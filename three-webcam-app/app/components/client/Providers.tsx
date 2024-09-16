"use client";

import { SessionProvider } from "next-auth/react";

import { AblyProvider } from "ably/react";
import * as Ably from "ably";

const client = new Ably.Realtime({
  key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
  clientId: "me",
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AblyProvider client={client}>{children}</AblyProvider>
    </SessionProvider>
  );
}
