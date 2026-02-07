# PDR-00: Gamified vocabulary game modes – overview

**Product:** Language learning app (vocabulary, quizzes, short stories)  
**Initiative:** New gamified game modes for word memorisation  
**Status:** Discovery complete; PDRs drafted  
**Last updated:** 2026-02-07

---

## 1. Purpose

Users requested more interactive ways to memorise vocabulary. This document summarises discovery with user, developer, and designer stakeholders and defines the feature set and phasing for gamified vocabulary modes.

---

## 2. Discovery summary

- **User stakeholders (Jordan, Margaret):** Quick sessions, optional competition vs calm/solo, clear UI and readability, optional hints. Ideas: Word Flick (swipe), Speed Quiz (timed + leaderboards), Word Chain, Word Match, Flashcard Frenzy; avoid long puzzle-heavy modes.
- **Tech lead (Alex):** Feasibility assessed; Phase 1 = Flashcard Frenzy + Word Match (high feasibility); Phase 2 = Word Flick, Speed Quiz (MVP without leaderboards first), Word Chain (solo then multiplayer). Risks: offline sync, leaderboard scale, multiplayer sync, accessibility.
- **UX designer (Marcus):** Consistency, 44px touch targets, onboarding per mode, clear feedback, dark mode and reduced-motion from day one; static alternatives for streaks, timer, correct/incorrect when motion reduced.
- **Refinement:** Jordan prefers Word Flick in Phase 1; Margaret prefers current Phase 1 (Flashcard + Word Match). Product to decide prioritisation; both views captured in PDRs.

---

## 3. Feature set and phasing

| Feature | Phase | Brief description |
|--------|-------|-------------------|
| **Flashcard Frenzy** | 1 | Show word → user types translation; optional adaptive speed. |
| **Word Match** | 1 | Match words to meanings/translations (cards or drag-and-drop); progress, hints. |
| **Word Flick** | 2 | Swipe left/right for Don’t Know / Know; streaks and badges. |
| **Speed Quiz Showdown** | 2 | Timed quizzes, points; MVP without leaderboards, then weekly/friend leaderboards. |
| **Word Chain** | 2 | Next word starts with last letter; solo first, then multiplayer. |

---

## 4. Cross-cutting requirements

- **Accessibility:** Large, high-contrast text; touch targets ≥ 44×44 px; screen reader and audio feedback; dark mode and reduced-motion from day one.
- **Quick sessions:** All modes support short bursts; clear save/continue.
- **Consistency:** Shared layout principles, colour, typography; central dashboard for modes; familiar gestures across modes.
- **Stakeholder logs:** `stakeholders-log/01` (users), `02` (developer), `03` (designer), `04` (refinement).

---

## 5. Related PDRs

- [PDR-01: Flashcard Frenzy](PDR-01-flashcard-frenzy.md)
- [PDR-02: Word Match](PDR-02-word-match.md)
- [PDR-03: Word Flick](PDR-03-word-flick.md)
- [PDR-04: Speed Quiz Showdown](PDR-04-speed-quiz-showdown.md)
- [PDR-05: Word Chain](PDR-05-word-chain.md)
