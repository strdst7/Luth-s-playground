# Project Research Summary

**Project:** Luth's Playground
**Domain:** Offline-first children's educational platform (ages 4-6, bilingual English + Malay) with pronunciation scoring, parental dashboard, content authoring, and COPPA compliance
**Researched:** 2026-07-10
**Confidence:** HIGH

## Executive Summary

Luth's Playground is an offline-first, bilingual (English + Malay) educational platform for a 5-year-old child, built on Next.js 16 with a custom offline sync engine and PostgreSQL backend. Research across stack, features, architecture, and pitfalls confirms that this is a well-scoped personal project with a clear technical direction, but with several critical risks that must be addressed before expanding features.

**The recommended approach** is a 6-phase build: (1) Foundation & Security — extract pure types/functions, fix hardcoded credentials and PIN, design COPPA consent architecture; (2) Offline-First Sync Engine — Dexie.js IndexedDB layer with a proper six-state sync queue (not the current binary pending/synced/error), per-field merge conflict resolution, and idempotency keys; (3) Component Extraction & i18n — decompose the 872-line `learning-app.tsx` into route-backed views and implement next-intl bilingual routing with Malay language support; (4) Parent Dashboard — secure PIN gate, meaningful metrics (trends, struggle signals, not vanity metrics), Recharts visualizations; (5) Pronunciation Scoring — Web Speech API for transcription with word-level LCS diff scoring (not phoneme-level), PasarAPI.xyz as optional verifier; (6) Content Authoring — template-first lesson builder with Zod/RHF forms. This ordering respects the dependency chain discovered in architecture research and avoids the most critical pitfalls.

**Key risks:** (1) COPPA 2026 compliance — voice recordings are now biometric PII requiring separate parental consent, and data retention policies must be written and published; this is not optional. (2) Sync data loss — the current three-state sync queue (pending/synced/error) silently drops data on crash; a six-state machine with IN_FLIGHT, RETRYABLE_ERROR, and DEAD_LETTER states is mandatory. (3) Web Speech API false positives — using `recognition.confidence` as a pronunciation grade will produce misleading results for a 5-year-old's voice; the research is clear that this must be a word-level Levenshtein comparison, not a confidence-score pass-through. (4) Content authoring abandonment — the biggest differentiator risks falling flat if the first lesson creation takes more than 5 minutes; template-first design and pre-built curriculum as default are essential.

## Key Findings

### Recommended Stack

The stack research (STACK.md) recommends a pragmatic, lightweight architecture optimized for a single-developer codebase and low-end tablets. The key principle: use battle-tested libraries where they fit, write custom code where the integration is unique (sync layer), and defer complexity until it's justified.

