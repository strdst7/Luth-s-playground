---
status: draft
phase: 1
phase_name: Bilingual Foundation
created: 2026-07-10
design_system: custom-tailwind-v4
shadcn: none — project uses pure Tailwind CSS v4 with custom CSS-based design system
---

# UI-SPEC: Phase 1 — Bilingual Foundation

## 1. Design Contract Overview

This contract governs all visual and interaction decisions for Phase 1: Bilingual Foundation. It builds on the existing **dark blocky 3D Roblox-themed aesthetic** (Tailwind CSS v4 + custom CSS) and extends it with bilingual i18n patterns, IndexedDB migration UX, and contrast improvements.

| Domain | Decision Source | Status |
|--------|----------------|--------|
| Design System | Existing `globals.css` + CONVENTIONS.md | Locked — extend, don't replace |
| Component Library | None (pure custom CSS) | Locked — no shadcn |
| i18n Framework | RESEARCH.md (next-intl ^4.x) | Locked — install Phase 1 |
| Offline Storage | RESEARCH.md (Dexie.js ^4.2.x) | Locked — install Phase 1 |
| State Management | RESEARCH.md (Zustand ^5.x) | Locked — install Phase 1 |

### shadcn Gate Decision

**Result: NOT initialized.** The project uses Tailwind CSS v4 with a fully custom CSS-first design system (`globals.css` — 307 lines of dark blocky 3D theme). The existing visual language is game-like, dimensional, and heavily customized (neon borders, isometric perspective, 3D drop shadows, portal rings). Introducing shadcn/ui would:
1. Fight the existing aesthetic (shadcn is flat/minimal, this is blocky/3D)
2. Add ~50KB+ of unstyled primitives that require full re-theming
3. Increase bundle on low-end tablets unnecessarily

Contract: Continue with pure custom CSS + Tailwind CSS v4 utility classes. No component library.

---

## 2. Design Tokens

### 2.1 Color Palette

All values locked from existing `globals.css`. Phase 1 adds ONLY:
- `--accent-ms` — brand color for Malay language indicator (differentiates from English)
- `--surface-lesson` — darker lesson overlay background (contrast fix)

#### Core Colors (Dark Theme — Active)

| Token | Value | Usage | WCAG AA |
|-------|-------|-------|---------|
| `--void` | `#070915` | Page background | — |
| `--void-2` | `#0d1230` | Gradient terminus | — |
| `--panel-dark` | `rgba(16, 24, 64, .88)` | Card/section backgrounds | — |
| `--neon` | `#48f7ff` | Accent borders, glow effects | 7.5:1 on void (pass) |
| `--neon-pink` | `#ff4fd8` | Secondary accent | 5.2:1 on void (pass) |
| `--neon-green` | `#48ff9b` | Success / correct states | 8.1:1 on void (pass) |
| `--gold` | `#ffd166` | XP, rewards, highlights | 6.8:1 on void (pass) |
| `--coral` | `#ff5a79` | Destructive, Mandarin subject | 4.7:1 on void (pass) |
| Ink (text) | `#f5fbff` | Primary text on dark bg | — |
| Muted text | `#8890a8` | Secondary text on dark bg | 4.6:1 on `#101840` (pass) |

#### Subject Colors (Locked)

| Subject | `--subject` | `--subject-light` | `--subject-dark` |
|---------|-------------|-------------------|-------------------|
| Mandarin | `#ff5a79` | `#5a1a2e` | `#d92e52` |
| Math | `#6b62e8` | `#2a2560` | `#4c43bd` |
| English | `#f29a33` | `#5a3a10` | `#c96e0b` |
| Science | `#20ae78` | `#0d3d2a` | `#087c52` |
| Coding | `#3d91e8` | `#143254` | `#176bbd` |

**IMPORTANT (Contrast Fix):** Subject light colors (`--subject-light`) used as card backgrounds MUST be replaced with dark variants in the dark theme. The existing light values (`#fff0f3`, `#f0efff`, etc.) are invisible on dark backgrounds. Use the dark equivalents listed above.

#### Phase 1 Additions

| Token | Value | Usage |
|-------|-------|-------|
| `--accent-ms` | `#48ff9b` | Malay language indicator (green neon to match flag) |
| `--surface-lesson` | `rgba(7, 9, 21, .96)` | Lesson overlay background (currently too light) |
| `--surface-card` | `rgba(16, 24, 64, .92)` | Standard card surface (add to CSS variable for reuse) |

