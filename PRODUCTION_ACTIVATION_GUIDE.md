# LearnVerse AI — Production Activation Guide

**Purpose:** take the validated LearnVerse AI production candidate from repository-ready to a controlled public release.

**Important boundary:** the repository can be built, tested, audited, and documented here. It cannot create or verify ownership of your hosting, cloud database, storage/CDN, media processor, monitoring accounts, Apple/Google developer accounts, legal approvals, or physical devices. Do not mark a gate complete without attaching its evidence.

## 0. Release decision and evidence rule

The current code candidate is validated, but public release remains **blocked until every gate in this guide has evidence**.

Latest repository evidence:

- `pnpm install --frozen-lockfile`: passed
- TypeScript: passed
- Automated tests: **27 passed; 1 authentication test intentionally skipped** because it needs an external authentication environment
- Lint: passed
- Server and worker bundles: passed
- Expo Doctor: **18/18 passed**
- Static web export: **20 routes generated**
- Production runtime dependency audit: **0 critical, 0 high, 0 moderate, 0 low**

Create a release record with these fields before starting:

```text
Release ID:
Git/checkpoint version:
Staging URL:
Production URL:
Database provider and instance:
Object-storage bucket(s):
CDN domain:
Media processor endpoint:
Worker host and worker ID:
Monitoring workspace:
Backup owner:
Incident/on-call owner:
Legal/privacy owner:
Android build/version:
iOS build/version:
Go/no-go decision:
Evidence links:
```

Never paste secret values into chat, tickets, screenshots, or this repository.

---

## 1. Choose the deployment shape

### Recommended path: managed WebDev hosting

Use the existing LearnVerse project’s managed hosting for the web/API service. Use the platform’s **Reserved Hosting** mode for a continuously running worker if the worker and processor fit its resource limits. Use managed database and storage already attached to the project where available.

1. Open the LearnVerse project.
2. Confirm the latest checkpoint is the dependency-remediated release.
3. Configure production secrets in the hosting environment, not in `.env` files committed to Git.
4. Publish to a staging environment first.
5. Run all smoke tests in Section 8.
6. Switch to production only after the change record is approved.
7. Use Reserved Hosting for the worker if it must poll continuously. Do not rely on a sleeping development shell.

### Alternative: persistent Ubuntu host

Use this only when you need OS-level control, Docker, FFmpeg, GPU/CPU sizing, or a processor that WebDev cannot run. The host must have HTTPS termination, firewall rules, automatic restart, encrypted disks, backups, and a named owner. Install FFmpeg only from a trusted package source and keep it patched.

---

## 2. Provision production services

Provision separate production resources; do not reuse development data.

### 2.1 API/web hosting

Required:

- HTTPS with a stable hostname
- automatic restart and health checks
- request timeout and body-size limits
- structured logs with request IDs
- separate staging and production environments
- rollback to the previous known-good checkpoint

