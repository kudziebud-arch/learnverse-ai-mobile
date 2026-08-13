import { index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import { organizationRoles } from "../shared/production";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull(),
  createdByUserId: int("createdByUserId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("organizations_slug_unique").on(table.slug), index("organizations_creator_idx").on(table.createdByUserId)]);

export const organizationMembers = mysqlTable("organization_members", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().references(() => organizations.id),
  userId: int("userId").notNull().references(() => users.id),
  role: mysqlEnum("role", organizationRoles).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("organization_members_org_user_unique").on(table.organizationId, table.userId), index("organization_members_user_idx").on(table.userId)]);

export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().references(() => organizations.id),
  createdByUserId: int("createdByUserId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  subject: varchar("subject", { length: 120 }),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).default("beginner").notNull(),
  visibility: mysqlEnum("visibility", ["private", "organization", "public", "unlisted"]).default("private").notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("courses_org_status_idx").on(table.organizationId, table.status), index("courses_creator_idx").on(table.createdByUserId)]);

export const courseModules = mysqlTable("course_modules", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull().references(() => courses.id),
  title: varchar("title", { length: 255 }).notNull(),
  position: int("position").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("course_modules_position_unique").on(table.courseId, table.position)]);

export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull().references(() => courses.id),
  moduleId: int("moduleId").references(() => courseModules.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  position: int("position").notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("lessons_course_position_idx").on(table.courseId, table.position), index("lessons_module_idx").on(table.moduleId)]);

export const videoAssets = mysqlTable("video_assets", {
  id: int("id").autoincrement().primaryKey(),
  lessonId: int("lessonId").notNull().references(() => lessons.id),
  storageKey: varchar("storageKey", { length: 512 }).notNull(),
  playbackUrl: varchar("playbackUrl", { length: 2048 }),
  captionsUrl: varchar("captionsUrl", { length: 2048 }),
  durationSeconds: int("durationSeconds"),
  processingStatus: mysqlEnum("processingStatus", ["uploaded", "processing", "ready", "failed", "rejected"]).default("uploaded").notNull(),
  rightsStatus: mysqlEnum("rightsStatus", ["pending", "verified", "restricted", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("video_assets_lesson_idx").on(table.lessonId), index("video_assets_processing_idx").on(table.processingStatus)]);

export const mediaProcessingJobs = mysqlTable("media_processing_jobs", {
  id: int("id").autoincrement().primaryKey(),
  videoAssetId: int("videoAssetId").notNull().references(() => videoAssets.id),
  jobType: mysqlEnum("jobType", ["transcode", "transcript", "index", "moderation_scan"]).notNull(),
  status: mysqlEnum("status", ["queued", "running", "succeeded", "failed"]).default("queued").notNull(),
  attempt: int("attempt").default(0).notNull(),
  lockedAt: timestamp("lockedAt"),
  lockedBy: varchar("lockedBy", { length: 160 }),
  errorMessage: text("errorMessage"),
  scheduledAt: timestamp("scheduledAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("media_jobs_status_scheduled_idx").on(table.status, table.scheduledAt), index("media_jobs_asset_idx").on(table.videoAssetId)]);

export const learnerStates = mysqlTable("learner_states", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  state: json("state").$type<Record<string, unknown>>().notNull(),
  version: int("version").default(1).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("learner_states_user_unique").on(table.userId)]);

export const learningEvents = mysqlTable("learning_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  eventType: mysqlEnum("eventType", ["VIDEO_STARTED", "VIDEO_COMPLETED", "CHAPTER_COMPLETED", "QUESTION_ANSWERED", "QUIZ_COMPLETED", "FLASHCARD_REVIEWED"]).notNull(),
  lessonId: int("lessonId").references(() => lessons.id),
  concept: varchar("concept", { length: 160 }),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
}, (table) => [index("learning_events_user_occurred_idx").on(table.userId, table.occurredAt), index("learning_events_lesson_idx").on(table.lessonId)]);

export const moderationReports = mysqlTable("moderation_reports", {
  id: int("id").autoincrement().primaryKey(),
  reportedByUserId: int("reportedByUserId").notNull().references(() => users.id),
  organizationId: int("organizationId").references(() => organizations.id),
  subjectType: mysqlEnum("subjectType", ["course", "lesson", "video", "comment"]).notNull(),
  subjectId: int("subjectId").notNull(),
  reason: varchar("reason", { length: 120 }).notNull(),
  details: text("details"),
  status: mysqlEnum("status", ["open", "under_review", "resolved", "dismissed"]).default("open").notNull(),
  resolvedByUserId: int("resolvedByUserId").references(() => users.id),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [index("moderation_reports_status_idx").on(table.status, table.createdAt), index("moderation_reports_org_idx").on(table.organizationId)]);

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  actorUserId: int("actorUserId").references(() => users.id),
  organizationId: int("organizationId").references(() => organizations.id),
  action: varchar("action", { length: 160 }).notNull(),
  entityType: varchar("entityType", { length: 80 }).notNull(),
  entityId: varchar("entityId", { length: 120 }),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [index("audit_logs_org_created_idx").on(table.organizationId, table.createdAt), index("audit_logs_actor_created_idx").on(table.actorUserId, table.createdAt)]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type LearnerStateRecord = typeof learnerStates.$inferSelect;
export type ModerationReport = typeof moderationReports.$inferSelect;
