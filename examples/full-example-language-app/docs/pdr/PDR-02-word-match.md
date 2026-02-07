# PDR-02: Word Match

**Feature:** Match words to meanings/translations (cards or drag-and-drop)  
**Phase:** 1  
**Status:** Draft

---

## 1. Overview

User matches words with their meanings, synonyms, or translations. Interaction via cards, tiles, or drag-and-drop. Progress tracker, optional hints. Calm, non-competitive mode suitable for short sessions.

---

## 2. User need

- **Margaret:** Simple, intuitive; large text, progress tracker, optional hints; calm environment.  
- **Design:** Grid with readable cards; clear instructions; positive reinforcement on match.

---

## 3. Functional requirements

- Present a set of word items and a set of meaning/translation items; user creates correct pairs.
- Interaction: drag-and-drop and/or tap-to-select pairing (ensure alternative to drag for accessibility).
- Progress indicator (e.g. pairs left or matches made).
- Optional hint (e.g. reveal one pair or narrow choices) without ending the round.
- Clear win state when all pairs are matched; optional gentle animation/sound on correct match.
- Support short sessions; save/continue if needed.

---

## 4. Non-functional requirements

- **Accessibility:** Touch targets ≥ 44×44 px; alternative to drag (e.g. tap-to-select) for motor and screen reader users; high contrast and readable text.
- **Mobile:** Layout works on small screens; spacing between cards sufficient for touch.
- **Performance:** Smooth interaction; no blocking during match validation.

---

## 5. Design considerations (from UX)

- Grid layout; large, readable cards; adequate spacing.
- Large, easy-to-drag cards with clear instructions; hint button visible and non-intrusive.
- Positive reinforcement (e.g. animation or sound) on correct match.
- Consistent with app colour and typography; dark mode and reduced-motion support.

---

## 6. Technical notes (from Tech Lead)

- High feasibility. Focus on grid generation, match logic, win condition; defer heavy animation in MVP.
- Backend: progress sync, achievements; optional dynamic word–meaning data.

---

## 7. Acceptance criteria

- [ ] User can complete a round by matching all word–meaning pairs.
- [ ] At least one input method besides drag (e.g. tap-to-select) is available.
- [ ] Progress (e.g. remaining or completed pairs) is visible.
- [ ] Optional hint is available and does not break round state.
- [ ] Correct match gives clear, immediate feedback; win state is clear.
- [ ] Layout is usable on mobile; touch targets and text meet accessibility guidelines.
- [ ] Dark mode and reduced-motion are supported.

---

## 8. References

- `stakeholders-log/01-user-stakeholders-gamified-vocabulary.md`
- `stakeholders-log/02-developer-feasibility-alex-chen.md`
- `stakeholders-log/03-designer-considerations-marcus-rivera.md`
