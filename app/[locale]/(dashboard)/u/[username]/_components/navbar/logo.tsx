import {cn} from "@/lib/utils";
import { justSans } from "@/lib/fonts";
import {Poppins} from "next/font/google";
import Image from "next/image";
import Link from "next/link";
const font = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export default function Logo() {
  return (
    <Link href={"/"}>
      <div className="flex items-center gap-x-4 hover:opacity-75 transition">
        <div>
          <Image
            src={"/LOGO.svg"}
            alt="game-hub"
            height={"32"}
            width={"32"}
          />
        </div>
 
             <div className={cn("hidden lg:block", justSans.className)}>
               <p className="text-lg font-bold text-black">
                 Spectra
                 <span className="text-transparent" style={{ 
                  WebkitTextStroke: '1px    #000000',
             
                 }}>
       HUB
     </span>
               </p>
             </div>

     
      </div>
    </Link>
  );
}
