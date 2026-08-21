# LearnVerse AI Industry and Education Readiness Roadmap

## Executive Status

The current LearnVerse release is **validated for controlled staging**, not yet an unconditional public-production release. The browser-first web experience is implemented and validated with responsive route screenshots, a static web export, TypeScript, lint, automated tests, and server/worker builds. The learning foundation includes lesson discovery, video learning, chapters, transcripts, checkpoints, flashcards, AI tutoring interfaces, Learning Hub planning and retention tools, local persistence, offline progress queueing, account-aware cloud synchronization, RBAC-aware server contracts, media-job contracts, and operational documentation.

The remaining work falls into four categories: **external infrastructure activation, unfinished enterprise workflows, compliance and operational ownership, and final release validation**. The table below separates work that must be done by you or your organization from work that can be completed by engineers, DevOps, security specialists, legal counsel, QA testers, and education-content owners.

## Decision First: Web-Only or Web Plus Native

Because the current product was originally structured as a mobile application but now has a browser-first web experience, decide which release target is primary.

| Release target | What must be completed | What can be deferred |
|---|---|---|
| Web-only education product | Production web hosting, domain/HTTPS, OAuth callback configuration, database, media pipeline, monitoring, privacy/compliance, accessibility, security testing, support process, and pilot rollout. | Apple/Google store submission and physical mobile-device QA can be deferred. |
| Web plus Android/iOS | Everything in the web-only column, plus signed native builds, physical Android/iOS QA, store metadata, developer-account review, signing, and store submission. | Nothing in the web-only column should be skipped. |

For the fastest education launch, use **web-only controlled pilot first**, then activate native stores after the web product has real learner usage and stable operations.

## What Is Already Implemented

The project already contains protected account-aware learner synchronization, server-side validation and authorization boundaries, organization and role data models, media processing job records, a separate authenticated worker package, signed media-delivery controls, offline local learning state, a browser-first navigation layout, dark/light/system appearance preferences, branded learning UI, deterministic automated tests, production runbooks, privacy/store drafts, and a successful static web export with the documented routes.

These capabilities are foundations. They are not proof that the external production services, legal policies, support team, or operating procedures are active.

## Critical Gates Still Required

### 1. Choose the production web environment and ownership

**Owner:** You as product/business owner, with a DevOps engineer.

**Steps:**

1. Choose the production web host or managed deployment environment.
2. Register or select the education product domain, such as `learnverse.ai` or an institutional subdomain.
3. Enable HTTPS and redirect all HTTP traffic to HTTPS.
4. Create separate environments named development, staging, and production.
5. Restrict production deployments to reviewed checkpoints and named administrators.
6. Define who owns product decisions, infrastructure, security incidents, learner support, content approval, and emergency rollback.
7. Write the production URLs into the OAuth, CORS, privacy, support, and store configurations.

**Evidence required:** A live staging URL, a production domain plan, HTTPS verification, environment ownership list, deployment permissions, and a rollback procedure.

### 2. Activate the production database

**Owner:** DevOps or backend engineer; database administrator for an institution-scale deployment.

**Steps:**

1. Provision a managed PostgreSQL or MySQL database matching the configured Drizzle dialect.
2. Apply the reviewed migration journal to staging first.
3. Seed only approved course and organization data; do not use unreviewed test learner data in production.
4. Restrict database network access to the API and migration process.
5. Store `DATABASE_URL` only in the server environment.
6. Enable encrypted connections and credential rotation.
7. Run learner-state sync, organization creation, course access, moderation, and media-job tests against staging.
8. Promote the migration to production only after staging validation.

**Evidence required:** Migration output, schema version, staging test report, production connection test, access-control review, and database owner approval.

### 3. Configure real authentication and account recovery

**Owner:** Backend engineer and identity/OAuth administrator.

**Steps:**

1. Create the production OAuth application with the selected identity provider.
2. Register the exact web callback URL, for example `https://your-domain.example/api/oauth/callback`.
3. If native apps are retained, register the native deep-link scheme and platform callback values separately.
4. Configure the production app ID, portal URL, server URL, and API base URL.
5. Test first-time sign-in, cancellation, retry, callback return, session restoration, logout, and account recovery.
6. Confirm that no token or personal data is written to logs.
7. Add a support route for account deletion and account-access problems.

**Evidence required:** Successful staging login/callback records, a tested recovery procedure, callback allowlist, and support contact.

