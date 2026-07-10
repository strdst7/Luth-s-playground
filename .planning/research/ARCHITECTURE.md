# Architecture Research

**Domain:** Offline-first children's educational platform
**Researched:** 2026-07-10
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Presentation Layer (Next.js 16)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐ │
│  │ Home     │ │ Learn    │ │ Arcade       │ │ Progress     │ │ Parent    │ │
│  │ View     │ │ View     │ │ View         │ │ View         │ │ Dashboard │ │
│  └────┬─────┘ └────┬─────┘ └──────┬───────┘ └──────┬───────┘ └─────┬─────┘ │
│       │            │              │                │              │       │
│  ┌────┴────────────┴──────────────┴────────────────┴──────────────┴─────┐ │
│  │                    LessonPlayer (Modal Overlay)                       │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│                          Feature Layer (Custom Hooks)                        │
│  ┌──────────────┐ ┌────────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │ useSync      │ │ useProgress    │ │ useSpeech    │ │ usePronunciation │  │
│  │ (queue mgmt) │ │ (state mgmt)   │ │ (TTS)        │ │ (Scoring)        │  │
│  └──────┬───────┘ └───────┬────────┘ └──────┬───────┘ └────────┬─────────┘  │
│         │                 │                 │                  │            │
│  ┌──────┴─────────────────┴─────────────────┴──────────────────┴──────────┐ │
│  │                           useI18n (next-intl)                          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│                          Service Layer                                       │
│  ┌──────────────────┐ ┌──────────────────┐ ┌─────────────────────────┐      │
│  │ SyncEngine       │ │ SpeechService    │ │ AnalyticsPipeline       │      │
│  │ (IndexedDB +     │ │ (Web Speech API) │ │ (metrics aggregation)   │      │
│  │  sync queue)     │ │                  │ │                         │      │
│  └────────┬─────────┘ └────────┬─────────┘ └───────────┬─────────────┘      │
│           │                    │                        │                    │
├───────────┴────────────────────┴────────────────────────┴───────────────────┤
│                          Data Layer                                          │
│  ┌──────────────────┐ ┌──────────────────┐ ┌─────────────────────────────┐  │
│  │ IndexedDB        │ │ localStorage     │ │ Curriculum Data             │  │
│  │ (Dexie.js)       │ │ (settings,       │ │ (hardcoded → CMS migration) │  │
│  │ primary store    │ │  preferences)    │ │                             │  │
│  └────────┬─────────┘ └──────────────────┘ └─────────────────────────────┘  │
│           │                                                                  │
│  ┌────────┴──────────────────────────────────────────────────────────────┐  │
│  │                  Next.js API Routes (Bridge)                           │  │
│  │  /api/sync    /api/speech    /api/admin/*    /api/health               │  │
│  └────────┬──────────────────────────────────────────────────────────────┘  │
├───────────┴──────────────────────────────────────────────────────────────────┤
│                          Backend Layer                                        │
│  ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐  │
│  │ PostgreSQL (Drizzle) │ │ PasarAPI.xyz         │ │ (Future: CMS DB)    │  │
│  │ sync & auth          │ │ external APIs        │ │ Payload / custom     │  │
│  └──────────────────────┘ └──────────────────────┘ └──────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **HomeView** | Welcome hero, stats, subject cards, daily mission | Server component where possible, client for animations |
| **LearnView** | Subject/lesson browser with filters, bilingual toggle | Server component with client search/filter |
| **LessonPlayer** | Question UI, answer input, speech practice, pronunciation scoring, XP reward | Client component (full interactivity) |
| **ArcadeView** | External API integration (dog pics, facts, rhymes) | Client component with offline fallback data |
| **BadgesView** | Badge collection display, unlock animations | Client component, reads from IndexedDB |
| **ProgressView** | Charts, metrics, streak calendar, weekly activity graph | Client component with Chart.js or recharts |
| **ParentDashboard** | Learning metrics, settings, reports, COPPA controls | Client component, PIN-gated, config export |
| **AdminDashboard** | Lesson/subject CRUD, publish workflow, translations | Client component, admin-auth-gated, separate route group |
| **SyncEngine** | IndexedDB mutations queue, conflict resolution, cloud sync | Service worker + IndexedDB, React hook facade |
| **SpeechService** | TTS playback, speech recognition results | Browser API wrapper, hook facade |
| **PronunciationScorer** | Compare spoken vs expected phonemes, accuracy scoring | Pure functions + Web Speech API hook |
| **AnalyticsPipeline** | Compute learning metrics from progress events | Pure functions, runs on demand for dashboard |

## Recommended Project Structure

```
src/
├── app/                           # Next.js App Router routes
│   ├── [locale]/                  # i18n route segment (next-intl)
│   │   ├── layout.tsx             # Root layout with locale detection
│   │   ├── page.tsx               # Home/Learn view (SPA shell or route)
│   │   ├── learn/
│   │   │   ├── [subjectId]/
│   │   │   │   └── [lessonId]/
│   │   │   │       └── page.tsx   # Individual lesson page (deep-linkable)
│   │   │   └── page.tsx           # Subject/lesson browser
│   │   ├── arcade/page.tsx
│   │   ├── badges/page.tsx
│   │   ├── progress/page.tsx
│   │   └── parent/
│   │       ├── page.tsx           # PIN gate
│   │       └── dashboard/
│   │           ├── page.tsx       # Parent dashboard
│   │           ├── settings/page.tsx
│   │           └── reports/page.tsx
│   ├── admin/                     # Admin route group (separate layout)
│   │   ├── layout.tsx             # Admin auth check layout
│   │   ├── lessons/
│   │   │   ├── page.tsx           # Lesson list
│   │   │   ├── new/page.tsx       # Create lesson
│   │   │   └── [id]/edit/page.tsx # Edit lesson
│   │   ├── subjects/page.tsx
│   │   └── translations/page.tsx  # Translation management
│   └── api/
│       ├── sync/route.ts          # Sync endpoint
│       ├── speech/route.ts        # PasarAPI bridge
│       ├── admin/
│       │   ├── lessons/route.ts   # Lesson CRUD API
│       │   └── subjects/route.ts  # Subject CRUD API
│       └── health/route.ts        # Health check
├── components/                    # Shared UI components
│   ├── ui/                        # Primitive UI (shadcn-style)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── PinPad.tsx
│   │   └── SyncIndicator.tsx
│   └── layout/
│       ├── TopBar.tsx
│       ├── BottomNav.tsx
│       └── TabBar.tsx
├── features/                      # Feature-based modules
│   ├── sync/
│   │   ├── hooks/
│   │   │   ├── useSync.ts         # Sync queue facade
│   │   │   ├── useConflict.ts     # Conflict resolution UI
│   │   │   └── useOnlineStatus.ts # Connectivity tracking
│   │   ├── services/
│   │   │   ├── SyncEngine.ts      # Core sync engine class
│   │   │   ├── IndexedDBStore.ts  # Dexie.js wrapper
│   │   │   └── ConflictResolver.ts # Per-field merge logic
│   │   └── types.ts
│   ├── speech/
│   │   ├── hooks/
│   │   │   ├── useSpeechRecognition.ts  # Web Speech API hook
│   │   │   ├── useSpeechSynthesis.ts    # TTS hook
│   │   │   └── usePronunciation.ts      # Scoring hook
│   │   ├── services/
│   │   │   ├── SpeechService.ts          # Browser API wrapper
│   │   │   ├── PronunciationScorer.ts    # Phoneme comparison
│   │   │   └── PhraseBooster.ts          # Contextual biasing
│   │   └── types.ts
│   ├── progress/
│   │   ├── hooks/
│   │   │   ├── useProgress.ts           # Read/write progress
│   │   │   └── useStreak.ts             # Streak calculation
│   │   ├── services/
│   │   │   ├── ProgressStore.ts         # IndexedDB progress ops
│   │   │   └── AnalyticsPipeline.ts     # Metrics computation
│   │   └── types.ts
│   ├── parent-dashboard/
│   │   ├── components/
│   │   │   ├── MetricsGrid.tsx
│   │   │   ├── ActivityChart.tsx
│   │   │   ├── SubjectBreakdown.tsx
│   │   │   ├── SettingsForm.tsx
│   │   │   └── DataDeletionButton.tsx
│   │   ├── hooks/
│   │   │   ├── useParentAuth.ts         # PIN management
│   │   │   ├── useMetrics.ts            # Aggregated metrics
│   │   │   └── useReportExport.ts       # PDF/CSV export
│   │   └── types.ts
│   ├── admin/
│   │   ├── components/
│   │   │   ├── LessonEditor.tsx
│   │   │   ├── SubjectManager.tsx
│   │   │   ├── QuestionBank.tsx
│   │   │   ├── PublishToggle.tsx
│   │   │   └── TranslationManager.tsx
│   │   ├── hooks/
│   │   │   ├── useLessons.ts
│   │   │   ├── useSubjects.ts
│   │   │   └── usePublishWorkflow.ts
│   │   ├── services/
│   │   │   └── AdminApi.ts              # Admin API client
│   │   └── types.ts
│   └── i18n/
│       ├── locales/
│       │   ├── en.json
│       │   └── ms.json
│       ├── components/
│       │   └── LanguageSwitcher.tsx
│       └── config.ts                    # next-intl setup
├── lib/                           # Pure utilities, no React
│   ├── sync/
│   │   ├── merge-fields.ts        # Per-field merge logic
│   │   ├── idempotency.ts         # ULID generation
│   │   └── diff.ts                # Object diff for sync
│   ├── speech/
│   │   ├── phoneme-utils.ts       # Phoneme comparison algorithms
│   │   ├── normalize-text.ts      # Text normalization for comparison
│   │   └── lcs.ts                 # Longest Common Subsequence diff
│   ├── analytics/
│   │   ├── metrics.ts             # XP calc, streak calc, mastery
│   │   └── charts.ts              # Chart data transformation
│   ├── constants.ts
│   └── types.ts
├── db/                            # Drizzle ORM schema (backup)
│   ├── index.ts
│   └── schema.ts
└── middleware.ts                   # next-intl locale routing
```

### Structure Rationale

- **`features/`:** Each domain concern is self-contained with its hooks, services, components, and types. This is Feature-Sliced Design adapted for a single-developer codebase — it prevents cross-coupling without the overhead of strict FSD layers. Sync, speech, progress, parent-dashboard, admin, and i18n are independent feature modules.
- **`lib/`:** Pure TypeScript functions with zero React dependencies. These are the "domain layer" — algorithms, calculations, and transformations that are independently testable. No React imports allowed here.
- **`components/ui/`:** Shared presentational primitives. shadcn/ui-style components that accept props and render markup. No business logic.
- **`components/layout/`:** App chrome — nav bars, headers. Rendered once at the layout level.
- **`app/[locale]/`:** i18n-aware route segments. Each tab view becomes its own page, enabling deep-linking and code splitting. The SPA tab pattern is replaced with real routes.
- **`app/admin/`:** Separate route group with its own layout, auth middleware, and admin-only components. Isolated from the child-facing app.

## Architectural Patterns

### Pattern 1: Offline-First Sync Engine (IndexedDB + Sync Queue)

**What:** A local-first data layer where IndexedDB is the primary store, a persistent mutation queue captures all writes, and a sync engine reconciles with the cloud when online. The app reads and writes locally — the server is a backup, not the source of truth.

**When to use:** Any application that must work fully offline. For this project: children use tablets without guaranteed internet; sync is opportunistic.

**Trade-offs:**
- + Full offline capability, instant UI feedback
- + No network dependency for core operations
- + COPPA-friendly: data lives on-device by default
- - Significant implementation complexity (queue, conflict resolution, migrations)
- - Must handle edge cases: app crash mid-sync, queue corruption, version skew

**Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│                                                                  │
│  ┌──────────┐    ┌──────────────────┐    ┌───────────────────┐  │
│  │ React    │◄──►│ useSync (hook)   │◄──►│ SyncEngine (class)│  │
│  │ Components│    │ optimistic writes │    │ ───────────────── │  │
│  └──────────┘    └──────────────────┘    │ • Read from DB    │  │
│                                           │ • Write to DB     │  │
│                                           │ • Enqueue mutation │  │
│                                           │ • Process queue    │  │
│                                           │ • Handle conflicts │  │
│                                           └────────┬──────────┘  │
│                                                    │              │
│                                           ┌────────┴──────────┐  │
│                                           │ IndexedDB (Dexie)  │  │
│                                           │ ─────────────────  │  │
│                                           │ • progress_store   │  │
│                                           │ • sync_queue       │  │
│                                           │ • conflict_log     │  │
│                                           │ • settings_store   │  │
│                                           └────────────────────┘  │
│                                                    │              │
│                                           ┌────────┴──────────┐  │
│                                           │ Service Worker    │  │
│                                           │ (background sync) │  │
│                                           └────────┬──────────┘  │
└────────────────────────────────────────────────────┼──────────────┘
                                                     │
                                                     ▼
                              ┌─────────────────────────────────────┐
                              │  Next.js API: /api/sync             │
                              │  ──────────────────────────          │
                              │  POST: accepts batch of mutations   │
                              │  GET: returns deltas since cursor   │
                              │                                      │
                              │  IdempotencyStore: dedup by key      │
                              │  MutationLog: append-only log w/seqId│
                              └────────────────┬────────────────────┘
                                               │
                                               ▼
                              ┌─────────────────────────────────────┐
                              │  PostgreSQL (Drizzle ORM)           │
                              │  • learner_sync (upsert)            │
                              │  • mutation_log (append-only)       │
                              │  • idempotency_keys (dedup)         │
                              └─────────────────────────────────────┘
```

**Sync Queue Lifecycle:**

```
User Action → write to IndexedDB (optimistic) → enqueue mutation with ULID
     ↓
Queue processor (runs on online event or periodic tick):
  1. Pull all pending mutations ordered by created_at
  2. Process per record_id sequentially (preserve causal order)
  3. Send batch POST to /api/sync with idempotency keys
  4. On 2xx: dequeue, update local version
  5. On 409: fetch server state, run conflict resolver, re-queue
  6. On failure: exponential backoff, retry up to N attempts
     ↓
On reconnect (pull-before-push):
  1. GET /api/sync?since=lastCursor → server deltas
  2. Merge deltas into IndexedDB (server wins for synced records)
  3. Flag conflicts for pending local records
  4. Then drain local queue (push phase)
```

**Example — IndexedDB schema:**

```typescript
// IndexedDB stores via Dexie.js

interface ProgressRecord {
  id: string;                // `${deviceId}:${entityType}`
  deviceId: string;
  entityType: 'progress' | 'settings' | 'player';
  payload: Record<string, unknown>;
  localVersion: number;
  serverVersion: number;
  syncStatus: 'synced' | 'pending' | 'conflict';
  updatedAt: number;
}

interface SyncQueueEntry {
  id: string;                // ULID — idempotency key (monotonic, sortable)
  recordId: string;          // references ProgressRecord.id
  operation: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
  status: 'pending' | 'in_flight' | 'failed';
  attemptCount: number;
  lastAttemptAt: number | null;
  createdAt: number;         // client timestamp
}

interface ConflictRecord {
  id: string;
  recordId: string;
  localState: Record<string, unknown>;
  serverState: Record<string, unknown>;
  resolvedState: Record<string, unknown> | null;
  strategy: 'auto-merged' | 'manual';
  resolvedAt: number | null;
}
```

**Example — Per-field merge resolver:**

```typescript
// lib/sync/merge-fields.ts
// Pure function, no React dependencies, trivially testable

export interface FieldDiff {
  field: string;
  localValue: unknown;
  serverValue: unknown;
  type: 'unchanged' | 'local-only' | 'server-only' | 'conflict';
}

export function diffFields(
  local: Record<string, unknown>,
  server: Record<string, unknown>,
  assumed: Record<string, unknown>
): FieldDiff[] {
  const allFields = new Set([...Object.keys(local), ...Object.keys(server)]);
  const diffs: FieldDiff[] = [];

  for (const field of allFields) {
    const lv = local[field];
    const sv = server[field];
    const av = assumed[field];

    if (lv === sv) continue;                     // both same, no conflict
    if (lv === av && sv !== av) {                // only server changed
      diffs.push({ field, localValue: lv, serverValue: sv, type: 'server-only' });
    } else if (sv === av && lv !== av) {         // only local changed
      diffs.push({ field, localValue: lv, serverValue: sv, type: 'local-only' });
    } else {                                     // both changed — real conflict
      diffs.push({ field, localValue: lv, serverValue: sv, type: 'conflict' });
    }
  }

  return diffs;
}

/**
 * Merge strategy for Luth's Playground data types:
 * - progress.xp: take max(local, server)
 * - progress.badges: merge arrays, deduplicate
 * - progress.completedLessons: union of both sets
 * - settings.*: server wins (parent settings authoritative)
 * - playerName: last-write-wins
 * - Timestamps: take max
 */
