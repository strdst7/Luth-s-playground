<!-- refreshed: 2026-07-10 -->
# Architecture

**Analysis Date:** 2026-07-10

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                   Browser (Client-Side Rendering)                    │
├─────────────────────┬───────────────────────┬───────────────────────┤
│   Next.js SSR Shell │  LearningApp (CSR)    │  External APIs        │
│   `layout.tsx`      │  `learning-app.tsx`   │  dog.ceo, uselessfacts│
│   `page.tsx`        │  (872 lines, client)  │  datamuse, pasarapi   │
└─────────┬───────────┴──────────┬────────────┴───────────┬───────────┘
          │                      │                        │
          ▼                      ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Data Layer & Persistence                          │
├────────────────────────────┬────────────────────────────────────────┤
│  localStorage              │  Next.js API Routes                    │
│  (primary storage)         │  `/api/sync` `/api/health`             │
│                            │                         │              │
└────────────────────────────┴─────────────────────────┼──────────────┘
                                                       │
                                                       ▼
                              ┌────────────────────────────────────────┐
                              │  PostgreSQL via Drizzle ORM            │
                              │  `src/db/schema.ts` `src/db/index.ts`  │
                              │  (falls back to in-memory Map)         │
                              └────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| RootLayout | HTML shell, metadata, viewport config | `src/app/layout.tsx` |
| HomePage | Renders LearningApp as default export | `src/app/page.tsx` |
| LearningApp | **Main app orchestrator** — state, tabs, lesson logic, progress, sync, audio | `src/app/learning-app.tsx` |
| HomeView | Welcome hero, stats, subject cards, daily mission | `src/app/learning-app.tsx` (lines 485–563) |
| LearnView | Subject/lesson browser with filters | `src/app/learning-app.tsx` (lines 565–594) |
| PasarApiArcadeView | Live API playground (dog, facts, rhymes) | `src/app/learning-app.tsx` (lines 596–764) |
| BadgesView | Badge collection display | `src/app/learning-app.tsx` (lines 766–779) |
| ProgressView | Charts and metrics dashboard | `src/app/learning-app.tsx` (lines 781–798) |
| ParentGate | PIN-protected parent dashboard entry | `src/app/learning-app.tsx` (lines 800–810) |
| ParentDashboard | Settings, controls, recommendations | `src/app/learning-app.tsx` (lines 812–839) |
| LessonPlayer | Modal overlay for answering questions | `src/app/learning-app.tsx` (lines 841–872) |
| learning-data | Static curriculum data (subjects, lessons, questions, badges) | `src/app/learning-data.ts` |
| db/index | Drizzle ORM client setup | `src/db/index.ts` |
| db/schema | PostgreSQL schema definition | `src/db/schema.ts` |
| sync/route | GET/POST progress sync endpoint | `src/app/api/sync/route.ts` |
| health/route | Health check endpoint | `src/app/api/health/route.ts` |

## Pattern Overview

**Overall:** Hybrid Next.js App Router — single-page application (SPA) pattern simulated within a server-rendered shell.

The main interactive portion (`learning-app.tsx`) uses a "use client" directive, making it a client-side rendered React app that simulates tab-based navigation without using Next.js file-based routing for internal pages.

**Key Characteristics:**
- Monolithic client component (872 lines) owns all state and all view rendering
- Tab-based "routing" controlled by `activeTab` state, with 6 views rendered conditionally
- Local-first persistence: `localStorage` is primary, cloud sync is secondary/opportunistic
- All lesson/subject data is static JS objects (no CMS, no SSR data fetching)
- Graceful degradation when database or network is unavailable
- Audio and speech synthesis used directly via browser APIs (no external voice service)

## Layers

**Next.js Server Shell:**
- Purpose: Deliver initial HTML with metadata, viewport, and theme color
- Location: `src/app/layout.tsx`, `src/app/page.tsx`
- Contains: Server components with metadata export, minimal JS
- Depends on: Nothing (pure Next.js)
- Used by: Next.js runtime

**Client Application Layer (LearningApp):**
- Purpose: All interactive UI — tabs, lessons, progress, arcade
- Location: `src/app/learning-app.tsx` (872 lines)
- Contains: 10+ view components, state management, game logic, audio, sync, TTS
- Depends on: `learning-data.ts` for curriculum data, `lucide-react` for icons
- Used by: `page.tsx` as the root export

**Data Layer:**
- Purpose: Static curriculum content
- Location: `src/app/learning-data.ts` (240 lines)
- Contains: 5 subjects × 5 lessons × 4 questions = 100 questions total, badge catalog, avatars list
- Depends on: Nothing
- Used by: `learning-app.tsx`

