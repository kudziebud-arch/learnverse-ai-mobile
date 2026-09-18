import { describe, expect, it } from "vitest";
import { createStudyRoomPlan, getActivationBoundary, getRoleActions, getWorkspaceMetrics } from "../lib/learning/role-workspaces";

describe("role workspaces", () => {
  it("provides distinct operational metrics for each supported role", () => {
    for (const role of ["educator", "creator", "institution", "administrator"] as const) {
      expect(getWorkspaceMetrics(role)).toHaveLength(3);
      expect(getRoleActions(role)).toHaveLength(3);
      expect(getActivationBoundary(role).length).toBeGreaterThan(20);
    }
  });

  it("creates a bounded Watch to Apply study-room blueprint", () => {
    const plan = createStudyRoomPlan("Recursion", 60);
    expect(plan.title).toBe("Recursion study room");
    expect(plan.agenda).toHaveLength(4);
    expect(plan.agenda.join(" ")).toContain("Watch");
    expect(plan.agenda.join(" ")).toContain("Apply");
    expect(plan.liveServiceRequired).toBe(true);
  });

  it("clamps invalid room durations and uses a useful fallback topic", () => {
    const plan = createStudyRoomPlan("", 500);
    expect(plan.title).toBe("A shared learning topic study room");
    expect(plan.agenda[0]).toContain("63 min");
  });
});
