import type { Course, LearnerState } from "./types";

export type StudyPlan = {
  topic: string;
  durationMinutes: number;
  goal: string;
  blocks: Array<{ label: string; minutes: number }>;
  createdAt: string;
};

export type ExamPlan = {
  subject: string;
  examDate: string;
  topics: string[];
  daysRemaining: number;
  weeks: Array<{ label: string; topics: string[] }>;
  readiness: number;
};

export type ReviewItem = {
  concept: string;
  learnedAt: string;
  dueAt: string;
  intervalDays: number;
};

export type NotificationPreferences = {
  reviewReminders: boolean;
  quizReminders: boolean;
  teacherUpdates: boolean;
};

export type LearnerArtifacts = {
  skills: string[];
  certificates: string[];
  achievements: string[];
  portfolioSummary: string;
};

export type LearningAnalytics = {
  learningHours: number;
  completionRate: number;
  quizAccuracy: number | null;
  currentStreak: number;
  weeklyProgress: number;
  learningVelocity: number;
  strongConcepts: string[];
  weakConcepts: string[];
};

export type KnowledgeGraph = {
  nodes: string[];
  edges: Array<{ from: string; to: string }>;
};

const REVIEW_INTERVALS = [1, 2, 4, 8, 16];

export function createStudyPlan(topic: string, durationMinutes: number, goal: string, now = new Date()): StudyPlan {
  const safeDuration = Math.max(10, Math.min(180, Math.round(durationMinutes)));
  const review = Math.max(1, Math.round(safeDuration * 0.17));
  const learn = Math.max(1, Math.round(safeDuration * 0.33));
  const practice = Math.max(1, Math.round(safeDuration * 0.33));
  const recall = Math.max(1, safeDuration - review - learn - practice);
  return {
    topic: topic.trim() || "Focused review",
    durationMinutes: safeDuration,
    goal: goal.trim() || "Build understanding",
    blocks: [
      { label: "Review", minutes: review },
      { label: "Learn", minutes: learn },
      { label: "Practice", minutes: practice },
      { label: "Recall", minutes: recall },
    ],
    createdAt: now.toISOString(),
  };
}

export function createExamPlan(subject: string, examDate: string, topics: string[], today = new Date()): ExamPlan {
  const parsedDate = new Date(`${examDate}T23:59:59`);
  const daysRemaining = Number.isFinite(parsedDate.getTime()) ? Math.max(0, Math.floor((parsedDate.getTime() - today.getTime()) / 86_400_000)) : 0;
  const cleanTopics = topics.map((topic) => topic.trim()).filter(Boolean).slice(0, 24);
  const weekCount = Math.max(1, Math.ceil(Math.max(daysRemaining, 1) / 7));
  const weeks = Array.from({ length: Math.min(6, weekCount) }, (_, index) => ({
    label: index === Math.min(5, weekCount - 1) ? "Final review" : `Week ${index + 1}`,
    topics: cleanTopics.filter((_, topicIndex) => topicIndex % Math.min(6, weekCount) === index).slice(0, 5),
  }));
  const readiness = Math.min(100, Math.round((cleanTopics.length / Math.max(1, 8)) * 55 + Math.min(daysRemaining, 28) / 28 * 45));
  return { subject: subject.trim() || "General preparation", examDate, topics: cleanTopics, daysRemaining, weeks, readiness };
}

export function buildReviewSchedule(concepts: string[], learnedAt = new Date()): ReviewItem[] {
  return concepts.filter(Boolean).slice(0, 50).map((concept) => ({
    concept,
    learnedAt: learnedAt.toISOString(),
    dueAt: new Date(learnedAt.getTime() + REVIEW_INTERVALS[0] * 86_400_000).toISOString(),
    intervalDays: REVIEW_INTERVALS[0],
  }));
}

export function advanceReview(item: ReviewItem, reviewedAt = new Date()): ReviewItem {
  const nextInterval = REVIEW_INTERVALS[Math.min(REVIEW_INTERVALS.length - 1, REVIEW_INTERVALS.indexOf(item.intervalDays) + 1)] ?? REVIEW_INTERVALS[REVIEW_INTERVALS.length - 1];
  return { ...item, learnedAt: reviewedAt.toISOString(), dueAt: new Date(reviewedAt.getTime() + nextInterval * 86_400_000).toISOString(), intervalDays: nextInterval };
}

