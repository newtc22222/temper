import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { lessonNo } from "@/content/lessons";
import { localizeLesson, useLessons, useTracks, useUi } from "@/content/localize";
import type { Lesson } from "@/content/types";
import { Blocks } from "@/components/blocks";
import { Diagram } from "@/components/diagrams";
import { Quiz } from "@/components/quiz";
import { lessonDone, useCourseProgress } from "@/lib/course-progress";
import { usePrefs } from "@/lib/prefs";
import clsx from "clsx";

export function LessonView({ lesson }: { lesson: Lesson }) {
  const navigate = useNavigate();
  const ui = useUi();
  const { locale } = usePrefs();
  const shown = useMemo(() => localizeLesson(lesson, locale), [lesson, locale]);
  const all = useLessons();
  const trackList = useTracks();
  const { answers, answer, ready } = useCourseProgress();
  const index = all.findIndex((item) => item.slug === lesson.slug);
  const prev = index > 0 ? all[index - 1] : undefined;
  const next = index >= 0 ? all[index + 1] : undefined;
  const track = trackList.find((item) => item.id === lesson.track);

  return (
    <div className="mx-auto grid w-full max-w-6xl lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="hidden px-5 py-8 lg:block">
        <nav className="lesson-nav" aria-label={ui.path}>
          {trackList.map((item) => (
            <div key={item.id} className="mb-6">
              <p className="text-xs tracking-wide text-muted">{item.title}</p>
              <ol className="mt-2">
                {all
                  .filter((itemLesson) => itemLesson.track === item.id)
                  .map((itemLesson) => {
                    const current = itemLesson.slug === lesson.slug;
                    const done = lessonDone(itemLesson, answers[itemLesson.slug]);
                    return (
                      <li key={itemLesson.slug}>
                        <Link
                          to="/lessons/$slug"
                          params={{ slug: itemLesson.slug }}
                          aria-current={current ? "page" : undefined}
                          className={clsx(
                            "flex min-h-11 items-baseline gap-2 border-l-2 py-1 pl-3",
                            current ? "border-oxide text-oxide" : "border-transparent text-ink-soft",
                          )}
                        >
                          <span className="w-6 shrink-0 font-mono text-xs tabular-nums">
                            {lessonNo(itemLesson.number)}
                          </span>
                          <span className="min-w-0 leading-snug">{itemLesson.title}</span>
                          {done && (
                            <>
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 self-start bg-oxide" aria-hidden="true" />
                              <span className="sr-only">{ui.doneWord}</span>
                            </>
                          )}
                        </Link>
                      </li>
                    );
                  })}
              </ol>
            </div>
          ))}
        </nav>
      </aside>
      <article className="min-w-0 max-w-3xl px-5 py-8 lg:py-12">
        <label className="mb-8 block lg:hidden">
          <span className="sr-only">{ui.jump}</span>
          <select
            className="w-full min-h-11 border border-line bg-card px-3 text-ink"
            value={lesson.slug}
            onChange={(event) => {
              void navigate({ to: "/lessons/$slug", params: { slug: event.target.value } });
            }}
          >
            {all.map((item) => (
              <option key={item.slug} value={item.slug}>
                {lessonNo(item.number)} {item.title}
                {lessonDone(item, answers[item.slug]) ? ` · ${ui.doneWord}` : ""}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-muted">
          <span className="font-mono text-oxide">{lessonNo(shown.number)}</span>
          <span> · {track?.title}</span>
          <span className="font-mono tabular-nums"> · {shown.minutes}</span>
          <span> {ui.minutes}</span>
        </p>
        <h1 className="mt-3 font-display text-4xl text-balance text-ink sm:text-5xl">{shown.title}</h1>
        <p className="mt-4 text-lg text-pretty text-ink-soft">{shown.summary}</p>
        <Diagram id={shown.diagram} />
        <Blocks blocks={shown.blocks} />
        <Quiz
          lesson={shown}
          answers={answers[lesson.slug]}
          ready={ready}
          onAnswer={(questionId, choiceId) => answer(lesson.slug, questionId, choiceId)}
        />
        <nav className="mt-12 flex items-stretch justify-between gap-4 border-t border-line pt-6">
          {prev ? (
            <Link to="/lessons/$slug" params={{ slug: prev.slug }} className="min-h-11 max-w-[45%]">
              <span className="block text-xs text-muted">{ui.previous}</span>
              <span className="text-ink">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to="/lessons/$slug" params={{ slug: next.slug }} className="min-h-11 max-w-[45%] text-right">
              <span className="block text-xs text-muted">{ui.next}</span>
              <span className="text-ink">{next.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </div>
  );
}