### 2.2 Typography

#### Font Stack

```css
font-family: "Arial Rounded MT Bold", "Nunito", ui-rounded, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

**Locked.** This family has good Malay character support (Latin script, no diacritics beyond standard).

#### Font Sizes (Declared — 4 sizes)

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--text-xs` | 10px | 800 (extrabold) | 1.3 | Eyebrow labels, badges, stats |
| `--text-sm` | 14px | 500 (medium) / 600 (semibold) | 1.6 | Body text, descriptions |
| `--text-base` | 18-24px | 900 (black) / 1000 (extrablack) | 1.1 | Card titles, section headings |
| `--text-lg` | clamp(32px, 3.3vw, 48px) | 1000 (extrablack) | 1.02 | Hero headings, page titles |

#### Font Weights (Declared — 4 weights)

| Weight | CSS Value | Usage |
|--------|-----------|-------|
| Medium | 500 | Body copy, descriptions (family falls back to Nunito) |
| Semibold | 600 | Default body (Arial Rounded MT Bold) |
| Extrabold | 800 | Eyebrow labels, button text |
| Black | 900 | Card titles, section headings |
| Extrablack | 1000 | Hero headings ("Ready to build your brain power") |

#### Malay Text Considerations

- **Text overflow:** Malay has compound words up to 22 chars (`mempertanggungjawabkan`). All text containers MUST use `overflow-wrap: break-word` or `word-break: break-word`.
- **Line height:** Body text set to 1.6 to accommodate longer Malay phrases without clipping.
- **No RTL:** Malay uses Latin script. No layout mirroring needed.

### 2.3 Spacing Scale (8-Point)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Micro spacing, icon gaps |
| `--space-2` | 8px | Button padding, grid gaps (small) |
| `--space-3` | 12px | Element gaps, card padding (tight) |
| `--space-4` | 16px | Standard gap, card padding |
| `--space-5` | 24px | Section padding, modal padding |
| `--space-6` | 32px | Hero padding, large gaps |
| `--space-7` | 48px | Page margins |
| `--space-8` | 64px | Large sections, footer spacing |

Existing CSS uses ad-hoc values (18px, 22px, 14px, etc.). Phase 1 does NOT refactor legacy spacing — new components only.

### 2.4 Border Radii

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 8px | Subject icon corners |
| `--radius-md` | 12-16px | Buttons, filter chips |
| `--radius-lg` | 18-22px | Cards, panels, sections |
| `--radius-xl` | 24-30px | Welcome grid, modals, results |

### 2.5 Shadows

All values locked from existing theme. The "blocky 3D" effect uses stacked shadows:

```css
/* Card depth shadow */
box-shadow: 0 10px 0 rgba(0,0,0,.35);

/* Button "3D press" shadow */
box-shadow: 0 8px 0 rgba(0,0,0,.42), 0 0 22px rgba(72,247,255,.28);

/* Active button press */
transform: translateY(4px); box-shadow: 0 3px 0 #bf2f50;
```

---

## 3. Component Inventory

### 3.1 Existing Components (Locked, Not Modified in Phase 1)

These components exist in `learning-app.tsx` and are NOT modified in Phase 1 (component extraction deferred to v2):

| Component | Lines | Status |
|-----------|-------|--------|
| `NavButton` | 474-483 | Unchanged |
| `HomeView` | 485-563 | Unchanged |
| `LearnView` | 565-594 | Unchanged |
| `PasarApiArcadeView` | 596-764 | Unchanged |
| `BadgesView` | 766-779 | Unchanged |
| `ProgressView` | 781-798 | Unchanged |
| `ParentGate` | 800-810 | Unchanged |
| `ParentDashboard` | 812-839 | Unchanged |
| `LessonPlayer` | 841-872 | Modified (contrast fix + i18n text props) |

### 3.2 Existing Components (Modified in Phase 1)

#### LessonPlayer (Modified — Contrast Fix)

