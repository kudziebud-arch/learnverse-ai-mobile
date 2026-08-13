import type { Course, LearnerState } from "./types";

export const initialLearnerState: LearnerState = {
  lessonProgress: {},
  completedLessonIds: [],
  answeredQuestionIds: [],
  quizAttempts: [],
  reviewedFlashcardIds: [],
  events: [],
};

export function getCourseProgress(course: Course, state: LearnerState) {
  if (course.lessons.length === 0) return 0;
  const completed = course.lessons.filter((lesson) => state.completedLessonIds.includes(lesson.id)).length;
  return Math.round((completed / course.lessons.length) * 100);
}

export function getLearningMinutes(state: LearnerState) {
  const totalSeconds = Object.values(state.lessonProgress).reduce((sum, seconds) => sum + seconds, 0);
  return Math.round(totalSeconds / 60);
}

export function getQuizAccuracy(state: LearnerState) {
  if (state.quizAttempts.length === 0) return null;
  const correct = state.quizAttempts.filter((attempt) => attempt.correct).length;
  return Math.round((correct / state.quizAttempts.length) * 100);
}

export function hasStartedLesson(lessonId: string, state: LearnerState) {
  return (state.lessonProgress[lessonId] ?? 0) > 0 || state.completedLessonIds.includes(lessonId);
}

export function nextLesson(course: Course, state: LearnerState) {
  return course.lessons.find((lesson) => !state.completedLessonIds.includes(lesson.id)) ?? course.lessons[0];
}
