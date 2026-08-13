import { and, asc, count, desc, eq, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  auditLogs,
  courses,
  learnerStates,
  lessons,
  mediaProcessingJobs,
  moderationReports,
  organizationMembers,
  organizations,
  type InsertUser,
  type User,
  users,
  videoAssets,
} from "../drizzle/schema";
import type { OrganizationRole } from "../shared/production";
import type { LearnerState } from "../lib/learning/types";
import { ENV } from "./_core/env";

let database: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!database && process.env.DATABASE_URL) {
    try {
      database = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      database = null;
    }
  }
  return database;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("The production database is unavailable");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await requireDb();
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  (["name", "email", "loginMethod"] as const).forEach((field) => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getLearnerState(userId: number) {
  const db = await requireDb();
  const result = await db.select().from(learnerStates).where(eq(learnerStates.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function saveLearnerState(userId: number, state: LearnerState) {
  const db = await requireDb();
  const existing = await getLearnerState(userId);
  const serialized = state as unknown as Record<string, unknown>;
  if (existing) {
    await db.update(learnerStates).set({ state: serialized, version: existing.version + 1, updatedAt: new Date() }).where(eq(learnerStates.id, existing.id));
    return { version: existing.version + 1, updatedAt: new Date() };
  }
  const result = await db.insert(learnerStates).values({ userId, state: serialized, version: 1 });
  return { version: 1, id: Number(result[0].insertId) };
}

export async function createOrganizationWithOwner(userId: number, name: string, slug: string) {
  const db = await requireDb();
  return db.transaction(async (tx) => {
    const organizationInsert = await tx.insert(organizations).values({ name, slug, createdByUserId: userId });
    const organizationId = Number(organizationInsert[0].insertId);
    await tx.insert(organizationMembers).values({ organizationId, userId, role: "institution_admin" });
    await tx.insert(auditLogs).values({ actorUserId: userId, organizationId, action: "organization.created", entityType: "organization", entityId: String(organizationId), metadata: { name, slug } });
    return { id: organizationId, name, slug, role: "institution_admin" as const };
  });
}

export async function listOrganizationMemberships(userId: number) {
  const db = await requireDb();
  return db
    .select({ organizationId: organizations.id, name: organizations.name, slug: organizations.slug, role: organizationMembers.role })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
    .where(eq(organizationMembers.userId, userId));
}

export async function getOrganizationMembership(userId: number, organizationId: number) {
  const db = await requireDb();
  const result = await db
    .select()
    .from(organizationMembers)
    .where(and(eq(organizationMembers.userId, userId), eq(organizationMembers.organizationId, organizationId)))
    .limit(1);
  return result[0] ?? null;
}

export async function createCourse(input: { organizationId: number; createdByUserId: number; title: string; description?: string; subject?: string; level: "beginner" | "intermediate" | "advanced"; visibility: "private" | "organization" | "public" | "unlisted" }) {
  const db = await requireDb();
  const result = await db.insert(courses).values({ ...input, description: input.description ?? null, subject: input.subject ?? null, status: "draft" });
  const id = Number(result[0].insertId);
  await db.insert(auditLogs).values({ actorUserId: input.createdByUserId, organizationId: input.organizationId, action: "course.created", entityType: "course", entityId: String(id), metadata: { title: input.title } });
  return { id, status: "draft" as const };
}

export async function listOrganizationCourses(organizationId: number) {
  const db = await requireDb();
  return db.select().from(courses).where(eq(courses.organizationId, organizationId)).orderBy(desc(courses.updatedAt));
}

export async function registerVideoAsset(input: { lessonId: number; storageKey: string; playbackUrl?: string; captionsUrl?: string; durationSeconds?: number; processingStatus: "uploaded" | "processing" | "ready" | "failed" | "rejected"; rightsStatus: "pending" | "verified" | "restricted" | "rejected" }) {
  const db = await requireDb();
  const result = await db.insert(videoAssets).values({ ...input, playbackUrl: input.playbackUrl ?? null, captionsUrl: input.captionsUrl ?? null, durationSeconds: input.durationSeconds ?? null });
  return Number(result[0].insertId);
}

export async function getLessonScope(lessonId: number) {
  const db = await requireDb();
  const result = await db
    .select({ lessonId: lessons.id, courseId: courses.id, organizationId: courses.organizationId })
    .from(lessons)
    .innerJoin(courses, eq(courses.id, lessons.courseId))
    .where(eq(lessons.id, lessonId))
    .limit(1);
  return result[0] ?? null;
}

export async function registerVideoAssetWithJobs(input: { lessonId: number; organizationId: number; requestedByUserId: number; storageKey: string; playbackUrl?: string; captionsUrl?: string; durationSeconds?: number; rightsStatus: "pending" | "verified" | "restricted" | "rejected" }) {
  const db = await requireDb();
  return db.transaction(async (tx) => {
    const assetResult = await tx.insert(videoAssets).values({
      lessonId: input.lessonId,
      storageKey: input.storageKey,
      playbackUrl: input.playbackUrl ?? null,
      captionsUrl: input.captionsUrl ?? null,
      durationSeconds: input.durationSeconds ?? null,
      processingStatus: "uploaded",
      rightsStatus: input.rightsStatus,
    });
    const videoAssetId = Number(assetResult[0].insertId);
    await tx.insert(mediaProcessingJobs).values([
      { videoAssetId, jobType: "transcode" },
      { videoAssetId, jobType: "transcript" },
      { videoAssetId, jobType: "index" },
      { videoAssetId, jobType: "moderation_scan" },
    ]);
    await tx.insert(auditLogs).values({ actorUserId: input.requestedByUserId, organizationId: input.organizationId, action: "media.asset_registered", entityType: "video_asset", entityId: String(videoAssetId), metadata: { lessonId: input.lessonId, rightsStatus: input.rightsStatus } });
    return { videoAssetId, processingStatus: "uploaded" as const, queuedJobTypes: ["transcode", "transcript", "index", "moderation_scan"] as const };
  });
}

export async function listMediaProcessingJobs(lessonId: number) {
  const db = await requireDb();
  return db
    .select({ id: mediaProcessingJobs.id, jobType: mediaProcessingJobs.jobType, status: mediaProcessingJobs.status, attempt: mediaProcessingJobs.attempt, scheduledAt: mediaProcessingJobs.scheduledAt, updatedAt: mediaProcessingJobs.updatedAt, videoAssetId: videoAssets.id })
    .from(mediaProcessingJobs)
    .innerJoin(videoAssets, eq(videoAssets.id, mediaProcessingJobs.videoAssetId))
    .where(eq(videoAssets.lessonId, lessonId))
    .orderBy(desc(mediaProcessingJobs.updatedAt));
}

export async function claimMediaProcessingJob(workerId: string) {
  const db = await requireDb();
  return db.transaction(async (tx) => {
    const candidates = await tx
      .select()
      .from(mediaProcessingJobs)
      .where(eq(mediaProcessingJobs.status, "queued"))
      .orderBy(asc(mediaProcessingJobs.scheduledAt), asc(mediaProcessingJobs.id))
      .limit(1);
    const job = candidates[0];
    if (!job) return null;
    const claimed = await tx
      .update(mediaProcessingJobs)
      .set({ status: "running", attempt: job.attempt + 1, lockedAt: new Date(), lockedBy: workerId, errorMessage: null })
      .where(and(eq(mediaProcessingJobs.id, job.id), eq(mediaProcessingJobs.status, "queued")));
    if (!claimed[0].affectedRows) return null;
    const assets = await tx.select({ storageKey: videoAssets.storageKey }).from(videoAssets).where(eq(videoAssets.id, job.videoAssetId)).limit(1);
    const asset = assets[0];
    if (!asset) throw new Error("Media job references a missing video asset");
    return { id: job.id, videoAssetId: job.videoAssetId, jobType: job.jobType, attempt: job.attempt + 1, storageKey: asset.storageKey };
  });
}

export async function completeMediaProcessingJob(input: { jobId: number; workerId: string; status: "succeeded" | "failed"; errorMessage?: string; playbackUrl?: string; captionsUrl?: string; durationSeconds?: number }) {
  const db = await requireDb();
  return db.transaction(async (tx) => {
    const jobs = await tx.select().from(mediaProcessingJobs).where(and(eq(mediaProcessingJobs.id, input.jobId), eq(mediaProcessingJobs.status, "running"), eq(mediaProcessingJobs.lockedBy, input.workerId))).limit(1);
    const job = jobs[0];
    if (!job) return false;
    if (job.jobType === "transcode" && input.status === "succeeded" && (!input.playbackUrl || !input.durationSeconds)) throw new Error("A successful transcode requires playbackUrl and durationSeconds");
    await tx.update(mediaProcessingJobs).set({ status: input.status, completedAt: new Date(), errorMessage: input.errorMessage ?? null }).where(eq(mediaProcessingJobs.id, input.jobId));
    if (job.jobType === "transcode") {
      await tx.update(videoAssets).set({ processingStatus: input.status === "succeeded" ? "ready" : "failed", playbackUrl: input.playbackUrl ?? null, captionsUrl: input.captionsUrl ?? null, durationSeconds: input.durationSeconds ?? null }).where(eq(videoAssets.id, job.videoAssetId));
    }
    return true;
  });
}

export async function getManagedPlaybackAsset(videoAssetId: number) {
  const db = await requireDb();
  const result = await db
    .select({ id: videoAssets.id, storageKey: videoAssets.storageKey, playbackUrl: videoAssets.playbackUrl, processingStatus: videoAssets.processingStatus, rightsStatus: videoAssets.rightsStatus, lessonId: videoAssets.lessonId, organizationId: courses.organizationId })
    .from(videoAssets)
    .innerJoin(lessons, eq(lessons.id, videoAssets.lessonId))
    .innerJoin(courses, eq(courses.id, lessons.courseId))
    .where(eq(videoAssets.id, videoAssetId))
    .limit(1);
  return result[0] ?? null;
}

export async function getMediaQueueHealth(staleAfterMinutes = 30) {
  const db = await requireDb();
  const staleBefore = new Date(Date.now() - staleAfterMinutes * 60 * 1000);
  const statuses = await db
    .select({ status: mediaProcessingJobs.status, total: count() })
    .from(mediaProcessingJobs)
    .groupBy(mediaProcessingJobs.status);
  const stale = await db
    .select({ total: count() })
    .from(mediaProcessingJobs)
    .where(and(eq(mediaProcessingJobs.status, "running"), lt(mediaProcessingJobs.lockedAt, staleBefore)));
  return {
    byStatus: Object.fromEntries(statuses.map((entry) => [entry.status, entry.total])),
    staleRunningJobs: stale[0]?.total ?? 0,
    staleAfterMinutes,
    checkedAt: new Date().toISOString(),
  };
}

export async function recoverStaleMediaProcessingJobs(staleAfterMinutes: number) {
  const db = await requireDb();
  const staleBefore = new Date(Date.now() - staleAfterMinutes * 60 * 1000);
  const result = await db
    .update(mediaProcessingJobs)
    .set({ status: "queued", lockedAt: null, lockedBy: null, scheduledAt: new Date(), errorMessage: "Recovered after worker lease expiry" })
    .where(and(eq(mediaProcessingJobs.status, "running"), lt(mediaProcessingJobs.lockedAt, staleBefore)));
  return Number(result[0].affectedRows ?? 0);
}

export async function createModerationReport(input: { reportedByUserId: number; organizationId?: number; subjectType: "course" | "lesson" | "video" | "comment"; subjectId: number; reason: string; details?: string }) {
  const db = await requireDb();
  const result = await db.insert(moderationReports).values({ ...input, organizationId: input.organizationId ?? null, details: input.details ?? null });
  const id = Number(result[0].insertId);
  await db.insert(auditLogs).values({ actorUserId: input.reportedByUserId, organizationId: input.organizationId ?? null, action: "moderation.reported", entityType: input.subjectType, entityId: String(input.subjectId), metadata: { reportId: id, reason: input.reason } });
  return id;
}

export async function listModerationReports(organizationId: number) {
  const db = await requireDb();
  return db.select().from(moderationReports).where(eq(moderationReports.organizationId, organizationId)).orderBy(desc(moderationReports.createdAt));
}

export async function resolveModerationReport(input: { reportId: number; actorUserId: number; organizationId: number; status: "resolved" | "dismissed" }) {
  const db = await requireDb();
  await db.update(moderationReports).set({ status: input.status, resolvedByUserId: input.actorUserId, resolvedAt: new Date() }).where(and(eq(moderationReports.id, input.reportId), eq(moderationReports.organizationId, input.organizationId)));
  await db.insert(auditLogs).values({ actorUserId: input.actorUserId, organizationId: input.organizationId, action: `moderation.${input.status}`, entityType: "moderation_report", entityId: String(input.reportId) });
}

export async function getProductionHealth() {
  const db = await getDb();
  return { database: db ? "connected" : "unavailable", checkedAt: new Date().toISOString() } as const;
}

export type MembershipRole = OrganizationRole;