Build and start commands:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm lint
pnpm build
NODE_ENV=production node dist/index.mjs
```

The API health check is:

```bash
curl -fsS https://API_HOST/api/health
# expected: {"ok":true,"timestamp":...}
```

The service must listen on the platform-provided `PORT`. Never hard-code a public IP or expose the database directly.

### 2.2 Database

Use a managed MySQL-compatible production database because this project uses Drizzle with `mysql2`.

1. Create a production database and a separate staging database.
2. Enable encrypted connections and provider-managed backups.
3. Create a least-privilege application user; do not use the root account.
4. Restrict network access to the API/worker networks.
5. Store the connection string as `DATABASE_URL` in the hosting secret manager.
6. Run migrations from a release job, not from every API instance.
7. Record migration output and the schema version.
8. Test restore into an isolated database before launch.

Migration procedure:

```bash
pnpm db:push
```

Run this only after taking a backup and reviewing the generated migration. For a rollback, prefer rolling back application code while retaining additive schema changes; destructive schema changes require a separately approved migration.

Troubleshooting:

- **Access denied:** verify username, password, database name, TLS mode, and provider allowlist.
- **Connection timeout:** verify private-network routing/firewall and that the API host is allowed.
- **Migration already applied:** inspect the migration journal; do not delete rows manually.
- **Schema mismatch:** stop the release, restore staging from the production snapshot into an isolated database, and reproduce the migration.

### 2.3 Object storage

Use a private production bucket/container for original media, processed outputs, captions, and learner-uploaded assets.

1. Create separate staging and production buckets.
2. Disable public object listing and public write access.
3. Enable encryption at rest and object versioning where supported.
4. Set lifecycle rules for temporary uploads and failed job artifacts.
5. Configure CORS only for the approved web origin.
6. Confirm signed URLs expire and cannot be used after rights revocation.
7. Set retention and deletion rules consistent with the privacy policy.

The application uses server-side storage credentials through the configured Manus/Forge integration. Do not put storage credentials in the browser or worker.

### 2.4 CDN

A CDN is optional until traffic or geography justifies it. When enabled:

1. Point the CDN origin at the private signed-delivery path, not the database.
2. Require HTTPS.
3. Forward only required headers.
4. Do not cache private learner data or tutor responses.
5. Cache immutable processed video segments with a versioned path.
6. Configure purge/invalidation and test it.
7. Verify a revoked asset returns an authorization failure even if a previous URL existed.
8. Set `CDN_BASE_URL` in the API environment and test playback from at least two regions.

If CDN setup is delayed, use managed signed storage delivery and record `CDN: deferred — not yet justified` rather than pretending it is active.

---

## 3. Configure production secrets

Set these in the server secret manager. Use a password manager or cloud secret manager to generate values.

| Variable | Required | Purpose |
|---|---:|---|
| `NODE_ENV` | yes | Set to `production`. |
| `PORT` | platform | Listening port supplied by host. |
| `VITE_APP_ID` | yes | LearnVerse application/project identifier. |
| `JWT_SECRET` | yes | High-entropy cookie/session secret; rotate using a planned session invalidation procedure. |
| `DATABASE_URL` | yes | TLS-enabled production MySQL-compatible connection string. |
| `OAUTH_SERVER_URL` | yes | Production OAuth issuer/base URL. |
| `OWNER_OPEN_ID` | yes | Owner/operator identity for notifications and privileged owner actions. |
| `BUILT_IN_FORGE_API_URL` | yes | Managed AI/storage/notification service base URL. |
| `BUILT_IN_FORGE_API_KEY` | yes | Server-only managed service credential. |
| `CORS_ALLOWED_ORIGINS` | yes | Comma-separated exact production/staging browser origins; no wildcard in production. |
| `CDN_BASE_URL` | optional | CDN base URL after the CDN gate is approved. |
| `MEDIA_WORKER_TOKEN` | yes | Random secret of at least 32 characters shared only by API and worker. |
| `WORKER_API_BASE_URL` | worker | Public HTTPS API URL used by the worker. |
| `MEDIA_PROCESSOR_ENDPOINT` | worker | HTTPS processor endpoint. |
| `MEDIA_WORKER_ID` | worker | Stable unique worker identifier. |
| `MEDIA_WORKER_POLL_INTERVAL_MS` | worker | Usually `5000`; allowed range is 1000–60000. |

Generate a worker token without storing it in shell history:

```bash
python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(48))
PY
```

After setting secrets, verify only names and presence, never values:

```bash
for key in NODE_ENV VITE_APP_ID JWT_SECRET DATABASE_URL OAUTH_SERVER_URL OWNER_OPEN_ID BUILT_IN_FORGE_API_URL BUILT_IN_FORGE_API_KEY CORS_ALLOWED_ORIGINS MEDIA_WORKER_TOKEN; do
  test -n "${!key:-}" && echo "$key=set" || echo "$key=MISSING"
