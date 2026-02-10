"use client";
import React, { useState, useRef, ElementRef, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { updateStream } from "@/actions/stream";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Hint } from "../hint";
import { Trash, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";

type Props = {
  initialName: string;
  initialThumbnailUrl: string | null;
};

export const InfoModal = ({ initialName, initialThumbnailUrl }: Props) => {
  const closeRef = useRef<ElementRef<"button">>(null);
  const router = useRouter();
  
  const [name, setName] = useState(initialName);
  const [thumbnailUrl, setThumbnailUrl] = useState(initialThumbnailUrl);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  // Hook de UploadThing para subir directamente
  const { startUpload } = useUploadThing("thumbnailUploader", {
    onClientUploadComplete: (res) => {
      const uploadedUrl = res?.[0]?.url;
      if (uploadedUrl) {
        startTransition(() => {
          updateStream({ thumbnailUrl: uploadedUrl })
            .then(() => {
              setThumbnailUrl(uploadedUrl);
              toast.success("Thumbnail uploaded!");
              router.refresh();
            })
            .catch(() => toast.error("Failed to save thumbnail"))
            .finally(() => setIsUploading(false));
        });
      }
    },
    onUploadError: () => {
      setIsUploading(false);
      toast.error("Failed to upload image");
    },
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  // Auto-sube cuando el usuario selecciona un archivo
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    await startUpload([file]);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(() => {
      updateStream({ name })
        .then(() => {
          toast.success("Stream updated");
          closeRef?.current?.click();
          router.refresh();
        })
        .catch(() => toast.error("Something went wrong"));
    });
  };

  const onRemoveThumbnail = () => {
    startTransition(() => {
      updateStream({ thumbnailUrl: null })
        .then(() => {
          toast.success("Thumbnail removed");
          setThumbnailUrl(null);
          router.refresh();
        })
        .catch(() => toast.error("Something went wrong"));
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="ml-auto">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit stream info</DialogTitle>
        </DialogHeader>
        <form className="space-y-14" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              placeholder="Stream name"
              onChange={onChange}
              value={name}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label>Thumbnail</Label>
            {thumbnailUrl ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
                <div className="absolute top-2 right-2 z-[10]">
                  <Hint label="Remove thumbnail" asChild side="left">
                    <Button
                      type="button"
                      disabled={isPending || isUploading}
                      onClick={onRemoveThumbnail}
                      className="h-auto w-auto p-1.5"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </Hint>
                </div>
                <Image
                  src={thumbnailUrl}
                  alt="Thumbnail"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              // ✅ Input invisible con label clickeable - sube automáticamente
              <div className="rounded-xl border border-dashed border-muted">
                <input
                  id="thumbnail-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isPending || isUploading}
                  onChange={onFileChange}
                />
                <label
                  htmlFor="thumbnail-input"
                  className={cn(
                    "flex flex-col items-center justify-center gap-y-2 py-10 cursor-pointer",
                    (isPending || isUploading) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      <p className="text-sm font-semibold">
                        Click to upload thumbnail
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF up to 4MB
                      </p>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>
          <div className="flex justify-between">
            <DialogClose ref={closeRef} asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="primary"
              type="submit"
              disabled={isPending || isUploading}
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
