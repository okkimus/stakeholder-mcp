# PDR-03: Word Flick

**Feature:** Swipe left/right for Don’t Know / Know; streaks and badges  
**Phase:** 2  
**Status:** Draft

---

## 1. Overview

Card-style interface: one word per card. User swipes left (“Don’t know”) or right (“Know”). Progress and streaks are tracked; badges or points for daily streaks. Optimised for quick, on-the-go sessions.

---

## 2. User need

- **Jordan:** Fast, engaging, good for short sessions; streak and badges for daily motivation.  
- **Margaret:** Phase 2 acceptable; some users prefer calmer modes first.  
- **Design:** Full-screen word; clear swipe area; subtle haptic and visual feedback.

---

## 3. Functional requirements

- Display one word per card; user swipes left (Don’t know) or right (Know).
- Record outcome per word for progress/Spaced Repetition (if applicable).
- Streak counter (e.g. daily sessions or consecutive days); display in UI (sidebar or banner).
- Badges or points for streak milestones; visible in profile or mode summary.
- Offline-capable progress; sync with backend when online; conflict resolution for streaks.
- Short sessions: start anytime, exit with progress saved.

---

## 4. Non-functional requirements

- **Performance:** Smooth card transitions; pre-load next card where possible; works on low-end devices.
- **Accessibility:** Swipe area large enough for different finger sizes; optional button fallback for Know/Don’t know; reduced-motion: streak shown as static indicator (no animated flames/counters).
- **Offline/sync:** Clear conflict resolution so streak and progress are not lost or duplicated.

---

## 5. Design considerations (from UX)

- Full-screen layout; word centred; swipe indicators or subtle animation.
- Visual feedback: e.g. green tick (Know), red cross (Don’t know); subtle haptic.
- Streaks/badges in sidebar or top banner, non-intrusive.
- Dark mode and reduced-motion: streak and feedback must work without motion.

---

## 6. Technical notes (from Tech Lead)

- High feasibility. Main complexity: offline progress and streak sync; conflict resolution.
- Client: card stack, swipe gesture, local storage (e.g. SQLite/UserDefaults). Backend: streaks, badges, optional cross-device sync.

---

## 7. Acceptance criteria

- [ ] User can swipe left/right and see immediate feedback (Know / Don’t know).
- [ ] Streak is calculated and displayed; badges/points for streak milestones are visible.
- [ ] Progress works offline and syncs when online without data loss.
- [ ] Optional button-based alternative to swipe is available.
- [ ] Card transitions are smooth; next card is ready without noticeable delay.
- [ ] Dark mode and reduced-motion supported; streak display does not rely on animation.

---

## 8. References

- `stakeholders-log/01-user-stakeholders-gamified-vocabulary.md`
- `stakeholders-log/02-developer-feasibility-alex-chen.md`
- `stakeholders-log/03-designer-considerations-marcus-rivera.md`
- `stakeholders-log/04-refinement-phase-order-and-accessibility.md`
