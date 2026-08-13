import { describe, expect, it } from "vitest";
import { starterCourse } from "../lib/learning/catalog";
import { getCourseProgress, getLearningMinutes, getQuizAccuracy, initialLearnerState, nextLesson } from "../lib/learning/progress";

describe("learning progress calculations", () => {
  it("uses recorded completion rather than a fabricated course percentage", () => {
    const state = { ...initialLearnerState, completedLessonIds: [starterCourse.lessons[0].id] };
    expect(getCourseProgress(starterCourse, state)).toBe(50);
  });

  it("selects the first incomplete lesson as the next action", () => {
    const state = { ...initialLearnerState, completedLessonIds: [starterCourse.lessons[0].id] };
    expect(nextLesson(starterCourse, state).id).toBe(starterCourse.lessons[1].id);
  });

  it("calculates time and accuracy from captured learning data", () => {
    const state = {
      ...initialLearnerState,
      lessonProgress: { [starterCourse.lessons[0].id]: 130, [starterCourse.lessons[1].id]: 110 },
      quizAttempts: [
        { id: "attempt-1", lessonId: starterCourse.lessons[0].id, questionId: "question-1", correct: true, occurredAt: "2026-08-13T10:00:00.000Z" },
        { id: "attempt-2", lessonId: starterCourse.lessons[0].id, questionId: "question-2", correct: false, occurredAt: "2026-08-13T10:01:00.000Z" },
        { id: "attempt-3", lessonId: starterCourse.lessons[1].id, questionId: "question-3", correct: true, occurredAt: "2026-08-13T10:02:00.000Z" },
      ],
    };
    expect(getLearningMinutes(state)).toBe(4);
    expect(getQuizAccuracy(state)).toBe(67);
  });
});
