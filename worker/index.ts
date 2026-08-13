import { loadMediaWorkerConfig } from "./config";
import { MediaWorkerClient, type ClaimedMediaJob } from "./client";

type ProcessorResult = {
  playbackUrl?: string;
  captionsUrl?: string;
  durationSeconds?: number;
};

async function dispatchToProcessor(endpoint: string, job: ClaimedMediaJob): Promise<ProcessorResult> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId: job.id, videoAssetId: job.videoAssetId, jobType: job.jobType, sourceUrl: job.sourceUrl, attempt: job.attempt }),
  });
  if (!response.ok) throw new Error(`Media processor failed (${response.status})`);
  const result = await response.json() as ProcessorResult;
  if (job.jobType === "transcode" && (!result.playbackUrl || !result.durationSeconds)) {
    throw new Error("Media processor returned no playback URL or duration for a transcode job");
  }
  return result;
}

async function run() {
  const config = loadMediaWorkerConfig();
  const client = new MediaWorkerClient(config);
  const verification = await client.verify();
  if (!verification.authenticated) throw new Error("Worker credential verification did not succeed");
  console.log(`[LearnVerseWorker] authenticated as ${config.workerId}`);

  let stopping = false;
  const stop = () => { stopping = true; };
  process.once("SIGTERM", stop);
  process.once("SIGINT", stop);

  while (!stopping) {
    try {
      const job = await client.claim();
      if (!job) {
        await new Promise((resolve) => setTimeout(resolve, config.pollIntervalMs));
        continue;
      }
      try {
        const result = await dispatchToProcessor(config.processorEndpoint, job);
        await client.complete({ jobId: job.id, status: "succeeded", ...result });
        console.log(`[LearnVerseWorker] completed ${job.jobType} job ${job.id}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown media processor failure";
        await client.complete({ jobId: job.id, status: "failed", errorMessage });
        console.error(`[LearnVerseWorker] failed job ${job.id}: ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown worker error";
      console.error(`[LearnVerseWorker] polling error: ${errorMessage}`);
      await new Promise((resolve) => setTimeout(resolve, config.pollIntervalMs));
    }
  }
  console.log("[LearnVerseWorker] stopped");
}

run().catch((error) => {
  console.error("[LearnVerseWorker] startup failed", error);
  process.exitCode = 1;
});
