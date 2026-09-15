"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { AblyProvider } from "ably/react";
import * as Ably from "ably";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Created once per browser tab; token auth keeps the Ably API key server-side.
  const [client] = useState(
    () =>
      new Ably.Realtime({
        authUrl: "/api/ably/token",
        autoConnect: typeof window !== "undefined",
      }),
  );

  return (
    <SessionProvider>
      <AblyProvider client={client}>{children}</AblyProvider>
    </SessionProvider>
  );
}
