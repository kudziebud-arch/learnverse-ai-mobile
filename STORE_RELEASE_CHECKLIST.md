# LearnVerse AI Store Release Checklist

## Android and iOS Build Preparation

The managed project must be checkpointed before the final release build is initiated. Confirm that the display name, bundle identifiers, icon, splash asset, portrait orientation, deep-link scheme, and privacy text in `app.config.ts` match the intended store listing.

| Item | Owner evidence |
|---|---|
| Signing and ownership | Confirm ownership of the Android and iOS developer accounts and the production bundle identifiers. |
| Store assets | Provide final icons, screenshots from real devices, feature graphics where applicable, support email, privacy-policy URL, and product description. |
| Account review | Supply a test account or precise reviewer access steps if any core learning experience requires sign-in. |
| Privacy | Complete each store’s current data collection/disclosure forms based on the actual production configuration. |
| Content policy | Confirm age rating, learner reporting process, moderation path, creator rights workflow, and user-generated-content review. |
| Native QA | Test login callback, video playback, caption display, Picture-in-Picture, background/foreground behavior, network loss, logout, and local/cloud progress merge on physical Android and iOS devices. |
| Rollback | Retain the prior signed build and document how an API or app release is rolled back. |

## Publish Boundary

Publishing is intentionally a human-controlled release action. After the final production checkpoint, use the project interface’s **Publish** control to trigger the managed build process, then complete store submission from the appropriate developer accounts.