export function mergeByField(
  local: Record<string, unknown>,
  server: Record<string, unknown>,
  assumed: Record<string, unknown>,
  mergeRules: Record<string, MergeRule>
): { merged: Record<string, unknown>; conflicts: FieldDiff[] } {
  const diffs = diffFields(local, server, assumed);
  const merged = { ...server };  // start with server as base
  const conflicts: FieldDiff[] = [];

  for (const diff of diffs) {
    if (diff.type === 'unchanged') continue;
    if (diff.type === 'server-only') continue;  // keep server value

    const rule = mergeRules[diff.field] ?? 'server-wins';

    if (diff.type === 'local-only') {
      merged[diff.field] = diff.localValue;  // safe to apply
    } else if (diff.type === 'conflict') {
      switch (rule) {
        case 'local-wins':
          merged[diff.field] = diff.localValue;
          break;
        case 'server-wins':
          // keep server value (already set)
          break;
        case 'max':
          merged[diff.field] = Math.max(
            diff.localValue as number,
            diff.serverValue as number
          );
          break;
        case 'union-array':
          merged[diff.field] = [
            ...new Set([
              ...(diff.localValue as unknown[]),
              ...(diff.serverValue as unknown[]),
            ]),
          ];
          break;
        case 'latest-timestamp':
          // take whichever was modified most recently
          merged[diff.field] =
            (local._modifiedAt ?? 0) > (server._modifiedAt ?? 0)
              ? diff.localValue
              : diff.serverValue;
          break;
      }
      conflicts.push(diff);
    }
  }

  return { merged, conflicts };
}

