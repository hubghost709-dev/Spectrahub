import { Poppins, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

// Configura Just Sans
export const justSans = localFont({
  src: [
    {
      path: "../public/fonts/JustSans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    // Agrega más variantes si las tienes
  ],
  variable: "--font-just-sans"
});

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins"
});