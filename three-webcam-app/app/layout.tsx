import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Cormorant, Inter } from "next/font/google";
import Providers from "./components/client/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Three webcam test",
  description: "",
};

const cormorant = Cormorant({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.className} bg-mainBgColor min-h-screen h-[calc(100dvh) flex flex-col justify-center w-full`}
      >
        <Providers>
          <main className="flex flex-col items-center justify-center h-full w-full">
            {children}
          </main>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
