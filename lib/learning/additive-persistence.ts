import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ExamPlan, NotificationPreferences, ReviewItem, StudyPlan } from "./additive";

export const ADDITIVE_STATE_KEY = "learnverse:additive-learning:v1";

export type AdditiveLearningState = {
  studyPlan: StudyPlan | null;
  examPlan: ExamPlan | null;
  reviewItems: ReviewItem[];
  notificationPreferences: NotificationPreferences;
};

export const initialAdditiveLearningState: AdditiveLearningState = {
  studyPlan: null,
  examPlan: null,
  reviewItems: [],
  notificationPreferences: { reviewReminders: true, quizReminders: true, teacherUpdates: true },
};

export function normalizeAdditiveLearningState(value: unknown): AdditiveLearningState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return initialAdditiveLearningState;
  const record = value as Record<string, unknown>;
  const preferences = record.notificationPreferences && typeof record.notificationPreferences === "object" && !Array.isArray(record.notificationPreferences)
    ? record.notificationPreferences as Record<string, unknown>
    : {};
  return {
    studyPlan: record.studyPlan && typeof record.studyPlan === "object" ? record.studyPlan as StudyPlan : null,
    examPlan: record.examPlan && typeof record.examPlan === "object" ? record.examPlan as ExamPlan : null,
    reviewItems: Array.isArray(record.reviewItems) ? record.reviewItems as ReviewItem[] : [],
    notificationPreferences: {
      reviewReminders: preferences.reviewReminders !== false,
      quizReminders: preferences.quizReminders !== false,
      teacherUpdates: preferences.teacherUpdates !== false,
    },
  };
}

export async function loadAdditiveLearningState(): Promise<AdditiveLearningState> {
  try {
    const stored = await AsyncStorage.getItem(ADDITIVE_STATE_KEY);
    return stored ? normalizeAdditiveLearningState(JSON.parse(stored)) : initialAdditiveLearningState;
  } catch {
    return initialAdditiveLearningState;
  }
}

export async function saveAdditiveLearningState(state: AdditiveLearningState): Promise<void> {
  await AsyncStorage.setItem(ADDITIVE_STATE_KEY, JSON.stringify(state));
}
