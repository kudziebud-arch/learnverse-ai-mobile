import { describe, expect, it, vi } from "vitest";
import { MediaWorkerClient } from "../worker/client";
import { loadMediaWorkerConfig } from "../worker/config";

const validEnv = {
  WORKER_API_BASE_URL: "https://api.learnverse.example",
  MEDIA_WORKER_TOKEN: "a".repeat(64),
  MEDIA_PROCESSOR_ENDPOINT: "https://processor.learnverse.example/jobs",
  MEDIA_WORKER_ID: "test-worker",
};

describe("persistent media worker", () => {
  it("validates required production worker configuration", () => {
    expect(loadMediaWorkerConfig(validEnv)).toMatchObject({ apiBaseUrl: validEnv.WORKER_API_BASE_URL, workerId: "test-worker", pollIntervalMs: 5000 });
    expect(() => loadMediaWorkerConfig({ ...validEnv, MEDIA_PROCESSOR_ENDPOINT: "" })).toThrow("MEDIA_PROCESSOR_ENDPOINT");
  });

  it("claims a job with a worker-authenticated API request", async () => {
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ job: { id: 8, videoAssetId: 12, jobType: "transcode", attempt: 1, sourceUrl: "https://signed.example/source" } }), { status: 200 }));
    const client = new MediaWorkerClient(loadMediaWorkerConfig(validEnv), request);
    await expect(client.claim()).resolves.toMatchObject({ id: 8, jobType: "transcode" });
    expect(request).toHaveBeenCalledWith("https://api.learnverse.example/api/worker/jobs/claim", expect.objectContaining({ method: "POST", headers: expect.objectContaining({ Authorization: `Bearer ${validEnv.MEDIA_WORKER_TOKEN}` }) }));
  });
});
