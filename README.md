# cuGuessr

cuGuessr is the daily Carleton University campus photo guessing game. Players
locate campus photos on a map, earn points for accurate guesses, and compare daily
scores. The app supports past daily games, streaks, community photo submissions,
and admin moderation.

The app uses TanStack Start and Router, React, Tailwind CSS, Better Auth, and
Drizzle ORM with PostgreSQL through `pg`. Photo uploads use Cloudflare R2; images
are served through the configured CDN.

## Local development

Development work targets `feat/tanstack-start-migration`, the source of truth for
the TanStack app. Base feature branches on it; `main` is the deployed legacy app
until the production cutover.

Install [Bun](https://bun.sh/) and Docker with Compose, and start Docker before
starting the database. Use Bun for dependencies and scripts; the lockfile is
`bun.lock`.

```bash
bun install
cp .env.example .env
```

Configure `.env` before continuing:

- Keep `DATABASE_URL=postgres://user:password@localhost:5432/db` for the local
  Docker database.
- Set `BETTER_AUTH_SECRET` to a random secret and keep `BETTER_AUTH_URL` aligned
  with the app's local URL (`http://localhost:3000` in `.env.example`).
- Configure the OAuth, SMTP, and R2 credentials for the features you need. The
  variable names are listed in `.env.example`.

Start PostgreSQL, push the development schema, and start the app:

```bash
bun run db:start
bun run db:push
bun run dev
```

Open the URL printed by Vite. If its port differs from `BETTER_AUTH_URL`, update
that variable to match.

The database runs independently of the app. After stopping the dev server, stop
PostgreSQL with:

```bash
docker compose down
```

Compose retains local data in its `pgdata` volume. A fresh database has no campus
photos or daily games; schema setup does not seed content.

## Environment and services

[`.env.example`](.env.example) lists the app's configuration:

| Variables                                                                                                                            | Purpose                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `DATABASE_URL`                                                                                                                       | PostgreSQL connection: local Docker for development, Neon in production. |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`                                                                                              | Session security and the app's base URL.                                 |
| `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET` | Social sign-in credentials.                                              |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`                                                                           | Email one-time password delivery.                                        |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`                                                                          | Cloudflare R2 photo uploads.                                             |
| `VITE_CDN_URL`                                                                                                                       | Public base URL for photo delivery.                                      |
| `CRON_SECRET`                                                                                                                        | Bearer token checked by `/api/daily`.                                    |

Better Auth already uses the Drizzle adapter and the shared database export in
`src/db/index.ts`. Its configuration is in `src/lib/auth.ts`, with auth tables in
`src/db/auth-schema.ts` and game tables in `src/db/schema.ts`.

## Development commands

| Command                    | Purpose                                                           |
| -------------------------- | ----------------------------------------------------------------- |
| `bun run dev`              | Start the Vite development server.                                |
| `bun run db:start`         | Start local PostgreSQL with Compose.                              |
| `bun run db:push`          | Push the current development schema to `DATABASE_URL`.            |
| `bun run db:generate`      | Generate a Drizzle migration from schema changes.                 |
| `bun run db:migrate`       | Apply committed migrations from `drizzle/` to `DATABASE_URL`.     |
| `bun run db:studio`        | Open Drizzle Studio.                                              |
| `bun test`                 | Run unit tests; PostgreSQL integration tests are opt-in.          |
| `bun run test:integration` | Run PostgreSQL integration tests in a disposable Docker database. |
| `bun run typecheck`        | Check TypeScript types.                                           |
| `bun run lint`             | Run Oxlint.                                                       |
| `bun run format:check`     | Check formatting with Oxfmt.                                      |
| `bun run build`            | Build the production app with Vite and Nitro.                     |

The integration suite covers daily completion, leaderboard and streak reads,
account linking, moderation, and migration backfill. It needs Docker and a local
`postgres:18-alpine` image (`docker pull postgres:18-alpine`); it creates and
removes its own database without using `DATABASE_URL`.

## App routes and moderation

File-based routes live in `src/routes`:

- `/`: homepage with approved campus photos.
- `/daily` and `/daily/$date`: today's game and past daily games.
- `/leaderboard` and `/leaderboard/$date`: daily on-time leaderboard.
- `/submit`: community photo submissions.
- `/login` and `/api/auth/$`: sign-in and Better Auth endpoints.
- `/privacy`: privacy policy.
- `/admin`: photo and report moderation for users with `isAdmin` set.
- `/api/daily`: authenticated daily game creation endpoint used by the cron job.

### Daily leaderboard

`/leaderboard` redirects to today's board; `/leaderboard/$date` lists on-time
`game_result` rows for that daily, ordered by points. The page reads
`getDailyLeaderboardFn` / `getDailyLeaderboard` (stored totals), not a live SUM
over `round_result`. Entries are linked from the footer and the daily results
screen.

**Deferred:** all-time and weekly boards are not shipped. Open product questions
from NAT-211 remain open: whether to hide anonymous players vs show generated
usernames, how to aggregate all-time scores, whether to ship a weekly board, and
whether competitive boards should be signed-in only. This release shows every
on-time finish with the account's current username and does not filter by
anonymous status.

### Streaks in the UI

Signed-in (non-anonymous) players see **current** and **best** streak on the
daily **results** screen after finishing or revisiting a completed game. Values
come from `getUserStreaksFn` / `getUserStreaks`, which count only on-time
`game_result` rows—archive and late plays do not extend a streak. Streaks are
not shown in the header, on a profile page, or on a public board in this
release.

Admins can approve, reject, or reopen photos, rotate them in 90° increments, and
resolve reports with an internal response. Responses stay internal; no email or
reporter notification is sent. Photo decisions and report resolutions are
separate actions. Pending or rejected photos are excluded from future games and
the homepage; existing rounds remain intact. Saved rotation applies to admin
previews, homepage images, and games.

The admin link appears only for signed-in admins. Every admin read and mutation
checks the current database role. Queues are paginated, and stale revisions are
rejected to prevent moderators from overwriting each other's changes. Apply the
admin moderation migration before running this version against an existing
database.

## Production on Vercel

`vercel.json` selects the `tanstack-start` framework. The production build is:

```bash
bun run build
```

`vite.config.ts` includes TanStack Start and Nitro. Vercel uses this build to
deploy the app's server functions and static assets. Keep the existing TanStack
Start framework settings in the Vercel project.

Set production values for the variables in `.env.example` in Vercel's environment
settings. Use the production Neon connection for `DATABASE_URL`, set
`BETTER_AUTH_URL` to the production origin, and configure the Discord, GitHub,
and Reddit OAuth callbacks for that origin. `VITE_` variables are included in the
browser bundle; keep secrets unprefixed.

`vercel.json` schedules `/api/daily` at `0 5 * * *` (05:00 UTC). Configure
`CRON_SECRET` in Vercel to match the endpoint's bearer-token check. The endpoint
creates a game for the current `America/Toronto` date using approved photos.

Production schema application, the merge from `feat/tanstack-start-migration` to
`main`, and the deployment cutover are tracked in
[NAT-323](https://linear.app/nbaby/issue/NAT-323). Apply the baseline and subsequent
Drizzle migrations as part of that cutover, then smoke-test sign-in, daily play,
and photo submission.