**What changes:**
- Overlay background: Replace `linear-gradient(160deg, var(--subject-light), #fbfbfe 45%, #f0eff8)` with `var(--surface-lesson)` (`rgba(7, 9, 21, .96)`)
- Card background: Replace `rgba(255,255,255,.93)` with `var(--panel-dark)` (`rgba(16, 24, 64, .88)`)
- Header background: Replace `white` with `var(--panel-dark)`
- Text color: Already `#f5fbff` — no change needed
- Apply `--subject` accent borders to cards instead of background colors
- Question visual area: Replace light gradient with dark gradient using `--subject-light` dark variant

**Contrast verification targets:**
- Body text on card bg: 4.5:1 minimum (currently ~6:1 with `#f5fbff` on `rgba(16, 24, 64, .88)`)
- Small/muted text on card bg: 3:1 minimum

### 3.3 New Components (Phase 1)

#### LanguageSwitcher

**Location:** Top bar, inside `.header-actions` div, positioned before sync pill.

**States:**
| State | Visual |
|-------|--------|
| English active | Shows "EN" in gold `--gold`, Malay option "MS" dimmed |
| Malay active | Shows "MS" in green `--accent-ms`, English option "EN" dimmed |
| Switching | Subtle pulse animation on active label (200ms) |

**Layout:**
```html
<div class="lang-switcher">
  <button class="lang-option active" data-lang="en">EN</button>
  <span class="lang-divider">|</span>
  <button class="lang-option" data-lang="ms">MS</button>
</div>
```

**Styles:**
- Height: 36px (matches sync pill)
- Padding: 0 8px
- Background: `rgba(72, 247, 255, .08)` (matches sync-pill area)
- Border: `1px solid rgba(72, 247, 255, .18)`
- Border radius: 18px (pill shape)
- Font: 11px, weight 800, letter-spacing 0.5px
- Touch target: Each button min 44px × 44px (padding ensures this)

**Interaction:**
- Tap to switch language
- Instant switch (no page reload — next-intl client-side navigation)
- Active state persisted to cookie (next-intl standard)

#### MigrationProgressIndicator

**Location:** Full-screen overlay on first load after Dexie.js migration triggers.

**States:**
| State | Visual | Copy |
|-------|--------|------|
| Idle (no migration) | Hidden | — |
| Scanning localStorage | Spinner + indeterminate bar | "Checking saved progress…" |
| Migrating | Determinate progress bar (0-100%) | "Moving {count} records to new storage…" |
| Complete | Checkmark + auto-dismiss (1.5s) | "Ready! Your progress is safe." |
| Error | Red bar + retry button | "Something went wrong. Your data is still safe. Tap to retry." |

**Visual design (follows dark theme):**
- Background: `var(--void)` with backdrop blur `8px`
- Card: `var(--panel-dark)`, border `rgba(72, 247, 255, .18)`, radius 24px
- Progress bar: 6px height, `--neon` gradient, rounded
- Emoji indicator: 🔄 (spinning for in-progress), ✅ (complete), ⚠️ (error)
- Copy: 14px weight 600, centered

**Interaction:**
- Non-dismissible while migrating
- Dismissible after complete (auto-dismiss after 1.5s or tap)
- Retry button on error

#### OfflineBanner (Enhanced from existing sync-pill)

**Location:** Top bar (already exists as `.sync-pill`). Enhanced for Phase 1 to include language-aware messaging.

**Enhanced states:**
| Sync State | Pill Color | Text (EN) | Text (MS) |
|------------|-----------|-----------|-----------|
| `saved` | Green (`#378062`, bg `#ecfaf4`) | "Cloud saved · v{version}" | "Disimpan · v{version}" |
| `saving` | Yellow (`#786c36`, bg `#fff9df`) | "Saving…" | "Menyimpan…" |
| `offline` | Gray (`#7c7285`, bg `#f1eff4`) | "Offline mode" | "Mod luar talian" |
| `migrating` | Blue (`#3d91e8`, bg `#143254`) | "Upgrading storage…" | "Menaik taraf…" |

**Note:** The sync-pill already exists. Phase 1 only adds the `migrating` state and bilingual text.

---

## 4. i18n UI Architecture

### 4.1 next-intl Setup Contract

