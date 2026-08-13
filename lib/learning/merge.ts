import type { LearnerState } from "./types";

export function mergeLearnerState(local: LearnerState, remote: LearnerState): LearnerState {
  const unique = (values: string[]) => [...new Set(values)];
  function uniqueRecords<T extends { id: string }>(values: T[]) {
    return [...new Map(values.map((value) => [value.id, value])).values()];
  }
  const lessonProgress = { ...remote.lessonProgress };
  Object.entries(local.lessonProgress).forEach(([lessonId, seconds]) => {
    lessonProgress[lessonId] = Math.max(lessonProgress[lessonId] ?? 0, seconds);
  });
  return {
    lessonProgress,
    completedLessonIds: unique([...remote.completedLessonIds, ...local.completedLessonIds]),
    answeredQuestionIds: unique([...remote.answeredQuestionIds, ...local.answeredQuestionIds]),
    quizAttempts: uniqueRecords([...remote.quizAttempts, ...local.quizAttempts]),
    reviewedFlashcardIds: unique([...remote.reviewedFlashcardIds, ...local.reviewedFlashcardIds]),
    events: uniqueRecords([...remote.events, ...local.events]),
  };
}
