# Luth's Playground

## What This Is

A personalized, child-first educational learning platform for a 5-year-old son that makes learning feel like play. Roblox-themed blocky 3D visual style with subjects (Mandarin, Math, English, Science, Coding), lessons, quizzes, XP/badges, and external API arcade activities. Built for offline-first use on children's tablets with COPPA-safe privacy and parental controls.

## Core Value

Make learning feel like play while giving parents real insight and control — everything else can fail, but the child must enjoy coming back.

## Requirements

### Validated

Inferred from existing codebase:

- [x] Subject-based curriculum with 5 subjects, 25 lessons, 100 questions — existing
- [x] XP, level, streak, and badge reward system — existing
- [x] localStorage persistence with cloud sync via API — existing
- [x] PostgreSQL via Drizzle ORM for optional cloud persistence — existing
- [x] Parent dashboard with PIN gate, settings (difficulty, time limit, sound, enabled subjects) — existing
- [x] External API arcade (dog pics, facts, rhymes) via PasarAPI — existing
- [x] Browser speech synthesis for lesson content — existing
- [x] Audio tone feedback for correct/incorrect answers — existing
- [x] Offline resilience with graceful degradation — existing
- [x] COPPA-conscious branding (ad-free, no purchases, no social features) — existing
- [x] Avatar selection and player name — existing
- [x] Tab-based navigation (home, learn, arcade, badges, progress, parent) — existing

### Active

- [ ] **SYNC-01**: COPPA-safe offline-first sync engine with per-field merge conflict resolution
- [ ] **SYNC-02**: Multi-device sync with device identity verification
- [ ] **SYNC-03**: Offline save queue with automatic flush on reconnect
- [ ] **SYNC-04**: Parental consent gate for data sync
- [ ] **SYNC-05**: One-click data deletion (parent-triggered cloud wipe)
- [ ] **SYNC-06**: Rate limiting and request validation on sync API
- [ ] **PRON-01**: Pronunciation scoring using Web Speech API + PasarAPI
- [ ] **PRON-02**: Phoneme-level feedback in lesson flow
- [ ] **PARENT-01**: Polished production-grade parental dashboard with actionable insights
- [ ] **PARENT-02**: Customizable parent PIN (not hardcoded 1234)
- [ ] **PARENT-03**: Learning metrics, charts, and recommendations
- [ ] **AUTH-01**: Content authoring admin dashboard for creating/editing lessons
- [ ] **AUTH-02**: Multi-subject curriculum management
- [ ] **AUTH-03**: Lesson versioning or publishing workflow
- [ ] **LOCALE-01**: Bilingual support (English + Malay)
- [ ] **LOCALE-02**: Localization architecture for future languages
- [ ] **UI-01**: Evolved visual design — production polish on blocky 3D aesthetic
- [ ] **UI-02**: Component extraction from monolithic learning-app.tsx
- [ ] **UI-03**: Loading states, transitions, accessibility improvements
- [ ] **UI-04**: Code splitting for tab views
- [ ] **SEC-01**: Remove hardcoded DB credentials from drizzle.config.json
- [ ] **SEC-02**: Add server-side sync write verification (HMAC device token)
- [ ] **SEC-03**: Content filter for externally-sourced speech text
- [ ] **SEC-04**: Respect prefers-reduced-motion for confetti animations
- [ ] **DEBT-01**: Remove stale blockbright localStorage keys with migration
- [ ] **DEBT-02**: Clean up duplicate CSS declarations
- [ ] **DEBT-03**: Fix stale closure state in useCallback (functional state updates)
- [ ] **DEBT-04**: Reuse single AudioContext instead of creating per sound

### Out of Scope

- User accounts or email/password login for children — device-ID-only identity (COPPA requirement)
- In-app purchases or subscriptions — ad-free commitment
- Social features, chat, or messaging — COPPA requirement
- Real-time multiplayer — not needed for single-child focus
- Video content or streaming — storage/bandwidth, defer indefinitely
- Third-party OAuth — email/password sufficient if parent auth needed later
- Mobile native apps — web-first, PWA for tablets

## Context

The app was built as a personal project for the user's 5-year-old son. The current codebase is a functional MVP with a monolithic architecture: all state, views, and game logic live in a single 872-line client component (`learning-app.tsx`). The curriculum data is hardcoded as static JS objects (240 lines). Persistence is localStorage-first with optional PostgreSQL cloud sync via Drizzle ORM.

Key technical context:
- Next.js 16 + React 19 with TypeScript strict mode
- Tailwind CSS 4 with custom dark blocky theme
- Drizzle ORM + PostgreSQL (degrades gracefully to in-memory Map)
- PasarAPI.xyz for free external APIs (dog pics, facts, rhymes)
- No JS test framework configured — Python validation tests only
- No CI/CD, no Docker, no hosting config
- The app already references COPPA compliance in UI but has no actual enforcement mechanism

## Constraints

- **Privacy**: COPPA compliance required — no PII collection, parental consent for data sync, data deletion on request, data minimization
- **Offline**: Must work fully offline; sync is opportunistic, not required
- **Target device**: Children's tablets (low-end hardware) — performance matters, bundle size matters
- **Single developer**: The user builds this themselves — scope must be manageable
- **Free APIs**: Pronunciation scoring must work within PasarAPI.xyz free tier
- **Accessibility**: Must work for young children (5yo) — large touch targets, simple navigation, audio feedback

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Sync strategy: merge per-field | Balances data integrity with implementation complexity | — Pending |
| COPPA: full compliance (no PII, consent gate, deletion) | Legal/trust requirement for children's platform | — Pending |
| Pronunciation: Web Speech API + PasarAPI | Free, no external service dependency | — Pending |
| Languages: English + Malay initially | Bilingual household need; architecture for expansion | — Pending |
| Content authoring: admin dashboard | Structured workflow for scaling curriculum | — Pending |
| Multi-device: build for multi-child from start | Avoids re-architecture later; profiles are cheap | — Pending |
| Visual direction: evolve the look | Polish the blocky 3D aesthetic alongside backend work | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-10 after initialization*
