# Requirements: Luth's Playground

**Defined:** 2026-07-10
**Core Value:** Make learning feel like play while giving parents real insight and control

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Sync & Storage

- [ ] **SYNC-01**: App stores all progress locally in IndexedDB (via Dexie.js) instead of localStorage for reliable offline-first storage

### Parent Dashboard

- [ ] **PARENT-01**: Parent can set a custom PIN on first access (replaces hardcoded 1234)
- [ ] **PARENT-02**: Parent must explicitly consent before any child data is synced to cloud
- [ ] **PARENT-03**: Parent dashboard shows meaningful learning metrics (trends, struggle signals, subject breakdowns) rather than vanity metrics
- [ ] **PARENT-04**: Parent dashboard visualizes progress with charts (Recharts) — accuracy trends, weekly activity, subject performance

### Localization

- [ ] **LOCALE-01**: i18n framework (next-intl) integrated with App Router for bilingual support
- [ ] **LOCALE-02**: All UI text available in both English and Malay
- [ ] **LOCALE-03**: Lesson/curriculum content supports bilingual switching (English + Malay)
- [ ] **LOCALE-04**: User-facing language switcher available in the app

### Pronunciation

- [ ] **PRON-01**: Lesson player includes microphone button and retry/skip UX flow (UI framework for future pronunciation scoring engine)

### Content Authoring

- [ ] **AUTH-01**: Admin lesson builder with structured form to create/edit lessons with questions per subject

### UI/UX

- [ ] **UI-01**: Quest layout visual theme fixed — improve contrast and visibility (current theme too light/low-contrast)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Security & Foundation

- **SEC-01**: Move hardcoded database credentials from drizzle.config.json to .env
- **SEC-02**: Add HMAC device token for server-side sync write verification
- **SEC-03**: Profanity/content filter for externally-sourced text passed to speech synthesis
- **SEC-04**: CSS-driven confetti that respects prefers-reduced-motion
- **SEC-05**: Remove stale blockbright localStorage keys with one-time migration
- **SEC-06**: Clean up duplicate CSS declarations in globals.css
- **SEC-07**: Fix stale closure state in useCallback (functional state updates)
- **SEC-08**: Reuse single AudioContext instead of creating per sound

### Sync Engine

- **SYNC-02**: Six-state sync queue (IN_FLIGHT, DEAD_LETTER, FATAL_ERROR) for reliable cloud sync
- **SYNC-03**: Per-field merge conflict resolution with version counters
- **SYNC-04**: Automatic queue flush when connectivity returns after offline play
- **SYNC-05**: API rate limiting and request body size validation
- **SYNC-06**: Multi-device sync with verified device identity

### Pronunciation Scoring

- **PRON-02**: Web Speech API integration with contextual biasing for real-time transcription
- **PRON-03**: Word-level LCS scoring — compare spoken vs expected words
- **PRON-04**: Pronunciation feedback display in lesson results

### Content Authoring

- **AUTH-02**: Template-first lesson creation (5-minute creation time from templates)
- **AUTH-03**: Preview lesson as child would see it before publishing
- **AUTH-04**: Subject/curriculum manager for adding/reordering subjects

### Visual Polish

- **UI-02**: Evolved blocky 3D visual design — production polish
- **UI-03**: Component extraction from monolithic learning-app.tsx into route pages
- **UI-04**: Loading states, transitions, accessibility improvements
- **UI-05**: Code splitting for tab views (React.lazy)

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts for children | Device-ID-only identity (COPPA requirement) |
| In-app purchases or subscriptions | Ad-free commitment |
| Social features, chat, messaging | COPPA requirement |
| Real-time multiplayer | Not needed for single-child focus |
| Video content or streaming | Storage/bandwidth, defer indefinitely |
| Third-party OAuth | No parent auth needed beyond PIN |
| Mobile native apps | Web-first, PWA for tablets |
| AI-assisted lesson generation | Too complex for v1, revisit after content patterns established |
| kidSAFE certification | Worth evaluating after compliance implementation |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SYNC-01 | Phase 1 | Pending |
| PARENT-01 | Phase 2 | Pending |
| PARENT-02 | Phase 2 | Pending |
| PARENT-03 | Phase 2 | Pending |
| PARENT-04 | Phase 2 | Pending |
| LOCALE-01 | Phase 1 | Pending |
| LOCALE-02 | Phase 1 | Pending |
| LOCALE-03 | Phase 1 | Pending |
| LOCALE-04 | Phase 1 | Pending |
| PRON-01 | Phase 3 | Pending |
| AUTH-01 | Phase 3 | Pending |
| UI-01 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0

---
*Requirements defined: 2026-07-10*
*Last updated: 2026-07-10 after initial definition*
