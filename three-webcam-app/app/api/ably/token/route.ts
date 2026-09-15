import Ably from "ably";
import { NextResponse } from "next/server";
import { CHANNEL_NAME } from "@/app/utils";

/**
 * Issues short-lived Ably tokens so the API key never reaches the browser.
 * The client SDK calls this URL automatically (see Providers.tsx).
 */
export async function GET() {
  const key = process.env.ABLY_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "ABLY_API_KEY is not set" }, { status: 500 });
  }

  const ably = new Ably.Rest({ key });
  const tokenRequest = await ably.auth.createTokenRequest({
    clientId: crypto.randomUUID(),
    capability: { [CHANNEL_NAME]: ["publish", "subscribe"] },
  });

  return NextResponse.json(tokenRequest);
}