type MergeRule = 'local-wins' | 'server-wins' | 'max' | 'union-array' | 'latest-timestamp';
```

### Pattern 2: Pronunciation Scoring with Web Speech API

**What:** Two-phase architecture using browser SpeechRecognition for fast transcription, then PasarAPI.xyz for verification. Word-level diff scoring via LCS alignment.

**When to use:** Browser-based pronunciation feedback without external paid services. Suitable for educational apps where approximate accuracy is acceptable (not medical/forensic).

**Trade-offs:**
- + Free, no API keys needed for initial recognition
- + On-device option (`processLocally: true`) keeps audio on device (COPPA win)
- + ~80-90% accuracy on clear speech with contextual biasing
- - Web Speech API sends audio to cloud by default (set `processLocally: true` explicitly)
- - Chrome/Edge only for recognition (Safari limited); Firefox behind flag
- - No true phoneme-level comparison — only word/transcript diff

**Architecture:**

```
┌───────────────────────────────────────────────────────────────┐
│                    Pronunciation Flow                          │
│                                                                │
│  1. User sees a word/phrase to practice                       │
│  2. Browser TTS (SpeechSynthesis) reads correct pronunciation │
│  3. User taps microphone → SpeechRecognition starts           │
│  4. On result: get transcript from recognition event          │
│  5. First pass: compare transcript to expected text           │
│  6. Optionally send text to PasarAPI for verification         │
│  7. Compute word-by-word diff with color coding               │
│  8. Display accuracy score + per-word feedback                │
│  9. Award partial XP based on accuracy                        │
└───────────────────────────────────────────────────────────────┘
```

**Example — useSpeechRecognition hook:**

```typescript
// features/speech/hooks/useSpeechRecognition.ts

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: SpeechRecognitionError | null;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

