# Codebase Concerns

**Analysis Date:** Fri Jul 10 2026

## Security

### Hardcoded Database Credentials in `drizzle.config.json`
- **Files:** `drizzle.config.json` (line 5)
- **Issue:** The database connection string contains a plaintext password: `postgresql://postgres:postgres@127.0.0.1:5432/app_db`. This credential is committed to version control.
- **Impact:** Anyone with access to the repository can see the database password. If this is ever pointed at a production database, it is an instant compromise.
- **Fix approach:** Move the database URL to an environment variable. The `dotenv` package is already in dependencies (though unused — see Tech Debt below). Use `process.env.DATABASE_URL` in the Drizzle config and never commit credentials.

### No Authentication on Sync API
- **Files:** `src/app/api/sync/route.ts` (lines 24–94)
- **Issue:** The `/api/sync` endpoint accepts a `deviceId` as the sole identifier. Any client can read or write progress for **any** device ID by guessing or enumerating device IDs (which are UUIDs, but never verified). No token, session, or proof of ownership is required.
- **Impact:** A malicious user could overwrite a child's learning progress, read progress data, or spam the database with junk records.
- **Current mitigation:** Device IDs are `crypto.randomUUID()`, making enumeration infeasible. But there is no server-side verification at all.
- **Recommendations:** Add a server-side write token derived from the device ID (e.g., HMAC with a server secret). At minimum, validate that the device is known before writing.

### Hardcoded Parent PIN
- **Files:** `src/app/learning-app.tsx` (line 343)
- **Issue:** The parent gate PIN is hardcoded as `"1234"` with no way for the parent to change it. The helper text on line 807 even displays: `Default PIN: 1234`, completely defeating the security purpose.
- **Impact:** A child who reads the screen can trivially bypass the parent lock by entering 1234. This provides no real parental control.
- **Fix approach:** Allow parents to set a custom PIN on first access (stored in localStorage or hashed in the sync store). Display helper text only if no PIN has been set.

### No Environment Variable Loading for `process.env.DATABASE_URL`
- **Files:** `src/db/index.ts` (line 4)
- **Issue:** The code reads `process.env.DATABASE_URL` but nowhere in the project is `.env` loaded. The `dotenv` package is listed in `package.json` dependencies but never imported or invoked in any source file.
- **Impact:** `process.env.DATABASE_URL` will be `undefined` unless set in the shell environment. The app silently falls into "demo mode" (`hasDatabase = false`) when no database is available. In production, this means data loss if the env var isn't correctly set.
- **Fix approach:** Either remove the unused `dotenv` dependency, or use `dotenv/config` at the Next.js config level to load `.env` files.

