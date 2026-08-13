import { describe, expect, it } from "vitest";
import { canManageOrganization, canResolveModeration, isSafeStorageKey } from "../shared/production";
import { mergeLearnerState } from "../lib/learning/merge";
import { initialLearnerState } from "../lib/learning/progress";

describe("production authorization and storage policy", () => {
  it("permits only designated organization roles to manage content", () => {
    expect(canManageOrganization("student")).toBe(false);
    expect(canManageOrganization("educator")).toBe(true);
    expect(canManageOrganization("creator")).toBe(true);
    expect(canResolveModeration("institution_admin")).toBe(true);
    expect(canResolveModeration("educator")).toBe(false);
  });

  it("rejects absolute and traversal-style media storage keys", () => {
    expect(isSafeStorageKey("org-10/video/lesson-2.mp4")).toBe(true);
    expect(isSafeStorageKey("/org-10/video.mp4")).toBe(false);
    expect(isSafeStorageKey("org-10/../video.mp4")).toBe(false);
    expect(isSafeStorageKey("org-10//video.mp4")).toBe(false);
  });
});

describe("cloud learning-state merge", () => {
  it("keeps the furthest watched progress and deduplicates learner records", () => {
    const local = {
      ...initialLearnerState,
      lessonProgress: { lessonA: 140 },
      completedLessonIds: ["lessonA"],
      events: [{ id: "event-local", type: "VIDEO_COMPLETED" as const, lessonId: "lessonA", occurredAt: "2026-08-13T10:00:00.000Z" }],
    };
    const remote = {
      ...initialLearnerState,
      lessonProgress: { lessonA: 90, lessonB: 20 },
      completedLessonIds: ["lessonA", "lessonB"],
      events: [{ id: "event-local", type: "VIDEO_COMPLETED" as const, lessonId: "lessonA", occurredAt: "2026-08-13T10:00:00.000Z" }],
    };
    const merged = mergeLearnerState(local, remote);
    expect(merged.lessonProgress).toEqual({ lessonA: 140, lessonB: 20 });
    expect(merged.completedLessonIds).toEqual(["lessonA", "lessonB"]);
    expect(merged.events).toHaveLength(1);
  });
});
