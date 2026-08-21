# LearnVerse AI

> **Watch → Understand → Practice → Apply**

LearnVerse AI is an AI-native educational learning platform for structured video lessons, grounded tutoring, active recall, measurable progress, and offline-friendly study. It is designed to help learners move beyond passive video consumption toward verifiable understanding and practical application.

The current release is **browser-first** and also retains the Expo-native Android/iOS presentation. The web experience uses a desktop-friendly top navigation, responsive layouts, bundled learning content, local persistence, and the same learning flows used by the native presentation.

## Product Overview

LearnVerse AI combines short educational video with chapters, transcripts, checkpoints, flashcards, contextual AI tutoring, study planning, retention tools, and progress evidence. The experience is intentionally organized around a learning loop:

| Stage | Learner experience | Evidence created |
|---|---|---|
| Watch | Discover a concept and watch a structured lesson with chapters. | Playback progress and lesson-start events. |
| Understand | Read the transcript, inspect the verified lesson outline, and ask a lesson-grounded tutor. | Tutor context, notes, and concept links. |
| Practice | Answer checkpoints, review flashcards, and revisit weak concepts. | Quiz attempts, review events, and accuracy. |
| Apply | Follow a study plan, connect prerequisites, build artifacts, and monitor progress. | Plans, retention schedules, analytics, certificates, and portfolio evidence. |

## Main Features

### Learner experience

The Home screen presents a branded learning entry point, animated learning hero, current course focus, first-lesson launch transition, and a clear next action. Discover supports concept-first browsing, filters, course and lesson cards, and deterministic natural-language semantic matching for requests such as “teach me recursion.”

The lesson experience includes browser-compatible video playback, chapters, transcript segments, verified lesson outlines, checkpoint questions, flashcards, progress recording, completion actions, and a contextual tutor entry point. The opening visual does not expose an unnecessary volume control outside the video player’s native controls.

### Learning Hub

The Learning Hub adds study planning, focus sessions, exam preparation, knowledge-graph relationships, spaced review, analytics, notification preferences, learner artifacts, certificates, and portfolio evidence. These tools are additive and do not remove the original learning screens.

### Offline-first learning

LearnVerse stores learner progress and approved local study state on the device. While offline, learners can continue using bundled lesson metadata, transcripts, verified outlines, flashcards, checkpoints, Learning Hub plans, and progress tracking. Authenticated cloud changes are queued locally and merged with remote learning evidence after reconnection using conflict-safe progress and event merging.

AI tutor and server-generated notes require network access. When offline, the interface explains the limitation and keeps local lesson materials available instead of presenting a dead-end action.

### Appearance and accessibility

Learners can choose System, Light, or Dark appearance. The preference persists locally. Primary actions expose accessibility roles and labels, and the app includes reduced-motion behavior for non-essential animation. Final deployments still require a formal keyboard, screen-reader, contrast, text-scaling, and device accessibility review.

### Authentication and cloud state

The account flow uses OAuth-based authentication with protected server procedures. After sign-in, local activity is merged with the authenticated learner record and synchronized through validated server boundaries. The client does not decide organization permissions; protected server procedures use authenticated ownership and organization membership.

## Browser-First Web Experience

The web build is generated through Expo Router static rendering and includes the following route groups:

| Route | Purpose |
|---|---|
| `/` | Home and current learning focus. |
| `/discover` | Concept, course, and lesson discovery. |
| `/study` | Practice signals, flashcard review, and understanding checks. |
| `/tutor` | AI tutor entry point. |
| `/profile` | Account state, appearance, privacy, progress, and Learning Hub entry. |
| `/learning-hub` | Planning, exam preparation, knowledge graph, retention, analytics, and artifacts. |
| `/learning-path` | Course learning path. |
| `/progress` | Progress and mastery view. |
| `/lesson/[id]` | Interactive lesson experience. |
| `/tutor/[lessonId]` | Lesson-contextual tutoring. |
| `/oauth/callback` | Authentication callback. |

Use valid lesson IDs such as `lesson-js-values` and `lesson-js-functions` when testing lesson routes. A route such as `/lesson/variables-values` is not a valid lesson identifier and correctly displays the unavailable-lesson state.

The web navigator uses a top navigation bar at desktop widths. Native platforms retain the original tab navigator. This platform-specific separation preserves the strong mobile interaction model without forcing mobile-only navigation on desktop users.

## Technical Architecture

| Layer | Implementation |
|---|---|
| Web and native client | React 19, React Native, Expo SDK 54, Expo Router, TypeScript, NativeWind, React Native Web. |
| UI and motion | NativeWind, React Native Reanimated, Expo Haptics, responsive platform layouts, reduced-motion handling. |
| Video | Expo Video with browser/native playback controls and persisted progress events. |
| Local state | React context, AsyncStorage persistence, versioned offline sync queue, conflict-safe merge utilities. |
| Server API | Node.js, Express, tRPC, protected procedures, input validation, OAuth/session boundaries. |
| Database | Drizzle ORM with managed relational database migrations and organization/RBAC/media models. |
| AI | Server-side grounded tutor and note-generation procedures; credentials remain server-side. |
| Media control plane | Durable media-job records, signed delivery controls, worker authentication, queue monitoring, and recovery contracts. |
| Worker | Separate authenticated Node.js worker package for bounded media-job claiming and completion reporting. |
| Validation | Vitest, TypeScript, Expo lint, Expo Doctor, static web export, server build, and worker build. |

