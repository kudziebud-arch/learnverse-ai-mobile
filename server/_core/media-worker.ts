import crypto from "crypto";
import type { Express, NextFunction, Request, Response } from "express";
import { z } from "zod";
import { claimMediaProcessingJob, completeMediaProcessingJob } from "../db";
import { notifyOwner } from "./notification";

const workerIdInput = z.object({ workerId: z.string().trim().min(3).max(160) });
const completionInput = workerIdInput.extend({
  jobId: z.number().int().positive(),
  status: z.enum(["succeeded", "failed"]),
  errorMessage: z.string().trim().max(4000).optional(),
});

function getWorkerToken() {
  return process.env.MEDIA_WORKER_TOKEN ?? "";
}

export function isValidMediaWorkerToken(value: string | undefined) {
  const expected = getWorkerToken();
  if (!expected || !value) return false;
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(value);
  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

function extractBearerToken(request: Request) {
  const value = request.header("authorization") ?? "";
  return value.startsWith("Bearer ") ? value.slice("Bearer ".length).trim() : undefined;
}

function requireWorker(request: Request, response: Response, next: NextFunction) {
  if (!isValidMediaWorkerToken(extractBearerToken(request))) {
    response.status(401).json({ error: "Worker authentication required" });
    return;
  }
  next();
}

export function registerMediaWorkerRoutes(app: Express) {
  app.get("/api/worker/verify", requireWorker, (_request, response) => {
    response.json({ authenticated: true, service: "learnverse-media-worker" });
  });

  app.post("/api/worker/jobs/claim", requireWorker, async (request, response) => {
    const parsed = workerIdInput.safeParse(request.body);
    if (!parsed.success) return response.status(400).json({ error: "Invalid worker claim request" });
    try {
      const job = await claimMediaProcessingJob(parsed.data.workerId);
      return response.json({ job });
    } catch (error) {
      console.error("[MediaWorker] job claim failed", error);
      return response.status(503).json({ error: "Media job store unavailable" });
    }
  });

  app.post("/api/worker/jobs/complete", requireWorker, async (request, response) => {
    const parsed = completionInput.safeParse(request.body);
    if (!parsed.success) return response.status(400).json({ error: "Invalid worker completion request" });
    try {
      const completed = await completeMediaProcessingJob(parsed.data);
      if (!completed) return response.status(409).json({ error: "Job is not owned by this worker or is no longer running" });
      if (parsed.data.status === "failed") {
        await notifyOwner({
          title: "LearnVerse media worker failure",
          content: `Worker ${parsed.data.workerId} reported a failed processing job (${parsed.data.jobId}). ${parsed.data.errorMessage ?? "No error detail was provided."}`,
        });
      }
      return response.json({ success: true });
    } catch (error) {
      console.error("[MediaWorker] job completion failed", error);
      return response.status(503).json({ error: "Media job store unavailable" });
    }
  });
}
