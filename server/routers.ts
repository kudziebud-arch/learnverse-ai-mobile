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
            content: "You are LearnVerse AI, an educational assistant. You are not a human teacher. Answer only from the supplied lesson context when possible. If the context is insufficient, clearly say what is uncertain. Do not invent citations. Use exactly these labeled sections: Explanation, Example, Practice, Check understanding. Keep the response concise and suitable for a learner.",
          },
          {
            role: "user",
            content: `Lesson ID: ${input.lessonId}\nCurrent lesson moment: ${timestamp}\nTranscript context:\n${input.transcript}\n\nLearner question: ${input.question}`,
          },
        ],
      });
      const answer = response.choices[0]?.message?.content;
      if (typeof answer !== "string" || answer.trim().length === 0) throw new Error("The AI tutor returned no answer");
      return {
        answer: answer.trim(),
        groundingStatus: "grounded" as const,
        citations: [{ label: `Current lesson context at ${timestamp}`, timestampSeconds: input.timestampSeconds }],
        suggestedPractice: "Restate the idea in your own words, then answer the lesson checkpoint without looking at the explanation.",
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
