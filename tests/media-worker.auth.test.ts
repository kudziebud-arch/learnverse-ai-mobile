import express from "express";
import { once } from "node:events";
import { describe, expect, it } from "vitest";
import { registerMediaWorkerRoutes } from "../server/_core/media-worker";

describe("media worker authentication", () => {
  it("accepts the configured server-side worker credential on the verification endpoint", async () => {
    const token = process.env.MEDIA_WORKER_TOKEN;
    expect(token).toBeTruthy();
    const app = express();
    app.use(express.json());
    registerMediaWorkerRoutes(app);
    const server = app.listen(0);
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not bind to a TCP port");
    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/api/worker/verify`, { headers: { Authorization: `Bearer ${token}` } });
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({ authenticated: true, service: "learnverse-media-worker" });
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });

  it("rejects requests without the worker credential", async () => {
    const app = express();
    app.use(express.json());
    registerMediaWorkerRoutes(app);
    const server = app.listen(0);
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not bind to a TCP port");
    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/api/worker/verify`);
      expect(response.status).toBe(401);
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });
});