done
```

If a secret is exposed, rotate it immediately, invalidate affected sessions/tokens, inspect audit logs, and record the incident.

---

## 4. Deploy and validate the media processor

The LearnVerse worker expects an HTTPS processor with this contract:

### Request

```json
{
  "jobId": 123,
  "videoAssetId": "asset-id",
  "jobType": "transcode",
  "sourceUrl": "https://signed-source-url",
  "attempt": 1
}
```

### Successful transcode response

```json
{
  "playbackUrl": "https://cdn.example.com/video/asset-id/master.m3u8",
  "captionsUrl": "https://cdn.example.com/video/asset-id/captions.vtt",
  "durationSeconds": 742
}
```

For transcription, return the processor-specific caption/result fields agreed with the content pipeline. Always return JSON and a useful non-secret error status on failure.

Processor requirements:

- accept only HTTPS requests authenticated from the worker network or worker credential
- validate the signed source URL and content type
- enforce maximum source size, duration, and processing time
- run FFmpeg/transcription in an isolated process/container
- never execute uploaded files as programs
- write outputs to private storage using versioned keys
- return only HTTPS output URLs
- make retries idempotent by `jobId` and `attempt`
- emit structured duration, bytes, codec, captions, and failure metrics

Validation matrix:

| Test | Expected evidence |
|---|---|
| small valid transcode | playback URL and positive duration |
| captions enabled | captions URL opens and matches the media |
| invalid/oversized input | bounded failure; no worker crash |
| processor timeout | job marked failed; alert created |
| retry | no duplicate uncontrolled output; attempt increments |
| revoked source/right | processor cannot retrieve the source |
| malformed callback | API rejects it; no job state corruption |

---

## 5. Deploy the persistent worker

The repository already contains a dedicated worker and strict startup validation.

### 5.1 Worker environment

```bash
export WORKER_API_BASE_URL="https://API_HOST"
export MEDIA_WORKER_TOKEN="<secret-manager-value>"
export MEDIA_WORKER_ID="learnverse-media-worker-prod-1"
export MEDIA_PROCESSOR_ENDPOINT="https://PROCESSOR_HOST/process"
export MEDIA_WORKER_POLL_INTERVAL_MS="5000"
```

Do not use the literal placeholders.

### 5.2 Build and verify

```bash
pnpm install --frozen-lockfile
pnpm build:worker
node dist/worker.mjs
```

Startup must authenticate against:

```bash
curl -fsS -H "Authorization: Bearer $MEDIA_WORKER_TOKEN" \
  "$WORKER_API_BASE_URL/api/worker/verify"
