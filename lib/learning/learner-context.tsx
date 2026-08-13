import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { LEARNER_STATE_KEY, normalizeLearnerState } from "./persistence";
import { mergeLearnerState } from "./merge";
import { initialLearnerState } from "./progress";
import type { LearnerState, QuizAttempt } from "./types";

type SyncStatus = "local" | "syncing" | "synced" | "error";
type LearnerContextValue = {
  state: LearnerState;
  isReady: boolean;
  syncStatus: SyncStatus;
  syncError: string | null;
  syncNow: () => Promise<void>;
  recordVideoStarted: (lessonId: string, seconds: number) => void;
  recordVideoProgress: (lessonId: string, seconds: number) => void;
  markLessonComplete: (lessonId: string) => void;
  answerCheckpoint: (lessonId: string, questionId: string, concept: string, correct: boolean) => void;
  reviewFlashcard: (flashcardId: string, concept: string) => void;
  resetLearningState: () => void;
};

const LearnerContext = createContext<LearnerContextValue | null>(null);

function makeEvent(type: LearnerState["events"][number]["type"], lessonId?: string, concept?: string) {
  return { id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type, lessonId, concept, occurredAt: new Date().toISOString() };
}

export function LearnerProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<LearnerState>(initialLearnerState);
  const [isReady, setIsReady] = useState(false);
  const [cloudHydrated, setCloudHydrated] = useState(false);
  const { isAuthenticated } = useAuth();
  const learnerStateQuery = trpc.learnerState.get.useQuery(undefined, { enabled: isReady && isAuthenticated, retry: 1 });
  const saveLearnerState = trpc.learnerState.save.useMutation();

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
      .finally(() => { if (mounted) setIsReady(true); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(LEARNER_STATE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [isReady, state]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCloudHydrated(false);
      return;
    }
    if (!learnerStateQuery.isSuccess || cloudHydrated) return;
    const remoteState = learnerStateQuery.data?.state;
    if (remoteState) {
      setState((local) => mergeLearnerState(local, normalizeLearnerState(remoteState)));
    }
    setCloudHydrated(true);
  }, [cloudHydrated, isAuthenticated, learnerStateQuery.data, learnerStateQuery.isSuccess]);

  useEffect(() => {
    if (!isReady || !isAuthenticated || !cloudHydrated) return;
    const timer = setTimeout(() => saveLearnerState.mutate(state), 800);
    return () => clearTimeout(timer);
  }, [cloudHydrated, isAuthenticated, isReady, saveLearnerState, state]);

  const recordVideoStarted = useCallback((lessonId: string, seconds: number) => {
    setState((current) => {
      if (current.lessonProgress[lessonId]) return current;
      return { ...current, lessonProgress: { ...current.lessonProgress, [lessonId]: Math.max(1, seconds) }, events: [...current.events, makeEvent("VIDEO_STARTED", lessonId)] };
    });
  }, []);
  const recordVideoProgress = useCallback((lessonId: string, seconds: number) => {
    setState((current) => ({ ...current, lessonProgress: { ...current.lessonProgress, [lessonId]: Math.max(current.lessonProgress[lessonId] ?? 0, seconds) } }));
  }, []);
  const markLessonComplete = useCallback((lessonId: string) => {
    setState((current) => {
      if (current.completedLessonIds.includes(lessonId)) return current;
      return { ...current, completedLessonIds: [...current.completedLessonIds, lessonId], events: [...current.events, makeEvent("VIDEO_COMPLETED", lessonId)] };
    });
  }, []);
  const answerCheckpoint = useCallback((lessonId: string, questionId: string, concept: string, correct: boolean) => {
    setState((current) => {
      if (current.answeredQuestionIds.includes(questionId)) return current;
      const attempt: QuizAttempt = { id: `${questionId}-${Date.now()}`, lessonId, questionId, correct, occurredAt: new Date().toISOString() };
      return { ...current, answeredQuestionIds: [...current.answeredQuestionIds, questionId], quizAttempts: [...current.quizAttempts, attempt], events: [...current.events, makeEvent("QUESTION_ANSWERED", lessonId, concept)] };
    });
  }, []);
  const reviewFlashcard = useCallback((flashcardId: string, concept: string) => {
    setState((current) => {
      if (current.reviewedFlashcardIds.includes(flashcardId)) return current;
      return { ...current, reviewedFlashcardIds: [...current.reviewedFlashcardIds, flashcardId], events: [...current.events, makeEvent("FLASHCARD_REVIEWED", undefined, concept)] };
    });
  }, []);
  const resetLearningState = useCallback(() => setState(initialLearnerState), []);
  const syncNow = useCallback(async () => {
    if (!isAuthenticated) return;
    await saveLearnerState.mutateAsync(state);
    await learnerStateQuery.refetch();
  }, [isAuthenticated, learnerStateQuery, saveLearnerState, state]);

  const syncStatus: SyncStatus = !isAuthenticated ? "local" : learnerStateQuery.isLoading || saveLearnerState.isPending || !cloudHydrated ? "syncing" : learnerStateQuery.isError || saveLearnerState.isError ? "error" : "synced";
  const syncError = learnerStateQuery.error?.message ?? saveLearnerState.error?.message ?? null;
  const value = useMemo(() => ({ state, isReady, syncStatus, syncError, syncNow, recordVideoStarted, recordVideoProgress, markLessonComplete, answerCheckpoint, reviewFlashcard, resetLearningState }), [answerCheckpoint, isReady, markLessonComplete, recordVideoProgress, recordVideoStarted, resetLearningState, reviewFlashcard, state, syncError, syncNow, syncStatus]);

  return <LearnerContext.Provider value={value}>{isReady ? children : <View style={styles.loading}><ActivityIndicator color="#255CFF" size="small" /><Text style={styles.loadingText}>Loading your learning state…</Text></View>}</LearnerContext.Provider>;
}

export function useLearner() {
  const value = useContext(LearnerContext);
  if (!value) throw new Error("useLearner must be used inside LearnerProvider");
  return value;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#F6F8FC" }, loadingText: { color: "#68738B", fontSize: 13, fontWeight: "700" } });
