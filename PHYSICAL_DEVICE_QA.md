# LearnVerse AI Physical Device QA Protocol

## Purpose

This protocol is executed on at least one current Android device and one current iPhone after the final managed build is available. Each case should record the operating-system version, device model, build version, result, evidence, and owner. A failed critical case blocks store submission.

| Area | Android validation | iOS validation | Expected result |
|---|---|---|---|
| First launch | Install fresh build; complete initial navigation. | Install fresh build; complete initial navigation. | No crash, clipped safe-area content, or inaccessible action. |
| Appearance | Select system, light, and dark in Profile. Restart the app. | Select system, light, and dark in Profile. Restart the app. | Preference persists; system option follows the device setting. |
| Authentication | Start sign-in, cancel, retry, return to app, and sign out. | Start sign-in, cancel, retry, return to app, and sign out. | Correct callback, no stuck loading state, and local state remains coherent. |
| Cloud sync | Create a learning event, sign in, reopen app, then refresh. | Repeat on a second device with the same account. | Protected state merges without losing the furthest progress or duplicating events. |
| Video learning | Start, pause, seek, open a chapter, review transcript, answer check. | Repeat with silent switch enabled and with headphones. | Playback controls remain usable; progression and feedback are correct. |
| Tutor | Ask a lesson-contextual question and simulate a network interruption. | Repeat with a question outside the supplied lesson context. | Clear loading, source-limit, and retry feedback. |
| Accessibility | Test VoiceOver/TalkBack labels, dynamic text, focus order, and contrast. | Repeat with larger system text. | Primary actions and learning controls remain understandable and reachable. |
| Network resilience | Switch Wi-Fi/mobile data/offline during sync and playback. | Repeat with background/foreground transitions. | No data corruption; status explains retry or local-only behavior. |

## Evidence and Exit Criteria

Capture screenshots or short recordings for any failed case. Resolve all crashes, authorization defects, playback failures, data-loss risks, and inaccessible primary actions before submission. Document accepted non-critical issues with a mitigation and target release.
