import type { DefaultSession, DefaultUser } from "next-auth";

export type UserRole = "admin" | "user";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { role?: UserRole };
  }
  interface User extends DefaultUser {
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
  }
}
