import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't let `next dev` drop AGENTS.md / CLAUDE.md into the repo.
  agentRules: false,
  // Dev only: lets a tunnel (ngrok) reach the dev server's HMR socket, so the
  // phone flow can be tested on a real device. No effect in production.
  allowedDevOrigins: ["*.ngrok-free.dev", "*.ngrok-free.app", "*.ngrok.io"],
};

export default nextConfig;
