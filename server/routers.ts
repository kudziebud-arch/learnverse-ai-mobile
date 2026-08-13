import { COOKIE_NAME } from "../shared/const.js";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
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

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