### 4. Deploy the real media pipeline

**Owner:** Media-platform engineer or DevOps engineer; content operations owner.

The current code contains the queue and worker control plane, but a real production processor is still required.

**Steps:**

1. Choose a media-processing provider or deploy a persistent worker on a managed VM/container platform.
2. Provide the worker with only the required `MEDIA_WORKER_TOKEN` and object-storage credentials. Never provide user credentials or unrestricted database credentials.
3. Connect secure object storage for source videos, processed outputs, thumbnails, transcripts, and captions.
4. Implement or activate transcoding to the supported web playback formats, normally HLS or a browser-compatible MP4 fallback.
5. Implement transcription and caption generation with a provider appropriate for the target languages.
6. Enforce file-size limits, MIME validation, timeouts, bounded retries, dead-letter handling, and rights-state checks.
7. Process one test lesson from upload through transcode, caption generation, signed playback, failure, retry, and revocation.
8. Confirm that a learner cannot access an unprocessed, unauthorized, or rights-revoked asset.

**Evidence required:** A processed test asset, caption file, playback test, failure/retry record, revoked-rights test, worker claim/completion logs, and cost estimate.

### 5. Decide whether to activate a CDN

**Owner:** DevOps or platform engineer.

A CDN is not automatically required for the first small pilot if signed object-storage delivery is fast and geographically appropriate. It becomes important when media traffic, geography, or latency justifies it.

**Steps:**

1. Measure media startup time, buffering, bandwidth cost, and learner geography in staging.
2. Select a CDN only if the measurements justify it.
3. Configure the CDN origin to the protected media output, not the raw source bucket.
4. Preserve short-lived signed URLs or signed cookies.
5. Configure cache invalidation for revoked or replaced media.
6. Test unauthorized access, cache leakage, expired signatures, and rollback to direct signed storage.

**Evidence required:** Performance comparison, signed-delivery test, invalidation test, security test, and rollback result.

### 6. Finish enterprise roles and workflows

**Owner:** Product manager and full-stack engineer.

The current server has role-aware boundaries, but a complete company or education product still needs user-facing workflows for the roles below.

| Workflow | Remaining product work |
|---|---|
| Institution administrator | Organization setup, domain/invite management, learner roster, role assignment, policy controls, reports, and audit review. |
| Educator | Course authoring, lesson upload, transcript/caption review, assignments, cohorts, learner progress, and feedback. |
| Creator | Creator profile, rights confirmation, publishing workflow, content versioning, and revenue/contract metadata if applicable. |
| Learner | Enrollment, course completion, certificates, exportable portfolio, accessibility preferences, and support/reporting. |
| Moderator | Report queue, evidence review, resolution actions, escalation, and immutable audit history. |
| Administrator | System health, queue recovery, abuse controls, user support tools, and emergency disable/rollback controls. |

**Evidence required:** Role-by-role acceptance tests, UI access tests, API authorization tests, audit-log examples, and a documented approval workflow.

### 7. Decide and implement collaboration and monetization scope

**Owner:** Product owner, finance/legal advisor, full-stack engineer.

These are not safe to simulate for an industry release.

**Steps:**

1. Decide whether the first release is free pilot, institution-paid, subscription, seat-based, or marketplace-based.
2. Obtain legal and finance approval for pricing, invoices, refunds, taxes, cancellation, and education procurement.
3. If billing is required, select a payment provider and implement server-side subscription/entitlement checks, webhook verification, and refund handling.
4. If classrooms or study rooms are required, define membership, moderation, message retention, reporting, and abuse controls before adding real-time collaboration.
5. Load-test collaboration and notification delivery before making them part of a paid promise.

**Evidence required:** Approved pricing and terms, tested entitlement rules, verified payment webhooks, refund test, or a signed decision that the pilot is free and collaboration is out of scope.

### 8. Complete AI safety, cost, and quality controls

**Owner:** AI engineer, security lead, product owner, and curriculum reviewer.

**Steps:**

1. Set per-user, per-organization, and global AI quotas.
2. Configure cost alerts and a hard spending ceiling.
3. Keep AI credentials server-side only.
4. Test prompt injection, data exfiltration attempts, irrelevant questions, unsafe content, fabricated citations, and requests outside lesson context.
5. Require the tutor to state when the supplied lesson context is insufficient.
6. Create an escalation route for harmful or incorrect educational guidance.
7. Have subject-matter educators review a sample of tutor and note outputs.
8. Define what learning evidence is stored, how long it is retained, and how a learner can request deletion.

