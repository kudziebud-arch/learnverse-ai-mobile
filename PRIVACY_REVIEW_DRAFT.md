# LearnVerse AI Privacy and Review Draft

## Plain-Language Privacy Summary

LearnVerse AI stores learning activity on the device. When a learner chooses to sign in, the app synchronizes the learner’s progress, learning interactions, and account identity with the protected LearnVerse service. Learning content, course information, media-processing records, organization membership, moderation reports, and audit events are retained only for their relevant platform purpose.

The AI tutor receives the learner’s question and the supplied lesson context required to answer it. The app presents source limitations when the supplied lesson material does not fully support a tutor answer. The mobile client does not contain database credentials, storage credentials, AI provider credentials, or media-worker secrets.

## Data Review Inventory

| Data category | Purpose | Stored on device | Stored when signed in | User-facing control |
|---|---|---:|---:|---|
| Account identity | Authentication and learner record ownership | Secure session reference | Protected account record | Sign out on device. |
| Learning progress | Resume lessons, calculate progress, and provide review context | Yes | Yes | Reset local learning state. |
| Tutor questions | Provide a lesson-contextual response | Transient interaction view | Service processing/audit policy dependent | Learner chooses each question. |
| Course and media metadata | Deliver authorized learning materials | Cached as needed | Yes | Access governed by course and organization authorization. |
| Moderation reports | Keep the learning environment safe | No | Yes | Authenticated reporting route. |
| Operational records | Diagnose security, media, and platform incidents | No | Yes | Restricted to authorized operations staff. |

## Review Submission Notes

Do not submit this draft unchanged. Before store submission, verify the current store privacy questionnaire against the deployed services, analytics configuration, authentication provider, media pipeline, and support process. Provide a current privacy-policy URL, support contact, account-deletion process, and reviewer sign-in steps when authentication is enabled.