**API Layer (Backend):**
- Purpose: Cloud sync endpoints
- Location: `src/app/api/sync/route.ts`, `src/app/api/health/route.ts`
- Contains: Two endpoints (GET/POST for sync, GET for health)
- Depends on: `src/db/index.ts` (Drizzle), `src/db/schema.ts` (schema)
- Used by: `learning-app.tsx` (client-side fetch calls)

**Database Layer:**
- Purpose: Optionally persist progress to PostgreSQL
- Location: `src/db/index.ts`, `src/db/schema.ts`
- Contains: Single `learner_sync` table, Drizzle Pool setup, graceful fallback
- Depends on: `pg` (node-postgres), `drizzle-orm`, `DATABASE_URL` env var
- Used by: API route handlers

## Data Flow

### Primary Request Path (Initial Page Load)

1. Browser requests `/` → Next.js server renders `layout.tsx` and `page.tsx`
2. `page.tsx` renders `<LearningApp />` — a client component flagged with `"use client"`
3. Client hydrates `LearningApp` → triggers `useEffect` to load from `localStorage`
4. Progress, settings, player name, avatar, device ID are restored from `localStorage`
5. UI is rendered based on restored state (default "home" tab)

### Lesson Play Flow

1. User clicks a subject card or lesson → `startLesson()` sets `selected` state with `{subject, lesson}`
2. `LessonPlayer` overlay renders with question UI
3. User selects an answer → `chooseAnswer()` updates local score, plays audio
4. User clicks Next → `nextQuestion()` advances or calls `finishLesson()`
5. `finishLesson()` computes XP, streak, badges, weekly activity → builds new `Progress` object
6. `saveProgress()` is called → writes to `localStorage` immediately, POSTs to `/api/sync` if online
7. `sync` API route upserts into PostgreSQL or falls back to in-memory `Map`

### Cloud Sync Flow

1. After state changes (progress, settings, name, avatar), values are written to `localStorage`
2. `saveProgress()` (for progress) sends POST to `/api/sync`
3. Sync POST receives `{deviceId, playerName, avatar, snapshot}` → upserts into DB
4. Sync GET retrieves progress by `deviceId` query param
5. Online/offline events are listened to for sync state indicator in the header

### Parent Dashboard Flow

1. User taps "Parents" nav tab → `ParentGate` renders a 4-digit PIN pad
2. On PIN entry (default: `1234`), `parentUnlocked` state flips to `true`
3. `ParentDashboard` renders with settings controls, metrics, and ML-like recommendation
4. Settings are persisted to `localStorage` on every change via `useEffect`

### External API Flow (Arcade Tab)

1. Dog CEO: `fetch("https://dog.ceo/api/breeds/image/random")` → displays random dog image
2. Useless Facts: `fetch("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en")` → displays fact
3. Datamuse: `fetch("https://api.datamuse.com/words?rel_rhy={word}&max=10")` → displays rhyming words
4. All API calls include try/catch with fallback data for offline/demo mode
5. Successful interactions may award bonus XP via `earnBonusXp()`

**State Management:**
- All application state lives in `LearningApp` via `useState` hooks (no context, no Redux)
- State is passed down as props to child view components (prop drilling pattern)
- No global state management library — the component tree is flat enough that context is unnecessary
- Callbacks (`onStart`, `onAnswer`, `onNext`, `onClose`, etc.) are passed as props for child→parent communication
- `useMemo` used for the parent recommendation calculation
- `useCallback` used for `awardBadges`, `saveProgress`, `earnBonusXp` to prevent unnecessary re-renders

## Key Abstractions

**`Subject`, `Lesson`, `Question` Types:**
- Purpose: Type-safe curriculum data model
- Examples: `src/app/learning-data.ts` lines 1–29
- Pattern: Exported TypeScript types, with a factory helper `q()` for concise Question construction

**`Progress` Type:**
- Purpose: Full player state snapshot for persistence and sync
- Contains: XP, lesson counts, accuracy, streak, badges, subject-level stats, weekly activity timeline
- Location: `src/app/learning-app.tsx` lines 40–51

**`ParentSettings` Type:**
- Purpose: Parent-controlled configuration
- Contains: Difficulty, daily time limit, sound toggle, enabled subjects
- Location: `src/app/learning-app.tsx` lines 53–58

**`SyncState` Type:**
- Purpose: UI-level sync status indicator
- Values: `"saved" | "saving" | "offline"`
- Displayed in top-bar sync pill with cloud/cloud-off icon

**`LearningSnapshot` (DB Schema):**
- Purpose: Database shape for the sync table
- Location: `src/db/schema.ts` lines 3–14
- Pattern: Mirrors the client-side `Progress` interface

## Entry Points

**Server Entry (Page Load):**
- Location: `src/app/page.tsx`
- Triggers: Any HTTP GET to `/`
- Responsibilities: Renders the `<LearningApp />` client component

