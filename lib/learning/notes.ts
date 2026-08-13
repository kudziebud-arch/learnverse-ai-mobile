import type { Lesson } from "./types";

export function createLessonOutline(lesson: Lesson) {
  const definitions = lesson.concepts.map((concept) => `• **${concept[0].toUpperCase()}${concept.slice(1)}** — revisit this term in the lesson transcript.`);
  const chapters = lesson.chapters.map((chapter) => `• **${chapter.title}** — ${chapter.summary}`);
  return [
    `# ${lesson.shortTitle}`,
    "",
    "## Key idea",
    lesson.description,
    "",
    "## Concepts to remember",
    ...definitions,
    "",
    "## Lesson map",
    ...chapters,
    "",
    "## Check your understanding",
    lesson.interactiveQuestion.prompt,
  ].join("\n");
}
