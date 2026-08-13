import { COOKIE_NAME } from "../shared/const.js";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { LearnerState } from "../lib/learning/types";
import { canManageOrganization, canResolveModeration, isSafeStorageKey, type OrganizationRole } from "../shared/production";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM, listLLMModels } from "./_core/llm";

let selectedTutorModel: string | null = null;
let modelLookupExpiresAt = 0;

async function getTutorModel() {
  if (selectedTutorModel && Date.now() < modelLookupExpiresAt) return selectedTutorModel;
  const { data } = await listLLMModels();
  const model = data.find((item) => item.id === "gpt-5-mini")?.id ?? data[0]?.id;
  if (!model) throw new Error("No AI model is currently available");
  selectedTutorModel = model;
  modelLookupExpiresAt = Date.now() + 5 * 60 * 1000;
  return model;
}

const tutorInput = z.object({
  question: z.string().trim().min(3).max(1000),
  lessonId: z.string().trim().min(1).max(120),
  timestampSeconds: z.number().finite().min(0).max(24 * 60 * 60),
  transcript: z.string().trim().min(1).max(12000),
});

const noteInput = z.object({
  lessonTitle: z.string().trim().min(1).max(200),
  concepts: z.array(z.string().trim().min(1).max(80)).min(1).max(12),
  transcript: z.string().trim().min(1).max(12000),
});

const tutorOutput = z.object({
  answer: z.string().trim().min(1).max(6000),
  groundingStatus: z.enum(["grounded", "limited"]),
  suggestedPractice: z.string().trim().min(1).max(1000),
});

const learningEventInput = z.object({
  id: z.string().min(1).max(160),
  type: z.enum(["VIDEO_STARTED", "VIDEO_COMPLETED", "CHAPTER_COMPLETED", "QUESTION_ANSWERED", "QUIZ_COMPLETED", "FLASHCARD_REVIEWED"]),
  lessonId: z.string().max(160).optional(),
  concept: z.string().max(160).optional(),
  occurredAt: z.string().datetime(),
});

const learnerStateInput = z.object({
  lessonProgress: z.record(z.string().max(160), z.number().finite().min(0).max(24 * 60 * 60)).refine((value) => Object.keys(value).length <= 500, "Too many lesson progress records"),
  completedLessonIds: z.array(z.string().min(1).max(160)).max(500),
  answeredQuestionIds: z.array(z.string().min(1).max(160)).max(2000),
  quizAttempts: z.array(z.object({ id: z.string().min(1).max(160), lessonId: z.string().min(1).max(160), questionId: z.string().min(1).max(160), correct: z.boolean(), occurredAt: z.string().datetime() })).max(2000),
  reviewedFlashcardIds: z.array(z.string().min(1).max(160)).max(5000),
  events: z.array(learningEventInput).max(5000),
});

const organizationInput = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
});
const organizationIdInput = z.object({ organizationId: z.number().int().positive() });
const courseInput = organizationIdInput.extend({
  title: z.string().trim().min(3).max(255),
  description: z.string().trim().max(8000).optional(),
  subject: z.string().trim().max(120).optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  visibility: z.enum(["private", "organization", "public", "unlisted"]).default("private"),
});
const moderationReportInput = z.object({
  organizationId: z.number().int().positive().optional(),
  subjectType: z.enum(["course", "lesson", "video", "comment"]),
  subjectId: z.number().int().positive(),
  reason: z.string().trim().min(3).max(120),
  details: z.string().trim().max(4000).optional(),
});
const mediaAssetInput = z.object({
  lessonId: z.number().int().positive(),
  storageKey: z.string().trim().refine(isSafeStorageKey, "Storage key must be a relative path without traversal segments"),
  playbackUrl: z.string().url().max(2048).optional(),
  captionsUrl: z.string().url().max(2048).optional(),
  durationSeconds: z.number().int().positive().max(24 * 60 * 60).optional(),
  rightsStatus: z.enum(["pending", "verified", "restricted", "rejected"]).default("pending"),
});

