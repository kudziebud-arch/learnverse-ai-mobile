# LearnVerse Media Worker Deployment

## Purpose

The LearnVerse media worker is a separate, authenticated process that polls the protected worker API, receives a short-lived signed source URL for one media job, dispatches that job to a configured media processor, and reports the result. The worker is intentionally separate from the learner-facing API so that media CPU, memory, and retry behavior cannot degrade learner requests.

## Deployment Choices

| Approach | Tradeoffs | Cost | Setup complexity |
|---|---|---:|---|
| Managed always-on application process | The simplest integrated deployment for a small, deterministic worker. It is suitable while the processor runs remotely and the worker only orchestrates jobs. | Depends on managed hosting usage. | Low |
| Container/virtual machine worker | Supports custom transcoding binaries, direct processor execution, custom networking, and independently scaled resources. | Depends on chosen infrastructure. | Medium to high |

The worker package is prepared for either approach. Do not run it in a transient development shell or inside the learner API process.

## Required Environment

| Variable | Required value | Purpose |
|---|---|---|
| `WORKER_API_BASE_URL` | Public HTTPS URL of the LearnVerse API | Location of the authenticated worker control endpoints. |
| `MEDIA_WORKER_TOKEN` | Existing server-side worker secret | Authenticates claim and completion requests. |
| `MEDIA_PROCESSOR_ENDPOINT` | Public HTTPS endpoint of the transcoding/transcription processor | Receives one bounded job with a signed source URL. |
| `MEDIA_WORKER_ID` | Stable worker instance identifier | Enables job leases and operational traces. |
| `MEDIA_WORKER_POLL_INTERVAL_MS` | Optional value between 1,000 and 60,000 | Controls idle queue polling frequency. |

## Start Procedure

Build the worker with `pnpm build:worker` and run it with `pnpm start:worker` in the selected persistent environment. The worker verifies its server credential before claiming work. A production start failure is expected when the API URL, worker token, or processor endpoint is not configured; this is deliberate and prevents an unauthenticated or misdirected worker from operating.

## Processor Contract

The worker sends a `POST` request to the processor with `jobId`, `videoAssetId`, `jobType`, `sourceUrl`, and `attempt`. The processor must return JSON. For `transcode`, it must return a `playbackUrl` and `durationSeconds`; it may return a `captionsUrl`. Processor inputs must remain bounded by a source-size policy, timed out deterministically, and treated as untrusted media.

## Operations

Use the administrator media queue health endpoint to monitor queued, running, failed, and stale jobs. The recovery operation returns jobs with expired leases to the queue and sends a project-owner notification. A failure reported by the worker also creates an owner notification. Investigate recurring failures before repeatedly retrying the same input.
