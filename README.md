# LearnVerse AI

> **Watch → Understand → Practice → Apply → Measure → Improve**

LearnVerse AI is an AI-native educational video platform for structured lessons, grounded tutoring, active recall, measurable progress, and offline-friendly study. Video is the starting point; the product is designed to help learners build and demonstrate understanding.

This repository contains a **browser-first web application** with retained Expo Android/iOS support. The codebase is validated for controlled staging. Public production readiness additionally depends on activating external infrastructure, completing legal and operational ownership, and passing physical-device or store gates where native release is in scope.

## Current release decision

**Code status: staging-ready. Public production status: not yet approved.**

The application code, server boundaries, worker package, automated tests, static web export, and operational documentation are present. The release must not be called public-production-ready until the external gates in the [production activation checklist](#production-activation-checklist) have evidence attached to the release record.

### Verification snapshot — 2026-10-04

The latest repository validation completed successfully: **27 tests passed, 1 authentication test was intentionally skipped because it requires an external authentication environment, TypeScript passed, lint passed, server and worker production bundles built, Expo Doctor passed 18/18 checks, and the static web export generated 20 routes**. The export was written to `dist/web-export` and contains a non-empty `index.html`. A bounded local smoke test also started the production API bundle and received `{"ok":true}` from `/api/health`; the temporary process was then stopped. The repository secret scan found no tracked secret-named files or matching private-key/API-key content.

The production runtime dependency audit is now **clean: 0 critical, 0 high, 0 moderate, and 0 low findings**. Direct tRPC, Axios, Drizzle, MySQL, and Express dependencies were upgraded; browser/native build dependencies were classified as development-only; and the Express 5 wildcard storage route was made type-safe. The full frozen-lockfile validation passed after these changes. Continue to run `pnpm audit --prod` in CI before every release.

## Product loop

| Stage | Learner experience | Evidence created |
|---|---|---|
| Watch | Discover a structured lesson with chapters and browser/native video playback. | Playback progress and lesson-start events. |
| Understand | Read the transcript, inspect the lesson outline, take notes, and ask a lesson-grounded tutor. | Notes, tutor context, and concept links. |
| Practice | Answer checkpoints, review flashcards, and revisit weak concepts. | Quiz attempts, review events, and accuracy. |
| Apply | Follow a study plan, connect prerequisites, build artifacts, and monitor progress. | Plans, retention schedules, analytics, certificates, and portfolio evidence. |
| Measure and improve | Use progress signals and spaced review to select the next action. | Completion, velocity, streak, mastery, and review evidence. |

## Implemented capabilities

### Learner experience

The Home screen provides the branded entry point, animated learning hero, current course focus, first-lesson launch transition, and a clear next action. Explore supports concept-first discovery, filters, course cards, lesson cards, and deterministic natural-language matching for requests such as “teach me recursion.”

The lesson experience includes video playback, chapters, transcript segments, verified outlines, checkpoint questions, flashcards, notes, progress recording, completion actions, and contextual tutor entry. Offline learners retain approved bundled lesson materials and queued progress changes. Network-dependent AI actions explain the limitation instead of presenting a dead end.

### Learning Hub and workspaces

The Learning Hub provides study planning, exam preparation, knowledge-graph relationships, spaced review, analytics, notification preferences, learner artifacts, certificates, and portfolio evidence.

The additive Role Workspaces route provides planning surfaces for educators, creators, institutions, and administrators. It includes role-specific metrics, operational action plans, activation boundaries, and a study-room blueprint. The blueprint is intentionally not presented as a live video room; real-time collaboration still requires a separately activated service.

### Account, security, and cloud state

Authentication uses the configured OAuth flow and protected server procedures. Local learner state is merged with the authenticated account and synchronized through validated server boundaries. Organization membership and server-side authorization determine access to organization, course, media, moderation, and operational procedures. Client state is not treated as an authorization source.

### Media control plane

The repository contains durable media-job records, signed delivery controls, queue monitoring and stale-job recovery contracts, authenticated worker dispatch, and a separate Node.js worker package. A real transcoding, transcription, object-storage, and CDN deployment is still required before uploading production content.

## Browser-first routes

| Route | Purpose |
|---|---|
| `/` | Home and current learning focus. |
| `/discover` | Concept, course, and lesson discovery. |
| `/study` | Practice signals, flashcard review, and understanding checks. |
| `/tutor` | AI tutor entry point. |
| `/profile` | Account, appearance, privacy, progress, and workspace links. |
| `/learning-hub` | Planning, exam preparation, knowledge graph, retention, analytics, and artifacts. |
| `/role-workspace` | Educator, creator, institution, administrator, and study-room planning surfaces. |
| `/learning-path` | Course learning path. |
| `/progress` | Progress and mastery view. |
| `/lesson/[id]` | Interactive lesson experience. |
| `/tutor/[lessonId]` | Lesson-contextual tutoring. |
| `/oauth/callback` | Authentication callback. |

Use `lesson-js-values` and `lesson-js-functions` when testing lesson routes. Invalid lesson IDs correctly display the unavailable-lesson state.

The web build uses a desktop-friendly top navigation. Native platforms retain the original tab navigation. This separation is intentional and preserves the mobile interaction model without forcing mobile-only navigation on desktop users.

## Architecture

| Layer | Implementation |
|---|---|
| Client | React 19, React Native, Expo SDK 54, Expo Router, TypeScript, NativeWind, and React Native Web. |
| UI and motion | NativeWind, React Native Reanimated, Expo Haptics, responsive layouts, and reduced-motion behavior. |
| Video | Expo Video with browser/native playback controls and persisted progress events. |
| Local state | React context, AsyncStorage persistence, offline queueing, and conflict-safe merge utilities. |
| API | Node.js, Express, tRPC, input validation, OAuth/session boundaries, and protected procedures. |
| Database | Drizzle ORM with relational migrations for organizations, memberships, courses, lessons, learning state, media jobs, moderation, and audits. |
| AI | Server-side grounded tutor and note-generation procedures. Credentials remain server-side. |
| Media worker | Separate authenticated Node.js worker that claims bounded jobs and reports completion. |
| Validation | Vitest, TypeScript, Expo lint, Expo Doctor, web export, server build, worker build, and manual QA protocols. |

## Repository structure

```text
app/                       Expo Router routes and web/native layouts
components/                Shared screen, UI, progress, and interaction components
constants/                 OAuth, theme, and app constants
drizzle/                   Database migrations and schema metadata
hooks/                     Authentication, color, and platform hooks
lib/learning/              Catalog, learner state, planning, search, and offline sync
server/                    tRPC routers, database access, auth, storage, and operations
shared/                    Shared types and production contracts
tests/                     Deterministic unit and API-boundary tests
worker/                    Authenticated persistent media-worker package
assets/images/             App icon, splash, hero, and brand assets
```

## Local development

### Prerequisites

Install Node.js 22 or a compatible current LTS version, pnpm, and Git. Local UI exploration does not require production credentials. Authenticated cloud synchronization, database migrations, media processing, and AI procedures require configured development services.

### Install and run

```bash
pnpm install
pnpm dev
```

The development command starts the API server and Expo Metro web server. The browser preview normally uses port `8081`; the API normally uses port `3000`.

Useful commands:

```bash
pnpm dev:metro       # browser-only Metro server
pnpm android         # native Android development target
pnpm ios             # native iOS development target
pnpm check           # TypeScript validation
pnpm test            # deterministic tests
pnpm lint            # Expo lint
pnpm build           # server and worker production bundles
pnpm db:push         # generate and apply Drizzle migrations
```

### Environment configuration

Never commit production secrets. Configure values through the project’s secure environment mechanism and keep development, staging, and production values separate.

| Variable or control | Required use |
|---|---|
| `DATABASE_URL` | Managed relational database connection. |
| `JWT_SECRET` | Server-side session-token verification. |
| OAuth application values | Web/native sign-in, callback URLs, and account identity. |
| `EXPO_PUBLIC_API_BASE_URL` or equivalent | Client API origin for the selected environment. |
| `MEDIA_WORKER_TOKEN` | Authenticated worker-to-server requests. |
| Object-storage credentials | Server and worker only; never expose to clients. |
| AI provider credentials | Server-side tutor and note procedures only. |
| Monitoring and notification credentials | Operations service only. |

For web release, configure the exact HTTPS domain and OAuth callback URL. For native release, configure the generated deep-link scheme, Android package, iOS bundle identifier, signing ownership, and physical-device callback validation.

## Validation before every release

Run the complete automated validation sequence from a clean dependency install:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm lint
pnpm build
npx expo-doctor
rm -rf dist/web-export
npx expo export --platform web --output-dir dist/web-export
```

The web export must contain `dist/web-export/index.html`, JavaScript and CSS bundles, and the static routes listed above. The **2026-10-04 validation snapshot** passed TypeScript, automated tests, lint, Expo Doctor 18/18, server build, worker build, and static web export. The intentionally skipped authentication test remains dependent on an external authentication environment and must be covered by staging smoke tests.

## Production activation checklist

The following sequence turns the validated repository into an operated release. Each item requires a named owner, a completion date, and evidence attached to the release record.

### 1. Create isolated environments

Create separate staging and production projects. Use separate domains, databases, OAuth applications, storage buckets, worker tokens, AI credentials, and monitoring destinations. Confirm that production credentials cannot be read by the client bundle or staging services.

**Evidence:** environment inventory, secret ownership record, and successful secret scan.

### 2. Provision and migrate the database

Provision the managed relational database, restrict network access, apply migrations, create the least-privilege application identity, and verify connection pooling. Test a migration on staging before applying it to production.

```bash
pnpm db:push
```

**Evidence:** migration journal, schema review, backup policy, restore test, and production readiness check.

### 3. Configure authentication

Register the exact web and native callback URLs. Verify sign-in, sign-out, session expiry, account recovery, unauthorized access, and cross-account isolation. Confirm that organization permissions are enforced by server procedures.

**Evidence:** staging authentication test record and callback configuration export.

### 4. Deploy media infrastructure

Connect object storage, a real transcoding and transcription processor, and the authenticated persistent worker. Process a test video through upload, queue claim, transcode, captions, playback, retry, failure, and rights-revocation paths. Add malware scanning and content-rights review before accepting production uploads.

Build and start the worker with:

```bash
pnpm build:worker
pnpm start:worker
```

**Evidence:** processed test asset, worker claim/completion logs, retry/dead-letter result, caption result, and revoked-playback result.

### 5. Configure delivery and CDN

Start with signed server-authorized playback. Add a CDN when traffic, geography, latency, or cost justify it. Verify cache invalidation, signed URL expiry, origin protection, and rollback before enabling broad media delivery.

**Evidence:** playback security test, cache invalidation test, and rollback record.

### 6. Configure operations

Set centralized logs, error reporting, API latency and error metrics, database readiness checks, uptime probes, queue age and worker lease metrics, AI usage and cost alerts, backup monitoring, and incident routing. Assign an incident owner and backup owner.

**Evidence:** alert delivery test, dashboard links, on-call schedule, and incident drill record.

### 7. Complete security, privacy, and education review

Review the threat model, authorization matrix, dependency and secret scans, rate limits, abuse controls, data map, retention rules, deletion/export workflow, accessibility, learner safety, AI grounding, and applicable education or child-privacy obligations. Resolve the current dependency-audit blocker before approval. Publish approved privacy, terms, acceptable-use, support, and retention documents.

**Evidence:** signed review record, resolved critical/high findings, educator content approval, and published policy URLs.

### 8. Complete web and native QA

Run the manual web matrix in Chrome, Safari, Firefox, and Edge at desktop and narrow widths. Test keyboard access, focus visibility, lesson navigation, offline queueing, reconnect sync, OAuth callback, theme persistence, invalid routes, error states, video playback, and Learning Hub actions.

If native release remains in scope, execute every case in `PHYSICAL_DEVICE_QA.md` on at least one current Android device and one current iPhone using fresh signed builds.

**Evidence:** device/browser matrix with build identifier, OS version, result, screenshots or recordings, and issue disposition.

### 9. Run a controlled education pilot

Start with a narrow learner segment and one measurable subject area. Use educator-reviewed content. Define success metrics for activation, lesson completion, checkpoint performance, review participation, support incidents, AI cost per active learner, and learning evidence. Keep rollback and learner-support ownership visible.

**Evidence:** pilot plan, outcome report, support log, and go/no-go decision.

### 10. Approve the public release

Release only when all blocking items are closed, the production checkpoint is tagged, rollback is tested, monitoring is active, and the accountable product, infrastructure, security, privacy, curriculum, QA, and support owners sign the release decision.

## Rollback procedure

1. Freeze new deployments and record the incident start time.
2. Identify whether the failure is in the client, API, database migration, AI service, media worker, storage, CDN, or authentication provider.
3. Disable the affected capability through configuration or access control when possible.
4. Roll back the application to the last validated checkpoint.
5. Do not reverse a database migration without a reviewed, tested rollback migration.
6. Preserve logs, queue state, audit entries, and affected asset identifiers.
7. Communicate learner impact and support instructions.
8. Restore service gradually and complete a post-incident review.

## Go/no-go decision

### Go for controlled staging when

- Automated validation passes.
- The web export is generated successfully.
- Staging authentication, database, API, and worker services are configured.
- A real test media asset completes the processing path.
- Monitoring and rollback are tested in staging.

### No-go for public production when any of the following is missing

- Production hosting, database, object storage, or media processing.
- Backup restoration evidence or named operational ownership.
- Security, privacy, accessibility, or educator content approval.
- Physical Android/iOS QA when native release is advertised.
- Store review and submission when native distribution is intended.
- Support, incident response, or data deletion/export process.

**Current decision: no-go for unrestricted public production; go for controlled staging and external infrastructure activation.**

## Documentation map

- [Production readiness](./PRODUCTION_READINESS.md)
- [Industry readiness roadmap](./INDUSTRY_READINESS_ROADMAP.md)
- [Industry release handoff](./INDUSTRY_RELEASE_HANDOFF.md)
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
- [Additive requirements gap](./ADDITIVE_REQUIREMENTS_GAP.md)

## License and ownership

Before public distribution, add the approved license, copyright notice, third-party notices, content-rights policy, support contact, and privacy policy. The product owner must confirm ownership of source code, generated artwork, course content, video assets, captions, fonts, domains, store accounts, and operational credentials.

## References

[1]: ./PRODUCTION_READINESS.md "LearnVerse AI production readiness matrix"
[2]: ./INDUSTRY_READINESS_ROADMAP.md "LearnVerse AI industry readiness roadmap"
[3]: ./INDUSTRY_RELEASE_HANDOFF.md "LearnVerse AI industry release handoff"