### Unvalidated External API Content Spoken via Speech Synthesis
- **Files:** `src/app/learning-app.tsx` (functions `speak()` at line 116, `fetchNewDog()` at line 625, `fetchNewFact()` at line 643, `findRhymes()` at line 664)
- **Issue:** Text fetched from external APIs (`dog.ceo`, `uselessfacts.jsph.pl`, `datamuse.com`) is passed directly to `SpeechSynthesisUtterance` without sanitization. While not a traditional XSS (it's spoken, not rendered as HTML), offensive or inappropriate API content could be spoken to a child.
- **Impact:** If any of these free APIs return unexpected content, a 5-year-old child could hear inappropriate language.
- **Current mitigation:** The API endpoints used are generally family-friendly.
- **Recommendations:** Add a simple profanity/content filter for text passed to `speak()`, especially for API-originating content.

### `prefers-reduced-motion` Only Partially Respected
- **Files:** `src/app/globals.css` (line 251)
- **Issue:** The CSS has a `prefers-reduced-motion` media query but the confetti animation in `LessonPlayer` (lines 848–849) is rendered via inline style elements with hardcoded animations rather than CSS classes that respect the media query.
- **Impact:** A child with vestibular motion sensitivity will experience the confetti animation regardless of their OS accessibility setting.
- **Fix approach:** Use CSS classes with `animation` controlled by `prefers-reduced-motion` for confetti effects instead of inline `animationDelay` values.

### Viewport `maximumScale: 1` Prevents Pinch-Zoom
- **Files:** `src/app/layout.tsx` (line 15)
- **Issue:** The viewport meta has `maximumScale: 1`, which disables pinch-to-zoom on mobile.
- **Impact:** This is an accessibility violation for users with low vision who need to zoom. WCAG Success Criterion 1.4.4 requires text to be resizable up to 200% without loss of content.
- **Fix approach:** Remove `maximumScale: 1` or set it to at least `2`.

## Performance

### New `AudioContext` Created on Every Sound
- **Files:** `src/app/learning-app.tsx` (lines 95–114)
- **Issue:** `playTone()` creates a new `AudioContext` instance every time a sound plays. Each `AudioContext` is a heavyweight browser resource with its own audio thread.
- **Impact:** On low-end devices (common for children's tablets), this causes audio glitches, higher memory usage, and potential browser warnings about too many AudioContexts.
- **Fix approach:** Create a single `AudioContext` at the app level (or lazily on first interaction) and reuse it for all tones. The current code does close each context after 800ms, but creation overhead remains.

### Unoptimized Dog Images (No Next.js `Image` Component)
- **Files:** `src/app/learning-app.tsx` (line 704)
- **Issue:** Dog photos from `dog.ceo` are rendered with a plain `<img>` tag instead of Next.js `<Image>` component.
- **Impact:** No automatic optimization (resizing, WebP conversion, lazy loading). Images load at full resolution regardless of viewport, wasting bandwidth — especially problematic on mobile data.
- **Fix approach:** Replace `<img>` with Next.js `<Image>` component, configuring the `dog.ceo` domain in `next.config.ts`.

### All State at Top Level Causes Full Re-Renders
- **Files:** `src/app/learning-app.tsx` (lines 127–147)
- **Issue:** All application state (progress, settings, player name, tab, lesson state, etc.) lives in a single `useState` cascade in the `LearningApp` component. Any state change re-renders the entire component tree, including views that haven't changed.
- **Impact:** Unnecessary re-renders of all child components on every answer click, tab switch, or progress update.
- **Fix approach:** Split views into separate components with their own state slices, or use `React.memo` on view components that only depend on specific props. Consider `useContext` or `zustand` for shared state.

### No Code Splitting for Views
- **Files:** `src/app/learning-app.tsx` (lines 383–414)
- **Issue:** All six views (`HomeView`, `LearnView`, `PasarApiArcadeView`, `BadgesView`, `ProgressView`, `ParentDashboard`) are imported and rendered conditionally, but always included in the initial bundle.
- **Impact:** The entire app (~872 lines of JSX plus data) is loaded upfront, even if the user never visits certain tabs. This increases initial load time.
- **Fix approach:** Use `React.lazy()` and dynamic imports for tab views. On a Next.js App Router project, consider making each tab a page route.

### `useEffect` Timer Without Dependency Array
- **Files:** `src/app/learning-app.tsx` (lines 252–255)
- **Issue:** The interval timer for `elapsedMinutes` uses `useEffect` with an empty dependency array (`[]`), which is correct for setup/teardown. However, the `setElapsedMinutes` state updater is called every 60s, causing a re-render of the entire app every minute — including when the user is in the middle of a lesson.
- **Impact:** Users may experience a subtle jank every minute during lessons.
- **Fix approach:** Move the session timer to a separate lightweight component or use `useRef` with a callback that only updates when the progress view is visible.

## Technical Debt

### Stale "blockbright" Legacy Keys Throughout localStorage
- **Files:** `src/app/learning-app.tsx` (lines 174, 179, 208–216, 244–249)
- **Issue:** The app reads and writes both `luthsplayground-*` and `blockbright-*` localStorage keys. There are 11 references to the old "blockbright" namespace, suggesting a rebrand from "BlockBright" to "Luth's Playground" was done incompletely.
- **Impact:** Data duplication in localStorage. If the old prefix is ever removed, users who still have data under `blockbright-*` keys will lose their progress.
- **Fix approach:** Remove all `blockbright-*` reads/writes. Add a one-time migration that copies `blockbright-*` data to `luthsplayground-*` keys.

### CSS Duplicate Declarations (Merge Artifacts)
- **Files:** `src/app/globals.css` (lines 3–14 vs 255–263, lines 18–27 vs 264–270)
- **Issue:** The `:root` block is declared twice — the first block (light theme) is immediately overwritten by the second block (dark theme). The `body` selector is also declared twice with conflicting backgrounds and colors.
- **Impact:** The first set of CSS variables and body styles are dead code. The file has 307 lines but ~30% of it is unreachable. This increases the CSS bundle for no benefit.
- **Fix approach:** Delete the first `:root` block (lines 3–14), the first `body` block (lines 18–27), and any other overridden styles. Keep only the dark theme declarations.

### Single Monolithic Component File (872 Lines)
- **Files:** `src/app/learning-app.tsx`
- **Issue:** Nine components (`LearningApp`, `NavButton`, `HomeView`, `LearnView`, `PasarApiArcadeView`, `BadgesView`, `ProgressView`, `ParentGate`, `ParentDashboard`, `LessonPlayer`) all live in a single 872-line file.
- **Impact:** Poor maintainability, difficult code reviews, no tree-shaking, and increased cognitive load. Any change to one component risks breaking others due to shared scope.
- **Fix approach:** Split each view into its own file under `src/app/components/`. The main `LearningApp` should only orchestrate tabs and state.

### Monolithic Learning Data (240 Lines)
- **Files:** `src/app/learning-data.ts`
- **Issue:** All 5 subjects, 25 lessons, and 100 questions are defined in a single 240-line file as deeply nested arrays.
- **Impact:** Adding a new subject or lesson requires editing a massive data structure. No separation between curriculum data and application code.
- **Fix approach:** Move each subject's data to its own file (e.g., `src/data/mandarin.ts`, `src/data/math.ts`) and import them into an index.

### Test File Checks for Old CSS Tokens
- **Files:** `tests/validate_luth_next_app.py` (lines 31–36)
- **Issue:** The test `test_dark_blocky_3d_theme_tokens_and_interactions_exist` asserts the presence of `--void`, `--neon`, `--neon-pink`, `sky-grid`, `portal-ring`, `blocky`, `isometric`, and `perspective` tokens. It also asserts the **absence** of `var(--paper);` and `background: white; border-top`.
- **Impact:** These tests pass currently but the CSS tokens they check for are the merged dark-theme overrides. If the CSS is cleaned up (removing duplicates), this test will break and needs updating.
- **Fix approach:** Update the test to check for meaningful behavioral CSS (e.g., the dark background color) rather than specific class names that may change.

### `dotenv` Package in Dependencies but Never Used
- **Files:** `package.json` (line 12)
- **Issue:** `dotenv` 17.3.1 is listed as a production dependency but never imported or referenced anywhere in the source code (`src/`).
- **Impact:** Unnecessary 562MB `node_modules` bloat (partially). Also confusing — a future developer may assume `.env` files are loaded automatically.
- **Fix approach:** Either remove `dotenv` from dependencies (Next.js supports `.env` natively via `@next/env`) or wire it up properly in `next.config.ts`.

### Monolithic ESLint Config with Bundle Config Dependency
- **Files:** `eslint.config.mjs`
- **Issue:** The ESLint config imports `eslint-config-next/core-web-vitals`, which is a massive flat config bundle. There are no custom rules tailored to this project.
- **Impact:** Slow lint runs on the full project. The bundle includes rules for scenarios this app doesn't have (e.g., data fetching patterns, server actions).
- **Fix approach:** Consider a leaner ESLint config or explicitly enable only relevant rule sets.

### Global and `window.setTimeout` Usage Instead of React Patterns
- **Files:** Multiple locations in `src/app/learning-app.tsx` (e.g., lines 218, 270, 328, 342, 350)
- **Issue:** The code uses `window.setTimeout` directly instead of React hooks or proper async patterns. Multiple calls use `window.setTimeout(() => ..., 0)` for hydration deferrals.
- **Impact:** These timing hacks are fragile and could break with React 19's concurrent features. If React batches state updates differently, the delays may be insufficient.
- **Fix approach:** Use `useEffect` with appropriate dependencies instead of `setTimeout(0)` hacks. Use `transition` APIs for deferring non-critical work.

### `useCallback` Captures Stale State
- **Files:** `src/app/learning-app.tsx` (lines 148, 171, 197)
- **Issue:** `awardBadges` (line 148) and `saveProgress` (line 171) are wrapped in `useCallback` with dependencies that include `progress`. `earnBonusXp` (line 197) also includes `progress` in its dependency array.
- **Impact:** If `saveProgress` or `earnBonusXp` is called multiple times in quick succession, the second call may capture a stale `progress` value, leading to lost XP or incorrect badge counts.
- **Fix approach:** Use functional state updates (`setProgress(prev => ...)`) inside these callbacks instead of relying on the closure variable `progress`.

## Dependency Risks

### Next.js 16.2.6 (Very New Release)
- **Files:** `package.json` (line 15)
- **Risk:** Next.js 16.x is an extremely recent major version with a new Turbopack-based build system, a new React compiler integration, and significant architectural changes. The ecosystem (plugins, community guides, StackOverflow answers) is still maturing.
- **Impact:** If a bug is encountered, there may be fewer workarounds available. Upgrading to minor patches may introduce breaking changes.
- **Recommendation:** Pin to a specific stable minor version. Monitor the Next.js changelog closely. Run the `typecheck` script regularly.

### React 19.2.6
- **Files:** `package.json` (lines 17–18)
- **Risk:** React 19 has new features (actions, use(), server components improvements) but also removes some deprecated APIs. The `"use client"` directive behavior may change.
- **Impact:** Code that works today may break in a future patch. Some third-party libraries may not be fully compatible.
- **Recommendation:** Ensure all third-party React libraries are compatible. Avoid using experimental APIs.

### `dotenv` 17.3.1 (Unused)
- **Files:** `package.json` (line 12)
- **Risk:** The package is 3+ years old (v17.x was released in late 2022). It's unused bloat, but if someone does start using it, it may have unpatched CVEs.
- **Impact:** Increases `node_modules` size. Potential false sense of security about environment variable loading.
- **Recommendation:** Remove from `package.json` or update to the latest version and actually use it.

### No Automated Security Auditing
- **Files:** `package.json` (no `audit` script)
- **Risk:** There is no `npm audit`, `snyk test`, or `socket` scan in the CI pipeline or scripts section.
- **Impact:** Vulnerable transitive dependencies can go unnoticed. With 321 items in `node_modules` (562MB), there is significant surface area.
- **Recommendation:** Add `"prebuild": "npm audit --production"` or integrate a security scanner.

### No Lockfile Integrity Verification
- **Files:** `package-lock.json`
- **Risk:** The lockfile is present (8502 lines) but there's no integrity verification in the build step.
- **Impact:** A compromised npm registry or dependency hijack could inject malicious code without detection.
- **Recommendation:** Use `npm audit signatures` or `npm ci` (instead of `npm install`) in deployment pipelines.

## UX/UI Concerns

### PIN Security Defeated by Helper Text
- **Files:** `src/app/learning-app.tsx` (line 807)
- **Issue:** The text `"Default PIN: 1234"` is displayed directly on the parent gate screen. A 5-year-old who can read numbers can bypass the lock.
- **Impact:** The entire parent gate serves no security purpose since the PIN is displayed on the same screen.
- **Fix approach:** Show the helper text only in a "forgot PIN" flow (e.g., after 3 failed attempts, reveal via a security question). Or allow parents to set a custom PIN on first access.

### No Loading States for Tab Transitions
- **Files:** `src/app/learning-app.tsx` (lines 383–414)
- **Issue:** Tab views switch immediately with no loading indicator, skeleton, or transition animation.
- **Impact:** If any view becomes async (e.g., fetching data), the user sees a blank content area or stale content. The `PasarApiArcadeView` has loading spinners within the view, but the view mount itself is instant.
- **Fix approach:** Add a `<Suspense>` boundary or a simple fade transition between views.

### No Offline Save Queue
- **Files:** `src/app/learning-app.tsx` (lines 171–195)
- **Issue:** When `navigator.onLine` is false, `saveProgress` sets sync state to "offline" but does not queue the save for retry when connectivity returns.
- **Impact:** If a child completes a lesson while offline (e.g., in a car or plane), the progress is saved to localStorage but never synced to the server, even after connectivity is restored.
- **Fix approach:** On the `"online"` event listener (line 234), trigger a flush of any unsynced progress from localStorage.

### Confetti Animation Uncontrolled
- **Files:** `src/app/learning-app.tsx` (lines 848–849)
- **Issue:** The `LessonPlayer` renders 32 confetti elements with hardcoded inline `animationDelay` values on every perfect score. These animations run for 3.4 seconds with no way to skip, close, or speed up.
- **Impact:** A child who wants to continue immediately must wait for the confetti to finish. On repeat perfect scores, the confetti becomes annoying.
- **Fix approach:** Add a "skip" button, or limit confetti to first perfect score per session, or use CSS animations that can be interrupted.

### Minimal Keyboard Accessibility
- **Files:** `src/app/learning-app.tsx` (various locations)
- **Issue:** Some buttons lack `aria-label` (e.g., the nav buttons describe their function via visible text but have no `aria-label` override). The `focus-visible` outline is styled but some interactive elements (like the `pasar-feature-banner` section at line 516 that uses `onClick`) are `<section>` elements, not `<button>` elements.
- **Impact:** Keyboard navigation is unreliable in some areas. Screen reader users may miss interactive elements.
- **Fix approach:** Ensure all clickable elements use `<button>` or have `role="button"` and `tabIndex={0}`. Add `aria-label` where icon-only buttons exist.

### No Warning Before Exiting Lesson
- **Files:** `src/app/learning-app.tsx` (line 856, exit button)
- **Issue:** The lesson "Exit" button on line 856 closes the lesson overlay immediately with no confirmation prompt.
- **Impact:** A child may accidentally tap "Exit" and lose their lesson progress (though the current `lessonScore` isn't persisted until finishing, so partial progress is lost).
- **Fix approach:** Show a simple confirmation dialog: "Leave this quest? Your progress won't be saved."

### Avatar Modal Closes on Backdrop Click Without Warning
- **Files:** `src/app/learning-app.tsx` (line 446)
- **Issue:** The avatar modal closes when the backdrop is clicked (`onMouseDown={() => setAvatarOpen(false)}`).
- **Impact:** A child may accidentally close the modal while trying to select an avatar, requiring them to reopen it. This is frustrating for young children.
- **Fix approach:** Consider requiring an explicit "Close" button tap to dismiss, especially for young users.

## Scalability

### In-Memory Sync Store Grows Unbounded
- **Files:** `src/app/api/sync/route.ts` (lines 15–22)
- **Issue:** When no database is configured (demo mode), progress data is stored in a `Map` on `globalThis.__luthsPlaygroundMemorySync`. There is no eviction policy, size limit, or expiration.
- **Impact:** Each device stores ~1KB of JSON. With thousands of visitors, memory usage grows without bound until the server crashes.
- **Current mitigation:** This only applies in demo mode (no `DATABASE_URL`). In production with a real database, this code path is not used.
- **Fix approach:** Add a size limit (e.g., 1000 entries) or TTL (e.g., 24 hours) to the in-memory store. Log a warning when approaching the limit.

### API `/api/sync` Has No Rate Limiting
- **Files:** `src/app/api/sync/route.ts`
- **Issue:** The sync endpoint accepts POST and GET requests with no rate limiting, IP throttling, or request size limits beyond `deviceId.length > 100`.
- **Impact:** A malicious client could POST large payloads repeatedly, consuming server resources and potentially exhausting database connections.
- **Recommendations:** Add rate limiting via middleware (e.g., `@upstash/ratelimit` or a simple in-memory counter per IP). Limit request body size to a reasonable maximum (e.g., 50KB).

### Subject Progress Hardcoded to 5 Max Lessons
- **Files:** `src/app/learning-app.tsx` (line 296: `Math.min(5, oldStats.completed + 1)`), `src/app/learning-data.ts` (each subject has exactly 5 lessons)
- **Issue:** The progress tracking caps completed lessons at 5, and every subject has exactly 5 lessons. This is hardcoded in both data and logic.
- **Impact:** Adding a 6th lesson to any subject requires changes in two files plus understanding the `Math.min(5, ...)` constraint. The `completed * 20%` progress bar width (line 546) also assumes 5 lessons.
- **Fix approach:** Derive the lesson count from `subject.lessons.length` instead of hardcoding 5 everywhere.

### `avatar` and `playerName` Sent on Every Sync
- **Files:** `src/app/api/sync/route.ts` (lines 58–59)
- **Issue:** The full `playerName` and `avatar` are sent with every sync POST request, even if only progress data changed.
- **Impact:** Unnecessary bandwidth for a field that changes rarely. The avatar is an emoji (4 bytes) but player name is up to 24 characters, sent on every lesson completion.
- **Fix approach:** Separate the avatar/name update endpoint from the progress sync endpoint. Only include metadata fields when they've changed.

### Health Check Returns Sensitive Info
- **Files:** `src/app/api/health/route.ts`
- **Issue:** The `/api/health` endpoint always returns `pasarapi: "https://pasarapi.xyz"` and reveals whether the database is connected or in demo mode.
- **Impact:** While innocuous in isolation, this leaks system configuration to any client that pings the health endpoint. An attacker learns about the backend infrastructure.
- **Fix approach:** Remove internal configuration details from public health checks. Return only `{ ok: true/false }`.

---

*Concerns audit: Fri Jul 10 2026*