function useSpeechRecognition(options?: {
  lang?: string;           // 'en-US' | 'ms-MY'
  continuous?: boolean;
  interimResults?: boolean;
  phrases?: { phrase: string; boost: number }[];  // contextual biasing
  processLocally?: boolean;  // COPPA: keep audio on device
}): UseSpeechRecognitionReturn {
  // Creates SpeechRecognition instance
  // Handles vendor prefixes (standard + webkit)
  // Sets contextual biasing via recognition.phrases
  // Manages lifecycle: start → result/error → stop
  // Sets processLocally: true for COPPA compliance
  // Returns transcript, interim, error states
  // Cleans up on unmount
}
```

**Example — PronunciationScorer (pure function):**

```typescript
// features/speech/services/PronunciationScorer.ts

export interface WordScore {
  word: string;
  expected: string;
  actual: string;
  status: 'correct' | 'missing' | 'extra' | 'substituted';
}

export interface PronunciationScore {
  overallAccuracy: number;  // 0-100
  wordScores: WordScore[];
  correctWords: number;
  totalWords: number;
}

/**
 * Compare expected text with spoken transcript using LCS.
 * Produces word-level diff with color-coded feedback.
 * Pure function — no browser API dependencies.
 */
export function scorePronunciation(
  expected: string,
  actual: string
): PronunciationScore {
  const expectedWords = normalizeText(expected).split(/\s+/);
  const actualWords = normalizeText(actual).split(/\s+/);

  const lcs = longestCommonSubsequence(expectedWords, actualWords);
  const wordScores: WordScore[] = [];
  let correctCount = 0;

  // Align using LCS and classify each word
  let eIdx = 0, aIdx = 0, lcsIdx = 0;
  while (eIdx < expectedWords.length || aIdx < actualWords.length) {
    if (
      eIdx < expectedWords.length &&
      lcsIdx < lcs.length &&
      expectedWords[eIdx] === lcs[lcsIdx]
    ) {
      // Word matches (might be in actual at aIdx)
      const actualWord = actualWords[aIdx] ?? '';
      wordScores.push({
        word: expectedWords[eIdx],
        expected: expectedWords[eIdx],
        actual: actualWord,
        status: actualWord.toLowerCase() === expectedWords[eIdx].toLowerCase()
          ? 'correct'
          : 'substituted',
      });
      if (actualWord.toLowerCase() === expectedWords[eIdx].toLowerCase()) correctCount++;
      eIdx++;
      aIdx++;
      lcsIdx++;
    } else if (
      aIdx < actualWords.length &&
      lcsIdx < lcs.length &&
      actualWords[aIdx] === lcs[lcsIdx]
    ) {
      // Extra word in actual (not in expected)
      wordScores.push({
        word: actualWords[aIdx],
        expected: '(none)',
        actual: actualWords[aIdx],
        status: 'extra',
      });
      aIdx++;
    } else {
      // Missing word
      wordScores.push({
        word: expectedWords[eIdx],
        expected: expectedWords[eIdx],
        actual: '(missing)',
        status: 'missing',
      });
      eIdx++;
    }
  }

  return {
    overallAccuracy: expectedWords.length > 0
      ? Math.round((correctCount / expectedWords.length) * 100)
      : 0,
    wordScores,
    correctWords: correctCount,
    totalWords: expectedWords.length,
  };
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, '')  // remove punctuation except apostrophes
    .replace(/\s+/g, ' ')       // collapse whitespace
    .trim();
}
```

### Pattern 3: Bilingual i18n with fallback chain (next-intl)

**What:** Locale-aware routing via `[locale]` segment, message files organized by feature, content fallback from target language → English, type-safe translation keys.

**When to use:** Any multi-language application. For this project: English + Malay with architecture for future languages.

**Trade-offs:**
- + Type-safe translations (catch missing keys at compile time)
- + Seamless App Router integration via middleware
- + Message files per feature prevent merge conflicts
- - Requires locale prefix in URLs (`/en/learn`, `/ms/learn`)
- - Translation management UI needed for admin dashboard

**Architecture:**

```
locale detection flow:
  Browser request
    ↓
  next-intl middleware (/middleware.ts)
    ↓
  Check: cookie > Accept-Language > defaultLocale ('ms')
    ↓
  Redirect to /{locale}/...
    ↓
  Layout reads messages/{locale}.json
    ↓
  Server + Client components use useTranslations('namespace')

