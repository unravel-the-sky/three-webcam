import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import type { UserRole } from "@/lib/next-auth";

/** Comma-separated list of Google account emails that get the `admin` role (and access to /admin). */
const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const roleFor = (email?: string | null): UserRole =>
  email && adminEmails.includes(email.toLowerCase()) ? "admin" : "user";

export const authOptions: AuthOptions = {
  // The adapter is typed against the default `@prisma/client` export; this project
  // generates its client to `lib/generated/prisma`, which is structurally identical.
  adapter: PrismaAdapter(prisma as unknown as Parameters<typeof PrismaAdapter>[0]),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.given_name,
          email: profile.email,
          image: profile.picture,
          role: roleFor(profile.email),
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, copy the DB user (incl. role) onto the token. Re-evaluate the
      // allowlist every time so promoting/demoting an email takes effect on next sign-in.
      if (user) token.role = roleFor(user.email);
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },
};
