# Testing Patterns

**Analysis Date:** Fri Jul 10 2026

## Test Framework

**Runner:**
- **Python `unittest`** — the single test file uses Python's built-in test framework
- No JavaScript/TypeScript test runner is configured (no jest, vitest, mocha, playwright, etc.)
- No test runner config files exist (`jest.config.*`, `vitest.config.*` not present)

**Run Commands:**
```bash
python tests/validate_luth_next_app.py          # Run all tests
python tests/validate_luth_next_app.py -v       # Verbose mode
```

**No npm test scripts:**
- `package.json` `scripts` block contains only: `dev`, `build`, `start`, `lint`, `typecheck`
- No test-related dev dependencies in `package.json`

## Test File Organization

**Location:**
- Tests live in a top-level `tests/` directory (not co-located with source)
- Single file: `tests/validate_luth_next_app.py`

**Naming:**
- Test file uses `snake_case` (`validate_luth_next_app.py`) — consistent with Python conventions
- Test class uses `PascalCase` (`LuthNextAppValidation`)
- Test methods use `snake_case` with `test_` prefix:

  ```python
  def test_package_and_metadata_are_rebranded(self):
  def test_learning_app_contains_luth_brand_footer_parent_controls_and_audio(self):
  def test_dark_blocky_3d_theme_tokens_and_interactions_exist(self):
  def test_pasarapi_arcade_and_education_curriculum_remain(self):
  def test_sync_api_and_health_api_exist(self):
  ```

**Structure:**
```
tests/
└── validate_luth_next_app.py    # Only test file (56 lines)
```

## Test Structure

**Suite Organization:**
```python
class LuthNextAppValidation(unittest.TestCase):
    def test_package_and_metadata_are_rebranded(self):
        package = json.loads(read("package.json"))
        self.assertEqual(package["name"], "luths-playground")
        layout = read("src/app/layout.tsx")
        self.assertIn("Luth's Playground", layout)
        self.assertIn("pasarapi.xyz", layout.lower())
        self.assertIn("#080b1f", layout)
```

**Patterns:**
- **Helper function** `read(relative: str) -> str` at module level reads file content
- Assertions use `self.assertIn()`, `self.assertEqual()`, and `self.assertNotIn()`
- Tests validate **file content** by reading source files and checking for expected strings
- Tests are integration/validation-focused, not unit tests

**Test Count:** 5 test methods in 1 test class

## Mocking

**Framework:** None — no mocking library or mocking patterns are used.

**What to Mock:**
- Not applicable — tests validate static file content, not runtime behavior

**What NOT to Mock:**
- All tests are static analysis of source files — no runtime execution is tested

## Fixtures and Factories

**Test Data:**
- No test fixtures or factories exist
- The `read()` helper reads files directly from the source tree:

  ```python
  ROOT = Path(__file__).resolve().parents[1]

  def read(relative: str) -> str:
      return (ROOT / relative).read_text(encoding="utf-8")
  ```

**Location:**
- The `read()` helper is defined inline in the test file
- No dedicated test data directory

## Coverage

**Requirements:** None enforced — no coverage tooling is configured in `package.json` or anywhere in the project.

**View Coverage:** Not possible with the current setup. No `nyc`, `c8`, `istanbul`, or Python `coverage` tooling is available.

## Test Types

**Unit Tests:**
- **Not present** — no unit tests exist for individual functions, hooks, or components

**Integration Tests:**
- **Python integration/validation tests only**
- Tests validate that source files contain expected content after merges
- Examples of what is tested:
  - `package.json` name is `"luths-playground"`
  - `layout.tsx` contains "Luth's Playground", "pasarapi.xyz", and "#080b1f"
  - `learning-app.tsx` contains brand name, parent dashboard, AudioContext, speechSynthesis
  - `globals.css` contains dark theme tokens (`--void`, `--neon`, `--neon-pink`, `blocky`, `perspective`)
  - `learning-data.ts` contains all 5 subjects and Mandarin phrases
  - `learning-app.tsx` references dog.ceo, uselessfacts, and datamuse APIs
  - `sync/route.ts` and `health/route.ts` exist and contain expected identifiers

**E2E Tests:**
- **Not used** — no browser automation or end-to-end testing

## Common Patterns

**String Content Validation Pattern:**
```python
def test_learning_app_contains_luth_brand_footer_parent_controls_and_audio(self):
    app = read("src/app/learning-app.tsx")
    for term in ["Luth&apos;s Playground", "pasarapi.xyz", "Parent Dashboard", "AudioContext", "speechSynthesis"]:
        self.assertIn(term, app)
    for term in ["soundEnabled", "playTone", "speak(", "dailyLimit", "enabledSubjects"]:
        self.assertIn(term, app)
    self.assertNotIn("ROBLOX LEARNING WORLD", app)
```

**Absence Check Pattern:**
```python
self.assertNotIn("ROBLOX LEARNING WORLD", app)
```

## Test Coverage Gaps

| Area | What's Not Tested | Risk | Priority |
|------|-------------------|------|----------|
| Individual functions | `playTone`, `speak`, `levelForXp`, `accuracy`, `todayKey` | Bugs in logic could go undetected | Medium |
| `learning-app.tsx` components | `NavButton`, `HomeView`, `LearnView`, `LessonPlayer` rendering/behavior | UI regressions not caught | High |
| API routes | `GET /api/sync`, `POST /api/sync`, `GET /api/health` | API contract breaks undetected | High |
| Database | `src/db/schema.ts`, `src/db/index.ts` | Schema changes not validated | High |
| State management | Progress calculation, badge awarding, XP math | Incorrect progress tracking | Medium |
| Error handling | Offline behavior, fetch failures, JSON parse errors | UX degradation during failures | Medium |
| Accessibility | No a11y tests | COPPA compliance assertions not validated | Medium |

## Recommendations

1. **Add a JavaScript test runner** — install vitest or jest for unit/integration testing of TypeScript code
2. **Test commands** — add `test` and `test:coverage` scripts to `package.json`
3. **Component tests** — add rendering tests for sub-components (`NavButton`, `LessonPlayer`, `ParentGate`, etc.) using React Testing Library
4. **API tests** — add integration tests for the sync and health API routes
5. **Utility tests** — add unit tests for pure functions (`levelForXp`, `accuracy`, `todayKey`, `awardBadges`, progress calculations)
6. **Maintain Python validation tests** — keep `validate_luth_next_app.py` as a quick sanity check for cross-merge content integrity

---

*Testing analysis: Fri Jul 10 2026*
