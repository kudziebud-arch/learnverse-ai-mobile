import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { initialLearnerState } from "./progress";
import type { LearnerState, QuizAttempt } from "./types";

type LearnerContextValue = {
  state: LearnerState;
  isReady: boolean;
  recordVideoStarted: (lessonId: string, seconds: number) => void;
  recordVideoProgress: (lessonId: string, seconds: number) => void;
  markLessonComplete: (lessonId: string) => void;
  answerCheckpoint: (lessonId: string, questionId: string, concept: string, correct: boolean) => void;
  reviewFlashcard: (flashcardId: string, concept: string) => void;
  resetLearningState: () => void;
};

const LearnerContext = createContext<LearnerContextValue | null>(null);
const LEARNER_STATE_KEY = "learnverse:learner-state:v1";

function makeEvent(type: LearnerState["events"][number]["type"], lessonId?: string, concept?: string) {
  return { id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type, lessonId, concept, occurredAt: new Date().toISOString() };
}

function normalizeLearnerState(value: unknown): LearnerState {
  if (!value || typeof value !== "object") return initialLearnerState;
  const state = value as Partial<LearnerState>;
  return {
    lessonProgress: state.lessonProgress && typeof state.lessonProgress === "object" ? state.lessonProgress : {},
    completedLessonIds: Array.isArray(state.completedLessonIds) ? state.completedLessonIds : [],
    answeredQuestionIds: Array.isArray(state.answeredQuestionIds) ? state.answeredQuestionIds : [],
    quizAttempts: Array.isArray(state.quizAttempts) ? state.quizAttempts : [],
    reviewedFlashcardIds: Array.isArray(state.reviewedFlashcardIds) ? state.reviewedFlashcardIds : [],
    events: Array.isArray(state.events) ? state.events : [],
  };
}

export function LearnerProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<LearnerState>(initialLearnerState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(LEARNER_STATE_KEY)
      .then((stored) => {
        if (!mounted || !stored) return;
        try {
          setState(normalizeLearnerState(JSON.parse(stored)));
        } catch {
          setState(initialLearnerState);
        }
      })
      .finally(() => {
        if (mounted) setIsReady(true);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(LEARNER_STATE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [isReady, state]);

  const recordVideoStarted = useCallback((lessonId: string, seconds: number) => {
    setState((current) => {
      if (current.lessonProgress[lessonId]) return current;
      return {
        ...current,
        lessonProgress: { ...current.lessonProgress, [lessonId]: Math.max(1, seconds) },
        events: [...current.events, makeEvent("VIDEO_STARTED", lessonId)],
      };
    });
  }, []);

  const recordVideoProgress = useCallback((lessonId: string, seconds: number) => {
    setState((current) => ({
      ...current,
      lessonProgress: { ...current.lessonProgress, [lessonId]: Math.max(current.lessonProgress[lessonId] ?? 0, seconds) },
    }));
  }, []);

  const markLessonComplete = useCallback((lessonId: string) => {
    setState((current) => {
      if (current.completedLessonIds.includes(lessonId)) return current;
      return {
        ...current,
        completedLessonIds: [...current.completedLessonIds, lessonId],
        events: [...current.events, makeEvent("VIDEO_COMPLETED", lessonId)],
      };
    });
  }, []);

  const answerCheckpoint = useCallback((lessonId: string, questionId: string, concept: string, correct: boolean) => {
    setState((current) => {
      const attempts: QuizAttempt[] = [...current.quizAttempts, { id: `${questionId}-${Date.now()}`, lessonId, correct, occurredAt: new Date().toISOString() }];
      return {
        ...current,
        answeredQuestionIds: current.answeredQuestionIds.includes(questionId)
          ? current.answeredQuestionIds
          : [...current.answeredQuestionIds, questionId],
        quizAttempts: attempts,
        events: [...current.events, makeEvent("QUESTION_ANSWERED", lessonId, concept)],
      };
    });
  }, []);

  const reviewFlashcard = useCallback((flashcardId: string, concept: string) => {
    setState((current) => ({
      ...current,
      reviewedFlashcardIds: current.reviewedFlashcardIds.includes(flashcardId)
        ? current.reviewedFlashcardIds
        : [...current.reviewedFlashcardIds, flashcardId],
      events: [...current.events, makeEvent("FLASHCARD_REVIEWED", undefined, concept)],
    }));
  }, []);

  const resetLearningState = useCallback(() => setState(initialLearnerState), []);

  const value = useMemo(
    () => ({ state, isReady, recordVideoStarted, recordVideoProgress, markLessonComplete, answerCheckpoint, reviewFlashcard, resetLearningState }),
    [answerCheckpoint, isReady, markLessonComplete, recordVideoProgress, recordVideoStarted, resetLearningState, reviewFlashcard, state],
  );

  return <LearnerContext.Provider value={value}>{children}</LearnerContext.Provider>;
}

export function useLearner() {
  const value = useContext(LearnerContext);
  if (!value) throw new Error("useLearner must be used inside LearnerProvider");
  return value;
}
