import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs";

const f = createUploadthing();

const handleAuth = () => {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");
  return { userId };
};

export const ourFileRouter = {
  idVerification: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 }
  })
    .middleware(() => handleAuth())
    .onUploadComplete(({ metadata, file }) => {
      return { url: file.url };
    }),

  thumbnailUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 }
  })
    .middleware(() => handleAuth())
    .onUploadComplete(({ metadata, file }) => {
      return { url: file.url };
    }),

  // ✅ Nuevo endpoint para capturas automáticas del stream
  streamCapture: f({
    image: { maxFileSize: "2MB", maxFileCount: 1 }
  })
    .middleware(() => handleAuth())
    .onUploadComplete(({ metadata, file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
