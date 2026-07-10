# Feature Research

**Domain:** Offline-first children's educational platform (ages 4-6, bilingual English + Malay)
**Researched:** 2026-07-10
**Confidence:** HIGH — verified across multiple sources (peer-reviewed research, competitor analysis, live products, COPPA regulatory docs)

## Feature Landscape

### Table Stakes (Users Expect These)

Features parents (the paying users) assume exist. Missing these = the app is not considered a serious educational tool.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Full offline operation** | Parents hand tablets to children; Wi-Fi is not guaranteed. Young kids don't understand "no internet." The app must launch, load content, and run quizzes 100% offline. | HIGH | Core learning flows (view lesson, answer quiz, earn XP) must work with zero connectivity. localStorage+IndexedDB baseline exists; need service worker shell and asset caching. |
| **Age-appropriate curriculum with progression** | Parents expect structured learning paths (not random activities). Lessons should build on each other with clear scope and sequence. | MEDIUM | 5 subjects, 25 lessons, 100 questions already exist. The scaffolded progression (counting → addition → word problems) is what legitimizes the app. |
| **No ads, no purchases, no social features** | COPPA-conscious parents actively avoid apps with ads, IAPs, or social feeds. This is table stakes for the 4-6 demographic (Meyer et al., 2021 — 58% of top kids' apps scored low on educational quality; ad-driven design was the primary cause). | LOW | Already committed in PROJECT.md. Must stay vigilant about third-party SDKs that might introduce tracking. |
| **Parental gate (PIN-protected settings)** | Parents need to know their child can't accidentally change settings, delete data, or access parent-only features. | LOW | Hardcoded 1234 exists; needs customizable PIN (PARENT-02). Research shows parental controls are a "deciding factor" for 74% of parents (IdeaUsher COPPA guide, 2025). |
| **Progress persistence across sessions** | If a child completes 3 lessons and the app closes, progress is saved when they reopen. Non-negotiable for trust. | MEDIUM | localStorage currently handles this. Cloud sync (SYNC-01 through SYNC-06) makes this survivable across device resets. |
| **Correct/incorrect audio feedback** | Young children are pre-literate; audio is the primary feedback channel. Tones, cheers, gentle corrections are expected. | LOW | Already implemented (audio tone feedback). The bar is higher now — cheerful, character-based audio (not just beeps). |
| **Large touch targets and simple navigation** | Ages 4-6 have developing fine motor skills. UI elements must be 60-80pt minimum (Dragos Roua, AI Kiddo). Tab-based nav works; children need to navigate independently. | LOW | Tab-based nav exists. Touch target audit recommended for production polish (UI-01 through UI-04). |
| **Screen-time limits enforced by parent** | Parents set daily caps; the app locks when time expires. MathCraft (2026) sets 15-60min caps that lock hard. This is expected in any credible kids' app. | MEDIUM | Already referenced in parent dashboard. Needs to be enforced client-side (hard lock, not just UI hide). |
| **COPPA-compliant privacy (no PII collection)** | 74% of parents say built-in safety features are a deciding factor (IdeaUsher, 2025). The 2026 COPPA amendments add biometric data (voiceprints) to protected PII. Parents expect NO data collection without consent. | MEDIUM | Existing app references COPPA but has no enforcement mechanism. Critical gap per PROJECT.md SEC items. |

### Differentiators (Competitive Advantage)

Features that set Luth's Playground apart from mass-market educational apps. These align with the Core Value: *"make learning feel like play while giving parents real insight and control."*

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Per-field merge conflict resolution for sync** | Most kids' apps don't sync at all. Those that do use last-write-wins. Per-field merge means a child's XP earned offline on one tablet merges correctly when parent's phone also updated settings. This is enterprise-grade sync in a personal project. | HIGH | SYNC-01 through SYNC-06. The 2026 edtech sync playbooks (pupil.cloud, edify.cloud) recommend per-field merge for mutable profiles and append-only logs for event data. Apply: last-write-wins for progress (safe), per-field merge for parent settings. |
| **Pronunciation feedback using Web Speech API + free API** | Most reading apps charge subscription fees for speech recognition. Using Web Speech API + PasarAPI.xyz keeps it free. Studycat's VoicePlay (2026) runs entirely on-device — gold standard. Our approach is a pragmatic free tier alternative. | HIGH | PRON-01, PRON-02. Key design constraint: Web Speech API accuracy on children's voices is lower than adult voices. The SingaKids (ACL 2025) research showed Malay children's speech WER dropped from 20.3% to 5.1% with Whisper fine-tuning — we can't fine-tune Whisper, so we must set parent expectations: "helpful feedback, not clinical diagnosis." |
| **Bilingual learning (English + Malay) in a unified experience** | Malaysian bilingual households (English + Malay) are underserved. Most bilingual apps are single-language with a toggle. Luth's Playground integrates both languages into the same curriculum, letting parents choose per-subject. EGK Agentic STEMOS and Poppet's Talkie Tales are recent 2026 competitors but target older kids or focus only on Malay. | MEDIUM | LOCALE-01, LOCALE-02. The SingaKids (ACL 2025) system supports English, Chinese, Malay, Tamil — validates the need. Differentiator: per-subject language setting (e.g., Mandarin taught in Mandarin, Math taught in English). |
| **Content authoring dashboard for non-technical parent-creator** | Mass-market apps lock curriculum behind their teams. A content authoring UI lets the parent add, edit, and version lessons without touching code. This is the single biggest unlock: the app grows with the child because the parent controls the curriculum. | HIGH | AUTH-01 through AUTH-03. Pattern from eSkilled AI Course Creator, Chalkie, Eduira — AI-assisted lesson creation. MVP: structured form (topic, subject, difficulty, questions) → auto-generates lesson JSON. The 2026 AI lesson generator market is crowded for teachers, empty for parents. |
| **Offline-first with cloud sync that respects COPPA (separate consent for sync)** | Even Khan Academy Kids requires online for some features. True offline-first + optional encrypted cloud sync with per-field merge is rare. Paired with COPPA 2026's new requirement for separate consent for data sharing (effective April 22, 2026), this becomes a compliance differentiator. | HIGH | SYNC architecture. The 2026 COPPA amendments explicitly require separate verifiable parental consent before sharing child data with third parties. Sync consent must be distinct from general app consent. This is new regulation — most competitors won't have updated yet. |
| **Pronunciation transparency: parent can hear child's recordings** | Most apps score pronunciation and show a number. Peekadee and Kids Shelf let parents review actual recordings. This builds trust and lets parents hear progress themselves. | MEDIUM | PRON-02 extension. COPPA 2026 now treats voiceprints as biometric PII — must be disclosed, require consent, and have a retention policy. Store recordings locally only; sync only with explicit parental opt-in. |
| **Multi-profile for siblings with separate progress** | Most free apps support one child. Premium tiers charge per child. Supporting multiple profiles (each with independent progress, XP, badges, settings) is a strong differentiator for family use. | MEDIUM | PROJECT.md mentions "build for multi-child from start." Matific, iMasterly, and DreamBox all support multi-child — but as paid tiers. Doing it free is differentiating. |
| **Roblox-themed blocky 3D visual style** | Most educational apps use flat 2D cartoon design. The blocky 3D Roblox-inspired aesthetic (already built) appeals to the target age group because Roblox is the dominant play platform for this cohort's slightly older siblings. | MEDIUM | UI-01 through UI-04. The existing visual direction is a differentiator if executed with production polish. The project's Core Value explicitly references this. |
| **AI tutor with logged conversations** | MathCraft (2026) logs every AI tutor conversation for parents. Bunky (2026) gives mental health alerts. For a personal project, an AI tutor that remembers what the child struggled with and adapts is aspirational but achievable with free APIs. | HIGH | Future-phase feature. Requires API costs management. Logging every interaction for parent review is the differentiator — most apps don't do it. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem useful for a children's educational platform but create problems for this specific project.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **User accounts / email login for children** | "How do I save progress across devices?" Parents are used to account-based models. | COPPA 2026 prohibits collecting email/PII from children under 13 without verifiable parental consent. Device-ID-only identity avoids this entirely. | Device-based identity with encrypted sync key shared between parent devices (QR code pairing). |
| **Social features / leaderboards** | "Kids love competing with friends." This is how many educational apps drive engagement. | COPPA violation risk (PII exposure). Social features create moderation overhead, bullying vectors, and require real-time content filtering. Locked out of scope in PROJECT.md. | Personal best tracking ("Beat your high score"). XP comparison with siblings only (same household, same device cluster). |
| **Subscription / premium tier** | "How do we make money / sustain development?" | This is a personal project for one child, not a SaaS. Introduction of payment creates COPPA complications (payment info = PII), feature fragmentation, and maintenance burden. | The app is free. Content authoring lets the parent sustain it. If costs arise (API usage), they're one person's costs, manageable. |
| **Real-time multiplayer** | "Kids could learn together." | Requires server infrastructure, moderation, real-time sync complexity. Not aligned with offline-first architecture. Single-child focus (PROJECT.md). | Async challenges ("Can you beat yesterday's score?"). Shared achievements visible on parent dashboard. |
| **Video content / streaming lessons** | "Video is engaging and explains concepts well." | Storage and bandwidth costs. Offline-first means bundling videos → large app size. Young children learn better from interactive experiences than passive video (Meyer et al., 2021 — Four Pillars of Learning research). | Interactive lessons with animations (current approach). Audio narration for pre-literate children. |
| **Gamification with external rewards** | "Add more badges, more collectibles, more reasons to come back." | Gamification for its own sake dilutes learning goals. The most successful kids' apps like Roblox succeed on agency and creation, not extrinsic rewards (Elite Game Developers, 2025). | XP, levels, streaks exist. Focus on intrinsic motivation: the joy of mastery, creation (Buildaloo model), and curiosity. Parent quiz about "what did you learn today?" reinforces this. |
| **AI story generation for children** | "Kids love personalized stories." KindRoot (2026) and Kidopedia AI (2026) both have this. | API cost for AI generation. Content safety risk (generated stories may contain inappropriate material without guardrails). The existing story arcade (PasarAPI) provides enough variety. | Structured story templates with fill-in-the-blank personalization. No freeform AI generation. If added later, must have content filter (SEC-03). |

## Feature Dependencies

```
Offline-First Core
    └──requires──> Service Worker Shell & Asset Caching
                       └──requires──> Content Bundling Strategy
                       └──requires──> localStorage/IndexedDB Schema

Sync Engine
    └──requires──> Offline-First Core
    └──requires──> Device Identity (no-PII device fingerprint)
    └──requires──> Sync Consent Gate (COPPA separate consent)
                       └──requires──> Parent PIN or verification
    └──enhances──> Multi-Profile Support
    └──enhances──> Parent Dashboard

Pronunciation Feedback
    └──requires──> Web Speech API Integration
    └──enhances──> Lesson Flow (in-lesson speak-aloud activities)
    └──enhances──> Parent Dashboard (recording playback)
    └──conflicts──> COPPA Voiceprint Rules (must disclose; require consent)

Content Authoring Dashboard
    └──requires──> Lesson JSON Schema Definition
    └──requires──> Curriculum Validation (no broken lessons)
    └──requires──> Authentication / Admin Gate
    └──enhances──> Multi-Subject Management
    └──enhances──> Lesson Versioning
    └──future──> AI-Assisted Lesson Generation

Bilingual Support
    └──requires──> i18n Architecture (next-intl or similar)
    └──requires──> Content Translation Strategy
    └──enhances──> Per-Subject Language Setting
    └──enhances──> Pronunciation Feedback (multi-language TTS)

Parent Dashboard
    └──requires──> Customizable Parent PIN (PARENT-02)
    └──requires──> Data Collection Architecture (what to track)
    └──enhances──> Sync Status Display
    └──enhances──> Pronunciation Recording Playback
    └──enhances──> Learning Metrics Charts

COPPA Compliance
    └──requires──> Age Gate (neutral, not incentivizing false age)
    └──requires──> Data Deletion Mechanism
    └──requires──> Data Retention Policy (written)
    └──requires──> Separate Consent Flows (core + sync + any AI training)
    └──requires──> No third-party analytics SDKs collecting PII
```

### Dependency Notes

- **Offline-First Core is the foundation:** Everything else (sync, pronunciation, dashboard) depends on the app working reliably offline first. This must be Phase 1, not an afterthought.
- **COPPA compliance is not optional:** The 2026 COPPA amendments (effective April 22, 2026) introduce mandatory written data retention policies, separate consent for data sharing, and expanded biometric PII rules. The pronunciation feature's voice recordings are now explicitly regulated. These are not "nice to haves" — they're legal requirements.
- **Content Authoring unblocks everything:** The most impactful feature is the parent's ability to create and modify curriculum. This should be prioritized early because it makes every other feature more valuable (the parent can create content that works with sync, pronunciation, bilingual support).
- **Bilingual architecture needs to be built before content authoring:** If i18n is retrofitted, all existing content needs migration. Better to set up the architecture first, then build content tooling on top.

## MVP Definition

### Launch With (v1 — next milestone)

Minimum viable next iteration — what makes the app production-ready for the child while addressing the most critical gaps.

- [ ] **SYNC-01 through SYNC-06:** COPPA-safe offline-first sync engine. The app MUST survive device loss. Per-field merge for parent settings, last-write-wins for child progress. With 2026 COPPA amendments in effect, this is table stakes.
- [ ] **PARENT-01 / PARENT-02:** Polished parent dashboard with customizable PIN. The existing hardcoded 1234 PIN is unacceptable for a production app. Dashboard must show: time spent, lessons completed, XP earned, accuracy trends, recent activity feed.
- [ ] **LOCALE-01:** Bilingual support (English + Malay). Start with subject-level toggles. Full UI internationalization. This is the top-line requirement from the project brief.
- [ ] **SEC-01 through SEC-04:** Remove hardcoded DB credentials, add HMAC device token, content filter for speech synthesis, respect prefers-reduced-motion. Security foundations.
- [ ] **UI-01 / UI-02 / UI-03 / UI-04:** Component extraction from monolithic `learning-app.tsx`, loading states, transitions, accessibility, code splitting. The 872-line component is a maintenance blocker.
- [ ] **DEBT-01 through DEBT-04:** Remove stale localStorage keys, clean duplicate CSS, fix stale closure in useCallback, reuse AudioContext. Quality foundations.

### Add After Validation (v1.x)

- [ ] **PRON-01 / PRON-02:** Pronunciation scoring. Requires Web Speech API integration + free API backend. Add speak-aloud activities to lesson flow. Parent can hear recordings.
- [ ] **AUTH-01 / AUTH-02:** Content authoring dashboard. Structured form → lesson JSON. This is the most impactful v1.x feature because it makes the app adaptable to the child's changing needs.
- [ ] **Multi-profile for siblings:** Profile switcher on home screen. Independent progress, XP, badges per child. Parent dashboard shows aggregated view.
- [ ] **AUTH-03:** Lesson versioning/publishing workflow. Track changes to curriculum. Ability to roll back a lesson.

### Future Consideration (v2+)

- [ ] **AI-assisted lesson generation:** "Generate me 5 math questions about addition with pictures." Requires API costs management. Pattern from eSkilled, Chalkie, Eduira — but adapted for parent use, not teacher use.
- [ ] **AI tutor with logged conversations:** Adapting to what the child struggles with. MathCraft's Merlin (Socratic questioning) and Buildaloo's Loo (game creation) are reference patterns but may be scope beyond single-developer capacity.
- [ ] **Advanced pronunciation analysis:** Phoneme-level feedback (Studycat VoicePlay, Kids Shelf level). The SingaKids research shows this is feasible but requires fine-tuned ASR models — not realistic for a single-developer free API project.
- [ ] **Peer comparison (privacy-safe):** "Your child is in the 70th percentile for their age group — without revealing other children's data." Requires aggregated anonymous data from multiple installs. Only valuable if the project scales beyond one family.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Offline-first sync engine (SYNC) | HIGH (device loss protection) | HIGH (sync architecture, conflict resolution, API) | **P1** |
| Customizable parent PIN (PARENT-02) | HIGH (security, parental trust) | LOW (replace hardcoded value) | **P1** |
| Bilingual support (LOCALE-01) | HIGH (core requirement) | MEDIUM (i18n architecture, translations) | **P1** |
| Security fixes (SEC-01 through SEC-04) | HIGH (credential exposure risk) | LOW (config changes, middleware) | **P1** |
| Component extraction (UI-02) | MEDIUM (developer velocity) | HIGH (refactoring 872-line component) | **P1** |
| Tech debt cleanup (DEBT-01 through DEBT-04) | MEDIUM (stability) | LOW (focused fixes) | **P1** |
| Parent dashboard polish (PARENT-01) | HIGH (parental insight) | MEDIUM (charts, metrics, recommendations) | **P1** |
| Pronunciation feedback (PRON) | HIGH (differentiator for language learning) | HIGH (Web Speech API accuracy, free API integration) | **P2** |
| Content authoring (AUTH) | HIGH (long-term adaptability) | HIGH (lesson JSON schema, validation, UI) | **P2** |
| Multi-profile support | MEDIUM (secondary for now) | MEDIUM (profile switcher, isolated state) | **P2** |
| AI-assisted lesson generation | MEDIUM (nice-to-have) | HIGH (API costs, content safety) | **P3** |
| AI tutor with conversation logs | HIGH (learning insight) | VERY HIGH (LLM integration, safety, cost) | **P3** |
| Phoneme-level pronunciation analysis | MEDIUM (depth over breadth) | VERY HIGH (fine-tuned ASR, research investment) | **P3** |

**Priority key:**
- **P1:** Must have for next milestone — these are blocking issues (security, basic usability, core requirement fulfillment)
- **P2:** Should have, add after v1 ships — meaningful value adds that require more architecture work
- **P3:** Nice to have, future consideration — aspirational or cost-prohibitive for single-developer project

## What Parents Building for Their Own Kids Want That Mass-Market Misses

Based on analysis of parent-built apps (AI Kiddo by Dragos Roua, Train Game by Dawid Dominiak, StudyFirst, StoryWeaver, Pixel Foundery):

| Parent-Built Feature | Mass-Market Approach | Why This Matters |
|----------------------|---------------------|------------------|
| **Custom curriculum control** (parent edits lessons) | Fixed curriculum, may not match child's school/pace | The child's actual learning needs are unique. A parent knows their child better than any curriculum designer. Content authoring (AUTH) is the highest-leverage feature. |
| **No gamification beyond what's meaningful** | Star/streak/badge overload (AI Kiddo deliberately left gamification out) | The reward IS the interaction. Gamification can become a distraction from learning. Let the child's curiosity drive engagement, not manipulative game loops. |
| **Pronunciation transparency (hear actual recordings)** | Opaque "score: 85%" without evidence | Parents wanted to hear their child's actual pronunciation attempts, not just a score. Builds trust and gives specific coaching opportunities. |
| **Real offline-first (zero dependency on cloud)** | "Offline mode" as a limited feature | Parents hand tablets to kids without worrying about connectivity. The app must feel complete without internet, not degraded. |
| **Hard screen-time enforcement** | "Gentle reminders" that kids dismiss | Hard lock (app closes when time expires) is what actually works. StudyFirst uses Apple's Screen Time API to block other apps until studying is done. |
| **No analytics, no tracking, no SDKs** | Analytics for product improvement | Parent-built apps use zero third-party SDKs. No Firebase Analytics. No crash reporting that phones home. This is the purest form of privacy-by-design. |
| **Content grown from what the child is actually learning** | Generic age-level content | The parent can create lessons about what their child is studying in school RIGHT NOW. This real-time alignment is impossible in mass-market apps. |
| **Bilingual/multilingual as a first-class feature, not an afterthought** | Primary language + optional second language toggle | Multilingual households need per-subject language control, not a global switch. The parent-built AI Kiddo supports 8 languages with per-family configuration. |
| **Voice-first interaction for pre-literate children** | Tap/swipe heavy interfaces | Ages 4-6 can't read menus. Voice interaction (Buildaloo model) lets them say what they want to learn. Pronunciation feedback is part of this. |
| **No subscription, no premium tier** | Freemium with upsells | Parent-built apps are either free or one-time purchase. No "unlock your child's potential" dark patterns. AI Kiddo costs $2.99 total for everything. |

## Competitor Feature Analysis

| Feature | Khan Academy Kids | Lingokids | MathCraft | Monkey Stories | Luth's Playground (Our Plan) |
|---------|-------------------|-----------|-----------|----------------|------------------------------|
| Offline mode | Partial (download content) | Online-required for many features | Not specified | Not specified | **Full offline-first** (core + sync) |
| Pronunciation feedback | No | VoicePlay (on-device, 2026) | No | M-Speak (proprietary) | **Web Speech API + PasarAPI** (free) |
| Parent dashboard | Basic (time, activities) | Screen time reports | PIN-protected, accuracy, curriculum heatmap, AI logs | Weekly reports | **Real-time dashboard + pronunciation playback + sync status** |
| Content authoring | No | No | No | No | **Yes — parent-editable curriculum** (core differentiator) |
| COPPA compliance | Yes (certified) | Yes | Yes (no ads, no data selling) | Yes | **COPPA 2026 with separate consent flows, voiceprint disclosure, data retention policy** |
| Bilingual support | English + Spanish | 5 languages | English only | English-only (Monkey Stories) | **English + Malay** (per-subject language control) |
| Multi-profile | Yes (free) | Yes (paid) | Not specified | Yes | **Free multi-profile** with independent progress |
| Screen time limits | No | Yes (Lingokids study, 2026) | Yes (15-60min hard lock) | No | **Hard time limits with parent customization** |
| AI features | Adaptive learning path | No | AI tutor (Merlin, Socratic) | AI Buddy (limited) | **Future: AI lesson generation + tutor** (P3) |
| Price | Free | Subscription | Free (no premium) | Subscription | **Free, forever** (personal project) |
| Bilingual English+Malay focus | No | No | No | No | **Yes — primary target** |

## Sources

### Academic Research
- Meyer et al. (2021). "How educational are 'educational' apps for young children?" — Four Pillars of Learning framework analysis of top 100 kids' apps. PMC. HIGH confidence.
- Broekman et al. (2018). "App features that fulfill parents' needs in apps for children." Mobile Media & Communication. Parent survey (n=591). HIGH confidence.
- Montazami et al. (2022). "Why this app? How parents choose good educational apps." British Journal of Educational Technology. HIGH confidence.
- Ngadni et al. (2025). "Interactive App Features for Vocabulary Development: Insights from Educators and Parents of Malaysian Preschoolers." IJARPED. HIGH confidence.
- Khalid (2024). "VocaDual for Kids: Enhancing English Vocabulary for Malay-Speaking Kindergarten Children." Zenodo. MEDIUM confidence.
- Silalahi et al. (2025). "Redesigning Student Progress Reporting: A Real-Time, Effort-Based Parental Dashboard." IEEE. MEDIUM confidence.
- SingaKids (ACL 2025). "A Multilingual Multimodal Dialogic Tutor for Language Learning." Conference paper. HIGH confidence (peer-reviewed).

### Competitor Products (Analyzed)
- **Khan Academy Kids** — market leader, offline download support, adaptive learning path
- **Lingokids** — largest kids' platform (20M monthly), VoicePlay on-device ASR, screen time study
- **MathCraft** — free UK curriculum RPG, AI tutor with logged conversations, hard time limits
- **Monkey Stories** — M-Speak proprietary pronunciation tech, subscription model
- **Studycat** — VoicePlay on-device ASR, privacy-first (no data upload)
- **DreamBox** — family dashboard with concept-level mastery, weekly email reports
- **iMasterly** — concept-level mastery tracking, real-time updates, multi-child
- **Matific** — parent dashboard with peer comparison, weekly summaries
- **Kids Shelf** — on-device speech recognition, 16 SLP speech patterns, 100% offline
- **Peekadee** — speech therapy app, AI feedback with parent recording playback
- **ZigZu** — Indian English accent support, phonics-based reading coach
- **KindRoot** — personalized AI stories, no illustrations (sparks imagination)
- **Buildaloo** — voice-first game creation for kids, AI buddy model
- **StudyFirst** — app blocking until studying complete, AI-generated content

### Parent-Built Projects (Direct Inspiration)
- **AI Kiddo** (Dragos Roua) — 8-language vocabulary app, no gamification, no backend, no SDKs, $2.99 total
- **Train Game** (Dawid Dominiak) — father built multiplication game → became Train Game for any subject
- **Pixel Foundery** — prompt generator for parents building HTML games with AI for their kids
- **StoryWeaver** (Roshan Rauof) — Whisper + Gemini speech therapy, 4-6 age group
- **Bunky** — AI companion with physical books, mental health alerts via BetterHelp

### Regulatory Sources
- FTC COPPA Rule Amendments (2025), effective April 22, 2026. HIGH confidence.
- FTC v. Disney ($10M settlement, 2025) — COPPA enforcement precedent. HIGH confidence.
- FTC v. Apitor Technology — SDK disclosure obligations. HIGH confidence.
- COPPA 2.0 (passed Senate March 2026) — extends protections to age 17, pending House. MEDIUM confidence.

### Industry & Technical
- pupil.cloud (2026). "Offline-first edtech: design for availability & resilience." HIGH confidence.
- edify.cloud (2026). "Offline-First Learning Experiences: Edge Playbook 2026." HIGH confidence.
- 6B Education (2026). "EdTech Development for Low-Bandwidth Environments." HIGH confidence.
- SATHEE IIT Kanpur — offline sync engine reference architecture. HIGH confidence.
- IdeaUsher (2025). "Key Features of a COPPA-Safe Educational App." MEDIUM confidence.
- Elite Game Developers (2025). "Investing in Education Apps for Kids" — intrinsic motivation analysis. HIGH confidence.

---
*Feature research for: Luth's Playground — children's educational platform (ages 4-6)*
*Researched: 2026-07-10*
