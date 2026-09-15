# Three Webcam

A multiplayer party demo: everyone in the room scans a QR code, picks a name and a colour, takes a selfie on their phone – and becomes a physics-driven ball on the big screen, wearing their own face as the texture. Phones turn into d-pads; the admin starts the game and the first ball to reach the top platform wins (with confetti on the winner's phone).

Presented live to ~20 people in 2024. Built with Next.js, react-three-fiber and cannon-es physics, with Ably for realtime messaging.

```
  phones (/)                          big screen (/admin, Google sign-in)
 ┌───────────────┐    Ably channel    ┌────────────────────────────────────┐
 │ name + colour │  ───"newPlayer"──▶ │ waiting room: player cards + QR    │
 │ selfie → S3   │                    │                                    │
 │ d-pad ▲◀●▶▼   │  ───"jump"───────▶ │ show time: react-three-fiber scene │
 │ respawn       │  ───"respawn"────▶ │  ● one sphere per player           │
 │               │  ◀──"winner"────── │  ● selfie as texture               │
 │ 🎉 confetti   │  ◀──"isGameOn"──── │  ● trampolines + platforms         │
 └───────────────┘                    └────────────────────────────────────┘
                         ▲                          ▲
                         └────── Postgres (players) ┘
```

## Stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Actions, `proxy.ts`), React 19, TypeScript |
| 3D & physics | three.js, `@react-three/fiber` 9, `@react-three/drei`, `@react-three/cannon`, `leva` (debug panel) |
| Realtime | Ably (token auth – API key never leaves the server) |
| Data | Postgres + Prisma 7 (`@prisma/adapter-pg`), AWS S3 for selfies |
| Auth | next-auth (Google) with an email allowlist for the admin screen |
| UI | Tailwind CSS 4, shadcn/ui primitives (Radix), lucide icons, zustand |

## How it works

- **`/` – the phone.** A three-step sign-up (`SplashScreen` → `TakePhoto` → upload). The webcam component is a small `getUserMedia` wrapper that captures a mirrored JPEG; the server action uploads it to S3 and inserts a `Player` row. The player id is kept in `localStorage` so a refresh brings the d-pad straight back. Every button press publishes a `jump` message on the shared Ably channel.
- **`/admin` – the big screen.** Lists players as they join (via `newPlayer` messages) and shows the QR code. "Show time" mounts the `ShowTime` canvas: a `Physics` world where each player is a `useSphere` body. Incoming `jump` messages become impulses. "Start game" flips the collision groups of the trampolines/platforms so the course appears; a ball touching the top face of the `final` platform publishes `winner`.
- **Realtime auth.** Browsers create their Ably client with `authUrl: /api/ably/token`, which signs short-lived token requests scoped to the one channel.

## Running it locally

You need four external things: a Postgres database, an Ably app, an S3 bucket and a Google OAuth client. All are free-tier friendly.

```bash
cd three-webcam-app
pnpm install                 # also runs `prisma generate`
cp .env.example .env         # fill in the values below
pnpm db:migrate              # applies prisma/migrations to DATABASE_URL
pnpm dev
```

Open <http://localhost:3000> on your phone(s) and <http://localhost:3000/admin> on the big screen (sign in with a Google account listed in `ADMIN_EMAILS`).

### Environment variables

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (Neon, Supabase, Railway, local docker…). Optionally `DATABASE_URL_UNPOOLED` for migrations if you're behind a pooler. |
| `ABLY_API_KEY` | From your Ably app's *API keys* tab. Needs `publish` + `subscribe` capabilities. |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME` | Selfies are written to `webcam/*` and served **without** signed URLs, so give that prefix a public-read bucket policy (or an equivalent CloudFront setup). |
| `NEXTAUTH_URL`, `NEXTAUTH_SECRET` | Standard next-auth. `openssl rand -base64 32` for the secret. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google Cloud → OAuth client (Web). Redirect URI: `<NEXTAUTH_URL>/api/auth/callback/google`. |
| `ADMIN_EMAILS` | Comma-separated Google emails allowed into `/admin`. |

Replace `three-webcam-app/public/qr-code.png` with a QR code pointing at your deployed URL.

### Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js |
| `pnpm lint` / `pnpm typecheck` | ESLint (flat config) / `tsc --noEmit` |
| `pnpm db:migrate` | `prisma migrate deploy` |
| `pnpm db:studio` | Browse the database |

## Admin tips for a live session

- **add randos** drops 50 fake (non-persisted) players into the list to stress-test the scene.
- The leva panel (top-right of the scene) toggles the axis helper, bounding walls, lights and whether balls show selfies or plain colours.
- Phone controls are frozen while the show is on but the game hasn't been started, so nobody gets a head start.
- **delete all** wipes the `Player` table – handy between sessions.

## Project layout

```
three-webcam-app/
├─ app/
│  ├─ page.tsx                 # phone
│  ├─ admin/page.tsx           # big screen
│  ├─ api/ably/token/          # Ably token endpoint
│  ├─ api/auth/[...nextauth]/  # Google sign-in
│  ├─ components/client/       # AppWrapper, Webcam, PlayerList, ShowTime (3D), …
│  ├─ serverActions/           # createPlayer + S3 upload, player queries
│  └─ store/                   # zustand stores + localStorage player hook
├─ components/ui/              # shadcn/ui primitives actually used
├─ lib/                        # prisma client, s3 client, auth options
├─ prisma/                     # schema + migrations
├─ proxy.ts                    # guards /admin (Next 16's middleware)
└─ prisma.config.ts
```
