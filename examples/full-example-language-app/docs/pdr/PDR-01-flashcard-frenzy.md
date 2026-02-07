# PDR-01: Flashcard Frenzy

**Feature:** Typed recall – show word, user types translation  
**Phase:** 1  
**Status:** Draft

---

## 1. Overview

User is shown a word (L1 or L2); they type the translation. Optional adaptive speed (e.g. faster after correct answers). Supports quick sessions and deeper recall practice.

---

## 2. User need

- **Margaret:** Calm, clear, paced recall; optional gentle speed increase.  
- **Jordan:** Deeper practice mode alongside quicker modes.  
- **Design:** Large word display, large text field, immediate feedback, option to pause or adjust speed.

---

## 3. Functional requirements

- Display one word at a time from the user’s vocabulary set (direction configurable: L1→L2 or L2→L1).
- User enters translation via text input; submit (e.g. button or key).
- Compare answer against correct translation(s); support multiple valid translations per word.
- Provide immediate visual and optional audio feedback (correct/incorrect).
- Optional: adaptive speed (e.g. shorter display time after correct answers); user can adjust or pause.
- Support short sessions with clear progress (e.g. count, streak) and save/continue.

---

## 4. Non-functional requirements

- **Input handling:** Trim whitespace; case-insensitive comparison; correct handling of diacritics and UTF-8 for target languages. Empty input = incorrect.
- **Matching:** Start with exact match; consider fuzzy matching only if user feedback justifies it, with conservative threshold.
- **Accessibility:** 44×44 px touch targets; keyboard/input area large and clear; works with screen readers; dark mode and reduced-motion (static feedback where applicable).

---

## 5. Design considerations (from UX)

- Layout: single word prominent; large text box for answer.
- Feedback: immediate correctness; encouraging copy on mistakes.
- Speed: gradual increase with option to adjust or pause.
- Onboarding: short tutorial for rules and controls.

---

## 6. Technical notes (from Tech Lead)

- High feasibility. Core: display word, accept input, compare, feedback.
- Store translations as list/set for multiple correct answers; support bidirectional direction in data model.
- Implement exact match first; add fuzzy only if needed, with strict threshold.

---

## 7. Acceptance criteria

- [ ] User can start a session and see one word at a time.
- [ ] User can type and submit translation; correct/incorrect feedback is immediate and clear.
- [ ] Multiple valid translations per word are accepted when configured.
- [ ] Input is normalised (trim, case, diacritics); empty submit is treated as incorrect.
- [ ] Optional speed control and pause are available and visible.
- [ ] Session progress (e.g. count/streak) is visible; session can be saved/continued.
- [ ] Dark mode and reduced-motion are supported; feedback does not rely on motion alone.

---

## 8. References

- `stakeholders-log/01-user-stakeholders-gamified-vocabulary.md`
- `stakeholders-log/02-developer-feasibility-alex-chen.md`
- `stakeholders-log/03-designer-considerations-marcus-rivera.md`