Content fallback chain:
  lesson content lookup: /{locale}/{subject}/{lesson}
    → try locale-specific file
    → fall back to English file
    → fall back to generic placeholder

Translation file structure:
  messages/
  ├── en/
  │   ├── common.json       # Navigation, buttons, labels
  │   ├── learn.json        # Lesson-related UI strings
  │   ├── arcade.json       # Arcade tab strings
  │   ├── badges.json       # Badge names and descriptions
  │   ├── parent.json       # Dashboard UI strings
  │   ├── subjects.json     # Subject names and descriptions
  │   └── speech.json       # Speech practice UI strings
  ├── ms/
  │   ├── common.json
  │   ├── learn.json
  │   └── ...              # Partial translations OK — fallback to en
  └── (future locale)/
```

**Example — next-intl middleware:**

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ms'],
  defaultLocale: 'ms',     // Malay as default (bilingual household)
  localeDetection: true,   // detect from browser preference
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

**Example — Content fallback for lesson data:**

```typescript
// Features can implement per-locale curriculum data
// For hardcoded content (pre-CMS migration):
const curriculum = {
  en: { /* full English curriculum */ },
  ms: { /* partial Malay translations — missing keys fall back */ },
};

function getLesson(subjectId: string, lessonId: string, locale: string): Lesson {
  const localeData = curriculum[locale]?.[subjectId]?.[lessonId];
  if (localeData) return localeData;

  // Fallback to English
  const enData = curriculum.en?.[subjectId]?.[lessonId];
  if (enData) return enData;

  throw new Error(`Lesson ${subjectId}/${lessonId} not found in any locale`);
}
```

### Pattern 4: Analytics Pipeline for Parent Dashboard

**What:** A tiered metrics system where learning events are captured locally, computed into aggregate metrics on demand, and visualized in the parent dashboard. No server-side analytics pipeline needed at this scale.

**When to use:** Parent-facing dashboards that need learning metrics (XP trends, subject mastery, streak history, time spent) without a complex data warehouse.

**Trade-offs:**
- + Fully offline — metrics computed from local IndexedDB
- + No server infra needed for analytics
- + COPPA-safe: no PII sent to analytics services
- - Metrics limited to what's stored locally
- - Aggregation is O(n) over all progress records (fine for single-child)

**Architecture:**

```
Progress Event (lesson complete, badge earned, XP award)
    ↓
write to IndexedDB (progress_store + event_log)
    ↓
    ┌───────────────────────────────────────────────────────┐
    │              AnalyticsPipeline (pure functions)        │
    │                                                       │
    │  on demand (when parent dashboard mounts):            │
    │                                                       │
    │  1. Read all progress records from IndexedDB          │
    │  2. Compute metrics:                                  │
    │     • totalXP, level, streak, longestStreak           │
    │     • subjectBreakdown: {subject: {completed, accuracy}}│
    │     • weeklyActivity: [{date, xpEarned, lessonsDone}] │
    │     • accuracyTrend: [{date, avgAccuracy}]            │
    │     • badgeProgress: [{badgeId, earned, progress}]    │
    │     • timeSpent: totalMinutes (estimated from events) │
    │  3. Return MetricsSnapshot to dashboard component     │
    │                                                       │
    └───────────────────────────────────────────────────────┘
```

**Example — AnalyticsPipeline:**

```typescript
// features/progress/services/AnalyticsPipeline.ts

