# LearnVerse AI API Contract

## API Principles

The production API is versioned at `/api/v1`, uses OAuth access tokens, validates all input with shared schemas, and returns a stable error envelope. Mobile endpoints are optimized for task completion, while web dashboards and internal workers may call broader domain services.

| Category | Example endpoints | Mobile responsibility |
|---|---|---|
| Discovery | `GET /discover`, `GET /search`, `GET /search/semantic` | Show content and concept results with empty, loading, and error states. |
| Learning | `GET /courses/:id`, `GET /lessons/:id`, `POST /progress/events` | Render lesson content and record deliberate learning events. |
| Media | `POST /media/upload-intents`, `GET /videos/:id/playback` | Request authorization; never expose storage credentials. |
| Practice | `POST /quizzes/:id/attempts`, `POST /flashcards/:id/reviews` | Submit user answers and render returned feedback. |
| Tutor | `POST /ai/tutor/answers` | Send explicit tutor context and display evidence/citation state. |
| Learner records | `GET /progress/overview`, `GET /learning-path`, `GET /study/reviews` | Show verified learner state rather than invented metrics. |
| Operations | `POST /reports`, `GET /notifications`, `PATCH /notification-settings` | Surface reporting and opt-in notification controls. |

## Error Envelope

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "The request limit has been reached. Please try again later.",
    "requestId": "req_...",
    "retryAfterSeconds": 60
  }
}
```

The mobile client maps errors to explicit **loading**, **empty**, **offline**, **unauthorized**, **forbidden**, **rate-limited**, and **retryable error** views. It does not silently substitute invented content when a platform request fails.

## Tutor Request Contract

```json
{
  "question": "Why does this loop stop?",
  "locale": "en",
  "context": {
    "lessonId": "lesson_...",
    "videoId": "video_...",
    "timestampSeconds": 522,
    "courseId": "course_...",
    "transcriptSegmentIds": ["segment_..."],
    "learnerGoalId": "goal_..."
  }
}
```

The response returns `answer`, `groundingStatus`, `citations`, `suggestedPractice`, and `safetyNotice` fields. If course material is insufficient, `groundingStatus` must indicate that limitation.
