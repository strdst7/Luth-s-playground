# Phase 1: Bilingual Foundation — Context

**Gathered:** 2026-07-10
**Status:** Ready for planning

<domain>
## Phase Boundary

App stores all progress in IndexedDB (Dexie.js), supports English + Malay bilingual UI and curriculum content with a language switcher, and fixes quest layout contrast/visibility. Component extraction from the monolithic 872-line learning-app.tsx is explicitly deferred to v2 — this phase works within the existing monolithic structure.

</domain>

<decisions>
## Implementation Decisions

### Language Switcher UX
- **D-01**: Both child and parent use the language switcher equally — it must be accessible to a 5-year-old who may not read
- **D-02**: Visual representation uses flag emoji buttons (🇲🇾 for Malay, 🇬🇧 for English) — no text labels needed
- **D-03**: Placement is OpenCode's discretion (recommendation: top header bar next to app title or sync indicator — visible but not competing with main nav)

### Mid-Lesson Language Switching
- **D-04**: OpenCode's discretion (recommendation: UI chrome changes immediately on switch, but current lesson content stays in its starting language until the lesson completes. Next lesson starts in the new language. Prevents confusing the child mid-question.)

### IndexedDB Migration UX
- **D-05**: Migration from localStorage to Dexie.js runs automatically on first app load after the update
- **D-06**: Brief branded loading spinner shown during migration (<500ms expected for single-child data)
- **D-07**: Auto-retry 3 times on failure, then fall back to localStorage — child always gets to play. Migration re-attempted next session.
- **D-08**: Old localStorage data kept as backup indefinitely — never deleted

### i18n Message Organization
- **D-09**: One message file per page/view (e.g., `home.json`, `learn.json`, `arcade.json`, `badges.json`, `progress.json`, `parent.json`) per locale
- **D-10**: Flat keys with page prefix naming convention (e.g., `home_greeting`, `learn_startLesson`, `badges_earned_count`)

### OpenCode's Discretion
- Exact placement of language switcher in the UI layout
- Exact behavior when language is switched mid-lesson (recommendation in D-04)
- Default locale detection strategy (Malay as default is locked; detection via cookie → Accept-Language → 'ms' is recommended but flexible)
- Loading spinner visual design
- Translation key values (actual strings are OpenCode's call, informed by the bilingual content strategy)

</decisions>

<specifics>
## Specific Ideas

- Language switcher should feel playful, not like a settings control — consistent with the Roblox-themed blocky aesthetic
- The switcher should be big enough for small fingers (minimum 44px touch target per UI-SPEC)
- Migration spinner should match the app's blocky 3D visual theme (not a generic browser spinner)

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### UI Design Contract
- `.planning/phase-01-bilingual-foundation/01-UI-SPEC.md` — Locked design system tokens (colors, typography, spacing, radii), component inventory, i18n patterns, contrast fix spec, LanguageSwitcher component spec, MigrationProgressIndicator spec

### Phase Scope
- `.planning/ROADMAP.md` §Phase 1 — Goal, success criteria, requirement mapping for LOCALE-01/02/03/04, SYNC-01, UI-01

### Requirements
- `.planning/REQUIREMENTS.md` §Localization — LOCALE-01/02/03/04 detailed descriptions
- `.planning/REQUIREMENTS.md` §Sync & Storage — SYNC-01 IndexedDB requirement
- `.planning/REQUIREMENTS.md` §UI/UX — UI-01 contrast fix requirement

### Technical Research
- `.planning/research/STACK.md` — Dexie.js ^4.2.x, next-intl ^4.x, Zustand ^5.x recommendations with version compatibility
- `.planning/research/ARCHITECTURE.md` — i18n routing pattern (prefix-based), offline-first data layer patterns, component decomposition approach
- `.planning/research/PITFALLS.md` — Pitfall 9 (Malay i18n breakage: text overflow, missing TTS, ICU format), Pitfall 10 (Next.js + offline hydration mismatch)

### Product Context
- `.planning/PROJECT.md` — Core value, constraints (offline, tablet-first, COPPA), key decisions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/globals.css` — Full dark blocky theme CSS tokens (colors, radii, shadows, breakpoints). Contrast fix modifies existing variables rather than adding new ones.
- `src/app/learning-data.ts` — Static curriculum data with Subject/Lesson/Question types. Bilingual content adds `{ en, ms }` fields.
- `src/app/layout.tsx` — Root layout with metadata. Will need next-intl provider wrapping.

### Established Patterns
- All state managed via `useState` in monolithic component — will use Zustand for locale preference (not useState)
- localStorage persistence pattern — replaced by Dexie.js for progress data, but locale preference can stay in Zustand persist middleware

### Integration Points
- `src/app/learning-app.tsx` (872 lines) — LanguageSwitcher component will be added here (not extracted yet)
- `src/app/layout.tsx` — next-intl NextIntlClientProvider wraps the app
- No route extraction in this phase — working within existing SPA tab pattern

### Creative Options
- Language switcher could be a Zustand `useSettingsStore` field persisted to localStorage (for PWA offline support) — no server round-trip needed
- Migration could use Dexie's built-in `version()` API for schema migration — no custom migration framework needed

</code_context>

<deferred>
## Deferred Ideas

- Component extraction from monolithic learning-app.tsx into route pages — Phase 2 (v2)
- Default locale detection strategy (cookie vs Accept-Language) — OpenCode discretion, revisit if issues arise

</deferred>

---
*Phase: 01-bilingual-foundation*
*Context gathered: 2026-07-10*