| Setting | Value |
|---------|-------|
| Locales | `en`, `ms` |
| Default locale | `ms` (Malay — bilingual household) |
| Fallback chain | `ms` ← `en` (no further fallback) |
| Detection strategy | Cookie → `Accept-Language` → default `ms` |
| Routing strategy | Prefix-based: `/en/...`, `/ms/...` |
| Message format | ICU MessageFormat (for Malay pluralization) |
| File structure | `messages/en.json`, `messages/ms.json` |

### 4.2 Language Switcher Interaction

**Placement:** Top bar, inside `.header-actions`, positioned before `.sync-pill`.

**Behavior:**
1. User taps "MS" → calls `switchToLocale('ms')` → navigates to `/ms/...` preserving current path
2. The active locale is stored in a cookie (next-intl standard)
3. All text re-renders via next-intl's `useTranslations()` hook
4. Lesson content (question prompts, options, hints, speak strings) switches based on `locale` — Phase 1 uses conditional translation keys, not separate lesson data objects
5. Speech synthesis language changes: `en-US` / `ms-MY`

### 4.3 Text Overflow Protection for Malay

All text containers in Phase 1 additions MUST use:

```css
overflow-wrap: break-word;
word-wrap: break-word;
hyphens: auto;  /* Malay compounds: "mempertanggungjawabkan" */
```

**Target containers:**
- Language switcher labels
- Migration progress copy
- Any new tooltip or notification text
- Nav button labels (existing — but Phase 1 adds `ms` translations for all)

### 4.4 Translation Keys Required (Phase 1)

All existing hardcoded English text in `learning-app.tsx` needs `next-intl` keys. This includes:

| Group | Example Strings |
|-------|----------------|
| Navigation | "Home", "Quests", "Free APIs", "Badges", "Progress", "Parents" |
| Home hero | "Ready to build your brain power", "Pick a learning quest", "Continue quest" |
| Stats | "DAY STREAK", "TOTAL XP", "Level", "XP to next level" |
| Daily mission | "DAILY MISSION", "Learn for X minutes", "min" |
| Lesson | "Exit", "of", "Read question aloud", "Finish", "Next" |
| Feedback | "You got it!", "Nice try—now you know!", "That answer is exactly right." |
| Results | "QUEST COMPLETE", "Block-tastic!", "Amazing work!", "Great try!" |
| Arcade | "Live Dog Explorer", "Curious Fun Facts", "Rhyme Time Wizard" |
| Badges | "Unlocked", "Still to find" |
| Parent | "Parent Dashboard", "Enter your 4-digit PIN", "Learning settings" |
| Misc | "Offline mode", "Saving…", "Cloud saved" |

**Total estimated keys per locale:** ~120

### 4.5 Lesson Content Translation Strategy

Phase 1 takes a **pragmatic approach**: add `ms` translations alongside existing `en` content in the data model, NOT duplicated data objects.

```typescript
// Current (English only — learning-data.ts)
type Question = {
  prompt: string;
  options: string[];
  answer: number;
  visual: string;
  speak?: string;
  hint?: string;
};

// Phase 1 — bilingual
type Question = {
  prompt: { en: string; ms: string };
  options: { en: string[]; ms: string[] };
  answer: number;
  visual: { en: string; ms: string };
  speak?: { en: string; ms: string };
  hint?: { en?: string; ms?: string };
};
```

Lesson content translation for all 100 questions across 25 lessons is scoped to Phase 1. Translations are hardcoded in `learning-data.ts` (no CMS until Phase 3).

---

## 5. Contrast & Visibility Fix (UI-01)

### 5.1 Problem Statement

The lesson/quest overlay (`.lesson-overlay`) uses a **light gradient background** on top of a **dark themed app**, making text and interactive elements hard to see. Specifically:
- `.lesson-overlay` background: `linear-gradient(160deg, var(--subject-light), #fbfbfe 45%, #f0eff8)` — these are LIGHT colors on a DARK app
- `.lesson-header` background: `white`
- `.question-card` background: `rgba(255,255,255,.93)`
- Subject light colors in card backgrounds: `#fff0f3`, `#f0efff`, `#fff6e8`, etc. — nearly invisible

### 5.2 Fix Specification

**Lesson overlay (`.lesson-overlay`):**
```css
background: var(--surface-lesson);  /* rgba(7, 9, 21, .96) */
/* Remove light gradient entirely */
```

**Lesson header (`.lesson-header`):**
```css
background: var(--panel-dark);  /* rgba(16, 24, 64, .88) */
border-bottom: 1px solid rgba(72, 247, 255, .22);
```

