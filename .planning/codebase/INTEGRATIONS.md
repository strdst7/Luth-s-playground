# External Integrations

**Analysis Date:** 2026-07-10

## APIs & External Services

**Free/Open APIs (consumed client-side in `src/app/learning-app.tsx`):**

| API | Endpoint | Purpose | Used In |
|-----|----------|---------|---------|
| Dog CEO API | `https://dog.ceo/api/breeds/image/random` | Fetch random dog photos for the "Live Dog Explorer" arcade card | `PasarApiArcadeView` (lines 609-633) |
| Random Useless Facts API | `https://uselessfacts.jsph.pl/api/v2/facts/random?language=en` | Fetch random kid-friendly fun facts for the "Curious Fun Facts" arcade card | `PasarApiArcadeView` (lines 635-651) |
| Datamuse API | `https://api.datamuse.com/words?rel_rhy={word}&max=10` | Fetch rhyming words for the "Rhyme Time Wizard" arcade card | `PasarApiArcadeView` (lines 653-673) |

**API Directory (referenced, not consumed):**
- `https://pasarapi.xyz` - Southeast Asia API directory; linked and credited throughout the app (footer, arcade page, health endpoint) but no direct API calls are made to it

## Data Storage

**Databases:**
- PostgreSQL
  - Driver: `pg@8.20.0` via `drizzle-orm/node-postgres`
  - Connection: `DATABASE_URL` environment variable
  - Schema: `src/db/schema.ts` — single table `learner_sync`
  - Local dev URL (from `drizzle.config.json`): `postgresql://postgres:postgres@127.0.0.1:5432/app_db`

**In-Memory Fallback:**
- When `DATABASE_URL` is not set, the app uses a `Map` stored on `globalThis.__luthsPlaygroundMemorySync` as a demo-mode in-memory store (`src/db/index.ts`, `src/app/api/sync/route.ts`)

**Client-Side Storage:**
- `localStorage` for persisting progress, settings, player name, avatar, and device ID
- Keys used: `luthsplayground-progress`, `luthsplayground-settings`, `luthsplayground-name`, `luthsplayground-avatar`, `luthsplayground-device` (and legacy `blockbright-*` keys for backward compatibility)

**File Storage:**
- Local filesystem only (no cloud file storage)

**Caching:**
- None (no Redis, no CDN caching layer)

## Authentication & Identity

**Auth Provider:**
- None — no authentication system implemented
- Device-based identity: `crypto.randomUUID()` generates a unique device ID stored in localStorage
- Parent dashboard protected by a hardcoded PIN (`1234`) — no real auth

**User Identity:**
- Player name and avatar stored in localStorage only
- No user accounts, no sign-in/sign-up flow

## Browser APIs (Client-Side)

**Web Speech API:**
- `window.speechSynthesis` for text-to-speech read-aloud functionality
- Supports English (`en-US`) and Mandarin Chinese (`zh-CN`)
- Used in lesson questions, arcade card interactions, and feedback

**Web Audio API:**
- `AudioContext` / `webkitAudioContext` for generating sound effects (correct, wrong, complete, bonus tones)
- No external audio files — tones are synthesized dynamically using oscillators

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, no logging service)

**Logging:**
- None — no structured logging on server side

**Health Check:**
- `GET /api/health` endpoint (`src/app/api/health/route.ts`) returns JSON status with database connection state

## CI/CD & Deployment

**Hosting:**
- Not configured — no deployment platform specified
- No `Dockerfile`, no `firebase.json`, no Vercel/Netlify config detected

**CI Pipeline:**
- None — no CI config files found

**Domain:**
- Not configured

## Environment Configuration

**Required env vars (optional — app runs in demo mode without them):**
- `DATABASE_URL` — PostgreSQL connection string (e.g., `postgresql://postgres:postgres@127.0.0.1:5432/app_db`)

**Secrets location:**
- Not applicable — no secrets committed or managed

**Env files:**
- No `.env`, `.env.local`, `.env.example`, or `.env.production` files committed

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Sync API (Custom, Self-Hosted)

**Endpoints (defined under `src/app/api/`):**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check returning service status & DB connection state |
| `/api/sync` | GET | Fetch learner progress snapshot by `deviceId` query param |
| `/api/sync` | POST | Upsert learner progress snapshot (body: `deviceId`, `playerName`, `avatar`, `snapshot`) |

**Sync flow:**
1. Client saves progress to localStorage immediately
2. If online, client POSTs to `/api/sync` with the full snapshot
3. Server upserts into PostgreSQL `learner_sync` table (or in-memory store in demo mode)
4. Server returns new version number, displayed as "Cloud saved · v{N}" in the UI

---

*Integration audit: 2026-07-10*