export interface MetricsSnapshot {
  overview: {
    totalXp: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    totalLessonsCompleted: number;
    totalBadgesEarned: number;
  };
  subjects: Record<string, {
    completed: number;
    total: number;
    accuracy: number;
    lastPracticed: number;
  }>;
  weeklyActivity: Array<{
    date: string;
    xpEarned: number;
    lessonsCompleted: number;
  }>;
  accuracyTrend: Array<{
    date: string;
    averageAccuracy: number;
  }>;
}

export function computeMetrics(
  progress: ProgressRecord[],
  events: EventLogEntry[]
): MetricsSnapshot {
  // Pure function — all computation from data, no side effects
  // Runs in ~1ms for single-child dataset (< 10k events)
  // Result is cached in React state, recomputed on new events
  return computeAllMetrics(progress, events);
}
```

### Pattern 5: Component Decomposition (From 872 Lines to Feature Modules)

**What:** Systematic extraction of a monolithic React component into feature-based modules, custom hooks, and pure utility functions. Applied to the existing `learning-app.tsx`.

**When to use:** Any component exceeding ~200 lines with multiple concerns mixed together.

**Trade-offs:**
- + Each slice independently testable
- + Smaller files with clear responsibilities
- + Parallel work possible on different features
- - Temporary overhead during refactor
- - Need to define interfaces between pieces

**Extraction Order (dependency-aware):**

```
Phase 1: Extract pure functions (no React) → lib/
  learning-app.tsx
    → lib/constants.ts       (XP thresholds, badge definitions)
    → lib/types.ts           (Progress, Subject, Lesson types)
    → lib/analytics/metrics.ts (Level calculation, streak math)
    → lib/analytics/charts.ts  (Chart data transformation)

Phase 2: Extract data services → features/*/services/
  → features/progress/services/ProgressStore.ts
  → features/progress/services/BadgeService.ts
  → features/sync/services/SyncEngine.ts
  → features/speech/services/SpeechService.ts

Phase 3: Extract custom hooks → features/*/hooks/
  → features/progress/hooks/useProgress.ts
  → features/progress/hooks/useBadges.ts
  → features/sync/hooks/useSync.ts
  → features/speech/hooks/useSpeechSynthesis.ts
  → features/parent-dashboard/hooks/useParentAuth.ts
  → features/parent-dashboard/hooks/useMetrics.ts

Phase 4: Extract view components → separate route pages
  → app/[locale]/page.tsx            (HomeView → server component shell)
  → app/[locale]/learn/page.tsx      (LearnView)
  → app/[locale]/arcade/page.tsx     (ArcadeView)
  → app/[locale]/badges/page.tsx     (BadgesView)
  → app/[locale]/progress/page.tsx   (ProgressView)
  → app/[locale]/parent/dashboard/page.tsx (ParentDashboard)

Phase 5: Extract shared UI → components/ui/
  → components/ui/Button.tsx
  → components/ui/Card.tsx
  → components/ui/Modal.tsx (LessonPlayer shell)
  → components/ui/PinPad.tsx
  → components/ui/SyncIndicator.tsx
  → components/layout/TopBar.tsx
  → components/layout/BottomNav.tsx
```

**Key rule for each extraction step:**
1. Extract logic out, not dependencies in. New files should not import React or browser APIs unless necessary.
2. After each extraction, the original component should be *smaller and simpler*, not just delegating to imports.
3. Explicit TypeScript prop types for every split. If writing the interface feels awkward, the split boundary is wrong.

## Data Flow

### Request Flow

```
Initial Page Load:
  Browser → [locale]/page.tsx (SSR shell)
    ↓
  Layout reads messages/{locale}.json for nav labels
    ↓
  Client hydrates → useProgress reads IndexedDB
    ↓
  Default tab route renders

Lesson Play:
  User clicks lesson → /learn/{subject}/{lesson}
    ↓
  Lesson component mounts
    ↓
  useProgress provides lesson state from IndexedDB
    ↓
  User answers question → ProgressStore.write() → enqueue sync
    ↓
  UI updates optimistically (immediate XP, streak, badges)
    ↓
  SyncEngine processes queue when online

Sync Flow:
  Offline write → IndexedDB + SyncQueue (ULID idempotency key)
    ↓
  Online event fires
    ↓
  Pull server deltas (GET /api/sync?since=cursor)
    ↓
  Merge into local (server-wins for synced, flag conflicts)
    ↓
  Push local mutations (POST /api/sync batch)
    ↓
  Server deduplicates by idempotency key
    ↓
  Server responds with commit results + new cursor
    ↓
  Dequeue successful, retry failed

Parent Dashboard:
  User enters PIN → parent/dashboard loads
    ↓
  AnalyticsPipeline reads IndexedDB progress records
    ↓
  Computes MetricsSnapshot (XP, streaks, accuracy, trends)
    ↓
  Renders charts, grids, settings controls
    ↓
  Export generates PDF/CSV from snapshot

Admin Dashboard:
  /admin/lessons → admin API reads from PostgreSQL
    ↓
  OR from hardcoded curriculum data (pre-migration)
    ↓
  LessonEditor saves to DB, curriculum updated
    ↓
  PublishToggle flips isPublished flag
    ↓
  Next lesson fetch sees published content
```

### State Management

```
Global State (no Redux — too heavy for this scale):

  IndexedDB (source of truth for on-device data)
    ↓
  useProgress hook reads/writes via ProgressStore
    ↓
  useSync hook syncs with server, updates local
    ↓
  React components read from hook return values

  React Context (for cross-cutting concerns only):
    - I18nProvider (next-intl wraps automatically)
    - SyncStatusProvider (online/offline/syncing indicator)
    - DeviceIdProvider (generated once, persists in IndexedDB)

  Local Component State (for UI-only state):
    - activeTab, modalOpen, animationState
    - Form input values, validation errors

  No prop drilling deeper than 2 levels.
  Hooks encapsulate data access — components declare what they need.
