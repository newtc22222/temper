import { useUi } from "@/content/localize";
import type { Lesson } from "@/content/types";
import { lessonDone } from "@/lib/course-progress";
import { RichText } from "@/components/rich-text";
import clsx from "clsx";

export function Quiz({
  lesson,
  answers,
  ready,
  onAnswer,
}: {
  lesson: Lesson;
  answers: Record<string, string> | undefined;
  ready: boolean;
  onAnswer: (questionId: string, choiceId: string) => void;
}) {
  const ui = useUi();
  const picked = answers ?? {};
  const done = lessonDone(lesson, picked);
  const any = lesson.quiz.some((question) => picked[question.id]);

  return (
    <section className="mt-14 border-t border-line pt-8" aria-labelledby="quiz-title">
      <h2 id="quiz-title" className="font-display text-3xl text-ink">
        {ui.quiz}
      </h2>
      <ol className="mt-6 space-y-8">
        {lesson.quiz.map((question, index) => {
          const choice = picked[question.id];
          return (
            <li key={question.id}>
              <p className="text-lg text-pretty text-ink">
                <span className="mr-2 font-mono text-sm text-muted">{index + 1}</span>
                <RichText text={question.prompt} />
              </p>
              <div className="mt-3 grid gap-2">
                {question.choices.map((option) => {
                  const selected = choice === option.id;
                  const correct = selected && option.id === question.answer;
                  const wrong = selected && option.id !== question.answer;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={!ready}
                      onClick={() => onAnswer(question.id, option.id)}
                      aria-pressed={selected}
                      className={clsx(
                        "min-h-11 border px-3 py-2 text-left motion-safe:transition-colors motion-safe:active:scale-[0.96] disabled:opacity-70",
                        correct && "border-oxide bg-oxide-soft",
                        wrong && "border-ink bg-paper-2",
                        !selected && "border-line bg-card",
                      )}
                    >
                      <RichText text={option.text} />
                    </button>
                  );
                })}
              </div>
              {choice && (
                <p className="mt-3 text-pretty text-ink-soft">
                  {choice === question.answer ? null : (
                    <span className="text-ink">{ui.notQuite} </span>
                  )}
                  <RichText text={question.why} />
                </p>
              )}
            </li>
          );
        })}
      </ol>
      {done && <p className="mt-8 text-oxide-deep">{ui.lessonDone}</p>}
      {!done && any && <p className="mt-8 text-muted">{ui.lessonUndone}</p>}
    </section>
  );
}