**Evidence required:** Safety test report, cost dashboard, quota behavior, reviewed output sample, escalation process, and retention/deletion decision.

### 9. Configure security, privacy, and education compliance

**Owner:** Security engineer and qualified legal/privacy counsel; not only a developer.

The exact legal requirements depend on country, age group, school use, and business model. Obtain formal legal advice before launch.

**Steps:**

1. Publish a privacy policy at the production domain.
2. Prepare terms of use, acceptable-use rules, cookie/analytics disclosures, and support contact details.
3. Decide whether children or minors can use the service. If yes, complete the appropriate child-safety, parental-consent, age-assurance, and data-minimization review.
4. For school deployments, review FERPA, COPPA, GDPR/UK GDPR, local education rules, data-processing agreements, and institutional procurement requirements as applicable.
5. Document data categories: account identity, learner progress, AI prompts, media, diagnostics, support tickets, and analytics.
6. Define retention, deletion, export, correction, and account-closure workflows.
7. Complete dependency scanning, secret scanning, rate limiting, abuse protection, authorization review, and penetration testing.
8. Review creator rights, uploaded content ownership, takedown handling, and moderation escalation.

**Evidence required:** Approved legal documents, data map, retention schedule, deletion test, DPA or institutional agreement where required, security review, penetration-test report, and incident contacts.

### 10. Configure monitoring, backups, alerts, and incident response

**Owner:** DevOps/SRE lead and named incident owner.

**Steps:**

1. Send server, worker, and browser error events to centralized logging.
2. Track API latency/error rate, authentication failures, database readiness, queue depth, stale leases, processing failures, storage errors, AI usage, and web uptime.
3. Configure alerts with severity levels and a real human recipient.
4. Configure managed database backups, retention, object-storage versioning where appropriate, and restore protection.
5. Restore the database into isolated staging and verify learner progress, organization membership, and media-job records.
6. Define recovery-time and recovery-point objectives.
7. Run a tabletop incident exercise for authentication compromise, data exposure, media outage, database failure, and harmful content.
8. Keep the previous production build and migration rollback instructions available.

**Evidence required:** Dashboards, alert test messages, backup policy, restore report, incident exercise notes, RTO/RPO decision, and named on-call schedule.

### 11. Perform complete web QA

**Owner:** QA lead, accessibility tester, and product owner.

**Steps:**

1. Test the deployed staging domain in current Chrome, Safari, Firefox, and Edge.
2. Test desktop widths and narrow browser widths.
3. Test Home, Explore, Practice, AI Tutor, Profile, Learning Hub, Learning Path, Progress, valid lesson routes, OAuth callback, and not-found behavior.
4. Test search, filters, buttons, lesson launch, chapters, transcript, notes, checkpoint answers, flashcards, completion, theme preference, offline queueing, and reconnect sync.
5. Test keyboard navigation, visible focus, screen-reader labels, contrast, reduced motion, zoom, and larger text.
6. Test slow network, failed network, expired session, server error, and empty-state behavior.
7. Record each result with browser, operating system, build/version, screenshot, severity, owner, and disposition.

**Evidence required:** Completed web QA matrix with no unresolved critical or high-severity defects.

### 12. Complete native QA only if mobile remains a release target

**Owner:** QA lead with one current Android device and one current iPhone.

**Steps:**

1. Generate fresh signed builds from the final checkpoint.
2. Install clean builds on real devices.
3. Test first launch, light/dark/system appearance, authentication, cloud sync, video, captions, tutor, offline/reconnect, accessibility, background/foreground, and logout.
4. Record device model, OS, build, result, evidence, and issue disposition.
5. Block store submission on any crash, data loss, authorization bypass, broken callback, unusable playback, or inaccessible primary action.

If the product is intentionally web-only, mark native release as deferred and do not advertise native availability.

**Evidence required:** Completed physical-device QA record and signed-build identifiers.

### 13. Prepare education content and pilot operations

**Owner:** Curriculum lead, educator reviewer, customer-success owner, and product owner.

**Steps:**

