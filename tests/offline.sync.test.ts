import { describe, expect, it } from "vitest";
import { mergeOfflineWithRemote } from "../lib/learning/offline-sync";
import { initialLearnerState } from "../lib/learning/progress";

describe("offline learner sync", () => {
  it("keeps the furthest local progress and unions offline evidence with remote evidence", () => {
    const remote = {
      ...initialLearnerState,
      lessonProgress: { "lesson-1": 18 },
      completedLessonIds: ["lesson-1"],
      events: [{ id: "remote-event", type: "VIDEO_STARTED" as const, lessonId: "lesson-1", occurredAt: "2026-01-01T10:00:00.000Z" }],
    };
    const offline = {
      ...initialLearnerState,
      lessonProgress: { "lesson-1": 42, "lesson-2": 5 },
      completedLessonIds: ["lesson-2"],
      reviewedFlashcardIds: ["card-1"],
      events: [{ id: "offline-event", type: "FLASHCARD_REVIEWED" as const, concept: "Functions", occurredAt: "2026-01-01T10:05:00.000Z" }],
    };
    const merged = mergeOfflineWithRemote(offline, remote);
    expect(merged.lessonProgress).toEqual({ "lesson-1": 42, "lesson-2": 5 });
    expect(merged.completedLessonIds).toEqual(expect.arrayContaining(["lesson-1", "lesson-2"]));
    expect(merged.reviewedFlashcardIds).toContain("card-1");
    expect(merged.events.map((event) => event.id)).toEqual(expect.arrayContaining(["remote-event", "offline-event"]));
  });
});
