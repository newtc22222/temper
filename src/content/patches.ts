import type { Block, Lesson, QuizQuestion } from "./types";

/** A translated slice of one block. The kind must match the English block. */
export type BlockPatch =
  | { text: string }
  | { items: string[] }
  | { title: string; text: string }
  | { caption?: string; outputLabel?: string }
  | { prompt: string; why: string }
  | { notes: string[] };

export type QuizPatch = {
  prompt: string;
  choices: string[];
  why: string;
};

export type LessonPatch = {
  title: string;
  summary: string;
  blocks: BlockPatch[];
  quiz: QuizPatch[];
};

function isText(patch: BlockPatch): patch is { text: string } {
  return "text" in patch && !("title" in patch);
}

export function applyLesson(lesson: Lesson, patch: LessonPatch | undefined): Lesson {
  if (!patch || patch.blocks.length !== lesson.blocks.length || patch.quiz.length !== lesson.quiz.length) {
    return lesson;
  }
  return {
    ...lesson,
    title: patch.title,
    summary: patch.summary,
    blocks: lesson.blocks.map((block, index) => applyBlock(block, patch.blocks[index])),
    quiz: lesson.quiz.map((question, index) => applyQuiz(question, patch.quiz[index])) as Lesson["quiz"],
  };
}

function applyBlock(block: Block, patch: BlockPatch | undefined): Block {
  if (!patch) return block;
  if ((block.type === "prose" || block.type === "heading") && isText(patch)) {
    return { ...block, text: patch.text };
  }
  if (block.type === "list" && "items" in patch && patch.items.length === block.items.length) {
    return { ...block, items: patch.items };
  }
  if (block.type === "callout" && "title" in patch && "text" in patch) {
    return { ...block, title: patch.title, text: patch.text };
  }
  if (block.type === "code" && !("text" in patch) && !("items" in patch) && !("prompt" in patch) && !("notes" in patch)) {
    return {
      ...block,
      caption: "caption" in patch && patch.caption ? patch.caption : block.caption,
      outputLabel: "outputLabel" in patch && patch.outputLabel ? patch.outputLabel : block.outputLabel,
    };
  }
  if (block.type === "pick" && "prompt" in patch && "why" in patch) {
    return { ...block, prompt: patch.prompt, why: patch.why };
  }
  if (block.type === "links" && "notes" in patch && patch.notes.length === block.items.length) {
    return {
      ...block,
      items: block.items.map((item, index) => ({ ...item, note: patch.notes[index] ?? item.note })),
    };
  }
  return block;
}

function applyQuiz(question: QuizQuestion, patch: QuizPatch | undefined): QuizQuestion {
  if (!patch || patch.choices.length !== question.choices.length) return question;
  return {
    ...question,
    prompt: patch.prompt,
    why: patch.why,
    choices: question.choices.map((choice, index) => ({ ...choice, text: patch.choices[index] ?? choice.text })),
  };
}
