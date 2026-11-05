import type { Lesson, Track, TrackId } from "../types";
import { bodyLessons } from "./body";
import { changeLessons } from "./change";
import { edgeLessons } from "./edge";
import { listLessons } from "./list";
import { programLessons } from "./program";
import { requestLessons } from "./request";

export const tracks: Track[] = [
  {
    id: "request",
    title: "The request",
    summary: "What the framework owns, and the first function it calls.",
  },
  {
    id: "body",
    title: "The body",
    summary: "Bytes become a struct you own, and a struct becomes bytes.",
  },
  {
    id: "list",
    title: "The list",
    summary: "One `Vec`, shared. Create, list, and get one note.",
  },
  {
    id: "program",
    title: "The program",
    summary: "Read the compiler, split the files, walk one request.",
  },
  {
    id: "change",
    title: "The change",
    summary: "Delete, replace, and narrow the same list. No new store.",
  },
  {
    id: "edge",
    title: "The edge",
    summary: "Change one field. Tell a missing path from a wrong method.",
  },
];

export const lessons: Lesson[] = [
  ...requestLessons,
  ...bodyLessons,
  ...listLessons,
  ...programLessons,
  ...changeLessons,
  ...edgeLessons,
];

export function lessonsIn(track: TrackId): Lesson[] {
  return lessons.filter((lesson) => lesson.track === track);
}

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.slug === slug);
}

export function lessonNo(n: number): string {
  return String(n).padStart(2, "0");
}

export function neighbors(slug: string): { prev?: Lesson; next?: Lesson } {
  const index = lessons.findIndex((lesson) => lesson.slug === slug);
  return {
    prev: index > 0 ? lessons[index - 1] : undefined,
    next: index >= 0 ? lessons[index + 1] : undefined,
  };
}

export function totalMinutes(): number {
  return lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
}