## Repository Structure

```text
app/                       Expo Router routes and platform-specific web/native layouts
components/                Shared screen, UI, progress, and interaction components
constants/                 OAuth, theme, and app constants
drizzle/                   Database migration files and schema relationships
hooks/                     Authentication, color, and platform hooks
lib/learning/              Catalog, learner state, persistence, planning, search, and offline sync
server/                    tRPC routers, database access, storage, auth, and operational boundaries
shared/                    Shared types and production contracts
tests/                     Deterministic unit and API-boundary tests
worker/                    Authenticated persistent media-worker package
assets/images/             App icon, splash, hero, and native/web brand assets
```

Important documents:

| Document | Purpose |
|---|---|
| `ARCHITECTURE.md` | System architecture and service boundaries. |
| `DATABASE.md` | Relational data model and migration guidance. |
| `API.md` | API procedures and authorization boundaries. |
| `SECURITY.md` | Security controls and threat considerations. |
| `DEPLOYMENT.md` | Deployment environment and release procedures. |
| `OPERATIONS_RUNBOOK.md` | Media operations, incidents, backups, and recovery. |
| `WORKER_DEPLOYMENT.md` | Persistent worker deployment procedure. |
| `PHYSICAL_DEVICE_QA.md` | Android and iOS physical-device QA protocol. |
| `STORE_RELEASE_CHECKLIST.md` | Native store preparation and submission checklist. |
| `INDUSTRY_RELEASE_HANDOFF.md` | External activation gates and current release boundary. |
| `INDUSTRY_READINESS_ROADMAP.md` | Complete step-by-step industry and education launch plan. |
| `ADDITIVE_REQUIREMENTS_GAP.md` | Original-brief comparison and additive feature scope. |

## Local Development

### Prerequisites

Install Node.js 22 or a compatible current LTS version, pnpm, and Git. A managed database and production credentials are not required for local UI exploration, but authenticated cloud features require a configured development server and valid environment values.

### Install dependencies

```bash
pnpm install
```

### Start the browser-first development environment

```bash
pnpm dev
```

The development command starts the API server and Expo Metro web server. The browser preview is served on the configured Expo port, normally `8081`, while the API server normally listens on port `3000`.

### Run the browser-only development server

```bash
pnpm dev:metro
```

### Run the native development commands if native support is retained

```bash
pnpm android
pnpm ios
```

Physical-device use requires a fresh managed/development build with the correct app configuration, not an outdated cached build.

## Environment Configuration

Never commit production secrets. Use the project’s secure environment configuration for server and build values.

| Variable or control | Purpose |
|---|---|
| `DATABASE_URL` | Managed relational database connection. |
| `JWT_SECRET` | Server-side session-token verification. |
| OAuth portal/server/app values | Sign-in, callback, and account identity configuration. |
| `EXPO_PUBLIC_API_BASE_URL` or equivalent API configuration | Public client API origin for the selected environment. |
| `MEDIA_WORKER_TOKEN` | Authenticates the dedicated media worker. |
| Object-storage credentials | Used only by the server/media worker, never by clients. |
| Built-in AI credentials | Used only by server-side AI procedures. |

For web production, configure the exact HTTPS domain and OAuth callback URL. For native production, configure the generated deep-link scheme and platform bundle identifiers. Keep development, staging, and production credentials separate.

## Testing and Validation

Run the core validation suite:

```bash
pnpm check
pnpm test
pnpm lint
pnpm build
```

Run Expo compatibility checks:

```bash
npx expo-doctor
```

Create a production web export:

```bash
rm -rf dist/web-export
npx expo export --platform web --output-dir dist/web-export
```

A valid export must contain `dist/web-export/index.html`, web JavaScript and CSS bundles, and static route output. The current validated release has passed Expo Doctor, TypeScript, lint, automated tests, static web export, server build, and worker build. One authentication logout test remains intentionally skipped because it depends on an external authentication environment.

### Manual web QA

Test the deployed staging domain in current Chrome, Safari, Firefox, and Edge. Verify desktop and narrow browser widths, keyboard access, focus visibility, lesson navigation, chapter seeking, transcript and notes tabs, checkpoint submission, flashcard reveal, Learning Hub actions, theme persistence, offline queue behavior, reconnect sync, OAuth callback, error states, and invalid-route handling.

### Manual native QA

If Android and iOS remain release targets, execute every case in `PHYSICAL_DEVICE_QA.md` on at least one current Android device and one current iPhone. Record the device, OS version, build identifier, result, evidence, and issue disposition.

## Production Readiness Boundary

The codebase is suitable for **controlled staging and infrastructure activation**. It is not an unconditional public-industry release until the external gates below are complete.

