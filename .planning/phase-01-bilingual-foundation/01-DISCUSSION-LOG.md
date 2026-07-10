# Phase 1 Discussion Log

**Date:** 2026-07-10
**Phase:** Bilingual Foundation

## Areas Discussed

### Language Switcher UX
- **Target audience**: Both child and parent use it equally
- **Visual**: Flag emoji buttons (🇲🇾/🇬🇧), no text labels
- **Placement**: OpenCode's discretion (top header recommended)
- **Mid-lesson behavior**: OpenCode's discretion (recommended: UI changes immediately, lesson content stays in starting language until done)

### IndexedDB Migration UX
- **When**: First load after update
- **Visual**: Brief branded loading spinner
- **Error handling**: Auto-retry 3x, fall back to localStorage
- **Cleanup**: Keep localStorage as backup indefinitely

### i18n Message Organization
- **File split**: One file per page/view (home.json, learn.json, etc.)
- **Key naming**: Flat keys with page prefix (home_greeting, learn_startLesson)

## Unselected Gray Areas
- Default locale detection strategy — left to OpenCode's discretion