**Core technologies:**
- **Dexie.js ^4.2.x + dexie-react-hooks ^4.x** — IndexedDB wrapper with reactive live queries; 154KB gzipped, auto-change tracking, declarative schema versioning. The only production-ready IndexedDB wrapper with `useLiveQuery()` React bindings.
- **Custom sync layer** (not Dexie Cloud, not CRDT libraries) — Per-field merge with version vectors and LWW for progress data. Rationale: the data model is simple (XP, streaks, badges — no collaborative editing), and off-the-shelf sync engines assume their own backend protocol (CouchDB, Supabase, Firebase). The existing Drizzle/PostgreSQL backend is staying; custom sync API routes are the right fit.
- **Web Speech API** (native, with `processLocally: true`) — For MVP transcription. Azure Speech SDK is documented as an optional pluggable fallback if phoneme-level feedback is needed, but research shows it's unnecessary for a 5-year-old: simple "did the audio roughly match the text?" with color-coded feedback (green/yellow/red) is age-appropriate and avoids $1/hr API costs.
- **Recharts ^3.8.x** — SVG-based React chart library for the parent dashboard. 48.9M weekly npm downloads, composable React API, tree-shakeable to ~50KB. Sufficient for <5K data points (a single child's history will never exceed this).
- **next-intl ^4.x** — De facto standard for App Router i18n in 2026. Native RSC support, ICU MessageFormat (critical for Malay pluralization), type-safe translation keys, integrated routing middleware.
- **Zustand ^5.x** — ~1KB gzipped state management for UI state (theme, sound, difficulty, sync status). No providers, no boilerplate. App state stays separate from persistent game state (which lives in Dexie).
- **Zod ^3.24.x + React Hook Form ^7.54.x** — Runtime validation and performant forms for the admin/content authoring dashboard. Industry standard for TypeScript-first schema validation.
- **`uuid` ^11.x** — ULID-based idempotency keys for offline-first sync records to prevent ID collisions.

**Version compatibility verified:** `next@16.2.x` + `next-intl@^4`, `react@19.2.x` + `dexie-react-hooks@^4` + `recharts@^3` + `zustand@^5`, `drizzle-orm@0.45.x` + `pg`.

### Expected Features

The feature research (FEATURES.md) analyzed competitors (Khan Academy Kids, Lingokids, MathCraft, Monkey Stories) and parent-built apps (AI Kiddo, Train Game, StoryWeaver) to identify what matters for this project's specific context.

**Must have (table stakes):**
- **Full offline operation** — Core learning flows (view lesson, answer quiz, earn XP) must work with zero connectivity. Parents hand tablets to children without guaranteed Wi-Fi. This is the #1 dependency for all other features.
- **Customizable parent PIN** — The hardcoded `1234` PIN displayed on the same screen is unacceptable. Hashed PIN storage, lockout on failed attempts, recovery mechanism required.
- **Bilingual support (English + Malay)** — Per-subject language control, not a global switch. Malay as default locale (bilingual household), with English fallback chain.
- **COPPA-compliant privacy** — Separate consent flows for data collection, sync, and third-party sharing. Voice recordings now classified as biometric PII under 2026 amendments. Written data retention policy required.
- **Progress persistence across sessions** — Survive device closure, cache clear, and device loss via cloud sync.
- **Component extraction** — The 872-line `learning-app.tsx` is a maintenance blocker. View decomposition into route pages with code splitting is prerequisite for every subsequent phase.

**Should have (differentiators):**
- **Per-field merge conflict resolution for sync** — Enterprise-grade sync in a personal project. XP merges correctly even when earned offline on different devices. Parent settings use per-field merge with server-wins for conflicts; child progress uses max/union strategies.
- **Pronunciation feedback with word-level scoring** — Free via Web Speech API + PasarAPI.xyz. Word-level LCS diff with color-coded feedback. Never present as definitive — frame as "practice" with retry/skip.
- **Content authoring dashboard** — Template-first lesson builder (not blank-page-first). First lesson under 5 minutes. Most impactful differentiator — parent controls the curriculum.
- **Multi-profile for siblings** — Independent progress, XP, badges per child with separate progress. Differentiator because most free apps support only one child profile.
- **Meaningful parent metrics** — Trend data (is my child improving?), struggle signals (which topics repeated most?), actionable recommendations. Not vanity metrics (logins, time spent).

**Defer (v2+):**
- AI-assisted lesson generation (API cost, content safety concerns)
- AI tutor with logged conversations (LLM integration, cost, safety)
- Phoneme-level pronunciation analysis (requires specialized children's ASR)
- Peer comparison (requires multiple installs, privacy-safe aggregation)

### Architecture Approach

The architecture research (ARCHITECTURE.md) defines a Feature-Sliced Design adapted for a single-developer codebase with clear separation of concerns: **pure functions in `lib/`** (zero React dependencies, independently testable), **services in `features/*/services/`** (data access and business logic), **hooks in `features/*/hooks/`** (React state + side effects bridging services to components), and **route pages under `app/[locale]/`** (presentation layer with Next.js code splitting).

**Major components:**
1. **SyncEngine** — Dexie.js-backed IndexedDB store with a six-state mutation queue (PENDING → IN_FLIGHT → SYNCED / RETRYABLE_ERROR → DEAD_LETTER), pull-before-push pattern, ULID-based idempotency keys, and per-field merge conflict resolution. This is the most architecturally significant component and must be designed before any sync code is written.
2. **PronunciationScorer** — Pure function performing word-level LCS (Longest Common Subsequence) diff between expected text and Web Speech API transcript. Zero browser API dependencies, exhaustively testable. Produces word-level scores ('correct', 'missing', 'extra', 'substituted').
3. **AnalyticsPipeline** — Tiered metrics system computing learning metrics (XP trends, subject mastery, streak history, accuracy trends) from local IndexedDB progress events on demand. No server-side analytics needed at single-child scale. COPPA-safe: no PII sent to external services.
4. **i18n routing** — next-intl middleware with locale detection (cookie → Accept-Language → default 'ms'), content fallback chain (target locale → English → generic placeholder), per-feature message files.

**Key architectural patterns:**
- SSR is treated as a shell only — no user data is server-rendered. Hydration mismatch avoided by client-only rendering of data-dependent views with skeleton loading states.
- View components never call `fetch()` directly — data access is always through custom hooks that encapsulate service calls.
- Admin routes (`/admin/`) are a separate Next.js route group with their own layout and auth middleware, isolated from the child-facing app.

### Critical Pitfalls

The pitfalls research (PITFALLS.md) identified 15 critical issues across sync, COPPA, speech, UX, i18n, and security domains. Verified against FTC enforcement actions, peer-reviewed studies, and production-tested patterns.

1. **Binary sync state machine (data loss on crash)** — A 3-state queue (pending/synced/error) cannot distinguish "about to send" from "stuck in transit," causing silent data loss on crash. **Mitigation:** Implement 6 states (PENDING, IN_FLIGHT, SYNCED, RETRYABLE_ERROR, FATAL_ERROR, DEAD_LETTER) with `inFlightAt` timestamp recovery jobs. This must be designed before any sync code is written.

2. **Web Speech API as pronunciation grader (false positives destroy trust)** — The API's `confidence` score measures transcription certainty, not pronunciation quality. For 5-year-olds, Word Error Rate is 15-35%. **Mitigation:** Never use `recognition.confidence` as a grade. Use word-level LCS diff between expected text and transcript. Always offer retry/skip. Frame as "practice" not "test."

3. **COPPA consent bundled with Terms of Service (instant FTC violation)** — Single-checkbox consent is prohibited. The 2026 amendments require separate VPC for data collection, separate consent for third-party sharing, and affirmative action (no pre-checked boxes). **Mitigation:** Two-screen consent flow with audit trail. Written data retention policy before any data storage. Voice recordings (biometric PII) require explicit disclosure and separate consent.

4. **Parental dashboard vanity metrics (looks good, useless in practice)** — Showing time spent, logins, and streaks doesn't answer "is my child learning?" 85% of parents rate EdTech dashboards at 5/10 or lower. **Mitigation:** Design for one-screen answer to "is my child on track?" with trend data, struggle signals, and actionable recommendations. De-emphasize logins and time.

5. **Content authoring abandonment (stops working after week 1)** — Blank-canvas lesson creation takes 30+ minutes → user never returns. Korea's $800M AI Textbook project failed in 4 months (87.4% felt unprepared). **Mitigation:** Template-first, not blank-page-first. First lesson under 5 minutes. Pre-built 25-lesson curriculum as default. Tweak existing lessons before creating new ones.

6. **i18n that breaks on Malay (RTL assumptions, missing audio)** — Malay has longer compound words (`mempertanggungjawabkan` = 22 chars), different sentence structure, reduplication for plurals, and no default browser TTS voice. **Mitigation:** Use ICU MessageFormat, not string concatenation. CSS logical properties. Malay TTS fallback chain (browser → PasarAPI → cloud). Native speaker content review.

## Implications for Roadmap

Based on the dependency chain from architecture research, feature prioritization matrix from features research, and pitfall prevention requirements, the recommended phase structure is:

### Phase 0.5: Foundation & Security
**Rationale:** Prerequisite for every subsequent phase. COPPA compliance cannot be retrofitted. Hardcoded credentials and PIN are active security holes. Pure type extraction unblocks all architecture work.
**Delivers:** `lib/types.ts`, `lib/constants.ts`, `lib/analytics/metrics.ts`, `lib/sync/merge-fields.ts`, `lib/speech/lcs.ts` — independently testable pure functions. DB credentials moved to env vars. HMAC device token pattern defined. COPPA consent architecture designed (two-screen flow, audit trail). Written data retention policy published.
**Addresses:** SEC-01 through SEC-04 (security fixes), DEBT-01 through DEBT-04 (tech debt foundation)
**Avoids:** Pitfall 5 (COPPA consent bundling), Pitfall 11 (no data retention policy), Pitfall 14 (hardcoded PIN), Pitfall 15 (COPPA school consent assumption)
**Research flag:** LOW — well-documented patterns (environment variables, TypeScript extraction, COPPA regulatory text). No research-phase needed.

### Phase 1: Offline-First Core + Sync Engine
**Rationale:** The single highest-priority feature from the feature matrix (P1). Everything else (dashboard, pronunciation, content authoring) depends on reliable offline data storage. Must be designed before sync code is written — retrofitting sync states is a schema migration nightmare.
**Delivers:** Dexie.js IndexedDB schema (`progress_store`, `sync_queue`, `conflict_log`, `settings_store`), six-state SyncEngine class with ULID idempotency keys and batch queue processing, pull-before-push `/api/sync` endpoints with rate limiting and HMAC verification, per-field merge conflict resolver, offline-first service worker shell with asset caching.
**Addresses:** SYNC-01 through SYNC-06 (full sync engine)
**Uses:** Dexie.js ^4.2.x, `uuid` ^11.x, Zustand ^5.x (for sync status UI state)
**Implements:** Pattern 1 — Offline-First Sync Engine
**Avoids:** Pitfall 1 (binary sync states), Pitfall 2 (LWW on all fields), Pitfall 3 (over-engineering CRDT), Pitfall 13 (sync retry storm)
**Research flag:** MEDIUM — the sync architecture is well-documented, but the custom integration with Drizzle/PostgreSQL needs implementation-level decisions (batch size, retry policy). May need `/gsd-research-phase` during planning for rate limiting and backoff specifics.

### Phase 2: Component Extraction + Bilingual i18n
**Rationale:** The 872-line `learning-app.tsx` is an active maintenance blocker and prevents code splitting. i18n must be built before content authoring to avoid retrofitting translations. These two workstreams can parallelize.
**Delivers:** Route pages extracted from monolithic component (`/learn`, `/arcade`, `/badges`, `/progress`, `/parent/dashboard`), shared UI primitives in `components/ui/`, next-intl middleware with Malay as default locale, `messages/en/*.json` and `messages/ms/*.json` with ICU MessageFormat, LanguageSwitcher component, content fallback chain (target → English → placeholder).
**Addresses:** UI-01 through UI-04 (component extraction), LOCALE-01 (bilingual support), DEBT-01 through DEBT-04 (tech debt resolution)
**Uses:** next-intl ^4.x, shadcn-style UI primitives
**Implements:** Pattern 3 (i18n with fallback chain), Pattern 5 (component decomposition)
**Avoids:** Pitfall 9 (Malay i18n breakage — text overflow, missing TTS, ICU format), Pitfall 10 (Next.js + offline hydration mismatch — views render data client-side only), Pitfall 8 (children's UX — apply principles per-view during extraction: no progress bars, tap-on-touch-down, large targets)
**Research flag:** MEDIUM — i18n setup is well-documented (next-intl docs), but Malay TTS on target devices needs testing. Plan for a TTS test session on the actual tablet.

### Phase 3: Parent Dashboard
**Rationale:** Depends on Phase 1 (progress data in IndexedDB) and Phase 2 (extracted dashboard view + i18n). Can be built once the data flow from lesson completion → IndexedDB → analytics pipeline is established.
**Delivers:** Customizable parent PIN (hashed, with lockout + recovery), AnalyticsPipeline computing MetricsSnapshot from IndexedDB, Recharts visualizations (line: XP over time, bar: subject progress, radar: skill distribution), one-screen metrics answer to "is my child on track?", weekly summary (not daily notifications), sync status display for parent.
**Addresses:** PARENT-01 (dashboard polish), PARENT-02 (customizable PIN)
**Uses:** Recharts ^3.8.x, Zustand ^5.x (dashboard UI state), `date-fns` ^4.x (date formatting)
**Implements:** Pattern 4 (Analytics Pipeline)
**Avoids:** Pitfall 6 (vanity metrics — design for trend data, struggle signals, recommendations), Pitfall 14 (PIN security — implement before any parent data is accessible)
**Research flag:** LOW — Recharts and dashboard patterns are well-documented. No research-phase needed.

### Phase 4: Pronunciation Scoring
**Rationale:** Independent of Phase 3 (doesn't need the dashboard). Depends on Phase 2 (extracted LessonPlayer view for in-lesson speak-aloud activities). Web Speech API integration is straightforward, but the scoring UX is sensitive.
**Delivers:** `useSpeechRecognition` hook (with `processLocally: true` and contextual biasing via `phrases` property), `PronunciationScorer` (pure word-level LCS diff), color-coded word feedback (green/yellow/red), effort-based XP (rewards trying, not just correctness), 3-attempt retry + "skip" option, PasarAPI.xyz integration as optional verifier, parent can hear child's recordings (local only, with COPPA consent).
**Addresses:** PRON-01 (pronunciation scoring), PRON-02 (pronunciation transparency)
**Uses:** Web Speech API (native), PasarAPI.xyz (optional), `features/speech/services/PronunciationScorer.ts`
**Implements:** Pattern 2 (Pronunciation Scoring with Web Speech API)
**Avoids:** Pitfall 4 (WS API confidence as grader — use LCS instead), Pitfall 12 (frustration from false negatives — retry + skip + effort XP)
**Research flag:** HIGH — PasarAPI.xyz accuracy for 5-year-old voices is unverified. Must test with actual child utterances before trusting results. Web Speech API's Malay language support (`ms-MY`) needs verification on target device (Chrome on Android). Plan a `/gsd-research-phase` during planning for accuracy testing.

### Phase 5: Content Authoring Dashboard
**Rationale:** Lowest priority among differentiated features because the existing 25 hardcoded lessons work for MVP. But highest long-term leverage — the parent (developer) can extend the curriculum without touching code. Depends on Phase 2 (i18n architecture for translated lesson content) but can proceed independently of Phase 3 and 4.
**Delivers:** `/admin` route group with auth middleware, template-first lesson builder (select subject → fill content → add questions → preview), Zod validation on every server action form, LessonEditor component with rich text (Tiptap optional), PublishToggle workflow with versioning, TranslationManager for managing `en`/`ms` lesson variants.
**Addresses:** AUTH-01 (lesson CRUD), AUTH-02 (curriculum management), AUTH-03 (lesson versioning)
**Uses:** Zod ^3.24.x, React Hook Form ^7.54.x, Tiptap ^2.10.x (optional), `sonner` ^2.x (toast notifications)
**Implements:** Admin architecture pattern from STACK.md
**Avoids:** Pitfall 7 (content authoring abandonment — template-first, 5-min first lesson, preview mode, pre-built curriculum as default)
**Research flag:** LOW — Zod/RHF/admin patterns are well-documented. No research-phase needed, but the UI design for template-first lesson creation needs thoughtful UX work.

### Phase 6: Polish & COPPA Enforcement
**Rationale:** Phases 0.5 (consent architecture) and 1 (sync) lay the COPPA groundwork, but full enforcement (consent gate, data deletion, UI polish) depends on all other features being built so the consent flow can reference them.
**Delivers:** Service Worker for background sync, parent consent gate screens (two-screen: collection + third-party disclosure), one-click parent-triggered cloud data wipe (`DELETE /api/account`), voice recording retention enforcement (delete after scoring, or store only with explicit opt-in), written data retention policy linked from app, accessibility pass (prefers-reduced-motion, keyboard navigation, touch target audit), loading states and transitions, confetti skip button, confetti interruptible, AnimationControl component.
**Addresses:** SEC-03 (content filter), UI-03 (loading states), UI-04 (accessibility)
**Implements:** COPPA compliance architecture, service worker background sync
**Avoids:** Pitfall 5 (COPPA consent — full enforcement), Pitfall 11 (data retention — deletion mechanism operational)
**Research flag:** MEDIUM — service worker patterns are standard, but COPPA consent gate UX needs thought. The specific consent language referencing project features needs to be written.

### Phase Ordering Rationale

- **Phase 0.5 first** because COPPA consent architecture and security fixes cannot be retrofitted without breaking changes. Pure type extraction is zero-risk and unblocks all subsequent phases.
- **Phase 1 before Phase 2** because the offline data layer must exist before meaningful views can operate independently. The sync engine is the riskiest component and benefits from early validation.
- **Phase 2 before Phase 3** because the parent dashboard view exists in the monolithic component; it must be extracted before it can be meaningfully enhanced.
- **Phase 4 (pronunciation) scheduled early** because it's a key differentiator for bilingual learning and the Web Speech API integration needs the most validation (children's voice accuracy risk).
- **Phase 5 last** because the existing hardcoded curriculum works; content authoring is the highest-leverage feature but has the lowest urgency.
- **Phase 6 as ongoing layer** rather than a discrete phase — COPPA consent architecture is designed in Phase 0.5 but enforced across all features; polish touches every phase.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Pronunciation):** HIGH — PasarAPI.xyz accuracy for 5-year-old Malay/English voices unverified. Web Speech API Malay (`ms-MY`) on-device support uncertain. Plan `/gsd-research-phase` for accuracy testing with actual child recordings.
- **Phase 1 (Sync):** MEDIUM — custom sync architecture is sound, but implementation specifics (batch sizing, retry policy parameters, backoff strategy) need prototyping. Consider `/gsd-research-phase` for rate limiting patterns.

Phases with standard patterns (skip research-phase):
- **Phase 0.5 (Foundation):** TypeScript extraction, environment variables, COPPA regulatory text — all well-documented.
- **Phase 3 (Dashboard):** Recharts, Zustand, analytics pipeline — all standard patterns.
- **Phase 5 (Content Authoring):** Zod, React Hook Form, admin patterns — industry standard.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified via official docs (Dexie.js, Web Speech API spec, MDN, next-intl, Zustand, Zod) and cross-referenced with multiple sources. FTC COPPA regulatory text directly sourced. |
| Features | HIGH | Verified against peer-reviewed research (Meyer 2021, Montazami 2022, SingaKids ACL 2025, Ngadni 2025), competitor analysis of 15+ products, and regulatory sources (FTC COPPA 2026 amendments, FTC enforcement actions). |
| Architecture | HIGH | Patterns sourced from official documentation (Next.js App Router, MDN Web Speech API, Dexie.js), established architectural literature (Martin Fowler, Feature-Sliced Design, Smashing Magazine), and production-tested sync patterns (six-state queue, per-field merge). |
| Pitfalls | HIGH | Multi-source verified: FTC enforcement records, peer-reviewed child ASR studies, production-tested sync patterns from Dev.to, COPPA compliance checklists, children's UX research (TIDRC, NN/G, Sesame Workshop), Malay language studies. |

**Overall confidence:** HIGH

### Gaps to Address

- **PasarAPI.xyz accuracy for children's voices:** No peer-reviewed or published accuracy data for `ms-MY` children's speech. Must test with actual 5-year-old utterances before trusting pronunciation scoring. Fallback plan: if accuracy is insufficient, the pronunciation feature becomes a simple "listen then repeat" exercise without automated scoring.
- **Web Speech API on-device Malay support:** The `processLocally: true` and `ms-MY` locale combination may not be supported on all target devices. Must verify on the specific tablet (Android Chrome) during Phase 2 planning.
- **Performance on low-end tablets:** All research assumes modern browser support. The target device may have performance constraints. Phase 2 component extraction should include a performance audit with the actual tablet.
- **Sync queue compaction strategy:** The research identifies merging queue entries before sending as a mitigation for retry storms, but the exact compaction logic (which events are safe to merge, which must be preserved individually) needs implementation-level specification during Phase 1 planning.

## Sources

### Primary (HIGH confidence)
- **Dexie.js v4 docs** (dexie.org) — Offline-first IndexedDB patterns, live queries, schema versioning, sync architecture
- **Web Speech API W3C Spec** (webaudio.github.io/web-speech-api/) — On-device recognition, contextual biasing, Quality enum
- **MDN Web Docs — Web Speech API** (developer.mozilla.org) — Browser support, on-device processing
- **next-intl docs** (next-intl.dev) — App Router i18n, routing middleware, Server Component translations, ICU MessageFormat
- **FTC COPPA Rule 2025 Amendments** (ftc.gov) — Final rule effective April 22, 2026: biometric PII, data retention, separate consent
- **FTC COPPA enforcement actions** (ftc.gov) — Disney $10M, Cognosphere $20M, Apitor $500K — enforcement precedent
- **Six-state sync queue analysis** (dev.to/salazarismo) — IN_FLIGHT, DEAD_LETTER states, idempotency, retry storms
- **Sync conflict handling in offline-first PWAs** (dev.to/crisiscoresystems) — Per-field merge, wall-clock vs logical timestamps
- **Child ASR recognition gap** (the-learning-agency.com) — 15-35% WER for ages 4-6, Web Speech API limitations
- **Edwards et al. 2026** — Automated speech scoring in early elementary: "far below human scorers" (doi.org/10.31234/osf.io/r3ydm_v1)
- **Meyer et al. 2021** — "How educational are 'educational' apps for young children?" Four Pillars of Learning (PMC)
- **NN/G children's usability** (nngroup.com) — Age-targeting, gesture patterns, reading level guidance
- **TIDRC touchscreen interaction framework** (doi.org/10.1145/3311927.3323149) — Meta-analysis of children's touch interaction
- **Hidden symbols study** (faculty.washington.edu) — Why progress bars and hand demos fail for preschoolers
- **Korea AI textbook failure** (minssam.com) — $800M project abandoned in 4 months, 87.4% unprepared
- **Malay cultural design principles** (ir.upsi.edu.my) — Malay UI design for mobile apps
- **MalayLearning app research** (doi.org/10.35631/ijepc.1061083) — Gamified language app development
- **SingaKids ACL 2025** — Multilingual multimodal dialogic tutor for language learning (peer-reviewed)
- **Martin Fowler — Modularizing React Applications** (martinfowler.com) — Layer separation, domain objects
- **Alex Kondov — Refactoring React Components** (2024) — Component splitting, extract hooks first
- **Smashing Magazine — Architecture of Local-First Web Development** (May 2026) — Offline-first patterns
- **Promise Legal COPPA Guide** (blog.promise.legal) — April 2026 compliance deadline, 8-checkpoint audit framework

### Secondary (MEDIUM confidence)
- **LogRocket React Chart Libraries 2026** (blog.logrocket.com) — Recharts vs alternatives benchmarks
- **Babble project — Web Speech API for children** (devpost.com) — Practical experience with children's pronunciation
- **EdTech abandonment research** (gurkhatech.com) — Why teachers stop using tools
- **Complexity Gap — AI tool evaluation** (nathancritchett.me) — 85-90% can't evaluate AI output
- **parent-built app inspirations** — AI Kiddo, Train Game, StoryWeaver, Pixel Foundery
- **Competitor product analysis** — Khan Academy Kids, Lingokids, MathCraft, Monkey Stories, Matific, Studycat

### Tertiary (LOW confidence)
- **OpenPronounce — Wav2Vec2 pronunciation analysis** (github.com/taalbubbl/OpenPronounce) — Small project, not production-proven
- **PasarAPI.xyz accuracy** — No published accuracy data for children's voices; needs project-specific validation

---

*Research completed: 2026-07-10*
*Ready for roadmap: yes*
