import { create } from "zustand";
import { persist } from "zustand/middleware";

type Answers = Record<string, Record<string, string>>;

type ProgressState = {
  answers: Answers;
  answer: (slug: string, questionId: string, choiceId: string) => void;
  reset: () => void;
};

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      answers: {},
      answer: (slug, questionId, choiceId) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [slug]: { ...state.answers[slug], [questionId]: choiceId },
          },
        })),
      reset: () => set({ answers: {} }),
    }),
    { name: "temper-progress", skipHydration: true },
  ),
);
