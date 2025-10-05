
// page.tsx
import { getSelf } from "@/lib/auth-service";
import { getStreamByUserId } from "@/lib/stream-service";
import { UrlCard } from "./_components/url-card";
import { KeyCard } from "./_components/key-card";
import { ConnectModal } from "./_components/connect-modal";
import { WebcamButton } from "./_components/webcam-button";

const KeysPage = async () => {
  const self = await getSelf();
  const stream = await getStreamByUserId(self.id);

  if (!stream) {
    throw new Error("Stream not found");
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Keys & URLs</h1>
        <div className="flex gap-2">
          {/* Quitamos completamente los props del WebcamButton */}
          <WebcamButton />
          <ConnectModal />
        </div>
      </div>
      <div className="space-y-4">
        <UrlCard value={stream.serverUrl || ""} />
        <KeyCard value={stream.streamKey || ""} />
      </div>
    </div>
  );
};

export default KeysPage;