```

### Key Data Flows

1. **Lesson completion:** User answers question → `useProgress.updateLessonScore()` → writes to IndexedDB (optimistic) → enqueues sync mutation → returns { xpEarned, newBadges, updatedStreak } → UI renders celebration. This is the hottest path — must be instant.

2. **Multi-device sync:** Device A completes lesson offline → queue writes to IndexedDB with ULID → Device A comes online → pull (GET /api/sync?since=X) → merge → push (POST /api/sync) → Device B comes online → pull discovers new server state → merge by field → resolve conflicts per rules → update local.

3. **Pronunciation practice:** User taps mic → `useSpeechRecognition.start()` → browser listens → `onresult` fires → transcript compared to expected via `PronunciationScorer.scorePronunciation()` → word-level diff rendered → partial XP awarded based on accuracy.

4. **Parent metric computation:** Parent opens dashboard → `useMetrics()` reads all events from IndexedDB → `AnalyticsPipeline.computeMetrics()` calculates aggregates → React state caches result → charts render → re-computes only when new events detected.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **0-1 child** (current) | Local-first IndexedDB, sync optional. Analytics from local DB. Hardcoded curriculum. Single-file components OK for prototype but extract for maintainability. |
| **2-5 children** (family) | Multi-device sync becomes important. Per-field merge handles concurrent edits. Device identity for each tablet. Parent dashboard shows multi-child view. |
| **10-100 children** (extended family/school) | Server becomes write-heavy. Need connection pooling, rate limiting, batch endpoints. Curriculum moves to CMS. Analytics may need server-side aggregation. |
| **1000+ children** (scaled) | Split sync server to separate service. Add CDN for curriculum content. Implement read replicas for dashboard queries. Consider CRDTs for complex collaborative scenarios. |

### Scaling Priorities

1. **First bottleneck:** IndexedDB performance with large event logs. Mitigation: periodic compaction, event TTL (archive events older than 12 months), aggregate pre-computation.

2. **Second bottleneck:** Sync queue draining after extended offline. Mitigation: batch mutations (don't send one-per-event), delta compression, cursor-based pagination.

3. **Third bottleneck:** Curriculum content in JS objects. Mitigation: Move to CMS-backed API with ISR caching. Takeaway: Don't do this preemptively — the hardcoded data is fine for single-child and the curriculum changes very slowly.

## Anti-Patterns

### Anti-Pattern 1: Prop Drilling Deeper Than 2 Levels

**What people do:** Pass `progress`, `setSettings`, `playerName`, `onStart`, `onEarnXp` through 3+ component layers as props.

**Why it's wrong:** Creates tight coupling between intermediate components that shouldn't know about the data. Adding a new prop requires touching every intermediate component's interface. Makes refactoring painful.

**Do this instead:** Use custom hooks that read from IndexedDB directly. Each view component calls `useProgress()` and gets what it needs. The hook is the boundary — components don't need to know where data comes from or how it's stored.

### Anti-Pattern 2: SPA Tab Routing Instead of Real Routes

**What people do:** Use `activeTab` state with conditional rendering instead of Next.js file-based routing.

**Why it's wrong:** No deep-linking, no browser back/forward, no route-level code splitting, all views in one bundle. For a 5-year-old this is acceptable UX-wise, but it prevents code splitting and makes the bundle unnecessarily large.

**Do this instead:** Create route segments for each tab. Use Next.js `<Link>` components for navigation. Keep the bottom nav as a shared layout component. This enables automatic code splitting and better performance on low-end tablets.

### Anti-Pattern 3: Mixing Sync Logic with UI Logic

**What people do:** Call `fetch('/api/sync')` directly inside event handlers, manage sync state alongside UI state, handle offline/online transitions in view components.

**Why it's wrong:** UI shouldn't know about sync mechanics. If the sync strategy changes (e.g., batching vs. streaming), every handler needs updating.

**Do this instead:** Encapsulate all sync logic in `SyncEngine` class and `useSync` hook. View components call `useProgress.updateLessonScore()` and get back immediate local results. The hook calls `SyncEngine` internally. View code has zero fetch calls.

### Anti-Pattern 4: Blocking UI on Server Response

**What people do:** `await fetch('/api/sync')` before showing the user their XP/badge.

**Why it's wrong:** Destroys the offline-first value proposition. If the network is slow or unavailable, the user sees a spinner instead of their reward.

**Do this instead:** Write to IndexedDB immediately, compute XP/badges locally, show the user the result instantly. Sync happens in the background. The only indicator is the sync status pill in the header.

### Anti-Pattern 5: Single File, Single Responsibility Violation

**What people do:** Keep all state, views, game logic, audio, sync, and data in one 872-line component file.

**Why it's wrong:** Impossible to test in isolation. Every change risks breaking unrelated features. Cognitive load is overwhelming for a single developer returning to the codebase after a break.

**Do this instead:** Extract by concern. Pure functions → `lib/`. Data operations → `features/*/services/`. State + side effects → `features/*/hooks/`. Presentation → `components/` or route pages. The test is: "Can I describe what this file does in one sentence without using 'and'?"

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **PasarAPI.xyz** | fetch from client component with try/catch + fallback data | Free tier rate limits. Cache responses in IndexedDB. Always have fallback data for offline. |
| **PostgreSQL (Drizzle)** | Next.js API routes → Drizzle ORM | Falls back to in-memory Map gracefully. Must add proper connection pooling for scale. |
| **(Future) CMS** | Separate route `/admin/` with editor UI → API → DB | Consider Payload CMS or custom lightweight solution. For single-developer, markdown files in git may be simpler. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **View ↔ useHook** | Hook return value (read), hook function call (write) | Hooks should return data + status, not React-specific objects. |
| **useHook ↔ Service** | Direct method call | Service is a class/object; hook instantiates or imports singleton. |
| **Service ↔ IndexedDB** | Dexie.js API | All IndexedDB access through services, never from components or hooks. |
| **Hook ↔ SyncEngine** | SyncEngine.enqueue(mutation) | Hooks call enqueue after writing locally. Async fire-and-forget. |
| **Client ↔ API Route** | HTTP fetch (GET/POST) | Only SyncEngine and AdminApi make HTTP calls. Views never fetch. |
| **API Route ↔ DB** | Drizzle ORM queries | API routes are thin — validate input, call Drizzle, return response. |

## Suggested Build Order (Dependency Chain)

```
Phase 1: Foundation (no dependencies on other new code)
  ├── lib/types.ts              — Extract pure types
  ├── lib/constants.ts          — Extract constants
  ├── lib/analytics/metrics.ts  — Pure math functions
  ├── lib/sync/merge-fields.ts  — Conflict resolution logic
  └── lib/speech/lcs.ts         — LCS algorithm (for pronunciation)

