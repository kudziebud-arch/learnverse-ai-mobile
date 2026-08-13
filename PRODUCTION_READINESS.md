# LearnVerse AI Production Readiness

## Delivery Status

This release establishes the **application foundations** required for a secure educational platform. It adds account-aware cloud synchronization, protected API procedures, organizational RBAC, durable content and moderation records, media-processing job records, audit logs, health endpoints, input validation, and production-facing operational documentation. It does not claim that code alone completes third-party account verification, legal review, media-transcoding capacity, observability vendor configuration, store review, or incident response staffing.

| Area | Implemented in this project | Required external completion before public launch |
|---|---|---|
| Identity | OAuth-based account flow, bearer-token client storage, protected server procedures, and server-side user ownership. | Confirm production OAuth configuration, account recovery support, and a support contact. |
| Cloud data | Managed relational database schema for organizations, membership roles, courses, lessons, learner state, media jobs, reports, and audits. | Establish backup retention, restoration drills, data-retention policy, and deletion-request workflow. |
| Authorization | Organization membership roles, server-side permission checks, admin-only operational health, and immutable audit entries. | Conduct a role/permission review for each production dashboard and service identity. |
| Media | Video asset records, rights state, queued processing jobs, and manager-only registration APIs. | Attach object storage, a transcoding/transcription worker, a CDN/HLS-DASH delivery path, malware scanning, and content-rights review. |
| AI | Server-only tutor and note generation with context grounding status. | Set product-level quotas, cost alerts, adversarial prompt testing, safety policy review, and provider failover. |
| Observability | Public liveness response and authenticated database readiness response. | Configure centralized logs, error reporting, metrics, alert routing, uptime probes, and on-call ownership. |

## Production Operating Model

The native app treats device state as a fast local cache. After an account signs in, the learning state is fetched and merged with local activity, then debounced back to the protected server endpoint. The server validates the full state shape and ties it to the authenticated user ID. Organization membership, not client-side claims, decides whether a user can create courses, register media, or resolve moderation reports.

> **Important:** Media processing is deliberately modeled as durable database work rather than executed inside the mobile request path. A separate worker should claim queued jobs, process one bounded job at a time, report status, and retry safely. Large video transcoding must be hosted in dedicated media infrastructure, not in the mobile API process.

## Environment and Secret Controls

| Variable or control | Use | Production rule |
|---|---|---|
| `DATABASE_URL` | Managed database connection | Restrict network access, rotate credentials, and back up regularly. |
| `JWT_SECRET` | Session-token verification | Provide only through the server environment and rotate through a planned session invalidation process. |
| OAuth app values | Native/web sign-in | Register only intended callback URLs and verify the generated Android/iOS scheme in a physical-device test. |
| Built-in AI credentials | Tutor and note service | Keep server-only; apply task-specific quotas and audit usage. |
| Object-storage credentials | Upload/transcoding worker | Keep in the worker or media service, never in Expo code or user-facing APIs. |

## Release Gates

| Gate | Evidence required |
|---|---|
| Database | Migration reviewed, applied, backed up, and verified on staging before production. |
| Security | Authorization matrix tested; no secret values committed; dependency review completed; abuse/rate-limiting layer configured at the edge. |
| Media | Upload entitlement, processing retry/dead-letter policy, captions, playback authorization, and content-rights workflow verified. |
| Quality | Type check, unit tests, lint, backend build, authenticated cloud-sync test, and physical iOS/Android device test completed. |
| Operations | Liveness and readiness probes, centralized error logging, dashboards, escalation contact, and incident runbook configured. |
| Store release | Store account ownership, legal/privacy disclosures, age rating, screenshots, support URL, review notes, signing, and final device builds prepared. |

## Testable API Boundaries

| Procedure group | Authorization boundary | Purpose |
|---|---|---|
| `learnerState` | Signed-in learner | Reads and writes only the caller’s validated learning state. |
| `organizations` | Signed-in learner | Creates an organization with the caller as the first institution administrator. |
| `courses` | Organization member / manager | Lists organization courses; permits creation only for creator, educator, or institution administrator roles. |
| `media` | Organization manager | Registers a validated relative storage key and queues processing records after a lesson-scope check. |
| `moderation` | Signed-in reporter / institution administrator | Accepts reports from authenticated users; lists and resolves organization reports only for institutional administrators. |
| `operations` | Public liveness / global administrator readiness | Separates minimal public service liveness from database-sensitive readiness information. |
