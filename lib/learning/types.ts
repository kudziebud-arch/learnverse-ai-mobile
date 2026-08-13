export type Chapter = {
  id: string;
  title: string;
  startSeconds: number;
  summary: string;
};

export type InteractiveQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  concept: string;
  timestampSeconds: number;
};

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  concept: string;
};

export type Lesson = {
  id: string;
  courseId: string;
  title: string;
  shortTitle: string;
  description: string;
  durationSeconds: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  concepts: string[];
  chapters: Chapter[];
  transcript: string[];
  interactiveQuestion: InteractiveQuestion;
  flashcards: Flashcard[];
  videoUrl: string;
};

export type Course = {
  id: string;
  title: string;
  subtitle: string;
  instructor: string;
  subject: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  totalDurationMinutes: number;
  description: string;
  skills: string[];
  lessons: Lesson[];
};

export type LearningEventType =
  | "VIDEO_STARTED"
  | "VIDEO_COMPLETED"
  | "CHAPTER_COMPLETED"
  | "QUESTION_ANSWERED"
  | "QUIZ_COMPLETED"
  | "FLASHCARD_REVIEWED";

export type LearningEvent = {
  id: string;
  type: LearningEventType;
  lessonId?: string;
  concept?: string;
  occurredAt: string;
};

export type QuizAttempt = {
  id: string;
  lessonId: string;
  correct: boolean;
  occurredAt: string;
};

export type LearnerState = {
  lessonProgress: Record<string, number>;
  completedLessonIds: string[];
  answeredQuestionIds: string[];
  quizAttempts: QuizAttempt[];
  reviewedFlashcardIds: string[];
  events: LearningEvent[];
};

export type TutorRequest = {
  question: string;
  lessonId: string;
  timestampSeconds: number;
  transcript: string;
};

export type TutorResponse = {
  answer: string;
  groundingStatus: "grounded" | "limited";
  citations: Array<{ label: string; timestampSeconds: number }>;
  suggestedPractice: string;
};
