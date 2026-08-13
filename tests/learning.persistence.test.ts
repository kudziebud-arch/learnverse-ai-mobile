import { describe, expect, it } from "vitest";
import { normalizeLearnerState } from "../lib/learning/persistence";

describe("learner-state persistence", () => {
  it("returns a safe empty state when storage contains malformed data", () => {
    const state = normalizeLearnerState("not-an-object");
    expect(state.lessonProgress).toEqual({});
    expect(state.quizAttempts).toEqual([]);
  });

  it("keeps valid persisted learning activity and drops unsafe values", () => {
    const state = normalizeLearnerState({
      lessonProgress: { lessonA: 120, lessonB: -3, lessonC: "bad" },
      completedLessonIds: ["lessonA", 9],
      answeredQuestionIds: ["questionA"],
      reviewedFlashcardIds: ["cardA"],
      quizAttempts: [{ id: "attemptA", lessonId: "lessonA", questionId: "questionA", correct: true, occurredAt: "2026-08-13T10:00:00.000Z" }],
      events: [{ id: "eventA", type: "VIDEO_STARTED", lessonId: "lessonA", occurredAt: "2026-08-13T10:00:00.000Z" }],
    });
    expect(state.lessonProgress).toEqual({ lessonA: 120 });
    expect(state.completedLessonIds).toEqual(["lessonA"]);
    expect(state.quizAttempts[0]?.questionId).toBe("questionA");
    expect(state.events).toHaveLength(1);
  });
});