async function requireOrganizationRole(userId: number, organizationId: number, predicate: (role: OrganizationRole) => boolean) {
  const membership = await db.getOrganizationMembership(userId, organizationId);
  if (!membership || !predicate(membership.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Your organization role does not permit this action" });
  }
  return membership;
}

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  learning: router({
    tutor: publicProcedure.input(tutorInput).mutation(async ({ input }) => {
      const model = await getTutorModel();
      const timestamp = Math.floor(input.timestampSeconds / 60).toString().padStart(2, "0") + ":" + Math.floor(input.timestampSeconds % 60).toString().padStart(2, "0");
      const response = await invokeLLM({
        model,
        maxTokens: 700,
        messages: [
          {
            role: "system",
            content: "You are LearnVerse AI, an educational assistant. You are not a human teacher. Answer only from the supplied lesson context when possible. If the context is insufficient, clearly say what is uncertain. Do not invent citations. Return a JSON object with exactly these keys: answer, groundingStatus, suggestedPractice. groundingStatus must be grounded only when the answer is supported by the supplied lesson context; otherwise use limited. In answer, use concise labeled paragraphs: Explanation, Example, Practice, Check understanding.",
          },
          {
            role: "user",
            content: `Lesson ID: ${input.lessonId}\nCurrent lesson moment: ${timestamp}\nTranscript context:\n${input.transcript}\n\nLearner question: ${input.question}`,
          },
        ],
        response_format: { type: "json_object" },
      });
      const rawAnswer = response.choices[0]?.message?.content;
      if (typeof rawAnswer !== "string" || rawAnswer.trim().length === 0) throw new Error("The AI tutor returned no answer");
      let answer: z.infer<typeof tutorOutput>;
      try {
        answer = tutorOutput.parse(JSON.parse(rawAnswer));
      } catch {
        throw new Error("The AI tutor returned an invalid response");
      }
      return {
        answer: answer.answer,
        groundingStatus: answer.groundingStatus,
        citations: answer.groundingStatus === "grounded" ? [{ label: `Current lesson context at ${timestamp}`, timestampSeconds: input.timestampSeconds }] : [],
        suggestedPractice: answer.suggestedPractice,
      };
    }),
    generateNotes: publicProcedure.input(noteInput).mutation(async ({ input }) => {
      const model = await getTutorModel();
      const response = await invokeLLM({
        model,
        maxTokens: 850,
        messages: [
          { role: "system", content: "You create concise study notes from only supplied educational material. Do not invent facts. Use headings, short definitions, one example when supported, and a final self-check prompt. Return plain text without citations." },
          { role: "user", content: `Lesson: ${input.lessonTitle}\nConcepts: ${input.concepts.join(", ")}\nTranscript:\n${input.transcript}` },
        ],
      });
      const notes = response.choices[0]?.message?.content;
      if (typeof notes !== "string" || notes.trim().length === 0) throw new Error("The notes service returned no content");
      return { notes: notes.trim() };
    }),
  }),
  learnerState: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const stored = await db.getLearnerState(ctx.user.id);
      return stored ? { state: stored.state as unknown as LearnerState, version: stored.version, updatedAt: stored.updatedAt.toISOString() } : null;
    }),
    save: protectedProcedure.input(learnerStateInput).mutation(async ({ ctx, input }) => {
      return db.saveLearnerState(ctx.user.id, input as LearnerState);
    }),
  }),
  organizations: router({
    listMine: protectedProcedure.query(({ ctx }) => db.listOrganizationMemberships(ctx.user.id)),
    create: protectedProcedure.input(organizationInput).mutation(({ ctx, input }) => db.createOrganizationWithOwner(ctx.user.id, input.name, input.slug)),
  }),
  courses: router({
    listForOrganization: protectedProcedure.input(organizationIdInput).query(async ({ ctx, input }) => {
      await requireOrganizationRole(ctx.user.id, input.organizationId, () => true);
      return db.listOrganizationCourses(input.organizationId);
    }),
    create: protectedProcedure.input(courseInput).mutation(async ({ ctx, input }) => {
      await requireOrganizationRole(ctx.user.id, input.organizationId, canManageOrganization);
      return db.createCourse({ ...input, createdByUserId: ctx.user.id });
    }),
  }),
  media: router({
    registerAsset: protectedProcedure.input(mediaAssetInput).mutation(async ({ ctx, input }) => {
      const scope = await db.getLessonScope(input.lessonId);
      if (!scope) throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
      await requireOrganizationRole(ctx.user.id, scope.organizationId, canManageOrganization);
      return db.registerVideoAssetWithJobs({ ...input, organizationId: scope.organizationId, requestedByUserId: ctx.user.id });
    }),
    listJobs: protectedProcedure.input(z.object({ lessonId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const scope = await db.getLessonScope(input.lessonId);
      if (!scope) throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
      await requireOrganizationRole(ctx.user.id, scope.organizationId, canManageOrganization);
      return db.listMediaProcessingJobs(input.lessonId);
    }),
  }),
  moderation: router({
    report: protectedProcedure.input(moderationReportInput).mutation(({ ctx, input }) => db.createModerationReport({ ...input, reportedByUserId: ctx.user.id })),
    list: protectedProcedure.input(organizationIdInput).query(async ({ ctx, input }) => {
      await requireOrganizationRole(ctx.user.id, input.organizationId, canResolveModeration);
      return db.listModerationReports(input.organizationId);
    }),
    resolve: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), reportId: z.number().int().positive(), status: z.enum(["resolved", "dismissed"]) })).mutation(async ({ ctx, input }) => {
      await requireOrganizationRole(ctx.user.id, input.organizationId, canResolveModeration);
      await db.resolveModerationReport({ ...input, actorUserId: ctx.user.id });
      return { success: true };
    }),
  }),
  operations: router({
    publicHealth: publicProcedure.query(() => ({ status: "ok" as const, service: "learnverse-api", checkedAt: new Date().toISOString() })),
    health: adminProcedure.query(() => db.getProductionHealth()),
  }),
});

export type AppRouter = typeof appRouter;
