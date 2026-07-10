# Stack Research

**Domain:** Offline-first children's educational platform with pronunciation scoring, parental dashboard, content authoring, and bilingual i18n
**Researched:** 2026-07-10
**Confidence:** HIGH (verified via Context7, official docs, and cross-referenced web sources)

## Recommended Stack

### Core Technologies

#### 1. Offline-First Sync Engine

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Dexie.js | ^4.2.x | IndexedDB wrapper for local-first data storage | Only production-ready IndexedDB wrapper with reactive live queries (`useLiveQuery`), auto-change tracking across tabs/workers, declarative schema versioning with auto-detect migration (Dexie 4 feature), and a CRDT-ready cloud addon. **154KB gzipped** — the lightest full-featured option. Synchronous-looking async API eliminates IndexedDB callback hell. Maintained by same team since 2014; v4 shipped 2025. |
| `dexie-react-hooks` | ^4.x | React bindings for Dexie live queries | First-party `useLiveQuery()` and `useObservable()` hooks that automatically re-render components when IndexedDB data changes. Zero boilerplate. |
| Custom sync layer | — | Bidirectional sync between Dexie (client) and Drizzle/PostgreSQL (server) | No off-the-shelf sync engine fits this exact stack. Dexie Cloud (commercial addon) is overkill and vendor-locks to their backend. CRDT libraries (Yjs, Automerge, SyncKit) are designed for collaborative editing, not per-field merge of structured progress data. Instead: **custom sync layer** using a `syncMeta` Dexie table (tracks `lastSyncedAt`, `pendingOperation`, `isDeleted`, `syncVersion`) + push/pull API routes against existing Drizzle/PostgreSQL schema. |

