import type { Metadata } from "next";
import { Montserrat, Quicksand } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: 'swap' });
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand", display: 'swap' });

export const metadata: Metadata = {
  title: "Junaid | Taha Acts Chief Architect",
  description: "Engineering elite corporate infrastructure and high-velocity creative execution.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${quicksand.variable} h-full selection:bg-ta-black selection:text-ta-offwhite`}>
      <body className="h-full font-quicksand antialiased text-ta-black flex flex-col relative overflow-hidden">
        {children}
      </body>
    </html>
  );
}
