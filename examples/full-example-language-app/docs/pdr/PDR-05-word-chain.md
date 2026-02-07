# PDR-05: Word Chain

**Feature:** Next word starts with last letter of previous; solo and multiplayer  
**Phase:** 2  
**Status:** Draft

---

## 1. Overview

User (or app) gives a word; next word must start with the last letter of the previous (e.g. CAT → TIGER → RABBIT). Solo mode first: user types or selects; app may suggest next word. Multiplayer later: turn-based, same rule. Hints and “Learn more” per word.

---

## 2. User need

- **Jordan:** Creative, engaging; solo and multiplayer.  
- **Margaret:** Thoughtful, low-pressure; clear display, hint, “Learn more,” save words for review.  
- **Design:** Clear current word and required starting letter; large submit and hint controls.

---

## 3. Functional requirements

**Solo (Phase 2)**  
- Display current word and the letter the next word must start with.  
- User submits next word (type or select); validate against vocabulary and rule.  
- Optional hint (e.g. suggest a valid word).  
- “Learn more” for current word: meaning, usage, add to review list.  
- Optional: save words for later review.  
- Progress through chain (e.g. length, score) visible.

**Multiplayer (later)**  
- Turn-based: each player submits word in turn; same chain rule.  
- Game session and turn state managed server-side; matchmaking or invite.  
- Timeout and end-of-game rules defined.

---

## 4. Non-functional requirements

- **Validation:** Server or client logic for “starts with last letter” and vocabulary membership.
- **Multiplayer:** Reliable state sync; handle disconnects and timeouts.
- **Accessibility:** Large buttons for submit/hint; screen reader support for current word and feedback.

---

## 5. Design considerations (from UX)

- Solo vs multiplayer: clearly different layouts.
- Large, readable current word and “next letter”; large submit and hint buttons.
- Hints and “Learn more” one tap, without breaking flow.
- Correct/incorrect and chain progress clearly indicated.

---

## 6. Technical notes (from Tech Lead)

- Solo: medium feasibility (validation, hints, links to content).  
- Multiplayer: WebSockets or similar; game session and turn management; matchmaking.  
- Risk: state sync and timeout handling.

---

## 7. Acceptance criteria

**Solo**  
- [ ] User sees current word and the required starting letter for the next word.
- [ ] User can submit a valid next word and receive correct/incorrect feedback.
- [ ] Hint suggests a valid word when requested.
- [ ] “Learn more” opens meaning/usage and optional save for review.
- [ ] Chain progress (e.g. length) is visible.
- [ ] Dark mode and reduced-motion supported.

**Multiplayer (later)**  
- [ ] Turn order is enforced; state is consistent for all players.
- [ ] Timeout and end-of-game behaviour are defined and implemented.

---

## 8. References

- `stakeholders-log/01-user-stakeholders-gamified-vocabulary.md`
- `stakeholders-log/02-developer-feasibility-alex-chen.md`
- `stakeholders-log/03-designer-considerations-marcus-rivera.md`
