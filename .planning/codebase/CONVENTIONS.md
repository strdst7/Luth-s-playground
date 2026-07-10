# Coding Conventions

**Analysis Date:** Fri Jul 10 2026

## Language & Runtime

- **TypeScript** with `strict: true` in `tsconfig.json` — full strict mode enforced
- **`allowJs: false`** — no plain JavaScript files permitted
- **`noEmit: true`** — TypeScript is used for type-checking only; Next.js/Turbopack handles compilation
- **`jsx: "react-jsx"`** — automatic JSX runtime (no `React` import needed)
- **Target:** `ES2017`
- **Module resolution:** `bundler` (Next.js native)

## Naming Patterns

**Files:**
- `kebab-case` for all source files (e.g., `learning-app.tsx`, `learning-data.ts`, `globals.css`, `route.ts`)
- Database schema file: `schema.ts`
- Database connection file: `index.ts`
- Next.js special files follow framework conventions: `layout.tsx`, `page.tsx`, `route.ts`

**Components:**
- `PascalCase` for component functions (e.g., `LearningApp`, `NavButton`, `HomeView`, `LearnView`, `LessonPlayer`, `ParentDashboard`)
- Inline props type definition for each component — no separate interface unless reused

**Functions and Hooks:**
- `camelCase` for all functions:

  ```typescript
  // Module-level helpers (learning-app.tsx)
  const levelForXp = (xp: number) => Math.floor(xp / 150) + 1;
  const accuracy = (correct: number, total: number) => (total ? Math.round((correct / total) * 100) : 0);
  const todayKey = () => new Date().toISOString().slice(0, 10);

  // Callback handlers inside component
  const startLesson = (subject: Subject, lesson: Lesson) => { ... };
  const chooseAnswer = (index: number) => { ... };
  const finishLesson = () => { ... };
  const closeLesson = () => { ... };
  ```

**Variables and State:**
- `camelCase` for all variables (e.g., `activeTab`, `playerName`, `deviceId`, `syncState`, `lessonScore`, `elapsedMinutes`)

**Types and Interfaces:**
- `PascalCase` with no `I` prefix (e.g., `Tab`, `SyncState`, `Difficulty`, `Progress`, `ParentSettings`, `SubjectStats`, `SubjectId`, `Lesson`, `Subject`, `Question`, `LearningSnapshot`)
- Union types preferred over enums:

  ```typescript
  type Tab = "home" | "learn" | "arcade" | "badges" | "progress" | "parent";
  type SyncState = "saved" | "saving" | "offline";
  type Difficulty = "Easy" | "Medium" | "Hard";
  type SubjectId = "mandarin" | "math" | "english" | "science" | "coding";
  ```

**Constants:**
- `camelCase` for module-level constants (e.g., `appName`, `dayLabels`, `defaultProgress`, `defaultSettings`)
- CSS custom properties use `kebab-case` (e.g., `--ink`, `--muted`, `--void`, `--neon`, `--subject`)

## Code Style

**Formatting:**
- **No Prettier config detected** — project relies on ESLint formatting via `eslint-config-next/core-web-vitals`
- No semicolons preference: semicolons are always present

**Linting:**
- **ESLint v9** with flat config at `eslint.config.mjs`
- Config: `eslint-config-next/core-web-vitals` (Next.js core web vitals rule set)
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

**TypeScript Strictness:**
- All function parameters have explicit type annotations
- `React.CSSProperties` used for CSS custom property injection:

  ```typescript
  style={{ "--subject": subject.color, "--subject-light": subject.light } as React.CSSProperties}
  ```

- `React.ReactNode` used for children prop type
- `as` type assertions used sparingly — primarily for JSON parsing, type casts on window, and CSS properties
- `React.Dispatch<React.SetStateAction<ParentSettings>>` used for setState prop types

## Import Organization

**Order:**
1. **External library imports** — first group, sorted by package name
2. **Local/relative imports** — second group, using `@/` path alias or `./` relative paths
3. **CSS imports** — last (`import "./globals.css"`)

**Examples from `learning-app.tsx`:**
```typescript
// 1. External libraries (lucide-react first, then react, then next)
import { ArrowLeft, Award, ... } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

// 2. Local data
import { avatars, badgeCatalog, subjects, type Lesson, type Subject, type SubjectId } from "./learning-data";
```

**Path Aliases:**
- `@/*` maps to `./src/*` (defined in `tsconfig.json`)

Used in:
- `src/app/api/health/route.ts`: `import { db, hasDatabase } from "@/db";`
- `src/app/api/sync/route.ts`: `import { db, hasDatabase } from "@/db";`

**Barrel Files:**
- `src/db/index.ts` serves as a barrel file for the `@/db` module, re-exporting `hasDatabase`, `pool`, and `db`
- No barrel files in the `app/` directory

## Error Handling

**Patterns:**

1. **Try/catch with fallback values** — error variable is never used (empty catch):

   ```typescript
   try {
     const res = await fetch("https://dog.ceo/api/breeds/image/random");
     // ...
   } catch {
     setDogImg("https://images.dog.ceo/breeds/pug/n02110958_13114.jpg");
     setDogBreed("Happy Pug (Offline mode)");
   }
   ```

