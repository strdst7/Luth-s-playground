# Pitfalls Research

**Domain:** Offline-first children's educational platform with speech, parental dashboards, content authoring, and COPPA compliance
**Researched:** 2026-07-10
**Confidence:** HIGH (multi-source verified with official docs and enforcement actions)

## Critical Pitfalls

### Pitfall 1: Binary Sync State Machine (Data Loss on Crash)

**What goes wrong:**
When a device crashes or loses power during sync transmission, pending items that were in transit are silently lost. On restart, the item appears as `PENDING` (never sent), gets retried, and the server processes a duplicate. If the item was already processed but confirmation never reached, the user sees a phantom duplicate. If the queue only has `PENDING` / `SYNCED` / `ERROR` states (three states), there is no way to distinguish "about to send" from "ready to send" from "stuck in transit."

**Why it happens:**
The most common offline sync implementation treats failure as binary — an item either synced or it didn't. Research shows that six states are necessary: `PENDING`, `IN_FLIGHT`, `SYNCED`, `RETRYABLE_ERROR`, `FATAL_ERROR`, `DEAD_LETTER`. Without `IN_FLIGHT`, a crash during transmission leaves the item indistinguishable from one that was never sent. Without `DEAD_LETTER`, items that will never succeed (validation errors, 400s) loop indefinitely, consuming battery and bandwidth on children's tablets. Source: [Six-state sync queue analysis](https://dev.to/salazarismo/the-hidden-problems-of-offline-first-sync-idempotency-retry-storms-and-dead-letters-1no8)

**How to avoid:**
- Implement the full six-state sync machine: `PENDING → IN_FLIGHT → SYNCED` (success) or `RETRYABLE_ERROR → DEAD_LETTER` (after exhaustion) or `FATAL_ERROR` (immediate terminal)
- Store `inFlightAt` timestamp on every item. Recovery job transitions items stuck in `IN_FLIGHT` longer than a threshold (e.g., 60s) back to `RETRYABLE_ERROR`
- Never silently delete failed items — `DEAD_LETTER` preserves evidence for diagnosis
- Use `stableStringify` (not `JSON.stringify`) for idempotency keys — property ordering differs between engines

**Warning signs:**
- Sync status shows only "synced" / "pending" / "error" (three states or fewer)
- No recovery mechanism for items stuck during transmission
- Duplicate records appearing after device restarts or network interruptions
- Same error retrying indefinitely without escalating

**Phase to address:**
**SYNC phase** (active milestone). Must be designed before any sync code is written — retrofitting states is a schema migration nightmare.

---

### Pitfall 2: Last-Write-Wins on All Fields (Silent Data Loss)

**What goes wrong:**
Server receives two conflicting writes from different devices. Using wall-clock timestamps, the later one silently overwrites the earlier one. But "later" may mean: device A was offline longer, clock B was wrong, or device C replayed an old action. The user's intent from device A is silently destroyed. For a child's learning progress, this means lost XP, completed lessons marked incomplete, or badges disappearing.

**Why it happens:**
Last-Write-Wins (LWW) is the simplest conflict strategy to implement. Most tutorials recommend "use a timestamp." But wall-clock time is not truth — it's timing. A child's tablet that was offline for 3 days will have a stale timestamp, and its data gets overwritten by a device that synced 5 minutes ago. The child loses progress and doesn't know why. Source: [Sync conflict handling in offline-first PWAs](https://dev.to/crisiscoresystems/sync-conflict-handling-in-offline-first-pwas-how-to-merge-without-lying-to-the-user-59i3)

**How to avoid:**
- Merge at the **field level**, not the document level. If device A updated XP and device B updated avatar, both should survive
- Use logical timestamps (Lamport clocks or version vectors), not wall-clock time, for ordering
- For scalar fields where conflict is possible (e.g., two lessons completed on different devices), use a CRDT register type or explicit conflict resolution UI
- Always preserve the losing value in a conflict history — never silently discard
- Treat deletes with tombstones — a lesson deleted on device A while device B was offline should not reappear when B syncs

**Warning signs:**
- Entire progress document is sent/replaced on every sync (field-level granularity missing)
- No version vector or revision counter on records
- User reports of "I earned that badge, where did it go?"
- Wall-clock timestamps used as primary conflict resolver

**Phase to address:**
**SYNC phase** — the merge strategy must be defined per-field in the sync contract. Cannot be bolted on later without data loss.

---

### Pitfall 3: Over-Engineering Sync with Full CRDT Library (Unnecessary Complexity)

**What goes wrong:**
Team adopts Yjs/Automerge/CRDT for the entire app state, paying complexity tax (tombstone bloat, schema versioning, peer-to-peer networking, compaction) when the app's actual sync needs are simpler: single-child profiles, last-write-wins on independent fields, and rare conflicts.

**Why it happens:**
CRDTs are the hot pattern in 2025-2026 local-first discourse. Articles celebrate them as the solution to all sync problems. But for an app where one user (the child) is the primary writer and writes are mostly independent (progress update, avatar change, settings change), the CRDT tax is unnecessary. Tombstone accumulation in long-lived documents causes memory bloat. Compaction cycles are complex. Source: [CRDT pitfalls](https://appdesign.intelligent-ps.store/blog/local-first-crdt-data-synchronization-protocols)

**How to avoid:**
- Per-field merge with version vectors is sufficient for single-child profiles with independent fields
- Reserve CRDT for truly collaborative surfaces (none in this app — collaborative editing is out of scope)
- A simple queue-based sync with `externalId` idempotency and field-level merge handles this app's use case
- If adding CRDT later, split into coarse document boundaries (per-subject progress, not a single giant document) — tombstone GC is tractable at document level

**Warning signs:**
- Sync design discussions mention "CRDT" before defining conflict policy per field
- Evaluating Yjs/Automerge without first determining whether queue-based sync suffices
- Single giant CRDT document containing all app state

**Phase to address:**
**SYNC phase** — evaluate against actual requirements before committing. Per-field merge + idempotency queue will likely suffice.

---

### Pitfall 4: Web Speech API as Pronunciation Grader (False Positives Destroy Trust)

**What goes wrong:**
The app asks a 5-year-old to say "apple." The child says "appo" (age-appropriate mispronunciation). The Web Speech API transcribes it as "apple" (confidence 0.92) because the language model fills in the expected word contextually. The app awards full points. The child learns nothing about pronunciation. Alternatively, the child says "apple" correctly but background noise causes a "no match" error — the child is frustrated.

**Why it happens:**
The Web Speech API is designed for **transcription**, not pronunciation grading. It returns a transcript and a confidence score — but the confidence score measures how confident the engine is that its transcription is correct, not how well the user pronounced the word. For non-native speakers, accuracy drops to ~65% (vs. 89% for native speakers). For children (ages 4-6), Word Error Rate is 15-35%, meaning 1 in 3 words can be misrecognized. Research shows automated scoring of children's speech is "far below that of human scorers" and "not yet ready to mimic human scoring." Source: [Edwards et al. 2026 - automated speech scoring in early elementary](https://doi.org/10.31234/osf.io/r3ydm_v1), [The Learning Agency - child speech recognition gap](https://the-learning-agency.com/guides-resources/closing-the-child-speech-recognition-gap-evidence-limitations-and-paths-forward/)

**How to avoid:**
- **Never use Web Speech API confidence as a pronunciation score.** It measures transcription confidence, not pronunciation quality
- Use Web Speech API only to detect whether the child said *something* (voice activity detection), then use dedicated pronunciation scoring:
  - **PasarAPI** (free tier): send audio, get phoneme-level feedback — but verify accuracy for children's voices before trusting
  - **Goodness of Pronunciation (GoP)** scoring: needs a dedicated ASR engine (SoapBox Labs, Speechace, or KeenASR) — these are trained on children's voices
- Accept the fundamental limitation: automated pronunciation scoring for 5-year-olds will never match human judgment. Set user expectations accordingly
- Implement "skip" and "try again" — the child should never be stuck on a pronunciation question
- For Malay/English bilingual: Web Speech API on-device recognition does NOT support Malay (`ms-MY`) — only cloud recognition does

**Warning signs:**
- Using `recognition.confidence` as a pronunciation quality score
- No fallback for browsers that don't support SpeechRecognition (Firefox, Safari, Brave blocks it)
- Testing only with adult voices, not 5-year-old children
- No way for parent/adult to override incorrect scoring
- No handling of `nomatch` and `error` events gracefully

**Phase to address:**
**PRON phase** — requires dedicated research on PasarAPI's actual accuracy for children's voices before building. Web Speech API can be used as a complement but not the grader.

---

### Pitfall 5: COPPA Consent Bundled with Terms of Service (Instant FTC Violation)

**What goes wrong:**
The app's onboarding flow has a single checkbox: "I agree to the Terms of Service and Privacy Policy." Parents check it, and the app starts collecting data. This is a direct COPPA violation. The FTC's Epic order specifically prohibits bundling COPPA consent with terms acceptance. Edtech companies lose hundreds of thousands avoiding this basic error.

**Why it happens:**
Developers treat privacy consent as a UX friction problem to minimize. A single checkbox is the lowest friction. But COPPA (and the April 2026 amendments) specifically require:
1. **Separate, verifiable parental consent** (VPC) — cannot be bundled with ToS
2. **Separate consent for third-party disclosures** (analytics SDKs, AI training) — cannot be bundled with collection consent
3. **Pre-checked boxes are prohibited** — consent must be affirmative

FTC enforcement is aggressive: Disney $10M (2025) for mislabeling YouTube videos, Cognosphere/Genshin $20M (2025) for children's data collection, Apitor $500K (2025) for SDK geolocation disclosure. Per-violation penalties are $53,088 per child per day. Source: [FTC COPPA enforcement](https://www.ftc.gov/news-events/topics/protecting-consumer-privacy-security/kids-privacy-coppa), [COPPA amendments April 2026](https://blog.promise.legal/coppa-april-2026-amendments-edtech/)

**How to avoid:**
- Separate consent flow with two distinct screens:
  1. **Primary VPC screen**: "We collect [specific data list] to track your child's learning progress. Do you consent?"
  2. **Secondary disclosure screen** (if applicable): "We share [data] with [named SDK/partner] for [purpose]. This is optional."
- Core service access cannot depend on secondary consent acceptance
- Use age-gating before any data collection (neutral age screen — ask for birth year, not "Are you 13?")
- Document the consent flow in the privacy policy as required by 312.4(d)
- Keep a consent audit trail (when, what version, what was consented to)

**Warning signs:**
- Single "I agree" checkbox for everything
- No distinction between first-party collection and third-party disclosure
- Pre-checked consent boxes
- No age gate before data collection starts
- Privacy policy not updated for April 2026 amendments

**Phase to address:**
**SEC phase** — before any data collection goes live. Must be designed into the architecture, not added later.

---

### Pitfall 6: Parental Dashboard Vanity Metrics (Looks Good, Useless in Practice)

**What goes wrong:**
The dashboard shows: total logins (this week), time spent (minutes), lessons completed, stars earned, streak length. Parents check it once, see the numbers go up, and stop checking. The data answers "is my child using the app?" but not "is my child learning?" The metrics that look good in a demo (colorful charts, progress bars) are the ones parents ignore.

**Why it happens:**
Education technology defaults to what's measurable rather than what's meaningful. Research shows 85% of parents rate EdTech dashboards at 5/10 or lower when they have to navigate multiple apps. The fundamental parent question is "Is my child on track?" — not "How many logins did they have?" Parents want the answer in under 10 seconds. Source: [What parents actually want from school technology](https://beenet.app/blog/what-parents-actually-want-from-school-technology-and-the-gap/), [Beyond dashboards: generative UI for parent trust](https://everydayindustries.com/beyond-dashboards-generative-ui-parent-trust-edtech/)

**How to avoid:**
- Metrics that matter: learning trend over time (is the child improving in subject X?), struggle signals (which topics are repeated most?), regression detection (was skill X mastered but now declining?), recommendations (what to practice next)
- Metrics to de-emphasize: total logins, total time, streak count (these encourage gaming the system)
- Format: one-screen answer to "Is my child on track?" with optional drill-down
- Crisis signals: immediate notification if a child shows sustained struggle in a subject (not weekly summary)
- Avoid overcommunication: one weekly summary in the parent's preferred language beats a daily notification barrage

**Warning signs:**
- Dashboard shows time-spent metrics prominently
- No trend data (only current state)
- Can't answer "is my child improving?"
- Requires parent to interpret charts to get answers
- Parent receives daily notifications

**Phase to address:**
**PARENT phase** — design metrics based on parent research, not what's easy to compute.

---

### Pitfall 7: Content Authoring Tool That Teachers/Parents Stop Using After Week 1

**What goes wrong:**
The admin dashboard for creating lessons looks polished in the demo. Users create 1-2 lessons, then abandon it. The lessons they created are lower quality than the pre-built ones. The tool becomes "shelfware."

**Why it happens:**
Three compounding factors from EdTech implementation research:
1. **Cognitive load outweighs benefit**: Teachers spend 5 hours setting up a gamified lesson; students are engaged for 20 minutes. Return on Effort (ROE) is negative. The 2024 Korea AI Textbook failure ($800M project abandoned in 4 months) showed 87.4% of teachers felt unprepared and the tools added work rather than reducing it.
2. **The Complexity Gap**: 85-90% of teachers can't evaluate AI-generated lesson quality well enough to use tools effectively. The tools demand rapid evaluative thinking that most users haven't been trained for.
3. **Invisible labor**: Content authoring adds setup time (uploading assets, configuring quizzes, sequencing lessons) that's invisible to administrators but consumes hours.
Source: [South Korea AI textbook failure](https://minssam.com/en/blog/2026-korea-ai-textbook-failure-lessons/), [Why better tools lead to worse lessons](https://flipeducation.ai/blog/why-better-tools-often-lead-to-worse-lessons), [The Complexity Gap](https://nathancritchett.me/writing/nobody-using-ai-tools.html)

**How to avoid:**
- **Template-first, not blank-page-first**: Users choose a subject template and fill in content, not architect from scratch
- **Return on Effort must be positive in week 1**: Creating a lesson should take under 5 minutes. If the first lesson takes 30 minutes, they never make a second
- **Pre-built curriculum as default**: The auth tool supplements the existing 25 lessons, it doesn't replace them. Users should be able to tweak an existing lesson far more easily than creating one
- **Preview on child's device**: Content authors must see what the child will see (tablet view, with audio, with animations) before publishing
- **No AI generation without review loops**: If AI generates questions, the author must verify each one — research shows AI-generated lessons engage only lower-order thinking skills (45% pure memorization vs 2% evaluation)
- **Versioning is table stakes**: Publishing without ability to roll back prevents adoption
- **For this project specifically (single parent creating content for their child)**: Keep it simpler than a general-purpose authoring tool. A form-based lesson builder with fields for title, content, questions, and audio is sufficient

**Warning signs:**
- Blank canvas as the starting state
- More than 10 fields/inputs to create a single question
- No template or starter content
- No preview mode
- Users create 1-2 items and stop
- High time-to-first-lesson (>10 minutes)

**Phase to address:**
**AUTH phase** — the UX must be designed for positive initial ROE. Test with actual users (the parent) in week 1.

---

### Pitfall 8: Children's UX Designed for Adults (Cognitive Mismatch)

**What goes wrong:**
Progress bars don't make sense to a 5-year-old. Animated hands demonstrating gestures are misinterpreted. Overcrowded screens cause confusion. The child taps randomly, gets frustrated, and closes the app. The most common failure: interfaces that work for 8-year-olds fail completely for 5-year-olds.

**Why it happens:**
Children's cognitive development at age 5 (Piaget's preoperational stage) means they cannot:
- Understand symbolic representations (progress bars, abstract icons)
- Interpret visual state changes (pulsing buttons signaling "tap me")
- Follow audio-only instructions reliably (under age 3.5, audio prompts are ineffective; at age 4-5, they work but need visual reinforcement)
- Perform complex gestures (pinch, multi-touch, flick — only tap and swipe are intuitive)
- Read any text

Research shows 44% of apps targeting preschoolers use symbolic interface elements (progress bars, hand demos) that are inaccessible to children under 3 and require specific design to work for ages 3-5. Embellishing symbols with visual detail (common in children's apps) *increases* cognitive burden. Source: [TIDRC touchscreen framework](https://doi.org/10.1145/3311927.3323149), [Hidden symbols study](https://faculty.washington.edu/alexisr/HiddenSymbols.pdf), [NN/G children's usability](https://www.nngroup.com/articles/childrens-websites-usability-issues/)

**How to avoid:**
- **Tap is king**: Tap is the only gesture guaranteed to work for 5-year-olds. Support swipe for scrolling but always have a tap alternative
- **No progress bars**: Replace with concrete visual metaphors (a path with characters reaching a castle, not an abstract bar)
- **Direct representation over symbols**: Show objects, not icons. A "home" button should be a picture of the home, not a house icon
- **Visual + audio instructions together**: Audio alone fails for 3-year-olds. Visual demonstration alone is ambiguous. Both together work from age 3.5
- **Register tap on touch-down, not touch-up**: Children tap hard and hold long. If feedback only comes on release, they think the app is broken
- **Large targets**: Minimum 44px, ideally 60px+. Children's finger pads are larger relative to target accuracy
- **No bottom-edge hot zones**: Children rest wrists on tablet bottoms, causing accidental touches
- **6-8 second timeout before hint**: Games should show a hint after 6-8 seconds of inactivity; stories after 3-5 seconds
- **Confirmation for destructive actions**: "Exit lesson?" needs a confirmation dialog. Accidental back-button taps lose progress

**Warning signs:**
- App uses progress bars, abstract icons, or symbolic indicators
- Multiple complex gestures (pinch, multi-touch, flick) required
- Text-dependent navigation or instructions
- Touch registered on release (not press)
- No timeout-based hints
- Bottom-edge interactive elements
- Interface elements not visually distinct from background

**Phase to address:**
**UI phase** — critical for all child-facing screens. The monolithic `learning-app.tsx` needs component extraction that applies these principles per-view.

---

### Pitfall 9: i18n That Breaks on Malay (RTL Assumptions, Missing Audio)

**What goes wrong:**
The app assumes left-to-right text direction, uses English-only fonts, hardcodes English grammar rules in question templates, and has no Malay audio for speech synthesis. When switching to Malay:
- Text overlaps or gets clipped (Malay words are often longer than English equivalents)
- Speech synthesis has no Malay voice (most browsers don't ship a default Malay voice)
- Question templating breaks ("Is this correct?" assumes English word order)
- Cultural assumptions creep in (English names, Western contexts in examples)

**Why it happens:**
Malay (Bahasa Melayu) is more than a translation challenge. It has:
- Different sentence structure (verb-subject-object ordering differs from English)
- Longer average word length (e.g., "pertanggungjawabkan" = 18 characters for "accountability")
- Reduplication for plurals (buku → buku-buku) — templating systems that don't account for this break
- Formal/informal register differences (not just "you" forms, but entire sentence structures)
- Arabic-derived script influence (Jawi) — though the app uses rumi (Latin script), some cultural artifacts assume Roman-only
- Speech synthesis: `speechSynthesis.getVoices()` in Chrome does NOT include a Malay voice by default on most systems. The app needs to stream from PasarAPI or a cloud TTS service

Source: [MalayLearning app research](https://doi.org/10.35631/ijepc.1061083), [Malay cultural UI design principles](https://ir.upsi.edu.my/files/docs/2020/3420_3420.pdf), [Bilingual Malaysian children's app study](https://kwpublications.com/papers/detail/IJARPED/19511/)

**How to avoid:**
- **Translation is not localization**: Use `next-intl` or `react-i18next` with ICU message format (handles pluralization, gender, word order). Avoid string concatenation for building sentences
- **Don't hardcode direction**: Malay rumi is LTR like English, but future RTL languages (Arabic, Jawi script) must be supported. Use CSS logical properties (`margin-inline-start` not `margin-left`)
- **Set up Malay voice fallback chain**: Try browser voice → PasarAPI TTS → cloud TTS. Test specifically that Malay speech synthesis works on target tablets (Android Chrome)
- **Template questions in the target language**: Don't translate English templates — write question structures that are grammatically correct in Malay
- **Cultural review**: Have a native Malay speaker review all content. Not just for language but for examples, names, and contexts
- **Font sizing**: Test with the longest word in each language. Malay compound words can be very long (`mempertanggungjawabkan` = 22 chars)
- **Audio content for speech**: Pre-record Malay pronunciations for key vocabulary. Browser TTS for Malay may sound unnatural

**Warning signs:**
- String concatenation for UI text (`prefix + variable + suffix`)
- CSS with hardcoded `left`/`right` instead of logical properties
- No Malay voice testing on target devices
- English sentence templates with variables inserted
- Only English-language examples in questions
- No native speaker review process

**Phase to address:**
**LOCALE phase** — needs to be designed into the component architecture from the start. Retrofitting i18n into a monolithic component is painful.

---

### Pitfall 10: Offline Sync + Next.js SSR Hydration Mismatch (Broken UI on First Load)

**What goes wrong:**
The app renders on the server with no data (or stale cached data), then client-side hydration loads fresh data from IndexedDB/localStorage. React throws hydration mismatch errors. The UI flashes from empty to populated. On slow tablets, users see a flash of incorrect state before the client corrects it.

**Why it happens:**
Next.js server-side rendering cannot access browser-only APIs (IndexedDB, localStorage). If the server renders "no progress" and the client hydrates with "there is progress," React 19 reports a hydration error. Even with `suppressHydrationWarning`, the user sees a visual flash. The local-first data model conflicts with SSR's assumption that the server knows the initial state. Source: [local-first with SSR](https://dev.to/salazarismo/the-hidden-problems-of-offline-first-sync-idempotency-retry-storms-and-dead-letters-1no8) ("No server-side rendering for user data"), [Next.js hydration errors](https://nextjs.org/docs/messages/react-hydration-error)

**How to avoid:**
- **Treat SSR as a shell**, not a data source. Server renders the app layout, navigation, and non-personalized content. All user data is client-rendered
- Use `'use client'` boundaries at view level. Wrap data-dependent sections in `<Suspense>` with skeleton loading states
- Use `useSyncExternalStore` for hooking IndexedDB/localStorage into React's concurrent mode — prevents tearing during hydration
- For the monolithic `learning-app.tsx`: extracting views into separate components with their own data subscriptions is necessary before offline sync can work reliably
- Consider static export for the PWA shell (`output: 'export'`) and serve data purely client-side — this eliminates SSR hydration entirely for data-dependent views
- **Critical pattern**: Show nothing until data is loaded rather than showing wrong data. A skeleton is better than a hydration flash

**Warning signs:**
- Server-rendered pages that depend on localStorage/IndexedDB data
- `suppressHydrationWarning` used instead of proper client-only rendering
- Views that render "0 XP" or "no progress" before client data loads
- No loading/skeleton states for data-dependent sections

**Phase to address:**
**UI / DEBT phase** — component extraction from `learning-app.tsx` is prerequisite. Then data views must be refactored for SSR-safe patterns.

---

### Pitfall 11: Data Retention Without a Written Policy (COPPA Violation)

**What goes wrong:**
The app stores children's progress data, session logs, and analytics indefinitely. There is no written policy specifying what's kept, why, and for how long. A parent requests data deletion — and the team realizes they can't easily delete because data is embedded in unstructured logs or cached in multiple places.

**Why it happens:**
The April 2026 COPPA amendments (16 CFR § 312.10) require a written data retention policy that:
- States the purposes for each data category
- States the business need justifying retention time
- Specifies a timeframe for deletion
- Appears in the online notice (not just internal docs)

Failure is common because teams design storage first and privacy second. The FTC's Apitor case ($500K, 2025) was triggered by third-party SDKs collecting geolocation without consent. The TikTok/ByteDance case (2024) included allegations of failing to delete data when requested. Source: [COPPA retention requirements](https://blog.promise.legal/coppa-april-2026-amendments-edtech/), [COPPA compliance checklist](https://vcisolite.com/blog/coppa-compliance-edtech)

**How to avoid:**
- **Write the retention policy NOW**, before building features. Answer: what data do we collect, why, how long, when do we delete?
- **Architecture for deletion from day one**: Every data store (IndexedDB client-side, PostgreSQL server-side, localStorage) must have a deletion path. Not having one means re-architecture later
- **One-click parent-triggered cloud wipe** (SYNC-05 in the roadmap): This isn't a nice-to-have, it's legally required
- Log retention: Progress data → delete 6 months after last activity. Session analytics → anonymize after 30 days. Device ID → delete on parent request
- Third-party SDK data: Map what PasarAPI receives. Ensure they don't retain children's data independently
- **Biometric data** (voice recordings for pronunciation): The 2026 amendments classify these as "personal information" requiring explicit parental consent. Delete voice recordings after scoring

**Warning signs:**
- No written data retention policy
- No mechanism to delete a child's data on request
- Data accumulates indefinitely with no deletion schedule
- Voice recordings kept beyond analysis window
- Third-party SDKs (PasarAPI) receive data with no written agreement about retention
- "We'll deal with deletion requests when we get them" attitude

**Phase to address:**
**SEC phase** — before any data storage goes to production. Retention policy must be written and architecture must support deletion.

---

### Pitfall 12: Pronunciation Feedback That Frustrates (False Negatives Destroy Motivation)

**What goes wrong:**
A 5-year-old says "rabbit" but the app doesn't recognize it. The child tries again, clearer this time. Still fails. The child gets frustrated, cries, and asks to stop using the app. For a 5-year-old, the app's core value ("make learning feel like play") is destroyed in one session.

**Why it happens:**
Children's speech has higher word error rates than adults' (15-35% WER for ages 4-6 vs. 5% for adults). Their pronunciation is developmentally variable — a "wabbit" for "rabbit" is age-appropriate but an ASR system marks it wrong. The gap between what the child intended and what the system recognizes creates a negative feedback loop. Research shows that for phoneme blending tasks (breaking words into sounds), automated scoring consistency with human raters is particularly low. Source: [Frontiers 2026 - speech verification with children](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2026.1671946/full), [The Learning Agency - child ASR gap](https://the-learning-agency.com/guides-resources/closing-the-child-speech-recognition-gap-evidence-limitations-and-paths-forward/)

**How to avoid:**
- **Expectation management**: The app should never present pronunciation scoring as definitive. Frame it as "let's practice" not "get it right"
- **Always have a "skip" or "try another way"**: No child should be stuck on a pronunciation question
- **Use multiple attempts**: Allow 3 attempts before offering the correct answer. Show the correct pronunciation (audio model, not just text)
- **Voice activity detection matters more than accuracy**: Detect that the child *tried* and reward effort, not just correctness. XP for effort motivates more than XP for perfect pronunciation
- **Infer from word-level evidence, not phonemes**: The Babble project approach is correct — score at the word level (Levenshtein distance to expected word), not phoneme-level (which Web Speech API doesn't provide anyway)
- **Consider specialized children's ASR**: SoapBox Labs claims 100,000+ child voice samples in training data — better than general Web Speech API for this use case. But cost may be prohibitive for a free-tier project
- **Malay pronunciation is harder**: No Malay-specific child ASR models known. Malay speech recognition for adults is limited; for children, accuracy will be significantly lower

**Warning signs:**
- Pronunciation scoring has no retry mechanism
- No feedback except "correct" / "incorrect"
- Not tested with actual 5-year-old children before shipping
- Single-attempt scoring presented as definitive
- Malay pronunciation treated same as English
- Voice recordings stored without explicit COPPA consent

**Phase to address:**
**PRON phase** — design for low accuracy expectations. The UX must handle the reality that automated scoring will be wrong sometimes.

---

### Pitfall 13: Sync Retry Storm on Reconnection (Battery Drain + Server Overload)

**What goes wrong:**
A child's device comes back online after 2 days offline (e.g., vacation). The sync queue has 500 queued events. The app fires all 500 in parallel. The server is overwhelmed. Half fail with 429/503. The queue retries them. Now there are 1000 concurrent requests. The child's tablet overheats, battery drains, and sync never completes.

**Why it happens:**
Offline-first tutorials show simple "on online event, flush queue" code. But when a device has been offline for days, the accumulated queue can be enormous. Without rate limiting and backoff, the reconnection storm causes cascading failure. Source: [offline sync retry storms](https://dev.to/salazarismo/the-hidden-problems-of-offline-first-sync-idempotency-retry-storms-and-dead-letters-1no8)

**How to avoid:**
- **Batch sync with backpressure**: Send items in batches of 10-20, wait for confirmation, send next batch
- **Exponential backoff per item**: First failure retry in 5s, second in 25s, third in 125s. Cap at 1 hour
- **Rate limit on server side**: `/api/sync` must reject with 429 when overloaded (currently has no rate limiting at all — CONCERNS.md)
- **Prioritize queue**: Last-write-wins for progress updates means old events can be dropped. Don't sync "XP was 10" then "XP was 15" — just sync "XP is 15"
- **Merge queue before sending**: If there are 3 progress updates for the same lesson, collapse to 1
- **Show sync progress to parent (not child)**: The child should never see a "syncing..." indicator. It's distracting and meaningless to a 5-year-old

**Warning signs:**
- All pending events sent in one burst on reconnect
- No backoff for retries
- No rate limiting on server endpoint
- Queue can grow unbounded without compaction
- Child-facing "syncing..." UI elements

**Phase to address:**
**SYNC phase** — queue architecture must include batching, backoff, and compaction.

---

### Pitfall 14: PIN-Based Parent Gate That's Not Actually Secure

**What goes wrong:**
The existing parent gate uses hardcoded PIN `1234`, displayed on the same screen as the PIN entry. A 5-year-old can read numbers. The parent gate provides zero security — it's a placebo. When PIN security fails, the child can access dashboard settings, change difficulty, set unlimited time, or (in future) delete data.

**Why it happens:**
The MVP used a hardcoded PIN for expedience. The "Default PIN: 1234" text was added as a helper. Nobody treated the parent gate as a real security boundary because it was provisional. Now it's shipped. Source: CONCERNS.md lines 20-24, 173-177.

**How to avoid:**
- **Custom parent-set PIN on first access** (PARENT-02 in roadmap): Store hashed in localStorage (bcrypt or PBKDF2) — never in plaintext
- **No helper text if PIN is set**: Show "Reset PIN?" only after 3 failed attempts
- **Failed attempt lockout**: 5 wrong attempts → 30-second lockout → 10 wrong → 5-minute lockout
- **Recovery mechanism**: If PIN is forgotten, parent can reset via a security question or (if sync is enabled) email-based reset. For offline-only, a durable recovery code stored separately
- **No PIN in plaintext anywhere**: Not in code, not in localStorage keys, not in logs

**Warning signs:**
- PIN displayed on the same screen as PIN entry
- Hardcoded PIN in source code
- PIN stored in plaintext in localStorage
- No lockout on failed attempts
- Child can bypass parent gate by refreshing or navigating

**Phase to address:**
**SEC phase** / **PARENT phase** — must be resolved before the app is used by anyone outside immediate family.

---

### Pitfall 15: Assuming School Consent Covers All COPPA Obligations

**What goes wrong:**
The app is used in a home/personal context (not a school), so school consent doesn't apply. But even if it did, assuming the "school authorization exception" covers everything is a mistake. COPPA's school authorization only covers data collection for educational purposes. Non-educational data use (analytics, product improvement, AI training) still requires separate parental consent. A FERPA-compliant DPA does NOT make you COPPA-compliant — they are separate laws enforced by different agencies. Source: [FERPA vs COPPA](https://dev.to/bhavesh_pawar_8205920953a/why-being-ferpa-compliant-does-not-make-you-coppa-compliant-in-2026-2d80)

**How to avoid:**
- For this project (single parent, home use): Obtain **direct verifiable parental consent** from the parent user
- Consent flow must be specific: what data is collected, how it's used, who it's shared with
- Document that this is a personal educational tool, not a school-authorized service
- If the app ever deploys to schools, negotiate a separate data processing agreement per school — COPPA school authorization requires this

**Warning signs:**
- Believing "we're a personal project, COPPA doesn't apply" (it does if children under 13 use it)
- Assuming FERPA compliance means COPPA compliance
- No consent audit trail
- Using "school authorization" without a written school agreement
- Collecting analytics data that goes beyond what's needed for the core educational purpose

**Phase to address:**
**SEC phase** — consent architecture must be designed before data collection.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Single monolithic component (872-line `learning-app.tsx`) | Fast MVP delivery | Impossible to maintain, no code splitting, full rerenders on every state change | Only for prototype. Component extraction is pre-requisite for subsequent phases |
| Hardcoded curriculum data (240-line `learning-data.ts`) | No database needed for content | Adding content requires code changes and redeployment | Acceptable for single-child MVP. Content authoring tool makes this obsolete |
| Three-state sync (pending/synced/error) | Simple to implement | Silent data loss on crash, infinite retry loops, no diagnostic path | Never acceptable for production — the six-state machine is necessary |
| Wall-clock timestamps for conflict resolution | Simple to implement | Silent data loss if clocks differ, "later" doesn't mean "better" | Acceptable only for single-device use (never for multi-device sync) |
| Hardcoded PIN `1234` | Zero implementation time | No security, child bypasses parent gate | Never acceptable — even in MVP, use a parent-set PIN |
| Default-on consent checkbox | Low friction onboarding | FTC violation ($53K per child per day) | Never acceptable under COPPA |
| localStorage for all persistence | Built into browser, simple API | 5MB limit, synchronous, no indexes, lost on cache clear | Acceptable as cache layer; IndexedDB needed for primary offline storage |
| Creating AudioContext per sound | Simple implementation | Performance glitches on low-end tablets | Acceptable for rarely-played sounds; refactor for frequently-played ones |
| No written data retention policy | One less document to write | FTC violation if audited; no clear deletion path | Never acceptable for production children's app |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **PasarAPI pronunciation** | Trusting accuracy for children's voices without testing | Test with actual 5-year-old utterances first. Expect WER of 15-35%. Frame scoring as "practice" not "examination" |
| **Web Speech API** | Using `recognition.confidence` as pronunciation quality | `confidence` measures transcription certainty, not pronunciation quality. Use separate GoP/Levenshtein scoring |
| **PasarAPI external content** | Passing unfiltered API responses to speech synthesis (dog facts, rhymes) | Add content filter before `SpeechSynthesisUtterance`. Current code has no filter (CONCERNS.md lines 32-37) |
| **Sync API** | No rate limiting on server endpoint | Add rate limiting middleware. Store per-IP request counts. Limit batch size (e.g., 50KB max payload) |
| **Third-party SDKs** (any analytics) | Not auditing what data they collect from children | Every SDK must be evaluated for COPPA compliance. Apitor paid $500K for not doing this |
| **PostgreSQL via Drizzle** | Assuming database is always available | The app handles this correctly (graceful degradation to in-memory Map), but sync queue needs similar treatment |
| **Malay speech synthesis** | Assuming browser has a Malay voice | Most browsers don't ship a default Malay voice. Fall back to PasarAPI TTS or cloud service |
| **Next.js Image component** | Using plain `<img>` for external images (dog.ceo) | Use Next.js `<Image>` with configured domains for optimization and lazy loading |
| **Device identity** | Using `crypto.randomUUID()` without server verification | Add HMAC-based device token verification on server-side sync writes (CONCERNS.md lines 13-18) |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| **Burst sync on reconnect** | Server overload, 429 errors, retry storm, battery drain | Batch-and-backoff sync, merge queue before sending, exponential retry | As soon as device is offline >1 day |
| **Unbounded in-memory sync store** | Server runs out of memory | Add size limit (1000 entries) or TTL (24h) to `globalThis.__luthsPlaygroundMemorySync` | 1000+ unique visitors in demo mode |
| **Full component re-render on every state change** | Jank on low-end tablets, lesson UI freezes during timer tick | Split state into per-view slices, use `React.memo` or `zustand` for shared state | Immediately on any tablet |
| **CSS bloat (duplicate declarations)** | Larger CSS bundle, maintenance confusion | Remove duplicate `:root` and `body` blocks in globals.css | Already broken (307 lines, ~30% dead code) |
| **Confetti animation without skip** | Child stuck waiting 3.4s on every perfect score | Add skip button, limit to first perfect score per session, use interruptible CSS animations | Every lesson completion |
| **Unlimited retries on failed sync** | Infinite loop, battery drain, data corruption | `DEAD_LETTER` state after N retries, escalating backoff | After first unrecoverable error |
| **AudioContext created per sound** | Audio glitches, browser warnings on tablets | Single AudioContext reused for all tones | 3+ sounds played in quick succession |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| **Hardcoded database credentials in `drizzle.config.json`** | Anyone with repo access can read PostgreSQL password | Move to `process.env.DATABASE_URL`, never commit credentials |
| **No sync API authentication** | Any client can read/write any device's progress | HMAC device token verification on server side |
| **Hardcoded PIN displayed on parent gate** | Child bypasses parent lock entirely | Parent-set PIN, hashed storage, no helper text after PIN is set |
| **External API content spoken without filter** | Child hears inappropriate language from free APIs | Content filter/sanitizer before `SpeechSynthesisUtterance` |
| **Voice recordings stored without COPPA consent** | FTC violation, $53K per child per day | Parental consent before recording, delete after scoring, document retention policy |
| **No rate limiting on sync endpoint** | Server resource exhaustion from spam | Rate limiting middleware, request body size limits |
| **Analytics SDK collecting data without consent** | COPPA violation via third party (Apitor case: $500K) | Audit every SDK, obtain separate consent for third-party disclosures |
| **Health endpoint leaking system info** | Attackers learn about database status, infrastructure | Return only `{ ok: true/false }` from `/api/health` |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| **Progress bars for 5-year-olds** | Child doesn't understand; abstract symbol is meaningless | Concrete visual metaphor (path with characters reaching milestones) |
| **Audio-only instructions** | Children under 3.5 cannot follow them; 4-5 year olds need visual reinforcement | Visual + audio instructions together |
| **Touch registered on release** | Child taps hard, holds, thinks app is broken | Register on touch-down with immediate visual feedback |
| **Bottom-edge interactive elements** | Accidental triggers from wrist resting on screen | Keep interactive zone away from bottom edge |
| **No confirmation on lesson exit** | Accidental exit loses progress, child cries | "Leave this quest? Your progress won't be saved." dialog |
| **Syncing/spinner indicators for children** | Child doesn't understand what "syncing" means | Never show sync status to child. Show to parent only |
| **Default PIN shown on screen** | Zero security from parent gate | Hidden PIN, lockout on wrong attempts, recovery flow |
| **Over-communication to parents** | Daily notifications → parent disables all notifications | Weekly personalized summary with crisis alerts only |
| **Vanity metrics in parent dashboard** | Parent sees numbers going up but doesn't know if child is learning | Trend data, struggle signals, actionable recommendations |
| **Content authoring starts blank** | High cognitive load, first lesson takes 30+ min → never use again | Template-first, tweak existing content, 5-min first lesson |
| **Text-only instructions expecting child to read** | 5-year-old can't read | All instructions spoken with visual reinforcement |
| **Abstract icons without labels** | Child can't map icon to function | Direct visual representation or icon + audio label |
| **No loading states** | Child sees blank screen during transitions | Skeleton screens or animated transitions appropriate for children |

---

## "Looks Done But Isn't" Checklist

- [ ] **Offline sync**: Has `IN_FLIGHT` state with recovery? Has `DEAD_LETTER` terminal state? Field-level merge or document-level overwrite? Idempotency keys on all mutations?
- [ ] **Parent gate**: PIN is NOT hardcoded? NOT displayed on screen? Has lockout on wrong attempts? Recovery mechanism exists?
- [ ] **COPPA consent**: Separate from ToS? Covers specific data categories? Includes third-party disclosures? Has audit trail? Written retention policy exists?
- [ ] **Pronunciation scoring**: Using `confidence` as grading metric? (shouldn't be) Tested with actual 5-year-old voices? Has retry and skip? Effort rewarded, not just correctness?
- [ ] **i18n**: String concatenation for sentences? (shouldn't be) Malay TTS tested on target devices? Longest-word overflow tested? Native speaker review done?
- [ ] **Parent dashboard**: Shows anything parents can't act on? (shouldn't) Answers "is my child on track?" in under 10 seconds? Includes trend data? Has crisis alerts?
- [ ] **Content authoring**: First lesson creation under 5 minutes? Template or blank canvas? Preview available on tablet view? Versioning for rollback?
- [ ] **Children's UX**: Progress bars present? (shouldn't be) Bottom-edge hot zones? (shouldn't be) Touch on release? (should register on down) Confirmation for destructive actions?
- [ ] **Database credentials**: Still in `drizzle.config.json`? (shouldn't be) Moved to environment variable?
- [ ] **Sync API**: Authentication on writes? Rate limiting? Request size limits?
- [ ] **CSS**: Duplicate declarations removed? Only one `:root` block? One `body` block?
- [ ] **Audio**: Single `AudioContext` reused? External content filtered before speech synthesis?
- [ ] **Viewport**: `maximumScale: 1` removed? Pinch-zoom enabled for accessibility?

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| **Data loss from binary sync states** | HIGH — lost data is lost | Restore from server backup if available. Fix sync state machine to prevent recurrence. Add data migration for existing queue items |
| **COPPA violation (consent bundling)** | HIGH — fines up to $53K/child/day, legal costs | Immediately separate consent flows. Pause data collection. Contact legal counsel. Audit all existing consent records |
| **Pronunciation scoring frustration** | MEDIUM — child may refuse to use app | Add "skip" and "try again" immediately. Frame as "practice" not "test." Consider removing automated scoring if accuracy can't be validated |
| **Child bypasses parent gate** | MEDIUM — settings exposed, data could be deleted | Reset parent gate. Implement proper PIN with hashed storage, lockout, and recovery. Change PIN immediately |
| **Sync retry storm** | LOW-MEDIUM — server load spike, temporary failures | Throttle queue processing on client. Implement backoff. Rate limit server endpoint. Add merge-before-send to collapse redundant events |
| **Offline data never synced** | LOW — data in localStorage, not lost | Add `online` event listener that flushes queue. If device reconnects, all pending items should sync |
| **Malay text overflow** | LOW — visual glitch | Fix CSS to use relative sizing and word-break. Test with longest Malay compound words |
| **CSS bloat / dead code** | LOW — larger bundle but functional | Remove duplicate declarations. Audit all CSS selectors. Reduce globals.css from 307 lines to ~200 |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Binary sync state machine (data loss) | SYNC phase | Unit test: crash during IN_FLIGHT recovers correctly |
| Last-write-wins on all fields | SYNC phase | Integration test: two devices edit different fields, both survive |
| Over-engineering with full CRDT | SYNC phase | Architecture review: queue-based sync is sufficient for requirements |
| Web Speech API as grader | PRON phase | Accuracy test: compare scores from API vs human judgment for 5-year-old voices |
| COPPA consent bundling | SEC phase | Consent flow audit: separate screens for collection and third-party disclosure |
| Parental dashboard vanity metrics | PARENT phase | User test: can parent answer "is my child on track?" in 10 seconds? |
| Content authoring abandonment | AUTH phase | Time trial: first lesson creation under 5 minutes? Second lesson under 2 minutes? |
| Children's UX adult assumptions | UI phase | Usability test: 5-year-old can complete a lesson independently |
| i18n Malay breakage | LOCALE phase | Content audit: all strings in ICU format? TTS tested on target device? |
| Next.js + offline hydration mismatch | UI / DEBT phase | Visual test: no hydration warning in console. No flash of wrong content |
| No data retention policy | SEC phase | Documentation audit: written policy exists and matches actual data flows |
| Pronunciation frustration | PRON phase | Child test session: does child try again (yes) or get upset (no)? |
| Sync retry storm | SYNC phase | Load test: 1000 queued items sync without server overload |
| PIN security failure | SEC / PARENT phase | Penetration test: 5-year-old cannot bypass parent gate |
| COPPA school consent assumption | SEC phase | Legal review: consent model matches actual deployment context |
| Sync API security | SEC phase | Security audit: sync writes require HMAC token verification |

---

## Sources

- [Six-state sync queue with IN_FLIGHT and DEAD_LETTER](https://dev.to/salazarismo/the-hidden-problems-of-offline-first-sync-idempotency-retry-storms-and-dead-letters-1no8) — HIGH confidence, production-tested patterns
- [Sync conflict handling — merge without lying to the user](https://dev.to/crisiscoresystems/sync-conflict-handling-in-offline-first-pwas-how-to-merge-without-lying-to-the-user-59i3) — HIGH confidence
- [CRDT pitfalls — tombstone bloat, semantic conflicts, over-syncing](https://appdesign.intelligent-ps.store/blog/local-first-crdt-data-synchronization-protocols) — HIGH confidence
- [Child ASR recognition gap — 15-35% WER for ages 4-6](https://the-learning-agency.com/guides-resources/closing-the-child-speech-recognition-gap-evidence-limitations-and-paths-forward/) — HIGH confidence, academic sources
- [Automated speech scoring in early elementary — "far below human scorers"](https://doi.org/10.31234/osf.io/r3ydm_v1) — HIGH confidence, peer-reviewed study
- [Speech verification with children — SVS vs human rater consistency](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2026.1671946/full) — HIGH confidence
- [Web Speech API specification — on-device recognition, contextual biasing](https://webaudio.github.io/web-speech-api/) — HIGH confidence, W3C spec
- [Babble project — Web Speech API for children's pronunciation](https://devpost.com/software/phonicsforge) — MEDIUM confidence, practical experience
- [Parents' needs in children's apps — clear design, controlled learning, challenge/reward](https://pmc.ncbi.nlm.nih.gov/articles/PMC6099983/) — HIGH confidence, peer-reviewed
- [What parents actually want from school tech — 5 questions, not dashboards](https://inkwelly.com/en/articles/what-parents-want-from-school-app) — HIGH confidence, user research
- [Parent dashboard vanity metrics — meaningful alternatives](https://www.ofashandfire.com/blog/student-engagement-analytics-edtech) — MEDIUM confidence
- [EdTech abandonment — why teachers stop using tools](https://gurkhatech.com/teacher-edtech-abandonment-workload-stress/) — HIGH confidence, academic study
- [Korea AI textbook failure — $800M, 4 months, 87.4% unprepared](https://minssam.com/en/blog/2026-korea-ai-textbook-failure-lessons/) — HIGH confidence, government data
- [Complexity Gap — 85-90% can't evaluate AI output effectively](https://nathancritchett.me/writing/nobody-using-ai-tools.html) — MEDIUM confidence
- [COPPA amendments April 2026 — biometric data, separate consent, retention policy](https://blog.promise.legal/coppa-april-2026-amendments-edtech/) — HIGH confidence, FTC regulatory text
- [COPPA compliance checklist for EdTech](https://vcisolite.com/blog/coppa-compliance-edtech) — HIGH confidence
- [FERPA vs COPPA — why being FERPA compliant doesn't make you COPPA compliant](https://dev.to/bhavesh_pawar_8205920953a/why-being-ferpa-compliant-does-not-make-you-coppa-compliant-in-2026-2d80) — HIGH confidence
- [FTC COPPA enforcement — $10M Disney, $20M Cognosphere, $500K Apitor](https://www.ftc.gov/news-events/topics/protecting-consumer-privacy-security/kids-privacy-coppa) — HIGH confidence, official FTC records
- [Children's touchscreen interaction design framework (TIDRC)](https://doi.org/10.1145/3311927.3323149) — HIGH confidence, academic meta-analysis
- [Hidden symbols — why progress bars and hand demos fail for preschoolers](https://faculty.washington.edu/alexisr/HiddenSymbols.pdf) — HIGH confidence, peer-reviewed study
- [Touchscreen prompts for preschoolers — audio vs visual effectiveness by age](https://faculty.washington.edu/alexisr/TouchscreenPrompts.pdf) — HIGH confidence
- [NN/G children's usability — age targeting, gesture patterns, reading levels](https://www.nngroup.com/articles/childrens-websites-usability-issues/) — HIGH confidence, NN/G research
- [Sesame Workshop touchscreen best practices](https://regmedia.co.uk/2012/12/19/sesame_street_best_practices.pdf) — HIGH confidence, industry practitioner guide
- [MalayLearning gamified language app — research and development](https://doi.org/10.35631/ijepc.1061083) — HIGH confidence
- [Malay cultural design principles for mobile apps](https://ir.upsi.edu.my/files/docs/2020/3420_3420.pdf) — HIGH confidence, academic study
- [Bilingual Malaysian preschool app features — educators and parents study](https://kwpublications.com/papers/detail/IJARPED/19511/) — MEDIUM confidence
- [Next.js offline-first PWA guide — caching strategies, IndexedDB, background sync](https://www.stripesys.com/blog/offline-first-pwa-nextjs) — HIGH confidence, practical guide
- [Local-first with Zero and Next.js — Rocicorp sync engine](https://noqta.tn/en/tutorials/zero-rocicorp-local-first-sync-nextjs-2026) — MEDIUM confidence
- [CONCERNS.md — existing project codebase audit](https://github.com/user/roblox-themed-educational-app-luth/blob/main/.planning/codebase/CONCERNS.md) — HIGH confidence, project-specific
- [Malay language interactive web app for kindergarten](https://hrmars.com/papers_submitted/16831/malay-language-learning-for-kindergarten-students-through-interactive-web-based-application.pdf) — MEDIUM confidence

---
*Pitfalls research for: Luth's Playground — offline-first children's educational platform*
*Researched: 2026-07-10*