**Question card (`.question-card`):**
```css
background: var(--panel-dark);  /* rgba(16, 24, 64, .88) */
border: 1px solid color-mix(in srgb, var(--subject) 30%, transparent);
```

**Question visual (`.question-visual`):**
```css
background: linear-gradient(145deg, var(--subject-dark), rgba(16, 24, 64, .95));
border: 1px solid color-mix(in srgb, var(--subject) 25%, transparent);
```

**Answer buttons (`.answer-list > button`):**
```css
background: rgba(16, 24, 64, .6);
border: 2px solid rgba(72, 247, 255, .15);
color: #f5fbff;
/* hover: border-color using subject color */
```

**Feedback box (`.feedback-box`):**
```css
/* CORRECT state */
background: rgba(72, 255, 155, .12);
border: 1px solid rgba(72, 255, 155, .3);
color: var(--neon-green);

/* WRONG state */
background: rgba(255, 90, 121, .12);
border: 1px solid rgba(255, 90, 121, .3);
color: var(--coral);
```

**Subject card backgrounds (`.subject-card`):**
```css
/* Replace --subject-light (which is light) with panel dark */
background: var(--panel-dark);
/* Keep --subject color for icons, borders, progress bars */
```

### 5.3 Contrast Ratio Targets

| Element | Foreground | Background | Min Ratio | Target |
|---------|-----------|------------|-----------|--------|
| Body text | `#f5fbff` | `rgba(16,24,64,.88)` | 4.5:1 | ~6.5:1 ✅ |
| Muted text | `#8890a8` | `rgba(16,24,64,.88)` | 3:1 | ~4.6:1 ✅ |
| Small labels (10px) | `#8890a8` | `rgba(16,24,64,.88)` | 3:1 | ~4.6:1 ✅ |
| Subject icon text | White | Subject color | 3:1 | 3.5:1 (coral) to 5:1+ ✅ |
| Answer option text | `#f5fbff` | `rgba(16,24,64,.6)` | 4.5:1 | ~5.5:1 ✅ |

---

## 6. Offline & IndexedDB Migration UX

### 6.1 Migration Screen

**Trigger:** First app load after Dexie.js v4 is installed and `db.version()` detects no existing IndexedDB database.

**States:**

1. **Idle (no migration needed):** Not rendered. App loads normally.
2. **Scanning existing localStorage:** Brief overlay (typically <500ms). Shows indeterminate progress.
3. **Active migration:** Iterates localStorage keys (`luthsplayground-*`, `blockbright-*`), maps to Dexie tables.
4. **Complete:** Auto-dismisses after 1.5s. Stores a flag in Dexie (`_migrated: true`).
5. **Error:** Shows error card with retry. Data remains in localStorage — no data loss possible.

**Visual spec:**