2. **API route validation with early return:**

   ```typescript
   const deviceId = new URL(request.url).searchParams.get("deviceId")?.trim();
   if (!deviceId || deviceId.length > 100) {
     return NextResponse.json({ error: "A valid device ID is required." }, { status: 400 });
   }
   ```

3. **JSON.parse with try/catch and empty catch** for localStorage hydration:

   ```typescript
   try { setProgress(JSON.parse(savedProgress) as Progress); } catch { /* keep safe defaults */ }
   ```

4. **Fetch error propagation** — errors thrown from non-OK responses:

   ```typescript
   if (!response.ok) throw new Error("Sync failed");
   ```

5. **finally blocks** used for cleanup after async operations:

   ```typescript
   } finally {
     setFetchingDog(false);
   }
   ```

**Offline resilience:** `navigator.onLine` checks before network requests, `online`/`offline` event listeners for sync state.

## Logging

**Framework:** None — no structured logging library is used.

**Patterns:** No logging statements exist in the codebase. Errors are either silently caught or returned as HTTP responses.

## Comments

**When to Comment:**
- Minimal comments — most code is self-documenting through naming
- CSS section headers used to group related styles (e.g., `/* Pasar Arcade Feature */`, `/* Luth's Playground dark blocky 3D merge overrides */`)
- API comments: None (no JSDoc)

**JSDoc/TSDoc:**
- Not used anywhere in the codebase

## Function Design

**Size:**
- Utility/helper functions are small (1-4 lines)
- Component functions can be very large: `LearningApp` spans ~345 lines (lines 127-471), `PasarApiArcadeView` spans ~168 lines
- Event handlers are typically 10-30 lines

**Parameters:**
- Named function parameters with inline types for components
- Destructured props objects for all component functions
- Helper functions use positional parameters

**Return Values:**
- Components return JSX
- API handlers return `Response.json()` or `NextResponse.json()`
- Utility helpers return primitives or computed values

## Module Design

**Exports:**
- **Default exports** for page/layout components (`export default function RootLayout`, `export default function HomePage`, `export default function LearningApp`)
- **Named exports** for:
  - Types (`export type SubjectId`, `export type Question`, etc.)
  - Data (`export const subjects`, `export const avatars`, `export const badgeCatalog`)
  - DB schema (`export const learnerSync`, `export type LearningSnapshot`)
  - DB connection (`export const hasDatabase`, `export const pool`, `export const db`)

**No barrel files in app directory** — all sub-components are defined in the same file as the parent

## CSS / Styling Conventions

**Framework:** Tailwind CSS v4 via `@tailwindcss/postcss` + custom CSS

**Configuration:**
- `postcss.config.mjs` — only `@tailwindcss/postcss` plugin
- `globals.css` — imports `tailwindcss` at top, then custom styles
- No `tailwind.config.*` file — Tailwind v4 uses CSS-first configuration

**Patterns:**
- Custom CSS classes use `kebab-case` (e.g., `.app-shell`, `.main-content`, `.welcome-grid`, `.primary-btn`, `.subject-card`, `.pasar-feature-banner`)
- BEM-like naming for child elements: `.subject-icon`, `.subject-title`, `.subject-desc`, `.subject-progress`, `.subject-play`
- CSS custom properties for theming: `--ink`, `--muted`, `--paper`, `--void`, `--neon`, `--subject`, `--subject-light`
- Dark theme defined via CSS overrides at bottom of `globals.css` (lines 254-307)
- Responsive breakpoints: `1050px`, `780px`, `500px`
- `prefers-reduced-motion` respected (line 251)
- `color-mix()` CSS function used for dynamic theming based on `--subject` variable

## Component Patterns

**Client vs Server Components:**
- `"use client"` directive used in `learning-app.tsx` — the main interactive component
- `layout.tsx`, `page.tsx` are Server Components (no `"use client"`)
- API route files (`route.ts`) are server-only

**State Management:**
- `useState` for local component state
- `useEffect` for hydration from `localStorage` and event listeners
- `useCallback` for memoized functions passed as dependencies
- `useMemo` for computed values (e.g., `recommendation`)
- No external state management library
- No context providers — data is passed via props

**Side-effect Patterns:**
- `window.setTimeout` used instead of plain `setTimeout` (for TypeScript compatibility)
- `void` keyword used to explicitly discard promise return values:

  ```typescript
  void saveProgress(next);
  ```

- Event listeners added in `useEffect` with cleanup via returned function

## Component Architecture

**Sub-component Organization:**
- Multiple sub-component functions defined in a single file (`learning-app.tsx`)
- Components are NOT extracted to separate files — `NavButton`, `HomeView`, `LearnView`, `PasarApiArcadeView`, `BadgesView`, `ProgressView`, `ParentGate`, `ParentDashboard`, `LessonPlayer` are all in `learning-app.tsx`
- Props are typed inline at each function declaration

## Data Patterns

**Helper factory function for generating objects:**

```typescript
const q = (prompt: string, options: string[], answer: number, visual: string, speak?: string, hint?: string): Question => ({
  prompt, options, answer, visual, speak, hint,
});
```

**Default/fallback patterns:**

```typescript
const defaultProgress: Progress = { ... };
const defaultSettings: ParentSettings = { ... };
```

---

*Convention analysis: Fri Jul 10 2026*
