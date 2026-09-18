export type WorkspaceRole = "educator" | "creator" | "institution" | "administrator";

export type WorkspaceMetric = {
  label: string;
  value: string;
  note: string;
};

export type StudyRoomPlan = {
  title: string;
  agenda: string[];
  nextStep: string;
  liveServiceRequired: boolean;
};

export function getWorkspaceMetrics(role: WorkspaceRole): WorkspaceMetric[] {
  switch (role) {
    case "educator":
      return [
        { label: "Draft lessons", value: "2", note: "Ready for content review" },
        { label: "Learner signals", value: "3", note: "Evidence-backed prompts" },
        { label: "Course health", value: "Good", note: "No blocking checks" },
      ];
    case "creator":
      return [
        { label: "Published lessons", value: "0", note: "Connect publishing to storage" },
        { label: "Content checks", value: "4", note: "Recommended before release" },
        { label: "Audience insight", value: "Pending", note: "Needs production analytics" },
      ];
    case "institution":
      return [
        { label: "Spaces", value: "1", note: "Private space blueprint" },
        { label: "Cohort pulse", value: "Ready", note: "Connect roster data" },
        { label: "Reports", value: "0", note: "Generate after sync" },
      ];
    case "administrator":
      return [
        { label: "Safety checks", value: "4/4", note: "Configured in the release" },
        { label: "Open reports", value: "0", note: "Connect moderation queue" },
        { label: "Service health", value: "Staging", note: "Production monitoring required" },
      ];
  }
}

export function getRoleActions(role: WorkspaceRole): string[] {
  switch (role) {
    case "educator":
      return ["Outline an interactive lesson", "Draft a quiz and assignment", "Review learner evidence"];
    case "creator":
      return ["Prepare a course release", "Run a content quality checklist", "Review audience questions"];
    case "institution":
      return ["Plan a private learning space", "Prepare a cohort report", "Define teacher and learner access"];
    case "administrator":
      return ["Review moderation controls", "Inspect release gates", "Prepare incident handoff"];
  }
}

export function createStudyRoomPlan(topic: string, durationMinutes: number): StudyRoomPlan {
  const safeTopic = topic.trim() || "A shared learning topic";
  const safeDuration = Math.max(15, Math.min(180, Math.round(durationMinutes)));
  return {
    title: `${safeTopic} study room`,
    agenda: [
      `Watch: align on the ${safeTopic} lesson (${Math.round(safeDuration * 0.35)} min)`,
      `Understand: compare notes and explain one idea (${Math.round(safeDuration * 0.25)} min)`,
      `Practice: solve a checkpoint together (${Math.round(safeDuration * 0.3)} min)`,
      `Apply: record one next action (${Math.max(3, safeDuration - Math.round(safeDuration * 0.35) - Math.round(safeDuration * 0.25) - Math.round(safeDuration * 0.3))} min)`,
    ],
    nextStep: "Invite participants through the configured collaboration service before scheduling a live session.",
    liveServiceRequired: true,
  };
}

export function getActivationBoundary(role: WorkspaceRole): string {
  if (role === "administrator") return "Live moderation, monitoring, and incident ownership still require production service configuration.";
  if (role === "institution") return "Roster sync, private spaces, and report exports require an activated organization backend.";
  if (role === "creator") return "Publishing, audience analytics, and monetization require storage, analytics, and billing activation.";
  return "Uploads, learner analytics, communication, and AI material generation require an authenticated educator workspace backend.";
}

export function getRoleLabel(role: WorkspaceRole): string {
  return role[0].toUpperCase() + role.slice(1);
}
