import { describe, expect, it } from "vitest";
import { appRouter } from "../server/routers";

const anonymousContext = {
  req: {},
  res: {},
  user: null,
} as never;

describe("production API boundaries", () => {
  it("exposes a minimal public liveness response without operational detail", async () => {
    const caller = appRouter.createCaller(anonymousContext);
    const health = await caller.operations.publicHealth();
    expect(health.status).toBe("ok");
    expect(health.service).toBe("learnverse-api");
  });

  it("rejects anonymous cloud-state access before any data operation", async () => {
    const caller = appRouter.createCaller(anonymousContext);
    await expect(caller.learnerState.get()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
