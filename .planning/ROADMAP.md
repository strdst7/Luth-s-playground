# Roadmap: Luth's Playground

## Overview

A 3-phase v1 delivery to transform the existing MVP into a bilingual, parent-empowered learning platform with reliable offline storage. Phase 1 establishes the bilingual foundation (i18n + IndexedDB storage + visual fix), Phase 2 delivers a secure, insight-rich parent dashboard, and Phase 3 adds pronunciation practice UX and admin lesson creation.

## Phases

- [ ] **Phase 1: Bilingual Foundation** — App supports English + Malay with reliable IndexedDB storage and improved visual contrast
- [ ] **Phase 2: Parent Dashboard** — Parents can set a custom PIN, consent to data sync, and view meaningful learning metrics with charts
- [ ] **Phase 3: Learning Tools** — Lesson player gains pronunciation retry/skip UX and admins can create/edit lessons

## Phase Details

### Phase 1: Bilingual Foundation
**Goal**: App is fully bilingual (English + Malay), stores all progress in IndexedDB, and has improved visual contrast on quest/lesson screens
**Depends on**: Nothing (first phase)
**Requirements**: LOCALE-01, LOCALE-02, LOCALE-03, LOCALE-04, SYNC-01, UI-01
**Success Criteria** (what must be TRUE):
  1. User can switch app language between English and Malay from any page via a visible language switcher
  2. All UI text (navigation, buttons, labels, feedback messages) displays correctly in the selected language with no untranslated strings or text overflow
  3. Lesson/quiz content displays in the selected language — questions, answer options, instructions appear in either English or Malay
  4. App stores all progress data (XP, streaks, badges, completed lessons) in IndexedDB via Dexie.js — data persists across page refreshes and browser restarts; existing localStorage data migrates on first load
  5. Quest/activity layout has sufficient contrast — text is readable against backgrounds, buttons are visually distinct, and interactive elements are clearly visible
**Plans**: 5 plans

```
Plans:
- [ ] 01-01-PLAN.md — Foundation: Install deps, configure i18n routing/messages, apply CSS contrast fix
- [ ] 01-02-PLAN.md — Bilingual App UI: LanguageSwitcher + wired i18n across all views
- [ ] 01-03-PLAN.md — Bilingual Curriculum: Update question/lesson types + add Malay translations
- [ ] 01-04-PLAN.md — Dexie.js Setup: Database schema, migration UX, enhanced sync-pill
- [ ] 01-05-PLAN.md — IndexedDB Persistence: UseLiveQuery data access + loading skeletons
```

**UI hint**: yes

### Phase 2: Parent Dashboard
**Goal**: Parents can securely access the dashboard, consent to data sync, and view meaningful learning insights with Recharts visualizations
**Depends on**: Phase 1
**Requirements**: PARENT-01, PARENT-02, PARENT-03, PARENT-04
**Success Criteria** (what must be TRUE):
  1. Parent can set a custom numeric PIN on first dashboard access (replaces hardcoded 1234) — PIN is hashed, not stored in plaintext
  2. Parent must complete an explicit consent flow before any child data is synced to cloud — two-screen flow with affirmative action, no pre-checked boxes
  3. Parent dashboard displays meaningful learning metrics — accuracy trends over time, subjects where child struggles most (repeat attempts), and subject mastery breakdown (not just logins or time spent)
  4. Parent dashboard visualizes metrics with Recharts — line chart for accuracy trends, bar chart for weekly activity, and subject performance comparison
**Plans**: TBD
**UI hint**: yes

### Phase 3: Learning Tools
**Goal**: Lesson player includes pronunciation practice flow and admins can create/edit lessons via a structured form
**Depends on**: Phase 1
**Requirements**: PRON-01, AUTH-01
**Success Criteria** (what must be TRUE):
  1. Lesson player includes a microphone button with retry/skip flow — child can attempt pronunciation, see feedback, tap retry to try again, or tap skip to move to next question
  2. Admin can access a lesson builder interface to create new lessons and edit existing ones with structured forms (title, subject, questions with answer options and correct answer)
  3. Newly created or edited lessons appear in the child's lesson flow and function correctly — questions display, answers are scored correctly, XP is awarded
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:** Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Bilingual Foundation | 0/5 | Planning | - |
| 2. Parent Dashboard | 0/TBD | Not started | - |
| 3. Learning Tools | 0/TBD | Not started | - |
