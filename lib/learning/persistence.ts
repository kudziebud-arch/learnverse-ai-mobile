import { initialLearnerState } from "./progress";
import type { LearnerState } from "./types";

export const LEARNER_STATE_KEY = "learnverse:learner-state:v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function normalizeLearnerState(value: unknown): LearnerState {
  if (!isRecord(value)) return initialLearnerState;

  const lessonProgress: Record<string, number> = {};
  if (isRecord(value.lessonProgress)) {
    Object.entries(value.lessonProgress).forEach(([lessonId, seconds]) => {
      if (typeof seconds === "number" && Number.isFinite(seconds) && seconds >= 0) {
        lessonProgress[lessonId] = seconds;
      }
    });
  }

  const completedLessonIds = Array.isArray(value.completedLessonIds)
    ? value.completedLessonIds.filter((id): id is string => typeof id === "string")
    : [];
  const answeredQuestionIds = Array.isArray(value.answeredQuestionIds)
    ? value.answeredQuestionIds.filter((id): id is string => typeof id === "string")
    : [];
  const reviewedFlashcardIds = Array.isArray(value.reviewedFlashcardIds)
    ? value.reviewedFlashcardIds.filter((id): id is string => typeof id === "string")
    : [];
  const quizAttempts = Array.isArray(value.quizAttempts)
    ? value.quizAttempts.flatMap((attempt) => {
        if (!isRecord(attempt) || typeof attempt.id !== "string" || typeof attempt.lessonId !== "string" || typeof attempt.correct !== "boolean" || typeof attempt.occurredAt !== "string") return [];
        return [{
          id: attempt.id,
          lessonId: attempt.lessonId,
          questionId: typeof attempt.questionId === "string" ? attempt.questionId : `legacy-${attempt.id}`,
          correct: attempt.correct,
          occurredAt: attempt.occurredAt,
        }];
      })
    : [];
  const events = Array.isArray(value.events)
    ? value.events.flatMap((event) => {
        if (!isRecord(event) || typeof event.id !== "string" || typeof event.type !== "string" || typeof event.occurredAt !== "string") return [];
        return [{
          id: event.id,
          type: event.type as LearnerState["events"][number]["type"],
          lessonId: typeof event.lessonId === "string" ? event.lessonId : undefined,
          concept: typeof event.concept === "string" ? event.concept : undefined,
          occurredAt: event.occurredAt,
        }];
      })
    : [];

  return { lessonProgress, completedLessonIds, answeredQuestionIds, quizAttempts, reviewedFlashcardIds, events };
}
