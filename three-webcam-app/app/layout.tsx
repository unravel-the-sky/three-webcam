import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Providers from "./components/client/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Three Webcam",
  description:
    "Take a selfie on your phone, then steer your ball on the big screen. Next.js + react-three-fiber + Ably.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-main-bg h-[calc(100dvh)] flex flex-col justify-center w-full`}
      >
        <Providers>
          <main className="flex flex-col items-center justify-center h-full w-full">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