export function getKnowledgeGraph(course: Course): KnowledgeGraph {
  const nodes = Array.from(new Set([course.subject, ...course.skills, ...course.lessons.flatMap((lesson) => lesson.concepts)])).filter(Boolean);
  const edges = course.lessons.flatMap((lesson) => lesson.concepts.slice(1).map((concept, index) => ({ from: lesson.concepts[index] ?? course.subject, to: concept })));
  return { nodes, edges };
}

export function getAnalytics(course: Course, state: LearnerState, now = new Date()): LearningAnalytics {
  const completed = course.lessons.filter((lesson) => state.completedLessonIds.includes(lesson.id)).length;
  const conceptAttempts = new Map<string, { correct: number; total: number }>();
  state.quizAttempts.forEach((attempt) => {
    const concept = course.lessons.find((lesson) => lesson.id === attempt.lessonId)?.interactiveQuestion.concept ?? "General understanding";
    const current = conceptAttempts.get(concept) ?? { correct: 0, total: 0 };
    current.total += 1;
    if (attempt.correct) current.correct += 1;
    conceptAttempts.set(concept, current);
  });
  const ranked = [...conceptAttempts.entries()].sort((a, b) => b[1].correct / b[1].total - a[1].correct / a[1].total);
  const dayKeys = new Set(state.events.map((event) => event.occurredAt.slice(0, 10)));
  let streak = 0;
  const cursor = new Date(now);
  while (dayKeys.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  const weekStart = now.getTime() - 7 * 86_400_000;
  const weeklyProgress = state.events.filter((event) => new Date(event.occurredAt).getTime() >= weekStart).length;
  return {
    learningHours: Math.round(Object.values(state.lessonProgress).reduce((sum, seconds) => sum + seconds, 0) / 36) / 100,
    completionRate: course.lessons.length ? Math.round(completed / course.lessons.length * 100) : 0,
    quizAccuracy: state.quizAttempts.length ? Math.round(state.quizAttempts.filter((attempt) => attempt.correct).length / state.quizAttempts.length * 100) : null,
    currentStreak: streak,
    weeklyProgress,
    learningVelocity: Math.round(state.events.length / Math.max(1, Math.ceil((now.getTime() - new Date(state.events[0]?.occurredAt ?? now.toISOString()).getTime()) / 86_400_000))),
    strongConcepts: ranked.filter(([, result]) => result.correct / result.total >= 0.7).slice(0, 3).map(([concept]) => concept),
    weakConcepts: ranked.filter(([, result]) => result.correct / result.total < 0.7).slice(0, 3).map(([concept]) => concept),
  };
}

export function getLearnerArtifacts(course: Course, state: LearnerState): LearnerArtifacts {
  const completed = course.lessons.filter((lesson) => state.completedLessonIds.includes(lesson.id));
  const skills = Array.from(new Set(completed.flatMap((lesson) => lesson.concepts))).slice(0, 12);
  const certificates = completed.length === course.lessons.length && completed.length > 0 ? [`${course.title} completion`] : [];
  const achievements = [
    ...(state.events.some((event) => event.type === "VIDEO_STARTED") ? ["First lesson started"] : []),
    ...(state.reviewedFlashcardIds.length >= 3 ? ["Recall builder"] : []),
    ...(state.quizAttempts.some((attempt) => attempt.correct) ? ["Understanding checked"] : []),
  ];
  return { skills, certificates, achievements, portfolioSummary: skills.length ? `Learning portfolio for ${course.title}: ${skills.join(", ")}.` : "Complete a lesson to begin building a verified learning portfolio." };
}

export function getDueReviews(items: ReviewItem[], now = new Date()): ReviewItem[] {
  return items.filter((item) => new Date(item.dueAt).getTime() <= now.getTime());
}

export function getNotificationReminders(items: ReviewItem[], preferences: NotificationPreferences, now = new Date()) {
  return preferences.reviewReminders ? getDueReviews(items, now).map((item) => `Your scheduled review for ${item.concept} is ready.`) : [];
}
