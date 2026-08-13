import type { Course, Lesson } from "./types";

const lessonOne: Lesson = {
  id: "lesson-js-values",
  courseId: "course-js-foundations",
  title: "Variables and values: how programs remember information",
  shortTitle: "Variables & values",
  description:
    "Learn how variables let a program name, store, and reuse information without repeating it.",
  durationSeconds: 984,
  level: "Beginner",
  concepts: ["variables", "values", "assignment", "strings", "numbers"],
  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  chapters: [
    {
      id: "chapter-intro",
      title: "Why names matter in code",
      startSeconds: 0,
      summary: "Connect everyday labels to variable names in a program.",
    },
    {
      id: "chapter-values",
      title: "Values and data types",
      startSeconds: 198,
      summary: "Distinguish text values from numeric values and see why the distinction matters.",
    },
    {
      id: "chapter-assignment",
      title: "Assignment in action",
      startSeconds: 486,
      summary: "Follow how an assignment stores a value under a meaningful variable name.",
    },
    {
      id: "chapter-practice",
      title: "Practice: trace the value",
      startSeconds: 755,
      summary: "Predict the value a variable holds after two assignments.",
    },
  ],
  transcript: [
    "A variable is a named place where a program can keep a value for later.",
    "The name should communicate what the value represents, such as score or studentName.",
    "An assignment stores the expression on the right under the name on the left.",
    "When a variable is assigned a new value, the previous value is replaced.",
  ],
  interactiveQuestion: {
    id: "checkpoint-variable-value",
    prompt: "After this code runs, what value does score hold? `let score = 3; score = score + 2;`",
    options: ["3", "5", "score + 2", "An error"],
    correctOptionIndex: 1,
    explanation:
      "The first line stores 3. The second line reads that value, adds 2, and stores the result back into score.",
    concept: "assignment",
    timestampSeconds: 755,
  },
  flashcards: [
    {
      id: "card-variable",
      front: "What is a variable?",
      back: "A named place in a program used to store a value that may be read or changed later.",
      concept: "variables",
    },
    {
      id: "card-assignment",
      front: "What does an assignment do?",
      back: "It evaluates a value or expression and stores the result under a variable name.",
      concept: "assignment",
    },
  ],
};

const lessonTwo: Lesson = {
  id: "lesson-js-functions",
  courseId: "course-js-foundations",
  title: "Functions: package a useful action",
  shortTitle: "Functions",
  description: "Turn repeated instructions into reusable, readable functions.",
  durationSeconds: 1120,
  level: "Beginner",
  concepts: ["functions", "parameters", "return values"],
  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  chapters: [
    { id: "fn-intro", title: "The purpose of a function", startSeconds: 0, summary: "Recognize repeated steps." },
    { id: "fn-input", title: "Inputs and parameters", startSeconds: 260, summary: "Give a function useful input." },
    { id: "fn-output", title: "Returning a result", startSeconds: 642, summary: "Use return values." },
  ],
  transcript: [
    "A function groups instructions that work together toward one purpose.",
    "Parameters are named inputs that a function receives when it is called.",
    "A return value lets a function provide a result to the rest of the program.",
  ],
  interactiveQuestion: {
    id: "checkpoint-function-purpose",
    prompt: "Which choice best describes a function?",
    options: ["A variable that only stores numbers", "A reusable group of instructions", "A browser setting", "A comment in code"],
    correctOptionIndex: 1,
    explanation: "Functions bundle related instructions so a program can reuse a clear, named action.",
    concept: "functions",
    timestampSeconds: 642,
  },
  flashcards: [
    { id: "card-function", front: "What is a function?", back: "A reusable, named group of instructions.", concept: "functions" },
  ],
};

export const starterCourse: Course = {
  id: "course-js-foundations",
  title: "JavaScript Foundations",
  subtitle: "Build your core programming vocabulary",
  instructor: "LearnVerse Editorial",
  subject: "Computer Science",
  level: "Beginner",
  totalDurationMinutes: 35,
  description:
    "A structured starter course that moves from values and variables to reusable functions through explain, practice, and recall activities.",
  skills: ["Programming foundations", "JavaScript", "Problem solving"],
  lessons: [lessonOne, lessonTwo],
};

export const catalog = [starterCourse];

export function getLesson(lessonId: string) {
  return catalog.flatMap((course) => course.lessons).find((lesson) => lesson.id === lessonId);
}

export function getCourse(courseId: string) {
  return catalog.find((course) => course.id === courseId);
}

export function formatDuration(seconds: number) {
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

export function formatTimestamp(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}
