import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LearnerState } from "./types";
import { mergeLearnerState } from "./merge";
import { normalizeLearnerState } from "./persistence";

export const OFFLINE_SYNC_QUEUE_KEY = "learnverse:offline-sync-queue:v1";

type OfflineQueueRecord = { state: LearnerState; queuedAt: string };

export async function queueLearnerState(state: LearnerState, queuedAt = new Date()): Promise<void> {
  const record: OfflineQueueRecord = { state, queuedAt: queuedAt.toISOString() };
  await AsyncStorage.setItem(OFFLINE_SYNC_QUEUE_KEY, JSON.stringify(record));
}

export async function readQueuedLearnerState(): Promise<OfflineQueueRecord | null> {
  const stored = await AsyncStorage.getItem(OFFLINE_SYNC_QUEUE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as { state?: unknown; queuedAt?: unknown };
    if (!parsed.state || typeof parsed.queuedAt !== "string") return null;
    return { state: normalizeLearnerState(parsed.state), queuedAt: parsed.queuedAt };
  } catch {
    return null;
  }
}

export async function clearQueuedLearnerState(): Promise<void> {
  await AsyncStorage.removeItem(OFFLINE_SYNC_QUEUE_KEY);
}

export function mergeOfflineWithRemote(local: LearnerState, remote: LearnerState): LearnerState {
  return mergeLearnerState(local, remote);
}
