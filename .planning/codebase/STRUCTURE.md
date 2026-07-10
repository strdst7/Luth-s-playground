# Codebase Structure

**Analysis Date:** 2026-07-10

## Directory Layout

```
luths-playground/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health/
│   │   │   │   └── route.ts          # GET /api/health — service status
│   │   │   └── sync/
│   │   │       └── route.ts          # GET/POST /api/sync — progress cloud sync
│   │   ├── globals.css               # Tailwind CSS v4 + custom dark blocky theme (~247+ lines)
│   │   ├── layout.tsx                # Root server component — HTML shell, metadata, viewport
│   │   ├── learning-app.tsx          # MAIN CLIENT COMPONENT — all state, views, game logic (872 lines)
│   │   ├── learning-data.ts          # Static curriculum data — subjects, lessons, questions, badges (240 lines)
│   │   └── page.tsx                  # Entry point — renders <LearningApp />
│   └── db/
│       ├── index.ts                  # Drizzle ORM client + PostgreSQL pool (graceful fallback)
│       └── schema.ts                 # learner_sync table definition + LearningSnapshot type
├── tests/
│   └── validate_luth_next_app.py     # Python validation tests — checks branding, content, APIs
├── .planning/
│   └── codebase/
│       ├── ARCHITECTURE.md
│       └── STRUCTURE.md
├── .next/                            # Build output (generated, gitignored)
├── node_modules/                     # Dependencies (gitignored)
├── package.json                      # Project manifest — "luths-playground"
├── package-lock.json
├── tsconfig.json                     # TypeScript config — strict, @/* path alias to src/
├── next.config.ts                    # Next.js config (minimal — defaults)
├── eslint.config.mjs                 # ESLint flat config — extends next/core-web-vitals
├── postcss.config.mjs                # PostCSS config — @tailwindcss/postcss plugin
├── drizzle.config.json               # Drizzle Kit config — PostgreSQL dialect, schema path
├── next-env.d.ts                     # Next.js TypeScript reference (generated)
└── tsconfig.tsbuildinfo              # TypeScript incremental build info (generated)
```

## Directory Purposes

**`src/`:**
- Purpose: All application source code
- Contains: Two directories — `app/` (pages, API, components, data) and `db/` (database layer)

**`src/app/`:**
- Purpose: Next.js App Router root — pages, layout, API routes, components, data
- Contains: Root layout (`layout.tsx`), home page (`page.tsx`), main client component (`learning-app.tsx`), data module (`learning-data.ts`), global CSS (`globals.css`), API routes (`api/`), and view components (inlined in `learning-app.tsx`)
- Key files:
  - `learning-app.tsx`: **The entire interactive application** — 872 lines, 10+ view components, all state management
  - `learning-data.ts`: Static curriculum data — 5 subjects, 25 lessons, 100 questions, 27 badges
  - `page.tsx`: Thin entry point (5 lines) that renders `<LearningApp />`

**`src/app/api/`:**
- Purpose: Next.js API route handlers for server-side endpoints
- Contains: Two route directories — `health/` and `sync/`
- Key files:
  - `sync/route.ts`: Full CRUD for progress sync — GET to retrieve, POST to upsert
  - `health/route.ts`: Returns `{ ok, service, database, pasarapi }` status

**`src/db/`:**
- Purpose: Database client and schema for optional PostgreSQL persistence
- Contains: Drizzle ORM setup and a single table definition
- Key files:
  - `index.ts`: Exports `db` (drizzle instance), `pool` (pg Pool), `hasDatabase` (boolean guard). Pool is cached globally for hot-reload safety.
  - `schema.ts`: Defines `learner_sync` table with `deviceId`, `playerName`, `avatar`, `version`, `snapshot` (JSONB), timestamps

**`tests/`:**
- Purpose: Codebase validation tests (Python, not Jest/Vitest)
- Contains: Single test file using Python's `unittest` framework
- Key files:
  - `validate_luth_next_app.py`: Validates package name, branding, curriculum content, API existence, dark theme CSS tokens, and absence of old Roblox branding

