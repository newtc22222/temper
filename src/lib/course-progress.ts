import { useEffect, useState } from "react";
import { lessons } from "@/content/lessons";
import type { Lesson } from "@/content/types";
import { useProgress } from "@/lib/progress";

export function lessonDone(lesson: Lesson, answers: Record<string, string> | undefined): boolean {
  if (!answers) return false;
  return lesson.quiz.every((question) => answers[question.id] === question.answer);
}

export function doneCount(all: Record<string, Record<string, string>>): number {
  return lessons.filter((lesson) => lessonDone(lesson, all[lesson.slug])).length;
}

export function useCourseProgress() {
  const answers = useProgress((state) => state.answers);
  const write = useProgress((state) => state.answer);
  const clear = useProgress((state) => state.reset);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const store = useProgress.persist;
    const unsub = store.onFinishHydration(() => setReady(true));
    if (store.hasHydrated()) setReady(true);
    else void store.rehydrate();
    return unsub;
  }, []);

  return {
    ready,
    answers: ready ? answers : {},
    answer: (slug: string, questionId: string, choiceId: string) => {
      if (!useProgress.persist.hasHydrated()) return;
      write(slug, questionId, choiceId);
    },
    reset: () => {
      if (!useProgress.persist.hasHydrated()) return;
      clear();
    },
  };
}