**API Entry (Sync):**
- Location: `src/app/api/sync/route.ts`
- Triggers: `GET /api/sync?deviceId=...` or `POST /api/sync`
- Responsibilities: Retrieve or upsert player progress snapshots

**API Entry (Health):**
- Location: `src/app/api/health/route.ts`
- Triggers: `GET /api/health`
- Responsibilities: Returns service status including database connection state

## Architectural Constraints

- **Threading:** Single-threaded event loop (browser + Node.js). All audio is generated in-memory via `AudioContext`; no worker threads used.
- **Global state:** The sync API route uses a global module-level `Map<string, ...>` (`__luthsPlaygroundMemorySync`) for in-memory fallback storage. The database connection pool is also cached globally (`__luthsPlaygroundPostgresqlPool`).
- **Circular imports:** None detected. The dependency graph is strictly tree-shaped:
  - `page.tsx` → `learning-app.tsx` → `learning-data.ts`
  - `sync/route.ts` → `db/index.ts` → `db/schema.ts`
  - `health/route.ts` → `db/index.ts`
- **Simulated routing:** All navigation uses `activeTab` state. There are no Next.js route segments for the 6 view tabs. This means:
  - No deep-linking to specific tabs
  - No browser back/forward button support for tab state
  - All views download in a single JS bundle
- **Single file constraint:** 872 lines in `learning-app.tsx` — all view components, state, and game logic in one file

## Anti-Patterns

### Monolithic Client Component

**What happens:** `src/app/learning-app.tsx` at 872 lines contains all state, all view render functions, all game logic, audio utilities, and sync logic in a single file.

**Why it's wrong:** Reduces maintainability, makes testing difficult (no isolated component exports), increases bundle size for initial load, and makes it harder for multiple developers to work simultaneously.

**Do this instead:** Split into separate files like `src/components/views/HomeView.tsx`, `src/lib/progress.ts`, `src/lib/audio.ts`, `src/hooks/useSync.ts`, etc. See `src/app/learning-data.ts` for the correct separation pattern — data is already cleanly extracted.

### Prop Drilling Instead of Context or Store

**What happens:** State and callbacks like `progress`, `settings`, `setSettings`, `onStart`, `onEarnXp`, `playerName`, etc. are passed through multiple component layers as props (e.g., `LearningApp` → `HomeView` → deeper).

**Why it's wrong:** When new state is added, every intermediate component's props interface must be updated, creating tight coupling.

**Do this instead:** Use React Context or a lightweight store (e.g., Zustand) for global state like progress, settings, player identity. Components like `BadgesView` and `ProgressView` only need read access to `progress` — they shouldn't receive it through their parent.

### Client-Side Tab Routing

**What happens:** `activeTab` state conditionally renders views instead of using Next.js file-based routing (`/learn`, `/arcade`, `/badges`, etc.).

**Why it's wrong:** Prevents deep-linking, breaks browser navigation (back/forward), defeats Next.js route-level code splitting, and forces all code into the initial bundle.

**Do this instead:** Create separate route segments like `src/app/(app)/learn/page.tsx`, `src/app/(app)/arcade/page.tsx`, etc. Use shared layout files to keep bottom nav and top bar.

### In-Memory Fallback in API Route

**What happens:** `src/app/api/sync/route.ts` lines 15–22 use a global `Map<string, ...>` as an in-memory data store when no database URL is configured.

**Why it's wrong:** Data is lost on server restart, not shared across serverless function instances, and grows unbounded.

**Do this instead:** Use file-based JSON storage (e.g., `data/`) or better, always configure the PostgreSQL database. The in-memory fallback is fine for local dev but should be documented as ephemeral.

## Error Handling

**Strategy:** Graceful degradation with fallback data and visual offline indicators.

**Patterns:**
- External API calls wrapped in try/catch with hardcoded fallback data (e.g., `src/app/learning-app.tsx` lines 609–633 fetchNewDog with fallback Pug image)
- `localStorage` parse errors caught with empty catch blocks, keep safe defaults
- Sync failures silently demote sync state to "offline" without blocking the user
- Database connection failure in health API returns `{ database: "error" }` with 500 status
- Input validation in sync POST: rejects if `deviceId`, `snapshot`, or `xp` are invalid
- `pinAttempt` and `speak()` have early returns for guard conditions

## Cross-Cutting Concerns

**Logging:** Minimal — no structured logging. Console output only via uncaught errors (not used in codebase). No error tracking service configured.

**Validation:** Input data is validated in the sync API route (deviceId length, snapshot shape). In the client, `JSON.parse` is wrapped in try/catch with safe defaults. No Zod, Joi, or other validation library.

**Authentication:** None. The deviceId is a random UUID generated client-side and serves as the sole user identifier. There is no login, password, OAuth, or session. The parent PIN (`1234`) is hardcoded and stored nowhere — it serves as a simple visual gate, not real auth.

---

*Architecture analysis: 2026-07-10*
