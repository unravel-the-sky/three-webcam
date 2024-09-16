"use client";

import { CHANNEL_NAME } from "@/app/utils";
import { ChannelProvider } from "ably/react";
import React from "react";

export default function ChannelWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChannelProvider channelName={CHANNEL_NAME}>{children}</ChannelProvider>
  );
}
