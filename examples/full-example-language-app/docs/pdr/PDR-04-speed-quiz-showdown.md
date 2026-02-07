# PDR-04: Speed Quiz Showdown

**Feature:** Timed quizzes, points, optional leaderboards and friend competition  
**Phase:** 2  
**Status:** Draft

---

## 1. Overview

Timed quiz mode: user answers vocabulary questions under time pressure; earns points for correct answers. MVP: timed quiz + scoring only. Later: weekly leaderboards and optional friend-based competition.

---

## 2. User need

- **Jordan:** Competition and social motivation; weekly leaderboards and challenges.  
- **Margaret:** Phase 2; may be stressful for some; staggered release acceptable.  
- **Design:** Timer prominent; large answer buttons; clear score and ranking.

---

## 3. Functional requirements

**MVP (Phase 2a)**  
- Timed quiz: each question has a time limit or total session time.  
- Points for correct answers; display running score.  
- Clear end-of-session summary (score, correct/incorrect count).  
- Support short sessions; save/continue if applicable.

**Phase 2b (leaderboards)**  
- Weekly leaderboard: rank by score (and optionally time).  
- Optional friend list; filter leaderboard to friends.  
- Sync-based or real-time leaderboard (product/tech to decide).

---

## 4. Non-functional requirements

- **Integrity:** Validate answers and time server-side to prevent cheating.
- **Scalability:** Leaderboard reads/writes efficient; consider dedicated store (e.g. Redis) for real-time.
- **Accessibility:** Timer readable in both themes; reduced-motion: static timer update (no animation). Large touch targets for answers.

---

## 5. Design considerations (from UX)

- Timer at top; questions and options clearly laid out; large, well-spaced answer buttons.
- Real-time score; leaderboard accessible from game or dedicated tab with clear ranking.
- Correct/incorrect: high-contrast, static option for reduced-motion.

---

## 6. Technical notes (from Tech Lead)

- Medium–high feasibility. Quiz + scoring straightforward; leaderboards are main complexity.
- Sync-based leaderboards simpler; real-time requires WebSockets or polling and scales less easily.
- Server-side validation of answers and time is essential.

---

## 7. Acceptance criteria

**MVP**  
- [ ] User can start a timed quiz and answer vocabulary questions.
- [ ] Score is calculated and displayed; session summary at end.
- [ ] Timer is visible and updates; reduced-motion: static update.
- [ ] Dark mode and high contrast supported.

**Leaderboards (Phase 2b)**  
- [ ] Weekly leaderboard is visible and ranks users by score.
- [ ] Optional friend filter works when friends are defined.
- [ ] Scores and rankings are validated server-side.

---

## 8. References

- `stakeholders-log/01-user-stakeholders-gamified-vocabulary.md`
- `stakeholders-log/02-developer-feasibility-alex-chen.md`
- `stakeholders-log/03-designer-considerations-marcus-rivera.md`
- `stakeholders-log/04-refinement-phase-order-and-accessibility.md`