**Root Config Files:**
- `package.json`: Project name `luths-playground`, dependencies on Next.js 16, React 19, Drizzle ORM, PostgreSQL client, Lucide React icons, Tailwind CSS v4
- `tsconfig.json`: Strict mode, `@/*` alias → `./src/*`, target ES2017, bundler module resolution
- `next.config.ts`: Empty/default configuration
- `postcss.config.mjs`: Single plugin — `@tailwindcss/postcss`
- `eslint.config.mjs`: Flat config extending `next/core-web-vitals`, ignores `.next/`, `out/`, `build/`, `next-env.d.ts`
- `drizzle.config.json`: PostgreSQL dialect, schema path `./src/db/schema.ts`, local dev connection string
- `.next/`: Generated Next.js build output (not committed)
- `node_modules/`: NPM dependencies (not committed)

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Application entry point — renders `<LearningApp />`
- `src/app/layout.tsx`: HTML shell with metadata, viewport, theme color
- `src/app/api/sync/route.ts`: API entry for progress sync
- `src/app/api/health/route.ts`: API entry for health checks

**Configuration:**
- `package.json`: Project metadata, scripts, dependencies
- `tsconfig.json`: TypeScript compiler options, path aliases
- `next.config.ts`: Next.js framework configuration (empty — all defaults)
- `postcss.config.mjs`: CSS processing pipeline (Tailwind)
- `eslint.config.mjs`: ESLint rules (Next.js core web vitals)
- `drizzle.config.json`: Database migration/kit configuration

**Core Logic:**
- `src/app/learning-app.tsx`: **All core logic** — application state, view rendering, lesson engine, XP/streak/badge calculations, localStorage persistence, cloud sync, audio generation, speech synthesis, API integration (dog, facts, rhymes), parent dashboard, PIN gate
- `src/app/learning-data.ts`: Curriculum data — subjects, lessons, questions, badges
- `src/db/schema.ts`: Database schema — single `learner_sync` table
- `src/db/index.ts`: Database connection management

**Testing:**
- `tests/validate_luth_next_app.py`: Python validation suite

## Naming Conventions

