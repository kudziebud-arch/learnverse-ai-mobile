# LearnVerse AI Operations Runbook

## Managed Media Delivery

LearnVerse uses managed signed object storage for server-authorized media access. A learner requests playback through the protected media API, which verifies organization membership, processed-media status, and rights clearance before returning a short-lived storage URL. The native client never receives storage credentials.

| Component | Responsibility | Primary control |
|---|---|---|
| Managed storage | Holds source/output media assets and returns signed access URLs. | Storage credentials remain server-side. |
| Media worker | Claims a queued job, processes one bounded task, and reports completion. | Bearer worker credential, job lease, and worker ID. |
| Queue monitor | Reports queued/running/failed state and stale worker leases. | Administrator-only operational API. |
| Recovery path | Requeues jobs with expired worker leases. | Administrator recovery action plus owner notification. |
| Incident channel | Delivers media failure and recovery alerts. | Built-in project-owner notification service. |

## Worker Deployment Procedure

Run the dedicated media worker in a persistent server environment. It should authenticate with the stored `MEDIA_WORKER_TOKEN`, call the claim endpoint, process only the claimed media job, and call the completion endpoint exactly once. The worker must never receive general user credentials or database credentials. It should enforce bounded source sizes, timeouts, retry limits, and content-type validation.

The current application contains the worker control plane, but heavy transcoding and transcription must be performed by a separately deployed worker process. Attach a CDN only when the media volume, geographic distribution, or delivery-performance requirement justifies a provider-managed distribution domain; until then, managed signed delivery remains the secure default.

## Incident Response

| Severity | Example | First response | Escalation |
|---|---|---|---|
| Critical | Authentication compromise, data exposure, or broad authorization bypass. | Restrict access, preserve evidence, rotate affected credentials, and assess impact. | Security owner and incident lead immediately. |
| High | Media worker failures block a substantial course release. | Inspect queue health, recover expired jobs, and suspend affected publishing. | Product and platform owner within the incident window. |
| Medium | A bounded lesson asset fails processing. | Review error detail, retry under a new lease, and notify the content owner. | Media operations owner. |
| Low | Minor copy, metadata, or non-blocking processing issue. | Log, prioritize, and schedule repair. | Product backlog owner. |

## Backup and Recovery Checklist

Before public launch, configure managed database backups, restore verification, object-storage versioning where appropriate, and a written recovery-time objective. Test restoration into an isolated staging environment before relying on the plan. Keep the database migration journal, asset inventory, deployment version, and incident timeline available to the response owner.