1. Define the first target learner group, subject, age range, language, and learning outcomes.
2. Have educators review every starter course, transcript, caption, checkpoint, flashcard, and AI-grounding source.
3. Add enough approved content for a meaningful pilot; one starter course is a technical demo, not an industry catalog.
4. Define enrollment, teacher onboarding, learner support, feedback collection, and escalation.
5. Recruit a small pilot institution or cohort.
6. Establish success metrics: activation, lesson completion, practice completion, retention, support incidents, AI cost per active learner, and learning-outcome evidence.
7. Run the pilot in staging or a controlled production tenant before broad launch.

**Evidence required:** Content approval record, pilot agreement, support workflow, KPI dashboard, learner feedback, and go/no-go review.

### 14. Complete web launch and rollback

**Owner:** Product owner and DevOps release manager.

**Steps:**

1. Create the final production checkpoint after all staging gates pass.
2. Review environment variables, domain, OAuth callbacks, database, media, monitoring, privacy links, support links, and build version.
3. Publish the web build using the managed project release flow.
4. Run smoke tests against the production URL.
5. Invite the pilot cohort gradually rather than opening broad access immediately.
6. Monitor errors, latency, media processing, sign-ins, and support requests for the first release window.
7. Keep the previous web build and rollback instructions ready.
8. Hold a formal launch review and record accepted risks.

**Evidence required:** Production smoke-test report, release version, monitoring confirmation, pilot invite record, and signed go/no-go decision.

## Recommended Execution Order

The safest order is: first choose web-only versus web-plus-native; then activate staging infrastructure; then configure authentication and database; then deploy media processing; then finish enterprise workflows and compliance; then configure monitoring and backups; then run web QA; then run the education pilot; and only after stable pilot evidence, activate broader production access or native store release.

Do not begin a public marketing launch before the database restore drill, media test, OAuth callback test, security review, privacy review, monitoring alerts, support ownership, and web QA are complete.

## Go/No-Go Standard

### No-go if any of the following is true

The media worker is not processing real assets; signed playback can be bypassed; backups have not been restored successfully; no human owns incidents; OAuth callbacks are unverified; production privacy and support links are missing; critical authorization or data-loss defects remain; the target learner content has not been educator-reviewed; or the web staging QA matrix is incomplete.

### Go for a controlled education pilot when

The production-like staging environment is isolated, the first approved course is available, authentication and learner-state sync work, real media processing and captions work, backups and monitoring are tested, privacy/support documents are published, educator reviewers approve the content, and a named team can respond to incidents.

### Go for broad industry use when

All controlled-pilot criteria pass, enterprise role workflows are complete for the promised customer type, compliance and contracts are approved, security and accessibility reviews are complete, operational ownership is staffed, costs are understood, and pilot evidence supports the claimed learning outcomes.

## Final Ownership Table

| Role | Main responsibility before launch |
|---|---|
| Product/business owner | Choose release scope, fund services, assign owners, approve risk, and sign go/no-go. |
| DevOps/SRE | Hosting, domain, HTTPS, database, worker, storage, monitoring, backups, alerts, and rollback. |
| Backend engineer | OAuth, database migrations, API authorization, sync, media controls, quotas, and rate limits. |
| Media engineer | Transcoding, transcription, captions, storage, signed delivery, retries, and rights revocation. |
| Security engineer | Threat model, dependency/secret review, penetration testing, abuse controls, and incident plan. |
| Privacy/legal counsel | Privacy policy, education compliance, contracts, retention, consent, rights, and terms. |
| QA/accessibility tester | Browser matrix, device testing if applicable, accessibility, resilience, and evidence capture. |
| Curriculum/education lead | Content quality, learning outcomes, captions, assessments, educator review, and pilot success measures. |
| Support/on-call owner | Learner support, incident response, escalation, communications, and service-level expectations. |

## Source Documents

This roadmap is based on the project’s current [`INDUSTRY_RELEASE_HANDOFF.md`](./INDUSTRY_RELEASE_HANDOFF.md), [`PRODUCTION_READINESS.md`](./PRODUCTION_READINESS.md), [`OPERATIONS_RUNBOOK.md`](./OPERATIONS_RUNBOOK.md), [`PHYSICAL_DEVICE_QA.md`](./PHYSICAL_DEVICE_QA.md), [`STORE_RELEASE_CHECKLIST.md`](./STORE_RELEASE_CHECKLIST.md), [`SECURITY.md`](./SECURITY.md), [`PRIVACY_REVIEW_DRAFT.md`](./PRIVACY_REVIEW_DRAFT.md), and [`ADDITIVE_REQUIREMENTS_GAP.md`](./ADDITIVE_REQUIREMENTS_GAP.md).