**Files:**
- **kebab-case** for directories and files: `globals.css`, `learning-app.tsx`, `learning-data.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `next.config.ts`, `drizzle.config.json`
- **Route convention:** API route files are always `route.ts` (Next.js App Router requirement)
- **TypeScript:** All source files use `.ts` or `.tsx` extensions
- **CSS:** Single `globals.css` file (no CSS modules detected)

**Directories:**
- **kebab-case** for route directories: `sync/`, `health/`
- **Snake case not used** anywhere in the project
- `.next/` and `node_modules/` follow standard convention with dot prefix for generated/hidden

**Functions:**
- **camelCase** throughout: `startLesson()`, `chooseAnswer()`, `finishLesson()`, `saveProgress()`, `playTone()`, `speak()`, `awardBadges()`, `earnBonusXp()`, `fetchNewDog()`, `findRhymes()`
- Utility functions use camelCase: `levelForXp()`, `nextLevelXp()`, `accuracy()`, `todayKey()`
- React function components use **PascalCase**: `LearningApp`, `HomeView`, `LearnView`, `BadgesView`, `ParentGate`, `ParentDashboard`, `LessonPlayer`, `NavButton`

**Variables:**
- **camelCase** for all JavaScript/TypeScript variables: `activeTab`, `progress`, `settings`, `playerName`, `deviceId`, `syncState`, `lessonScore`
- Constants use **camelCase** (not UPPER_SNAKE): `defaultProgress`, `defaultSettings`, `appName`, `dayLabels`
- Subject IDs use **camelCase** strings: `"mandarin"`, `"math"`, `"english"`, `"science"`, `"coding"`

**TypeScript Types:**
- **PascalCase** for types and interfaces: `SubjectId`, `Question`, `Lesson`, `Subject`, `Progress`, `ParentSettings`, `SyncState`, `Difficulty`, `Tab`, `LearningSnapshot`, `SubjectStats`
- Union types use PascalCase with string literals: `type Tab = "home" | "learn" | "arcade" | "badges" | "progress" | "parent"`

## Where to Add New Code

**New Subject or Lesson:**
- Primary code: `src/app/learning-data.ts` — add new `Subject` object to the `subjects` array, following the existing pattern with `q()` helper
- Badges: If new subject badges are needed, add to the `badgeCatalog` array in the same file
- UI automatically adapts — subject cards, filter buttons, and lesson lists are data-driven

**New Tab/View:**
- Implementation: `src/app/learning-app.tsx`
  1. Add new value to `type Tab` union
  2. Add new view component function in the same file (or extract to a separate file under `src/components/`)
  3. Add nav button in the `<nav className="bottom-nav">` section
  4. Add conditional render in the main return block
- For better practice: Extract views into `src/app/(components)/*.tsx` to keep `learning-app.tsx` manageable

**New API Route:**
- Implementation: Create `src/app/api/{name}/route.ts` following the Next.js App Router convention
- Must export named functions for HTTP methods (GET, POST, etc.)
- Follow pattern from `sync/route.ts` for database access and error handling

**New External API Integration (Arcade):**
- Implementation: `src/app/learning-app.tsx` in the `PasarApiArcadeView` component (lines 596–764)
- Follow the pattern: add a new `article` in the `arcade-grid`, define fetch function with try/catch and fallback data, bonus XP via `onEarnXp()`, speak support via `speak()`

**Database Changes:**
- Schema: `src/db/schema.ts` — add new tables or columns using Drizzle ORM's `pgTable` API
- Client: `src/db/index.ts` — already set up for PostgreSQL with graceful fallback
- Migration: Run `npx drizzle-kit push` after schema changes (configured in `drizzle.config.json`)

**New Tests:**
- Location: `tests/` directory
- Pattern: Python `unittest.TestCase` class following `validate_luth_next_app.py`
- For JavaScript tests: Would need Jest/Vitest setup — currently no JS test framework is configured

**Utilities & Shared Helpers:**
- Current location: Inline in `learning-app.tsx` (e.g., `levelForXp`, `playTone`, `speak`)
- Better practice: Create `src/lib/` directory for shared utilities:
  - `src/lib/audio.ts` → `playTone()`, `speak()`
  - `src/lib/progress.ts` → `levelForXp()`, `accuracy()`, `awardBadges()`
  - `src/lib/sync.ts` → `saveProgress()`, sync logic
  - `src/lib/types.ts` → Shared type definitions (Progress, SubjectStats, etc.)

**New Components:**
- Current pattern: All view components are inline functions in `learning-app.tsx`
- Recommended: Create `src/components/` directory and extract:
  - `src/components/views/HomeView.tsx`
  - `src/components/views/LearnView.tsx`
  - `src/components/views/ArcadeView.tsx`
  - `src/components/views/BadgesView.tsx`
  - `src/components/views/ProgressView.tsx`
  - `src/components/views/ParentDashboard.tsx`
  - `src/components/views/LessonPlayer.tsx`
  - `src/components/layout/NavButton.tsx`
  - `src/components/layout/Header.tsx`
  - `src/components/layout/Footer.tsx`

## Special Directories

**.next/:**
- Purpose: Next.js build output and cache
- Generated: Yes (by `next build` / `next dev`)
- Committed: No (in `.gitignore`)
- Contains: Compiled JS bundles, route manifests, build traces, Turbopack chunks

**node_modules/:**
- Purpose: NPM package dependencies
- Generated: Yes (by `npm install`)
- Committed: No (in `.gitignore`)
- Key packages: `next`, `react`, `react-dom`, `drizzle-orm`, `pg`, `lucide-react`, `tailwindcss`, `typescript`, `eslint`, `postcss`, `drizzle-kit`

**.planning/:**
- Purpose: GSD (Guided Software Development) planning artifacts
- Generated: No — manually created by `/gsd-*` commands
- Committed: Yes — contains documentation consumed by GSD commands
- Contains: `codebase/` subdirectory with codebase analysis documents

---

*Structure analysis: 2026-07-10*
