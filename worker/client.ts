import type { MediaWorkerConfig } from "./config";

export type ClaimedMediaJob = {
  id: number;
  videoAssetId: number;
  jobType: "transcode" | "transcript" | "index" | "moderation_scan";
  attempt: number;
  sourceUrl: string;
};

export type JobCompletion = {
  jobId: number;
  status: "succeeded" | "failed";
  errorMessage?: string;
  playbackUrl?: string;
  captionsUrl?: string;
  durationSeconds?: number;
};

type FetchLike = typeof fetch;

export class MediaWorkerClient {
  constructor(private readonly config: MediaWorkerConfig, private readonly request: FetchLike = fetch) {}

  private async call<T>(path: string, method: "GET" | "POST", body?: unknown): Promise<T> {
    const response = await this.request(`${this.config.apiBaseUrl}${path}`, {
      method,
      headers: { Authorization: `Bearer ${this.config.workerToken}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Worker API ${method} ${path} failed (${response.status})`);
    return response.json() as Promise<T>;
  }

  verify() {
    return this.call<{ authenticated: boolean }>("/api/worker/verify", "GET");
  }

  async claim(): Promise<ClaimedMediaJob | null> {
    const response = await this.call<{ job: ClaimedMediaJob | null }>("/api/worker/jobs/claim", "POST", { workerId: this.config.workerId });
    return response.job;
  }

  complete(completion: JobCompletion) {
    return this.call<{ success: boolean }>("/api/worker/jobs/complete", "POST", { workerId: this.config.workerId, ...completion });
  }
}
