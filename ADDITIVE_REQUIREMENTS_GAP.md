# LearnVerse AI Additive Requirements Gap

This matrix compares the original LearnVerse AI brief in `pasted_content_2.txt` with the current mobile project. Existing learner UI, navigation, branding, lesson experience, theme controls, tutor, notes, chapters, checkpoints, flashcards, local persistence, cloud sync, RBAC foundations, moderation contracts, media-worker contracts, and operations foundations are preserved.

## Already implemented and preserved

| Requirement area | Current evidence | Action |
|---|---|---|
| Student watch → understand → practice loop | Home, lesson, tutor, progress, study routes; learner context; lesson checkpoints and flashcards | Preserve |
| Branded mobile UI and bottom navigation | Existing Home, Discover, Study, AI, Profile tabs | Preserve |
| Interactive lesson player | Lesson route includes playback progress, chapters, transcript, notes, checkpoint, tutor, fullscreen/PiP | Preserve |
| Grounded AI tutor and AI notes | Protected server-side AI procedures with grounding status and lesson timestamp citation | Preserve |
| Learning path and evidence progress | Learning path and progress routes with persisted learner state | Preserve |
| Light/dark/system theme | Theme provider and Profile appearance controls | Preserve |
| Auth, cloud sync, RBAC foundations | OAuth, secure native token storage, protected sync, organizations and roles | Preserve |
| Media processing architecture | Signed media delivery, durable jobs, authenticated worker package | Preserve |
| Moderation and audit foundations | Moderation reports, resolution, audit logs, admin health boundaries | Preserve |
| Security and validation foundations | CORS/body limits, input validation, tests, lint, type/build checks | Preserve |

## Confirmed missing capabilities selected for additive implementation

| Original requirement | Additive implementation | Validation |
|---|---|---|
| Dedicated AI study mode | New Study Planner route with topic, duration, goal, and a generated focus sequence using deterministic local planning rules | Unit tests for plan generation and route type-check |
| AI exam preparation | Exam Prep route with subject, exam date, syllabus topics, weekly plan, practice/revision actions, and readiness estimate explicitly labeled as an estimate | Unit tests for date/topic planning and readiness bounds |
| Knowledge graph and prerequisite recovery | Knowledge Graph route built from catalog concepts and prerequisite edges, with weak-concept revisit suggestions | Unit tests for graph construction and prerequisite lookup |
| Spaced repetition | Review schedule utility using 1/2/4/8/16-day intervals and due-review calculation | Unit tests for schedule and due items |
| Skill passport, certificates, achievements, and portfolio | Additive local learner artifacts screen derived only from persisted evidence; no invented completion claims | Unit tests for evidence gating |
| Notification preferences and in-app reminders | Additive local notification preference model and scheduled-review/quiz reminders derived from learner state | Unit tests for preference filtering and reminder generation |
| Richer analytics | Additive analytics utility for streak, velocity, completion rate, strong/weak concepts, and weekly totals from existing events | Unit tests for each metric |
| Expanded learning state | Persist new planner, exam, review, artifact, and notification settings without changing existing state fields | Persistence and migration-compatible tests |

## Explicitly external or not safe to fake in this mobile-only release

Real video/audio study rooms, screen sharing, live collaborative whiteboards, arbitrary code execution, payment processing, creator revenue, institution dashboards, email/push delivery, semantic vector search infrastructure, AI dubbing, CDN activation, physical-device QA, store submission, and named production on-call ownership require external infrastructure, accounts, device testing, or a separately secured service. They remain documented release gates rather than fake buttons or placeholder claims.

## Additive-only constraints

No existing route, tab, visual treatment, animation, branding asset, player control, interaction, or copy is removed or restyled. New functionality is introduced through new screens, new utilities, new persistence fields, and additive links only. All added UI must use the existing LearnVerse tokens and components.