Phase 2: Data Layer (depends on Phase 1)
  ├── features/sync/services/IndexedDBStore.ts  — Dexie setup
  ├── features/sync/services/SyncEngine.ts      — Core sync logic
  ├── features/progress/services/ProgressStore.ts
  └── features/speech/services/SpeechService.ts

Phase 3: Hooks (depends on Phase 2)
  ├── features/sync/hooks/useSync.ts
  ├── features/progress/hooks/useProgress.ts
  ├── features/speech/hooks/useSpeechRecognition.ts
  ├── features/speech/hooks/useSpeechSynthesis.ts
  ├── features/speech/hooks/usePronunciation.ts
  └── features/parent-dashboard/hooks/useMetrics.ts

Phase 4: View Extraction (depends on Phase 3, parallelizable)
  ├── app/[locale]/page.tsx               — HomeView (simplest, start here)
  ├── app/[locale]/learn/page.tsx          — LearnView
  ├── app/[locale]/learn/[subject]/[lesson]/page.tsx  — LessonPlayer
  ├── app/[locale]/progress/page.tsx       — ProgressView
  ├── app/[locale]/badges/page.tsx         — BadgesView
  ├── app/[locale]/arcade/page.tsx         — ArcadeView
  └── app/[locale]/parent/dashboard/page.tsx — ParentDashboard

Phase 5: i18n (cross-cutting, can parallelize with Phase 4)
  ├── messages/en/*.json
  ├── messages/ms/*.json
  ├── middleware.ts (next-intl)
  └── components/ui/LanguageSwitcher.tsx

Phase 6: Admin Dashboard (depends on Phase 4, independent)
  ├── app/admin/... routes
  ├── features/admin/components/LessonEditor.tsx
  └── features/admin/hooks/useLessons.ts

Phase 7: Polish (depends on all above)
  ├── Service Worker for background sync
  ├── components/ui/SyncIndicator.tsx
  ├── Loading states, transitions, animations
  ├── Accessibility (prefers-reduced-motion, large touch targets)
  └── COPPA compliance enforcement (consent gate, data deletion)
```

## Sources

- **Smashing Magazine, "The Architecture Of Local-First Web Development"** (May 2026) — Comprehensive overview of offline-first patterns. HIGH confidence.
- **TechInterview, "Offline-First Service Low-Level Design: Local Store, Sync Queue, and Reconciliation"** (Apr 2026) — Detailed sync queue design with idempotency keys, pull-before-push strategy. HIGH confidence.
- **DEV Community, "Sync Conflict Handling in Offline-First PWAs"** (Apr 2026) — Field-level merge patterns, conflict categories. HIGH confidence.
- **MDN Web Docs, "Using the Web Speech API"** (2026) — SpeechRecognition interface, contextual biasing, on-device processing. HIGH confidence.
- **MDN Web Docs, "SpeechRecognition.processLocally"** (2026) — On-device recognition for COPPA compliance. HIGH confidence.
- **GitHub, "speech-to-phonetic-comparison-app"** — Web Speech API + transcription comparison pattern. MEDIUM confidence (single source).
- **Next.js Official Docs, "Internationalization"** (2025) — next-intl with App Router. HIGH confidence.
- **AI Educademy, "How We Built a Multilingual AI Education Platform"** (Mar 2026) — next-intl setup, git submodule content, fallback chain. HIGH confidence.
- **AssemblyAI, "Speech recognition in the browser using Web Speech API"** (Jun 2026) — Browser support matrix, limitations. HIGH confidence.
- **Alphazed, "How Our Analytics Lake Measures Learning Gains"** (Mar 2026) — Learning outcome metrics, event-driven analytics pipeline. MEDIUM confidence (enterprise patterns, overkill for single-child).
- **React Official Docs, "Reusing Logic with Custom Hooks"** (2026) — Custom hook extraction patterns. HIGH confidence.
- **CodeScene, "Refactoring components in React with custom hooks"** — Practical extraction methodology. HIGH confidence.
- **Martin Fowler, "Modularizing React Applications with Established UI Patterns"** (2023) — Layer separation, domain objects, hook extraction. HIGH confidence (timeless patterns).
- **Feature-Sliced Design, "Mastering React Hooks: An Architectural Guide"** (Feb 2026) — Hook placement by layer, public API contracts. MEDIUM confidence (FSD-specific).
- **Alex Kondov, "Common Sense Refactoring of a Messy React Component"** (Jul 2024) — Component splitting methodology, extract hooks first, pure functions outside React. HIGH confidence.

---
*Architecture research for: Luth's Playground — offline-first children's educational platform*
*Researched: 2026-07-10*
