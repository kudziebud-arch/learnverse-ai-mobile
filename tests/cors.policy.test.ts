import { describe, expect, it } from "vitest";
import { isAllowedBrowserOrigin } from "../server/_core/cors";

describe("browser origin policy", () => {
  it("allows native requests without an Origin header", () => {
    expect(isAllowedBrowserOrigin(undefined, "production", undefined)).toBe(true);
  });

  it("requires an explicitly configured browser origin in production", () => {
    expect(isAllowedBrowserOrigin("https://app.learnverse.example", "production", "https://app.learnverse.example,https://admin.learnverse.example")).toBe(true);
    expect(isAllowedBrowserOrigin("https://untrusted.example", "production", "https://app.learnverse.example")).toBe(false);
  });

  it("keeps local development functional without a configured origin list", () => {
    expect(isAllowedBrowserOrigin("http://localhost:8081", "development", undefined)).toBe(true);
  });
});
