# Refinement – Phase order and accessibility

**Date:** 2026-02-07  
**Topic:** User preference on build order; designer input on dark mode and reduced motion

---

## User stakeholders – Phase 1 order

**Prompt:** Phase 1 = Flashcard Frenzy + Word Match; Phase 2 = Word Flick, Speed Quiz, Word Chain. Does that work, or would you rather see e.g. Word Flick earlier?

### Jordan (millennial)

- Prefers **Word Flick in Phase 1** instead of Word Match (quick, on-the-go, more engaging).
- Keep Flashcard Frenzy for deeper practice; lead with Word Flick for short sessions.

### Margaret (senior)

- Supports **Phase 1 as proposed** (Flashcard Frenzy + Word Match).
- Values foundational, calm, simple modes first; Phase 2 (Word Flick, Speed Quiz, Word Chain) can follow for users who want more dynamic options. Staggered release is prudent.

**Product takeaway:** Divergent preference (quick/swipe vs calm/foundation). Options: (a) keep Phase 1 as is, (b) add Word Flick to Phase 1 as third mode, or (c) ship Word Flick in Phase 1 for “quick session” track and keep Word Match for “calm” track. Document in PDRs for product decision.

---

## Designer – Dark mode and reduced motion

**Prompt:** Plan dark mode and reduced-motion from day one? Patterns for streaks, timer, correct/incorrect?

### Marcus Rivera

- **Recommendation:** Plan for **dark mode and reduced-motion from day one** (accessibility, preference, consistency; harder to retrofit later).

**Patterns:**

- **Streaks:** High-contrast visual (progress bar or number). In reduced-motion: **static** indicator that updates in place; no animated streaks.
- **Timer:** Clear type, high contrast in both themes; optional outline/background for visibility. Reduced-motion: **static** countdown (update in place, no animation).
- **Correct/incorrect:** Universal cues (e.g. green/red); sufficient contrast in light and dark. Reduced-motion: **static** colour/icon change; feedback must be clear without motion.
- **General:** Test with users who use dark mode and reduced-motion; consistent patterns across modes; still aim for delight (colour, optional subtle animation).

---

## Summary

- **Phase 1 order:** User mix (Jordan: Word Flick first; Margaret: Flashcard + Word Match first). Captured in PDRs for prioritisation.
- **Design:** Dark mode and reduced-motion in scope from day one; static alternatives for streaks, timer, and correct/incorrect when motion is reduced.
