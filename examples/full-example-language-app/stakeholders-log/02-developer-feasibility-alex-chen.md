# Developer stakeholder – feasibility (Tech Lead)

**Date:** 2026-02-07  
**Stakeholder:** Alex Chen (Technical Lead)  
**Topic:** Technical feasibility and phasing for gamified vocabulary modes

---

## Prompt (summary)

Scoped features: Word Flick, Speed Quiz Showdown, Word Chain (solo + multiplayer), Word Match, Flashcard Frenzy. Asked for feasibility with small team, what to build first, and red flags (scalability, real-time, offline, security).

---

## Alex Chen – Technical assessment

### 1. Word Flick (Swipe)

- **Feasibility:** High.
- **Architecture:** Client: card rendering, swipe animations; local storage (SharedPreferences / UserDefaults / SQLite) for offline progress. Backend: streaks, badges, optional cross-device sync.
- **Risks:** Offline/sync conflict resolution for streaks; performance on low-end devices and smooth card pre-loading.

### 2. Speed Quiz Showdown (Timed + Leaderboards)

- **Feasibility:** Medium–High; real-time leaderboards are the main complexity.
- **Architecture:** Client: timer, questions, answer submit. Backend: leaderboards (sync-based = simpler; real-time = WebSockets or polling), scoring/ranking, friend-based filtering.
- **Risks:** Real-time leaderboard scale (consider Redis); cheating (validate answers and time server-side); backend load from frequent updates.

### 3. Word Chain (Solo + Multiplayer)

- **Feasibility:** Medium; multiplayer adds most of the complexity.
- **Architecture:** Solo: client-side validation and hints; “Learn more” can link to existing content. Multiplayer: WebSockets or similar, server-side game session and turn management, matchmaking.
- **Risks:** Multiplayer state sync, turn timeouts, handling unreliable networks; hint/learn-more data availability.

### 4. Word Match (Drag/Match)

- **Feasibility:** High.
- **Architecture:** Client: drag-and-drop or card selection, progress, accessibility (alternative input). Backend: progress sync, achievements, optional dynamic word-meaning data.
- **Risks:** Mobile and accessibility UX for drag-and-drop; needs careful front-end work.

### 5. Flashcard Frenzy (Typed Recall)

- **Feasibility:** High. Core: display word, accept input, compare, feedback.
- **Gotchas:**
  - **Exact vs fuzzy match:** Start with exact match; add fuzzy (e.g. Levenshtein) only if needed, with conservative threshold to avoid accepting wrong answers. Define rules for variants (e.g. colour/color, singular/plural).
  - **Validation:** Trim whitespace, case-insensitive comparison; handle empty input as wrong; correct handling of diacritics and UTF-8 for target languages.
  - **Multiple correct translations:** Store translations as list/set; accept if input matches any.
- **Data:** Support bidirectional (e.g. L1→L2 and L2→L1) per word.

---

## Recommended build order (small team)

**Phase 1**

1. **Flashcard Frenzy** – Core vocabulary loop; exact match first, robust sanitisation.
2. **Word Match** – High feasibility, associative recall; focus on grid, match logic, win condition; defer heavy animation.

**Phase 2**

3. **Word Flick** – Add swipe gesture and Know/Don’t Know association.
4. **Speed Quiz** – MVP: timed quiz + scoring without leaderboards first; add leaderboards (and optionally Redis) later.
5. **Word Chain** – Solo first; then multiplayer (real-time, turn management).

---

## Summary

- **Highest feasibility:** Word Flick, Word Match, (and likely Flashcard Frenzy).
- **Higher complexity:** Speed Quiz (leaderboards, anti-cheat), Word Chain multiplayer (real-time, turn management).
- **Red flags:** Offline/sync conflicts (Word Flick), real-time scale and cheating (Speed Quiz), multiplayer sync (Word Chain), accessibility (Word Match).