### Required before a controlled education pilot

1. Deploy a real staging web domain with HTTPS.
2. Configure production-like OAuth callbacks and account recovery support.
3. Provision and migrate a managed database.
4. Deploy a real media processor and authenticated persistent worker.
5. Process a real test asset through upload, transcoding, captions, playback, retry, and rights revocation.
6. Configure monitoring, backups, alert routing, and named incident ownership.
7. Publish privacy, terms, acceptable-use, support, and data-retention documents.
8. Have educators review the initial course, transcript, captions, checkpoints, flashcards, and AI grounding.
9. Complete security, accessibility, and web resilience QA.
10. Run a small controlled learner pilot with defined success metrics.

### Required before broad institutional or commercial use

Add institution administration, educator authoring, creator rights and publishing, learner enrollment, moderation workflows, certificates and portfolio export, reporting, support tooling, billing or a documented free-pilot decision, collaboration policies if applicable, education privacy/compliance approval, incident drills, restore drills, capacity testing, and a signed go/no-go review.

### Native-store requirements if applicable

Prepare signed Android and iOS builds, final store assets, privacy disclosures, age rating, support URL, review credentials, signing ownership, account-access instructions, native deep-link validation, physical-device QA, and Apple/Google submission materials. If launching web-only, explicitly defer store release and avoid claiming native availability.

## Security and Privacy Principles

Authentication tokens, AI credentials, database credentials, storage credentials, and worker credentials remain outside the client bundle. Authorization is enforced on the server using authenticated user ownership and organization membership. Media is delivered through server-authorized short-lived access rather than exposing storage credentials.

Before launch, conduct a formal threat model, dependency and secret scan, authorization review, rate-limit review, abuse review, penetration test, privacy data map, retention review, deletion/export test, and child/education compliance review where the learner population requires it. Legal and privacy requirements vary by jurisdiction and learner age; consult qualified counsel rather than relying on this README as legal advice.

## Operations and Incident Response

Production operations require centralized logs, error reporting, API latency and error metrics, database readiness checks, web uptime probes, media queue metrics, worker lease monitoring, AI usage and cost alerts, backup monitoring, and a named on-call owner.

Backups must be restored into isolated staging before launch. Keep the migration journal, deployment version, asset inventory, incident timeline, and rollback build available. Define recovery-time and recovery-point objectives. Practice responses for authentication compromise, data exposure, database failure, media outage, unauthorized playback, harmful AI output, and large-scale learner access problems.

## Education Deployment Model

Begin with a narrow learner segment and a measurable subject area. Define learning outcomes before selecting content. Have educators review the lesson content and assessment quality. Monitor activation, lesson completion, checkpoint performance, review participation, retained learning signals, support incidents, AI cost per active learner, and learner feedback.

A starter course is a product demonstration, not an education catalog. Institutional adoption requires approved content, educator workflows, learner support, privacy agreements, accessibility conformance, reporting, and a clear process for handling inaccurate content or learner safety concerns.

## Recommended Launch Sequence

1. Choose web-only pilot or web-plus-native release scope.
2. Assign product, infrastructure, security, privacy, QA, curriculum, and support owners.
3. Create isolated staging and production environments.
4. Configure the domain, HTTPS, OAuth, database, storage, and server secrets.
5. Deploy and test the real media worker and processor.
6. Configure monitoring, backups, restore drills, alerts, and rollback.
7. Complete security, privacy, accessibility, and education-content review.
8. Run the full web QA matrix and resolve critical/high defects.
9. Run a controlled education pilot and inspect outcome evidence.
10. Approve the final production checkpoint and publish the web release.
11. If native is still in scope, generate signed builds and complete physical-device/store review.

## Current Go/No-Go Assessment

**Current status: controlled-staging ready.** The browser-first experience and code-level validation are complete. Public education or industry launch remains **no-go** until real production services, operational ownership, legal/compliance review, educator-approved content, and deployment-specific QA are evidenced.

## License and Ownership

Add the organization’s approved license, copyright notice, third-party notices, content rights policy, and support contact before public distribution. The product owner is responsible for confirming ownership of source code, generated artwork, course content, video assets, captions, fonts, domains, store accounts, and operational credentials.

## Related Documentation

- [Industry readiness roadmap](./INDUSTRY_READINESS_ROADMAP.md)
- [Industry release handoff](./INDUSTRY_RELEASE_HANDOFF.md)
- [Production readiness](./PRODUCTION_READINESS.md)
- [Architecture](./ARCHITECTURE.md)
- [Database](./DATABASE.md)
- [API](./API.md)
- [Security](./SECURITY.md)
- [Deployment](./DEPLOYMENT.md)
- [Operations runbook](./OPERATIONS_RUNBOOK.md)
- [Worker deployment](./WORKER_DEPLOYMENT.md)
- [Physical-device QA](./PHYSICAL_DEVICE_QA.md)
- [Store release checklist](./STORE_RELEASE_CHECKLIST.md)
- [Privacy review draft](./PRIVACY_REVIEW_DRAFT.md)
