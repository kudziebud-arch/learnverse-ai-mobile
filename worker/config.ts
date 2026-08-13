const DEFAULT_POLL_INTERVAL_MS = 5_000;

export type MediaWorkerConfig = {
  apiBaseUrl: string;
  workerToken: string;
  workerId: string;
  pollIntervalMs: number;
  processorEndpoint: string;
};

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function loadMediaWorkerConfig(env: Record<string, string | undefined> = process.env): MediaWorkerConfig {
  const apiBaseUrl = env.WORKER_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";
  const workerToken = env.MEDIA_WORKER_TOKEN?.trim() ?? "";
  const workerId = env.MEDIA_WORKER_ID?.trim() ?? "learnverse-media-worker-1";
  const processorEndpoint = env.MEDIA_PROCESSOR_ENDPOINT?.trim() ?? "";
  const candidatePollInterval = Number(env.MEDIA_WORKER_POLL_INTERVAL_MS ?? DEFAULT_POLL_INTERVAL_MS);
  const pollIntervalMs = Number.isFinite(candidatePollInterval) ? Math.min(Math.max(candidatePollInterval, 1_000), 60_000) : DEFAULT_POLL_INTERVAL_MS;
  if (!isHttpUrl(apiBaseUrl)) throw new Error("WORKER_API_BASE_URL must be a valid HTTP(S) URL");
  if (workerToken.length < 32) throw new Error("MEDIA_WORKER_TOKEN must be configured with a high-entropy secret");
  if (!isHttpUrl(processorEndpoint)) throw new Error("MEDIA_PROCESSOR_ENDPOINT must be a valid HTTP(S) URL before starting the worker");
  return { apiBaseUrl, workerToken, workerId, pollIntervalMs, processorEndpoint };
}
