import { defineConfig } from "prisma/config";

// Next.js loads .env files for the app itself; the Prisma CLI does not,
// so load them here for `prisma migrate` / `prisma studio`.
for (const file of [".env", ".env.local"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // file is optional
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations should bypass the connection pooler, so prefer the unpooled URL
    // (DATABASE_URL_UNPOOLED is what Neon's Vercel integration provides). Left
    // undefined (instead of throwing) so `prisma generate` still works without a
    // database, e.g. on a fresh clone.
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  },
});