**Rationale for custom sync (not off-the-shelf):**
- The data model is simple: per-child progress snapshots with XP, streaks, badges, subject progress. No rich text, no collaborative editing, no real-time multi-user needs.
- The existing backend is Drizzle ORM + PostgreSQL — no Supabase, no Firebase, no CouchDB. Every off-the-shelf sync engine (SyncKit, RxDB, PouchDB) assumes its own backend protocol.
- Per-field merge conflict resolution is straightforward to implement with version counters + last-write-wins (LWW) for this data shape. The `learner_sync` table already has a `version` column.
- Bundle size matters for tablet targets: Dexie (154KB) vs SyncKit (154KB but includes CRDTs we don't need) vs RxDB (500KB+) vs Yjs (65KB core but needs extensive wiring).

#### 2. Pronunciation Scoring

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Web Speech API (native) | — | Browser-based speech recognition & transcription | Built into Chrome, Edge, Safari. Zero cost, works offline with `processLocally: true` (Chrome downloads language pack once). Provides `transcript` + `confidence` (0-1) per result. New in 2025 spec: contextual biasing via `phrases` property (boost domain-specific vocabulary like lesson words). Supports `Quality` enum (`"command"` for short phrases — ideal for word-level pronunciation). |
| Azure Speech SDK (optional fallback) | ^1.42.x | High-accuracy pronunciation assessment with phoneme-level feedback | Gold standard for pronunciation assessment: provides per-phoneme accuracy scores, word-level scores, fluency, prosody, completeness. Pearson correlation >0.5 with human judges. 16kHz audio input recommended. **Cost:** ~$1/hr for pronunciation assessment (Free tier: 5 hrs/month). Only needed if Web Speech API confidence alone is insufficient for phoneme-level feedback. |

**Architecture for Pronunciation Scoring:**
```
User speaks → Web Audio API (record blob) → [choice]:
  Option A (free, offline): Web Speech API →
    transcript + confidence score → compare with expected text → simple match %
  Option B (paid, detailed): Azure Speech SDK →
    phoneme-level accuracy, word stress, fluency scores
```

**Key decision:** For a 5-year-old child, Option A (Web Speech API alone) is **sufficient for MVP**. Young children's pronunciation varies widely; a simple "did the audio roughly match the text?" score plus color-coded feedback (green/yellow/red) is age-appropriate. Phoneme-level analysis (Azure) adds complexity and cost that doesn't improve learning outcomes at this age. Start with Option A, make Option B pluggable.

#### 3. Parental Dashboard (Data Visualization)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Recharts | ^3.8.x | SVG-based charts for React dashboards | **48.9M weekly npm downloads** (highest of any React chart library, May 2026). Native React component API (children, props, no imperative `chart.update()`). Composable architecture maps cleanly to React mental model. SVG rendering is sufficient for <5K data points — a single child's learning history will never exceed this. Tree-shakeable to ~50KB gzipped with selective imports. Actively maintained (last commit May 2026). Perfect for: line charts (XP over time), bar charts (subject progress), radar (skill distribution), donut (badges). |
| Tailwind CSS 4 | ^4.1.x | Styling for dashboard cards/layout | Already in the project. Use for dashboard layout, metric cards, and custom components. No additional styling library needed. |

**Why not alternatives:**
- **Chart.js**: Canvas-rendered, better for 10K+ points but imperative API, not React-native. The project won't have that much data.
- **Nivo**: Heavier bundle (~82KB per chart type), steeper learning curve, more chart types than needed.
- **ECharts**: 800KB+ bundle even tree-shaken, imperative config model fights React.
- **Tremor**: Pre-styled SaaS dashboard components — doesn't match this project's blocky 3D aesthetic.

#### 4. Content Authoring / Admin Dashboard

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Zod | ^3.24.x | Runtime validation for admin forms | Industry standard for TypeScript-first schema validation with inference. Use for lesson creation forms, curriculum editing, API input validation in server actions. Already implicitly needed (no current validation library in project). |
| React Hook Form | ^7.54.x | Performant form library for admin panels | Uncontrolled form library with minimal re-renders. Integrates natively with Zod via `@hookform/resolvers`. Right choice for admin forms with many fields (lessons, questions, answers). |
| Tiptap (optional for rich text) | ^2.10.x | Rich text editor for lesson content | If lesson content needs rich text (headings, lists, images). Headless framework-agnostic editor built on ProseMirror. Used by Strapi, Payload CMS, and most Next.js admin panels. Skip if lessons remain markdown-only. |

**Architecture pattern (not a library):**
```
/admin → catch-all App Router route ([[...slug]])
  /admin/lessons → list, create, edit, delete lessons
  /admin/subjects → curriculum management
  /admin/users → parent PIN management
  
Pattern:
- Server Components for data fetching
- Server Actions for mutations
- Client Components only for interactive form elements
- Zod for validation on server action boundary
```

**Why not a headless CMS (Strapi, Payload, Directus):**
- Overkill for a single-developer project managing 5 subjects, 25 lessons, 100 questions
- Adds deployment complexity (separate CMS process/node)
- The content model is simple and tightly coupled to the app's game logic
- A custom admin panel with server actions is 2-3 days of work vs 1+ week of CMS integration + customization

#### 5. COPPA Compliance (Architecture, not a library)

| Practice | Tooling | Purpose |
|----------|---------|---------|
| Data minimization | Custom audit | Collect only: device_id (not email/name), parent PIN (hashed), learning snapshots (XP, streaks, badges). No location, no browsing history, no PII. |
| Parental consent gate | Custom component | Before enabling cloud sync/backup: present consent form explaining what data is stored, for how long, and that it can be deleted at any time via the dashboard. Log consent timestamp + device_id. |
| Data deletion endpoint | API route: `DELETE /api/account` | One-click wipe: deletes child's row from `learner_sync`, clears local IndexedDB, invalidates device token. Must respond within published SLA. |
| Written retention policy | `PRIVACY.md` + API header | Required by 2025 FTC COPPA Rule (effective April 2026). Must specify per-category retention periods and deletion timeframe. Publish in privacy notice. |
| Separate consent for third parties | Custom toggle | Any data sharing (e.g., pronunciation audio to cloud API) requires separate, independently revocable parental consent — cannot be bundled with general ToS acceptance. Under new rule (2025), bundling is prohibited. |

**No COPPA "tooling library" exists** — compliance is architectural. The 2025 FTC rule update (effective April 22, 2026) made several changes:
- Biometric identifiers (voice recordings for pronunciation assessment) now count as personal information requiring consent
- Data retention policies must be written and publicly disclosed
- Third-party data disclosure for AI training requires separate consent
- Pre-checked consent boxes are no longer acceptable

#### 6. Bilingual i18n (English + Malay)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| next-intl | ^4.x | Internationalization for Next.js App Router | **De facto standard** for App Router i18n in 2026. Native RSC support (translations load in Server Components — zero JS shipped for static content). Integrated routing via `createMiddleware()`. TypeScript autocompletion for message keys. ICU MessageFormat (industry standard for pluralization/gender). Bundle: ~31KB gzipped minimal runtime with ICU precompilation. First-class support for locale detection via cookie, Accept-Language, or URL prefix. |

**Why next-intl over next-i18next:**
- next-intl was built specifically for the App Router (next-i18next v16 added App Router support retroactively — it's a port of Pages Router patterns)
- next-intl's routing middleware is one function call vs next-i18next's multi-file setup
- next-intl has **ICU MessageFormat** natively (better for Malay pluralization which differs from English patterns)
- next-intl has zero config for date/number formatting (wraps native Intl API)
- next-i18next is still the better choice if migrating a Pages Router project or needing the i18next plugin ecosystem (backend loading, CDN, etc.)

**Architecture for English + Malay:**
```
messages/
  en.json    → { "HomePage": { "title": "Welcome!" }, ... }
  ms.json    → { "HomePage": { "title": "Selamat Datang!" }, ... }
  
Locale detection:
  Cookie (locale) → Accept-Language header → fallback to 'en'
  
Routes:
  /en/learn, /en/parent   → English
  /ms/learn, /ms/parent   → Malay
  /learn, /parent         → Redirects based on detection
```

#### 7. State Management

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Zustand | ^5.x | Lightweight client state management | **2.6M weekly downloads**, ~1KB bundle. Minimal boilerplate. No providers needed. Perfect for: UI state (theme, sound on/off, difficulty), network status, sync state. Keep app state separate from persistent game state (which lives in Dexie). |

**Why not alternatives:**
- **React Context**: Fine for simple cases, but causes unnecessary re-renders in a deep component tree. The monolithic `learning-app.tsx` already shows this pain.
- **Jotai**: Good for atom-based state, but adds conceptual overhead. Zustand's single-store-with-slices pattern is simpler.
- **Valtio**: Proxy-based, mutable pattern — less TypeScript-friendly than Zustand.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `uuid` | ^11.x | Generate UUIDs for offline-first records | Required for any locally-created record to avoid ID collisions during sync. Client-generated UUIDs prevent conflicts between multiple devices. |
| `zod` | ^3.24.x | Runtime validation | Every server action boundary, every form, every API route. Critical for sync API validation — never trust the client. |
| `date-fns` | ^4.x | Date formatting for dashboard metrics | Lighter than moment.js, tree-shakeable, immutable. Use for "last played 2 days ago" etc. |
| `sonner` | ^2.x | Toast notifications for admin dashboard | Small (~3KB), accessible, works with Server Actions. Use for "Lesson saved", "Sync complete" feedback. |
| `@tanstack/react-query` | ^5.x | Server data fetching (optional) | Only needed if you have server-only data that doesn't live in Dexie. The existing pattern uses `useLiveQuery` for local data — that's correct. React Query + server actions are for admin panel fetching. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `@playwright/test` | E2E testing for admin dashboard and sync flows | The project has zero JS tests. Playwright is the standard for modern web apps. Start with smoke tests for critical paths (loading lessons, completing quiz). |
| `vitest` | Unit/integration testing | Lighter than Jest, native ESM, same API. Use for testing sync engine merge logic, utility functions, Zod validations. |
| `@faker-js/faker` | Seed data for development/test | Generate realistic curriculum data for testing dashboards and admin panel. |
| `nodemon` | Watch for DB schema changes | Optional — restart dev server when Drizzle schema changes. |

## Installation

```bash
# Offline-first sync engine
npm install dexie@^4 dexie-react-hooks@^4 uuid@^11

# Dashboard charts
npm install recharts@^3

# Admin panel
npm install zod@^3 react-hook-form@^7 @hookform/resolvers@^3

# i18n
npm install next-intl@^4

# State management
npm install zustand@^5

# Utilities
npm install date-fns@^4 sonner@^2

# Testing (dev)
npm install -D @playwright/test vitest @faker-js/faker

# Rich text (if needed for admin)
npm install @tiptap/react @tiptap/starter-kit @tiptap/pm

# Optional: Azure Speech SDK for advanced pronunciation
npm install microsoft-cognitiveservices-speech-sdk@^1.42
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Dexie + custom sync | SyncKit (`@synckit-js/sdk`) | When you need collaborative editing (rich text CRDTs, undo/redo, presence). Overkill for progress data sync. |
| Dexie + custom sync | RxDB | When targeting React Native or needing a built-in replication protocol. RxDB is 500KB+ and assumes CouchDB backend. |
| Web Speech API + Azure (optional) | Whisper (self-hosted) | When you need offline phoneme analysis without cloud dependency. Whisper (openai/whisper) requires a server or WASM runtime. Feasible but complex. |
| Recharts | Tremor | When building a SaaS dashboard with shadcn/ui aesthetics. Tremor's pre-styled charts don't match the blocky 3D theme. |
| next-intl | next-i18next v16 | When migrating from Pages Router i18n, or needing the i18next plugin ecosystem (CDN backend loading, translation management systems). |
| Custom admin | Payload CMS | When needing full-featured headless CMS with draft workflows, versioning, media library, and team collaboration. Overkill for 5-subject curriculum. |
| Zustand | Jotai | When you prefer atomic state management with derived computed values. Jotai is fine but adds conceptual overhead for this app's state needs. |
| custom sync | Dexie Cloud (commercial) | When you want zero-effort sync with hosted backend, auth, and multi-device support already built. Costs money and requires their cloud. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **MobX / Redux** | Heavy state management for an app with simple state. Redux boilerplate is unjustified. The app has ~8 pieces of UI state. | Zustand |
| **next-i18next < v16** | Versions before v16 do not support App Router at all. If using, must be v16+. | next-intl |
| **Chart.js (react-chartjs-2)** | Imperative API fights React patterns. Canvas rendering is unnecessary for <5K data points. The parent dashboard will never have that much data. | Recharts |
| **Yjs / Automerge** | Designed for collaborative rich text editing. This app syncs structured progress data (numbers, strings, booleans) — not shared documents. Yjs adds 65KB minimum and extensive wiring for zero benefit. | Dexie + version-based LWW |
| **Firebase / Supabase** | Vendor lock-in for a PostgreSQL-backed app. Firebase Realtime Database was not designed for offline-first with per-field merge. Supabase's offline support is limited to cache-then-network with no offline writes. | Dexie + custom sync to existing PostgreSQL |
| **PouchDB / CouchDB** | Requires running a CouchDB server alongside PostgreSQL. Adds infrastructure complexity for a single-developer project. | Dexie with API routes to existing PostgreSQL |
| **Strapi** | Running a separate Node.js CMS process adds operational overhead (memory, deployment, backups). The content model (5 subjects, lessons, questions) is simple enough for a custom admin. | Custom admin with Server Actions |
| **react-i18next** (without next-i18next) | Requires manual integration with Next.js App Router — no routing middleware, no locale detection, no server component support without manual wiring. | next-intl |
| **Google Analytics / Mixpanel** | COPPA violation. Collecting behavioral analytics or engagement data from children under 13 is prohibited without separate parental consent. | No analytics, or privacy-focused (no PII, no cookies, anonymous page-count only) |

## Stack Patterns by Variant

**If targeting low-end children's tablets (Android tablets, older iPads):**
- Use `processLocally: true` for Web Speech API (avoids cloud round-trips, works offline)
- Keep Dexie DB name stable (no version bumps without migration code)
- Avoid Recharts animations (`isAnimationActive={false}`) — animations cause jank on low-end devices
- Use `next-intl` with static message files (no dynamic JSON loading) to minimize network requests
- Consider removing chart library entirely for initial dashboard — use simple CSS-based progress bars

**If expanding to multiple children/profiles:**
- Extend the Dexie schema with a `profileId` field on every table
- Multi-device sync becomes more important (child plays on both tablet and laptop)
- The custom sync layer becomes the critical path — invest in conflict resolution testing early
- Parent dashboard becomes more complex (per-child charts, comparison views) — Recharts still holds

**If pronunciation scoring needs phoneme-level feedback (LOW priority for 5yo):**
- Add Azure Speech SDK as a pluggable scorer behind an interface:
  ```
  interface PronunciationScorer {
    score(audio: Blob, expected: string): Promise<PronunciationResult>;
  }
  ```
- Implement two scorers: `WebSpeechApiScorer` (free, basic) and `AzureSpeechScorer` (paid, detailed)
- Route through a feature flag or confidence threshold (use Azure when Web Speech confidence is low)
- For COPPA: voice recordings sent to Azure require separate parental consent (biometric data definition in new 2025 rule)

**If adding more languages beyond English + Malay:**
- next-intl handles any number of locales — add `{locale}.json` and update routing config
- SEO: update `generateStaticParams` for each new locale
- Pronunciation: each language needs its own on-device language pack (Chrome supports ~20 languages for on-device recognition)
- Curriculum: new language means new lesson content — the content authoring admin becomes critical

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `next@16.2.x` | `next-intl@^4` | next-intl v4 requires Next.js 14+. Works with Next.js 16 App Router. |
| `next@16.2.x` | `next-i18next@^16` | next-i18next v16 supports Next.js 16's `proxy.ts` convention (replaces `middleware.ts`). |
| `react@19.2.x` | `dexie-react-hooks@^4` | Works with React 18+ concurrent features. |
| `react@19.2.x` | `recharts@^3` | Recharts v3+ built for React 18/19. |
| `react@19.2.x` | `zustand@^5` | Zustand v5 requires React 18+. |
| `drizzle-orm@0.45.x` | `postgres` or `pg` | Current project uses `pg`. No breaking changes expected for the sync API routes. |
| `zod@3.x` | `react-hook-form@^7` + `@hookform/resolvers` | Official resolver package needed for integration. |
| `uuid@11.x` | All modern browsers | Works everywhere. Crypto-based UUIDs in modern environments. |
| `dexie@4.x` | `dexie-react-hooks@^4.x` | Must match major versions. |

**Database schema for sync (existing `learner_sync` table enhancement):**
```typescript
// Enhanced schema for per-field merge
export const learnerSync = pgTable("learner_sync", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  deviceId: text("device_id").notNull(),
  playerName: text("player_name").notNull().default("Player"),
  avatar: text("avatar").notNull().default("🧑‍🚀"),
  version: integer("version").notNull().default(1),          // ← exists, for conflict detection
  snapshot: jsonb("snapshot").$type<LearningSnapshot>().notNull(), // ← exists
  isDeleted: boolean("is_deleted").notNull().default(false), // ← NEW: for soft-delete sync
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }), // ← NEW: for delta sync
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("learner_sync_device_idx").on(table.deviceId)]);
```

## Sources

- **Dexie.js v4 docs** (dexie.org) — Offline-first IndexedDB patterns, live queries, schema versioning, sync architecture. Verified v4 features (auto-detect schema changes on load, cross-tab observation). **HIGH confidence.**
- **Web Speech API W3C Spec** (webaudio.github.io/web-speech-api/) — On-device recognition (`processLocally`), contextual biasing (`phrases`), Quality enum (`command`/`dictation`/`conversation`). **HIGH confidence.** Spec updated 2025 with new features.
- **MDN Web Speech API docs** (developer.mozilla.org) — Usage patterns, browser support, language pack installation for offline recognition. **HIGH confidence.**
- **Recharts v3** (npm: 48.9M weekly downloads, May 2026) — React chart library comparison. Recharts compared vs Chart.js, ECharts, Nivo, Victory across rendering performance, bundle size, DX. Source: usedatabrain.com/blog/react-chart-libraries (verified May 2026). **MEDIUM confidence** (third-party benchmarks, but consistent across multiple sources).
- **LogRocket React Chart Libraries 2026** (blog.logrocket.com) — Updated June 2026 with Next.js App Router and React 19 considerations. Confirms Recharts as default pick for SVG charts. **MEDIUM confidence.**
- **next-intl docs** (next-intl.dev) — App Router setup, routing, Server Component translations, ICU MessageFormat. Verified v4 latest features. **HIGH confidence.**
- **next-i18next v16 release** (github.com/i18next/next-i18next/releases/tag/v16.0.0) — App Router support, `createProxy()` for Next.js 16, mixed router support. **HIGH confidence.**
- **FTC COPPA Rule 2025 Amendments** (ftc.gov) — Final rule published January 2025, effective April 22, 2026. Expanded definitions (biometric identifiers), data minimization duty, written retention policy requirement, separate consent for third-party disclosures. **HIGH confidence.**
- **Promise Legal COPPA Guide** (blog.promise.legal) — April 2026 compliance deadline analysis, 8-checkpoint audit framework, AI training data consent requirements. **MEDIUM confidence** (legal blog, consistent with official FTC text).
- **Azure Pronunciation Assessment docs** (learn.microsoft.com) — Phoneme-level scoring, Pearson correlation >0.5 with human judges, supported languages, best practices. Verified March 2026 update. **HIGH confidence.**
- **Zod docs** (zod.dev) — Schema validation, TypeScript inference. Industry standard for runtime validation in the Next.js ecosystem. **HIGH confidence.**
- **Zustand docs** (github.com/pmndrs/zustand) — 2.6M weekly downloads, 49KB bundle, ~1KB gzipped. Minimal state management. **HIGH confidence.**
- **OpenPronounce** (github.com/taalbubbl/OpenPronounce) — Open-source pronunciation analysis using Wav2Vec2 + DTW alignment. Reference for self-hosted pronunciation scoring patterns. **LOW confidence** (small project, not production-proven).

---
*Stack research for: Offline-first children's educational platform with pronunciation scoring, parental dashboard, content authoring, bilingual i18n, and COPPA compliance*
*Researched: 2026-07-10*
