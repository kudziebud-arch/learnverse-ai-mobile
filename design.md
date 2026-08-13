# LearnVerse AI Mobile Design

## Product Scope

LearnVerse AI is a mobile-first educational video environment built around the learning loop **Watch → Understand → Practice → Apply → Measure → Improve**. This Android and iOS application prioritizes the student experience: discovering a structured learning path, watching interactive lessons, asking an AI tutor for contextual help, making revision materials, and tracking mastery. Educator, creator, institution, and administrator experiences are represented as future role-based surfaces and require backend-backed authorization before production enablement.

## Mobile Design Principles

The application is designed for portrait 9:16 screens and one-handed operation. Primary actions remain in the reachable lower half of each screen, touch targets are at least 44 pt high, and secondary actions use sheets or overflow menus. The UI follows iOS Human Interface Guidelines while retaining platform-native typography, navigation, haptics, safe areas, and system back behavior on Android.

## Color Choices

| Token | Value | Purpose |
|---|---:|---|
| Learn Blue | `#255CFF` | Primary actions, selected controls, progress emphasis |
| Indigo Night | `#111B3D` | Hero surfaces, lesson-player background, high-contrast text areas |
| Cloud | `#F6F8FC` | Main screen background |
| Surface | `#FFFFFF` | Cards, sheets, and elevated reading surfaces |
| Mint Success | `#16A66A` | Mastery, completed lessons, correct quiz feedback |
| Amber Focus | `#F0A83A` | Streaks, reminders, and in-progress state |
| Coral Alert | `#E45757` | Incorrect feedback and destructive actions |
| Ink | `#172033` | Primary text |
| Slate | `#68738B` | Supporting text, timestamps, and metadata |

## Screen List

| Screen | Primary content and functionality |
|---|---|
| Home | Greeting, learning streak, resume card, goal progress, recommended lessons, and a horizontal topic chooser. |
| Discover | Concept-first search, category filters, recommended video/course results, and a semantic-search integration boundary. |
| Learning Path | Career or subject goal, skill level, ordered milestones, course cards, and next-lesson actions. |
| Video Lesson | Video playback, chapter jump list, interactive checkpoint prompt, transcript, notes, resources, and a context-aware Ask Tutor entry point. |
| Tutor | Topic-aware AI conversation, citation chips for video timestamps, suggested prompts, and study-action shortcuts. |
| Study | Notes, flashcards, adaptive quiz entry, revision schedule, and export/share integration boundary. |
| Quiz | One question at a time, immediate response feedback, adaptive difficulty result, and retry/review actions. |
| Progress | Weekly learning activity, topic mastery, course progress, learning streak, weak-concept recommendation, and portfolio/certificate integration boundaries. |
| Profile | Learner goals, achievements, app preferences, and a future role/account switcher. |

## Core User Flows

| Flow | Steps |
|---|---|
| Resume learning | Home → Resume card → Video Lesson → Chapter or interactive checkpoint → Tutor or Notes → Completion updates progress. |
| Discover a topic | Discover → Enter concept or select topic → Review learning result → Open lesson → Save to learning path. |
| Understand a difficult moment | Video Lesson → Ask Tutor → Receive concise explanation and source timestamp → Open cited chapter or begin practice. |
| Practice and improve | Study → Adaptive Quiz → Answer questions → Receive feedback → View weak-concept recommendation → Return to a lesson chapter. |
| Track goal progress | Home → Learning Path or Progress → Review milestones and mastery → Select next recommended lesson. |

## Information Architecture

The bottom tab bar contains **Home**, **Explore**, **Practice**, **AI**, and **Profile**. The video lesson is pushed above the tab bar so the learner retains a clear back path, while the AI tab explains the tutor and provides a route into contextual conversation. The video player concentrates content at the top, while learning actions are arranged below it in a bottom-reachable action strip. Complex writing, exports, moderation, institution management, and revenue functions are intentionally scoped to future companion web/dashboard services.

## Domain Vocabulary

| Model | Meaning |
|---|---|
| Learning Path | An ordered set of milestones supporting a learner goal. |
| Course | A structured collection of educational lessons. |
| Lesson | One video-led learning activity with chapters, transcript, materials, and checkpoints. |
| Checkpoint | An in-video interactive prompt such as a multiple-choice question, poll, or reflection. |
| Learning Artifact | A learner-owned note, flashcard set, quiz result, or certificate. |
| Mastery | A measured understanding signal for a topic, used to guide revision recommendations. |
| Tutor Context | Current lesson, video timestamp, transcript segment, course, and recent learner progress sent to an AI service. |

## Production Boundaries

The mobile client will use local persistence for the usable offline-first learning prototype. Production requires authenticated APIs, PostgreSQL data modeling, object storage/CDN video delivery, a background media-processing pipeline, AI Gateway provider abstraction, vector/semantic search, moderation, subscription, institutional tenancy, audit logs, and role-based authorization. No AI provider credential is embedded in the client.
