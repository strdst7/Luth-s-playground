# Technology Stack

**Analysis Date:** 2026-07-10

## Languages

**Primary:**
- TypeScript 5.9.3 - Used for all application code (both client and server)

**Secondary:**
- Python 3 - Used for validation testing only (`tests/validate_luth_next_app.py`)
- CSS - Custom stylesheets with Tailwind CSS directives

## Runtime

**Environment:**
- Node.js (version not pinned — no `.nvmrc` or `.node-version` file found)
- Package Manager: npm
  - Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.2.6 - Full-stack React framework with App Router
- React 19.2.6 - UI component library
- React DOM 19.2.6 - DOM rendering

**Testing:**
- No JS/TS test framework configured (no `vitest.config.*`, `jest.config.*`, or `.test.ts` files in `src/`)
- Python `unittest` validation script at `tests/validate_luth_next_app.py`

**Build:**
- Next.js built-in build (`next build`, `next dev`)
- TypeScript compiler (`tsc --noEmit` for type-checking via `typecheck` script)

## Key Dependencies

**Critical:**
- `next@16.2.6` - Framework, routing, server components, API routes
- `react@19.2.6` / `react-dom@19.2.6` - UI library
- `drizzle-orm@0.45.2` - Type-safe SQL ORM / query builder
- `pg@8.20.0` - PostgreSQL client (used by `drizzle-orm/node-postgres` driver)
- `lucide-react@^1.24.0` - Icon component library

**Infrastructure:**
- `drizzle-kit@0.31.10` - Schema migrations and DB push (dev dependency)
- `dotenv@17.3.1` - Environment variable loading
- `@types/pg@8.18.0` - TypeScript types for `pg`
- `@types/node@22.19.15` - Node.js type definitions

## Configuration

**Environment:**
- `DATABASE_URL` - PostgreSQL connection string (read in `src/db/index.ts`)
- Uses `dotenv` package (version 17.3.1) for local env loading
- No `.env` or `.env.example` files committed to repo

**TypeScript (`tsconfig.json`):**
- Target: ES2017
- Module: ESNext with bundler resolution
- JSX: `react-jsx` (React 19 automatic JSX transform)
- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- Incremental compilation enabled

**Next.js (`next.config.ts`):**
- Empty/default configuration — no custom settings

**Build (`postcss.config.mjs`):**
- PostCSS with `@tailwindcss/postcss` plugin

## Styling

**CSS Framework:**
- Tailwind CSS 4.1.17 (via `@tailwindcss/postcss` 4.1.17)
- Import style: `@import "tailwindcss"` in `src/app/globals.css`
- Custom CSS variables defined in `:root` for theming (`--ink`, `--purple`, `--coral`, etc.)

**Approach:**
- Hybrid: Tailwind utility classes used via `@import "tailwindcss"`, plus extensive handwritten CSS in `src/app/globals.css`
- No CSS modules, CSS-in-JS, or component-level stylesheets detected

## State Management

**Client state:**
- React `useState` / `useEffect` hooks only — no external state management library
- LocalStorage for persistence (`luthsplayground-*` and `blockbright-*` keys)
- In-memory global store (via `globalThis`) for server-side demo mode fallback

**Server state:**
- PostgreSQL via Drizzle ORM
- In-memory `Map` fallback when no database is configured

## Database & ORM

**Database:**
- PostgreSQL (declared in `drizzle.config.json`)

**ORM:**
- Drizzle ORM 0.45.2 with `drizzle-orm/node-postgres` driver
- Schema defined in `src/db/schema.ts`
- Migration tool: Drizzle Kit 0.31.10 (`drizzle.config.json`)

**Schema:**
- Single table: `learner_sync` with columns for device sync data
- Unique index on `device_id`

## Platform Requirements

**Development:**
- Node.js (any modern LTS version)
- PostgreSQL running locally (or no database — app runs in "demo mode" with in-memory store)
- npm install, then `npm run dev`

**Production:**
- Deployment target: Not specified (no Dockerfile, no hosting config)
- Node.js environment required
- PostgreSQL recommended (not required — degrades gracefully to in-memory)

## Scripts (`package.json`)

| Script | Command |
|--------|---------|
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `eslint .` |
| `typecheck` | `tsc --noEmit` |

---

*Stack analysis: 2026-07-10*
