import {cn} from "@/lib/utils";
import { justSans } from "@/lib/fonts";
import {Poppins} from "next/font/google";
import Image from "next/image";

const font = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export default function Logo() {
  return (
    <div className="flex flex-col items-center gap-y-4">
      <div className="bg-white rounded-full p-1">
        <Image src={"/ISOTIPO.svg"} alt="game-hub" height={80} width={80} />
      </div>
      <div className={cn("flex flex-col items-center", justSans.className)}>
      <p className="text-lg font-bold text-white">
            Spectra
            <span className="text-transparent" style={{ 
             WebkitTextStroke: '1px    #FFFFFF',
        
            }}>
  HUB
</span>
          </p>
        <p className={`text-sm text-muted-foreground`}>Let&apos;s play</p>
      </div>
    </div>
  );
}