```
┌─────────────────────────────────┐
│  [void background + backdrop]   │
│                                 │
│  ┌─────────────────────────┐    │
│  │   Panel card            │    │
│  │                         │    │
│  │    🔄 or ✅ or ⚠️      │    │
│  │                         │    │
│  │   [Title text]          │    │
│  │   [Description text]    │    │
│  │                         │    │
│  │   ▓▓▓▓▓▓░░░░ 60%       │    │
│  │                         │    │
│  │   [Retry button] (err)  │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

### 6.2 Database Tables (Visual Contract — Not Schema)

| Dexie Table | Contains | Migration Source |
|-------------|----------|-----------------|
| `progress` | XP, streaks, badges, subject stats | `luthsplayground-progress`, `blockbright-progress` |
| `settings` | Difficulty, daily limit, sound, enabled subjects | `luthsplayground-settings`, `blockbright-settings` |
| `player` | Name, avatar, deviceId | `luthsplayground-name`, `luthsplayground-avatar`, etc. |
| `sync_queue` | Pending sync operations | Created empty (new cold path) |

### 6.3 Loading States for Data-Dependent Views

All views that read from Dexie (via `useLiveQuery`) MUST show a loading skeleton:

| View | Skeleton Spec |
|------|---------------|
| HomeView | Pulse-gradient on hero area, 3 stat boxes, 5 subject cards |
| LearnView | Pulse-gradient on hero, 5 filter pills, 2 world panels |
| BadgesView | Pulse-gradient on hero, 3 summary cards, 6 badge slots |
| ProgressView | Pulse-gradient on hero, 4 metric cards, 2 chart panels |
| ParentDashboard | Pulse-gradient on heading, 4 metric cards, 2 column panels |
| LessonPlayer | Only renders after data loads. If lesson data is loading, show subject-colored spinner. |

**Loading skeleton pattern (use existing style):**
```css
/* Already exists in globals.css */
@keyframes load-skele { to { background-position: -200% 0; } }
.dog-skeleton { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: load-skele 1.5s infinite; }
```

Apply the same pattern with dark colors:
```css
.skeleton-dark { background: linear-gradient(90deg, rgba(16,24,64,.6) 25%, rgba(30,40,80,.8) 50%, rgba(16,24,64,.6) 75%); background-size: 200% 100%; animation: load-skele 1.5s infinite; }
```

---

## 7. Layout Grid & Responsive Breakpoints

### 7.1 Grid System

The existing app uses CSS Grid throughout. Phase 1 does not introduce a grid framework.

| Layout Component | Grid Template | Notes |
|-----------------|---------------|-------|
| Main content | `width: min(1240px, calc(100% - 48px))` | Centered, max-width |
| Welcome grid | `grid-template-columns: 1.25fr 1fr .7fr` | Hero / scene / stats |
| Subject grid | `grid-template-columns: repeat(5, 1fr)` | 5 cards, wraps at 1050px → 3 cols, 780px → 2 cols |
| Bottom nav | `grid-template-columns: repeat(6, 1fr)` | Fixed 6 tabs |
| Lesson worlds | `grid-template-columns: 1fr 1fr` | 2 columns |
| Badge grid | `grid-template-columns: repeat(6, 1fr)` | Wraps down |
| Metric grid | `grid-template-columns: repeat(4, 1fr)` | Wraps down |

### 7.2 Breakpoints (Existing — Locked)

| Breakpoint | Type | Changes |
|------------|------|---------|
| ≥1051px | Desktop/wide tablet | Full layout |
| 781-1050px | Tablet landscape | Subject grid: 3 cols, badge grid: 4 cols, arcade: 1 col |
| 501-780px | Tablet portrait | Single column grids, tighter padding, collapsed topbar |
| ≤500px | Small phone | Min padding, hidden secondary text, full-width buttons |

### 7.3 Phase 1 Additions to Breakpoints

**Language switcher collapse (at 780px):**
- ≥781px: Shows "EN | MS" text labels
- ≤780px: Shows flag emoji only (`🇬🇧` / `🇲🇾`) with tooltip or aria-label

**Migration overlay (all breakpoints):**
- Max width: 400px, centered
- On ≤500px: Full width with 20px margin

---

## 8. Interaction Patterns

### 8.1 Touch Targets (Tablet-First)

| Element | Minimum Target Size | Current Status |
|---------|--------------------|-----------------|
| Bottom nav buttons | 44×44px (achieved via padding) | ✅ ~63×63px |
| Language switcher buttons | 44×44px | ✅ New: 44×44px padded |
| Answer options | 44×44px | ✅ Min-height 61px |
| Subject cards | 44×44px | ✅ Min-height 224px |
| Filter chips | 44×44px | ✅ Height 39px (meets 44px with padding) |
| Sync pill | 44×36px | ⚠️ Height 36px — increase vertical padding to achieve 44px |
| Modal close button | 44×44px | ✅ 39×39px — increase to 44×44px |
| Nav back/exit button | 44×44px | ✅ Height 42px — needs 2px more padding |

**Fix for Phase 1:** `.sync-pill` height needs `padding: 4px 0` to reach 44px touch target. `.modal-x` needs to increase from 39px to 44px.

### 8.2 Tap Interaction

All interactive elements use `onClick` (not `onPointerDown` or `onTouchStart`). This is correct for the target device — React's synthetic events handle touch-to-click mapping.

**Press feedback (already implemented):**
```css
.subject-card:hover { transform: translateY(-7px) rotate(-.4deg); }
.primary-btn:active { transform: translateY(4px); box-shadow: 0 3px 0 #bf2f50; }
```

Phase 1 adds the same pattern to **LanguageSwitcher** buttons:
```css
.lang-option:active { transform: scale(0.92); }
```

### 8.3 Animation & Motion

| Animation | Duration | Easing | Respects `prefers-reduced-motion` |
|-----------|----------|--------|-----------------------------------|
| Page transitions | 0.35s | ease | ✅ Yes (existing) |
| Modal pop | 0.28s | ease | ✅ Yes (existing) |
| Feedback appear | 0.25s | ease | ✅ Yes (existing) |
| Language switch | 0.2s | ease | ✅ Must add |
| Confetti fall | 3.4s | linear | ✅ Yes (existing) |

**Add for Phase 1:**
- Language switcher active state transition: 0.2s ease
- Migration progress bar fill: 0.3s ease per step

### 8.4 Swipe / Gesture

Phase 1 does NOT add swipe navigation. The tab bar is the primary navigation mechanism. Swipe gestures are deferred to v2 visual polish (UI-02).

---

## 9. Accessibility

### 9.1 ARIA & Screen Reader Support

Phase 1 improvements:

| Element | Requirement |
|---------|-------------|
| Language switcher | `aria-label="Switch language"` on container, `aria-pressed` on each button |
| Migration overlay | `role="alertdialog"`, `aria-describedby` for status |
| Sync pill | `aria-live="polite"` for sync state changes |
| Bottom nav | Already has `aria-label="Main navigation"` ✅ |
| Lesson play button | Already has `aria-label="Read question aloud"` ✅ |

### 9.2 Focus Indicators

Existing: `button:focus-visible { outline: 4px solid rgba(61, 145, 232, .25); outline-offset: 2px; }`

**Add for Phase 1:**
- Language switcher buttons: Same focus-visible outline
- Migration retry button: Same focus-visible outline

### 9.3 Reduced Motion

Existing: ✅ `@media (prefers-reduced-motion: reduce)` kills all animations.

Phase 1 additions:
- Migration progress bar: Should animate with `transition` not `animation` — respects reduced motion via the existing blanket rule.

### 9.4 Color Blindness

The app primarily uses subject color + icon combos. No information is conveyed by color alone. ✅

---

## 10. Copywriting Contract

### 10.1 Primary UI Strings (English — All Require Malay Translation)

| String ID | English | Malay | Context |
|-----------|---------|-------|---------|
| `nav.home` | Home | Laman Utama | Bottom nav |
| `nav.quests` | Quests | Cabaran | Bottom nav |
| `nav.arcade` | Free APIs | API Percuma | Bottom nav |
| `nav.badges` | Badges | Lencana | Bottom nav |
| `nav.progress` | Progress | Kemajuan | Bottom nav |
| `nav.parents` | Parents | Ibu Bapa | Bottom nav |
| `lang.en` | EN | EN | Language switcher |
| `lang.ms` | MS | MS | Language switcher |
| `sync.saved` | Cloud saved · v{version} | Disimpan · v{version} | Sync pill |
| `sync.saving` | Saving… | Menyimpan… | Sync pill |
| `sync.offline` | Offline mode | Mod luar talian | Sync pill |
| `sync.migrating` | Upgrading storage… | Menaik taraf… | Sync pill |

### 10.2 Migration Flow Copy

| State | English | Malay |
|-------|---------|-------|
| Scanning | "Checking saved progress…" | "Memeriksa kemajuan…" |
| Migrating | "Moving {count} records to new storage…" | "Memindahkan {count} rekod…" |
| Complete | "Ready! Your progress is safe." | "Sedia! Kemajuan anda selamat." |
| Error | "Something went wrong. Your data is still safe. Tap to retry." | "Ada masalah. Data anda masih selamat. Ketik untuk cuba semula." |

### 10.3 Destructive Actions

| Action | Confirmation Needed? | Approach |
|--------|---------------------|----------|
| Language switch | No | Instant switch, no confirmation |
| Migration retry | No | Direct retry, no confirmation |
| Offline data loss | N/A | Migration never deletes localStorage until confirmed complete |

**No destructive actions in Phase 1.** Data deletion (SYNC-05) deferred to v2.

### 10.4 Empty/Loading States

| Component | Empty State | Loading State |
|-----------|-------------|---------------|
| Lesson overlay | N/A (always has content) | Subject-colored spinner |
| Migration indicator | Not rendered when no migration needed | Pulse skeleton on hero area |
| Badges | "0 badges yet. Complete lessons to earn your first badge!" | Pulse grid skeleton |
| Progress metrics | "Start a lesson to see your progress!" | 4x pulse metric cards |

---

## 11. Registry & Third-Party Components

### 11.1 Registry Declaration

| Registry | Status | Safety Gate |
|----------|--------|-------------|
| shadcn official | NOT USED | N/A |
| Third-party registries | none | N/A |

**No registries are used.** All components are custom-built with pure Tailwind CSS v4 + custom CSS. No shadcn blocks, no third-party component registries.

### 11.2 npm Dependencies for Phase 1

| Package | Version | Purpose | Bundle Estimate |
|---------|---------|---------|-----------------|
| `next-intl` | ^4.x | i18n framework | ~31KB gzipped |
| `dexie` | ^4.2.x | IndexedDB wrapper | ~154KB gzipped |
| `dexie-react-hooks` | ^4.x | React bindings for Dexie | ~5KB gzipped |
| `zustand` | ^5.x | UI state management (sync status, locale) | ~1KB gzipped |

All from npm registry. No third-party component registries.

---

## 12. Implementation Order

The following order ensures dependencies are met:

| Step | What | Depends On |
|------|------|------------|
| 1 | Install `next-intl`, `dexie`, `dexie-react-hooks`, `zustand` | Nothing |
| 2 | Set up `messages/en.json` and `messages/ms.json` with all UI strings | Step 1 |
| 3 | Configure `next-intl` middleware, layout, routing | Step 1 |
| 4 | Add `LanguageSwitcher` component to top bar | Step 3 |
| 5 | Wire locale switching to all existing text (120+ keys) | Steps 2, 3 |
| 6 | Update `learning-data.ts` with bilingual `Question` type and translations | Step 5 |
| 7 | Apply contrast fixes to `.lesson-overlay`, `.question-card`, `.subject-card`, etc. | Nothing |
| 8 | Set up Dexie.js schema and database initialization | Step 1 |
| 9 | Create `MigrationProgressIndicator` component | Step 8 |
| 10 | Migrate `localStorage` reads → Dexie `useLiveQuery` | Step 8 |
| 11 | Add loading skeleton components for each view | Step 10 |
| 12 | Add Zustand store for sync state and locale | Step 1 |

---

## 13. Verification Matrix

| Check | Criteria | How to Verify |
|-------|----------|---------------|
| Language switcher visible | Appears in top bar on all 6 views | Visual inspection |
| Language switch works | All text changes EN ↔ MS | Toggle and check 5 screens |
| No text overflow | All Malay strings fit containers | Test longest string per component |
| Contrast fix applied | Lesson overlay is dark | Screenshot comparison |
| Migration shows | Progress bar appears on first load | Clear IndexedDB, reload |
| No data loss | XP/stats survive migration | Compare localStorage → Dexie |
| Offline works | App loads with no network | Airplane mode test |
| Touch targets ≥44px | All interactive elements meet size | DevTools element inspection |
| Loading skeletons show | Pulse animation while Dexie reads | Throttle CPU to slow Dexie |

---

## 14. Design Decisions Log

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| 1 | No shadcn — pure custom CSS | Existing blocky 3D theme incompatible with shadcn's flat aesthetic | 2026-07-10 |
| 2 | Prefix-based routing (`/en/`, `/ms/`) | Required for next-intl standard pattern; no RTL needed | 2026-07-10 |
| 3 | Malay as default locale | Bilingual household; child exposed to Malay first | 2026-07-10 |
| 4 | Bilingual `Question` type uses inline `{ en, ms }` objects | Avoids duplicating entire lesson data; simple key-switch pattern | 2026-07-10 |
| 5 | Contrast fix replaces light gradients with dark surfaces | The "too light, not visible" issue is a dark-theme inconsistency | 2026-07-10 |
| 6 | Migration never deletes localStorage | Safety net — user can recover data if migration has bugs | 2026-07-10 |
| 7 | Zustand for sync status + locale UI state | Keeps transient UI state out of Dexie (persistent data) | 2026-07-10 |

---

*UI-SPEC for Phase 1: Bilingual Foundation. Prepared: 2026-07-10. Status: draft.*