# expected: {"authenticated":true,"service":"learnverse-media-worker"}
```

### 5.3 Managed persistent process

Configure the host to:

- run `node dist/worker.mjs`
- inject only the worker variables above
- restart on failure
- retain logs for the operational retention period
- expose no public worker port
- use a stable worker ID
- run one worker initially; scale only after queue/lease behavior is tested

### 5.4 Ubuntu systemd option

Create `/etc/systemd/system/learnverse-worker.service`:

```ini
[Unit]
Description=LearnVerse AI media worker
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=learnverse
WorkingDirectory=/opt/learnverse
EnvironmentFile=/etc/learnverse/worker.env
ExecStart=/usr/bin/node /opt/learnverse/dist/worker.mjs
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/learnverse-worker

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now learnverse-worker
sudo systemctl status learnverse-worker --no-pager
sudo journalctl -u learnverse-worker -n 100 --no-pager
```

### 5.5 Real media-processing test

1. Upload one approved test asset to the staging/private bucket.
2. Register or enqueue the asset through the authenticated creator/admin flow.
3. Confirm the job appears in queue health.
4. Confirm the worker claims it.
5. Confirm the processor creates playback and caption outputs.
6. Confirm the worker completes the job exactly once.
7. Open the signed playback URL and captions.
8. Revoke access and confirm the URL no longer authorizes playback.
9. Record job ID, worker ID, processor log ID, output URLs, duration, and timestamps.

Worker API paths:

```text
GET  /api/worker/verify
POST /api/worker/jobs/claim       body: {"workerId":"..."}
POST /api/worker/jobs/complete    body: {"workerId":"...","jobId":123,"status":"succeeded",...}
GET  /api/health
```

The worker token must never be used from a browser.

---

## 6. Monitoring, alerts, backups, and rollback

### 6.1 Minimum dashboards

Create dashboards for:

- API availability and `/api/health` latency
- 4xx/5xx rate by route
- OAuth callback failures
- database connection errors and latency
- queue depth, processing age, failure count, and stale leases
- worker restarts and processor duration
- media output failure rate
- storage/CDN 4xx/5xx and bandwidth
- tutor/AI error rate and provider latency
- CPU, memory, disk, and process restarts

### 6.2 Alerts

Start with these alerts:

| Alert | Initial threshold | Owner/action |
|---|---|---|
| API unavailable | 2 failed checks in 5 minutes | page on-call; rollback if persistent |
| 5xx spike | >2% for 10 minutes | inspect release and dependencies |
| queue age | oldest job >30 minutes | inspect worker/processor |
| stale leases | any recurring stale jobs | recover only after worker diagnosis |
| worker restarts | >3 in 15 minutes | inspect startup/config/processor |
| DB errors | any sustained connection failure | verify provider/network/secrets |
| backup failure | any failed scheduled backup | backup owner investigates same day |
| storage denial spike | unexpected rise | check signed URL, CORS, CDN, rights |

Every alert must have one named owner and one backup owner. A dashboard without routing is not monitoring.

### 6.3 Backups and restore drill

1. Enable automated encrypted database backups.
2. Enable object-storage versioning/lifecycle rules.
3. Export the migration journal and asset inventory with each release.
4. Restore the latest database backup into an isolated staging database.
5. Restore one representative media object and verify signed delivery.
6. Start the API against the isolated restore.
7. Run health, login, lesson, progress, and worker contract checks.
8. Record restore time, data-loss window, failures, and corrective actions.
9. Repeat at least quarterly and after major schema changes.

### 6.4 Rollback drill

1. Keep the previous server/worker build and release metadata.
2. Deploy the new release to staging first.
3. If production errors exceed the threshold, stop media publishing.
4. Roll the API and worker back to the previous build.
5. Do not automatically reverse additive database migrations.
6. Verify `/api/health`, authentication, lesson playback, progress sync, and queue state.
7. Notify the incident owner and record the timeline.
8. Reopen the release only after root cause and a new test are documented.

---

## 7. Security, privacy, accessibility, and content approval

### Security

Before go-live, the security owner signs off on:

- OAuth redirect allowlist and session expiration
- server-side RBAC and organization scoping
- CORS exact-origin policy
- request body and upload limits
- rate limits and abuse controls
- secret rotation and audit log access
- signed media URL expiry and revocation
- AI prompt-injection and content-grounding behavior
- dependency audit evidence from `pnpm audit --prod`
- backup encryption and restore permissions

### Privacy/legal

Publish and link the approved:

- privacy policy
- terms of service
- acceptable-use/content policy
- support and incident contact
- account deletion/export process
- retention schedule
- AI-generated-content disclosure
- educational/child-privacy disclosures applicable to the target countries and age groups

Do not copy `PRIVACY_REVIEW_DRAFT.md` directly into production. A qualified privacy/legal owner must review the deployed data flows, analytics, OAuth provider, storage, AI processing, tutor retention, moderation, and deletion behavior.

### Accessibility

On web and native builds, verify:

- keyboard navigation and visible focus
- semantic labels for all primary actions
- screen reader announcements for playback, progress, and errors
- contrast in light and dark modes
- text scaling/dynamic type
- reduced-motion behavior
- captions and transcript access
- no color-only status signals
- accessible authentication and error recovery

Attach a test record with browser/OS/device, result, issue, and owner.

### Educator/content approval

For every launch course:

- content owner and rights evidence recorded
- transcript/captions reviewed
- age/level and learning objective assigned
- quiz/checkpoint answers reviewed
- AI tutor grounding checked against the lesson
- generated assets labeled and human-reviewed
- reporting/moderation path tested
- takedown and correction process assigned

---

## 8. Physical Android/iOS QA and store release

Physical-device QA cannot be simulated by this sandbox.

### Device protocol

Use at least one supported current Android device and one supported current iPhone. Record model, OS, app version, build ID, tester, date, result, and evidence for every case in `PHYSICAL_DEVICE_QA.md`.

Run:

1. fresh install and first launch
2. light/dark/system mode persistence
3. OAuth sign-in, callback, cancel, retry, and sign-out
4. cloud sync across two sessions/devices
5. video playback, seek, chapter, transcript, caption, and background behavior
6. tutor request, offline interruption, and retry
7. offline progress queue and reconnect merge
8. VoiceOver/TalkBack, dynamic text, focus order, and contrast
9. Wi-Fi/mobile/offline transitions and background/foreground
10. haptic and reduced-motion behavior

Any crash, data loss, authorization defect, inaccessible primary action, or broken playback blocks submission.

### Store procedure

1. Confirm Android package and iOS bundle ID ownership.
2. Create signed release builds from the validated checkpoint.
3. Capture real-device screenshots and store graphics.
4. Publish the privacy-policy and support URLs.
5. Complete data-safety/privacy questionnaires from the deployed configuration.
6. Provide reviewer credentials or reviewer access steps if sign-in is required.
7. Complete age rating, content policy, user-reporting, and creator-rights disclosures.
8. Upload builds to internal testing first.
9. Complete internal test sign-off.
10. Submit to closed/beta review, then staged production rollout.
11. Monitor crash-free sessions, login success, playback, and progress sync after release.

Store submission is an external, human-controlled action. Do not submit until legal and device evidence is attached.

---

## 9. End-to-end release gate

Mark a gate **complete** only when the evidence exists:

- [ ] Production API/web host is live over HTTPS.
- [ ] Production database is isolated, backed up, migrated, and restore-tested.
- [ ] Private storage is configured with signed access, lifecycle, and deletion rules.
- [ ] CDN is active and tested, or explicitly deferred with an owner and review date.
- [ ] Media processor passes valid, invalid, timeout, retry, and rights-revocation tests.
- [ ] Persistent worker authenticates, claims, processes, and completes a real job.
- [ ] Monitoring dashboards and routed alerts are active.
- [ ] Backup restore drill is recorded.
- [ ] Rollback drill is recorded.
- [ ] Security owner signs off.
- [ ] Privacy/legal owner signs off.
- [ ] Accessibility test record has no blocking issues.
- [ ] Educator/content review is complete for launch content.
- [ ] Physical Android/iOS QA is complete where native release is in scope.
- [ ] Store review/submission evidence is complete where native release is in scope.
- [ ] Incident owner, backup owner, and release owner are named.

**Go:** all applicable boxes checked and evidence attached.

**No-go:** any unchecked critical gate, any unknown secret/backup/rollback state, or any unresolved critical/high security issue.

---

## 10. Troubleshooting quick reference

### The API starts locally but fails in hosting

- Confirm `PORT` is read from the platform.
- Confirm `NODE_ENV=production`.
- Check missing `DATABASE_URL`, OAuth, Forge, or JWT secrets.
- Check the platform health path is `/api/health`.
- Inspect startup logs for a secret/config error.

### Browser shows CORS 403

- Add the exact scheme, host, and port to `CORS_ALLOWED_ORIGINS`.
- Remove trailing slash mismatches.
- Do not use `*` with credentials.
- Retest preflight and authenticated request from the actual production origin.

### OAuth callback loops or fails

- Verify the production callback URL in the OAuth provider.
- Verify `OAUTH_SERVER_URL` and app ID.
- Verify cookies are HTTPS-compatible and the public hostname is stable.
- Test sign-in cancellation and sign-out, not only the happy path.

### Worker exits immediately

- `WORKER_API_BASE_URL` and `MEDIA_PROCESSOR_ENDPOINT` must be valid HTTPS URLs.
- `MEDIA_WORKER_TOKEN` must be at least 32 characters and match the API secret exactly.
- Confirm the worker host can reach the API and processor over HTTPS.
- Run the `/api/worker/verify` curl check.

### Worker polls but no job completes

- Check queue health and database connectivity.
- Confirm the worker ID is stable and unique.
- Confirm the processor receives the signed source URL and returns JSON.
- Check that transcode responses include `playbackUrl` and positive `durationSeconds`.
- Check job lease expiry and do not run repeated recovery while the worker is healthy.

### Media playback is forbidden or stale

- Verify the user/org/course rights check.
- Verify the object is marked processed.
- Check signed URL expiry and CDN cache invalidation.
- Confirm the CDN origin is not public and is using the approved host.

### Database migration fails

- Stop the release and preserve the error output.
- Check the backup and migration journal.
- Reproduce in staging with a restored snapshot.
- Do not delete migration records or manually edit production tables to bypass the migration.

### Mobile build works in Expo but fails on a device

- Build from the exact validated checkpoint.
- Check native permissions, bundle/package identifiers, OAuth callback scheme, and release configuration.
- Repeat the physical-device protocol on a clean install.
- Capture the device model, OS, build ID, and crash log before changing code.

### Store review rejects the app

- Compare the rejection reason with the privacy, age-rating, user-generated-content, and authentication declarations.
- Provide reviewer access steps that actually work.
- Fix the stated issue, rebuild, rerun device QA, and resubmit with updated evidence.

---

## 11. After launch

For the first 24 hours:

- watch API, login, playback, progress sync, tutor, and worker dashboards
- review error and moderation queues at least every operating interval
- confirm backups succeed
- keep the previous release available for rollback
- record incidents and user-impact windows
- do not enable broad CDN caching or new AI/media features without a change record

For the first 30 days:

- complete one restore drill and one rollback rehearsal if not already done in staging
- review dependency audit and rotate secrets according to policy
- review accessibility and educator-content feedback
- decide whether CDN, realtime study rooms, billing, and additional workers are justified by measured demand
