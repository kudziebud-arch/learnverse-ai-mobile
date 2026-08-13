# LearnVerse AI Security Plan

## Security Boundary

The mobile application is an untrusted client. It may render authorized content and retain encrypted operating-system-managed credentials, but it must never contain database credentials, object-store secrets, long-lived provider keys, signing keys, or AI provider credentials.

| Risk area | Required control |
|---|---|
| Identity | OAuth/OIDC, short-lived access tokens, refresh-token rotation, optional MFA, and account-recovery verification. |
| Authorization | Server-side RBAC and organization scope checks on every data path; clients do not decide entitlements. |
| API abuse | Schema validation, rate limits, payload limits, idempotency keys for mutations, threat-aware logging, and abuse monitoring. |
| Media | Scoped upload URLs, entitlement-gated manifests, content ownership checks, and object keys that are not guessable. |
| AI | Server-only provider access, request quotas, content grounding, safety policy, prompt-injection resistance, and usage/audit tracking. |
| Data | Encryption in transit and at rest, encrypted device credential storage, minimal analytics collection, retention controls, and deletion workflows. |
| Generated content | Clear generated-content labels, human review for publication, model/version provenance, and report/appeal mechanisms. |
| Code execution | Student code runs only in a hardened isolated execution service, never in the API process or mobile client. |

## Security Delivery Gates

Each feature requires tests for authorization boundaries and input validation before release. Privileged operations create immutable audit entries. Secrets are set through the hosting environment, rotated operationally, and never committed to source control. Media or AI processing that is expensive or attacker-controlled runs in bounded background workers rather than the request path.
