import { describe, expect, it } from "vitest";
import { advanceReview, buildReviewSchedule, createExamPlan, createStudyPlan, getAnalytics, getDueReviews, getKnowledgeGraph, getLearnerArtifacts, getNotificationReminders } from "../lib/learning/additive";
import { initialLearnerState } from "../lib/learning/progress";
import { semanticMatch, semanticTokens } from "../lib/learning/search";
import { starterCourse } from "../lib/learning/catalog";

describe("additive learning capabilities", () => {
  it("creates a bounded watch-understand-practice-recall study plan", () => {
    const plan = createStudyPlan("recursion", 30, "exam prep", new Date("2026-01-01T00:00:00Z"));
    expect(plan.blocks.map((block) => block.minutes).reduce((a, b) => a + b, 0)).toBe(30);
    expect(plan.blocks.map((block) => block.label)).toEqual(["Review", "Learn", "Practice", "Recall"]);
  });

  it("creates an exam plan with a non-guaranteed bounded readiness estimate", () => {
    const plan = createExamPlan("JavaScript", "2026-01-29", ["Variables", "Functions"], new Date("2026-01-01T00:00:00Z"));
    expect(plan.daysRemaining).toBe(28);
    expect(plan.weeks.length).toBeGreaterThan(0);
    expect(plan.readiness).toBeGreaterThanOrEqual(0);
    expect(plan.readiness).toBeLessThanOrEqual(100);
  });

  it("builds prerequisite graph and spaced review schedule", () => {
    const graph = getKnowledgeGraph(starterCourse);
    const schedule = buildReviewSchedule(["Variables", "Functions"], new Date("2026-01-01T00:00:00Z"));
    expect(graph.nodes).toContain(starterCourse.subject);
    expect(schedule[0]?.intervalDays).toBe(1);
    expect(advanceReview(schedule[0]!, new Date("2026-01-02T00:00:00Z")).intervalDays).toBe(2);
    expect(getDueReviews(schedule, new Date("2026-01-03T00:00:00Z")).length).toBe(2);
  });

  it("derives analytics and artifacts only from learner evidence", () => {
    const state = {
      ...initialLearnerState,
      completedLessonIds: [starterCourse.lessons[0]!.id],
      lessonProgress: { [starterCourse.lessons[0]!.id]: 600 },
      reviewedFlashcardIds: ["one", "two", "three"],
      quizAttempts: [{ id: "a", lessonId: starterCourse.lessons[0]!.id, questionId: "q", correct: true, occurredAt: "2026-01-01T10:00:00.000Z" }],
      events: [{ id: "e", type: "VIDEO_STARTED" as const, lessonId: starterCourse.lessons[0]!.id, occurredAt: "2026-01-01T10:00:00.000Z" }],
    };
    const analytics = getAnalytics(starterCourse, state, new Date("2026-01-01T12:00:00Z"));
    const artifacts = getLearnerArtifacts(starterCourse, state);
    expect(analytics.learningHours).toBeGreaterThan(0);
    expect(analytics.currentStreak).toBe(1);
    expect(artifacts.achievements).toContain("Recall builder");
    expect(artifacts.certificates).toEqual([]);
  });

  it("matches natural-language concept searches semantically", () => {
    expect(semanticTokens("teach me recursion")).toContain("recursion");
    expect(semanticMatch("teach me recursion", ["Functions and repeated calls"])).toBe(true);
  });

  it("generates reminders only when the preference is enabled", () => {
    const items = buildReviewSchedule(["Functions"], new Date("2026-01-01T00:00:00Z"));
    expect(getNotificationReminders(items, { reviewReminders: true, quizReminders: true, teacherUpdates: true }, new Date("2026-01-03T00:00:00Z"))).toHaveLength(1);
    expect(getNotificationReminders(items, { reviewReminders: false, quizReminders: true, teacherUpdates: true }, new Date("2026-01-03T00:00:00Z"))).toHaveLength(0);
  });
});
