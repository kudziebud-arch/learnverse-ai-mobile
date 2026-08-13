# LearnVerse CDN Activation

## Current Secure Default

LearnVerse currently serves cleared media through **managed signed delivery**. The protected playback endpoint checks organization access, media processing status, and rights status before issuing access. This remains the correct default until a delivery domain and cache policy are managed outside the app.

## CDN Activation Gate

Enable a CDN only after the media team has a delivery domain, an origin-storage policy, cache invalidation ownership, HTTPS configuration, and a response plan for access or rights revocation. Set `CDN_BASE_URL` only after this operational review is complete. The API uses a CDN playback URL only if a processed asset URL begins with that configured base URL; otherwise it preserves managed signed delivery.

| Check | Required evidence |
|---|---|
| Domain | A dedicated HTTPS media domain owned by the organization. |
| Origin | Private object storage origin with no public write credentials in client software. |
| Access | Short-lived signed CDN URLs/cookies or an equivalent authorization policy. |
| Cache | Explicit manifest, segment, caption, thumbnail, and revocation/invalidation policy. |
| Observability | Delivery errors, cache status, latency, and origin-failure alerts visible to an operations owner. |
| Rights | Media takedown and access-revocation procedure tested end to end. |

## Rollback

If CDN delivery fails or a rights issue requires an immediate stop, remove or disable `CDN_BASE_URL`, invalidate the affected paths at the CDN, mark the asset restricted or rejected, and return the app to managed signed delivery for unaffected cleared media.
