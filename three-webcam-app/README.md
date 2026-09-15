# three-webcam-app

The Next.js app for [Three Webcam](../README.md) – see the root README for what it is, the architecture and the full setup guide.

```bash
pnpm install          # runs prisma generate
cp .env.example .env  # then fill in Postgres / Ably / S3 / Google values
pnpm db:migrate
pnpm dev              # phone: http://localhost:3000  ·  big screen: http://localhost:3000/admin
```

`pnpm lint`, `pnpm typecheck` and `pnpm build` should all pass before shipping.
