import { Link } from "@tanstack/react-router";
import { lessonNo } from "@/content/lessons";
import { useLessons, useTracks, useUi } from "@/content/localize";
import { lessonDone } from "@/lib/course-progress";
import { RichText } from "@/components/rich-text";

export function PathList({ answers }: { answers: Record<string, Record<string, string>> }) {
  const ui = useUi();
  const trackList = useTracks();
  const all = useLessons();

  return (
    <div className="mt-12">
      {trackList.map((track, trackIndex) => (
        <section key={track.id} id={track.id} className="mt-10">
          <h2 className="font-display text-2xl text-ink">
            <span className="mr-3 font-mono text-sm text-oxide">{lessonNo(trackIndex + 1)}</span>
            {track.title}
          </h2>
          <p className="mt-1 text-pretty leading-relaxed text-ink-soft">
            <RichText text={track.summary} />
          </p>
          <ol className="mt-4 border-t border-line">
            {all
              .filter((lesson) => lesson.track === track.id)
              .map((lesson) => {
                const done = lessonDone(lesson, answers[lesson.slug]);
                return (
                  <li key={lesson.slug} className="border-b border-line">
                    <Link
                      to="/lessons/$slug"
                      params={{ slug: lesson.slug }}
                      className="flex min-h-11 items-baseline gap-3 py-3"
                    >
                      <span className="w-8 shrink-0 font-mono text-sm tabular-nums text-muted">
                        {lessonNo(lesson.number)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-ink">{lesson.title}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted">
                        {done ? (
                          <span className="text-oxide">{ui.doneWord}</span>
                        ) : (
                          <>
                            <span className="font-mono tabular-nums">{lesson.minutes}</span> {ui.minutes}
                          </>
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
          </ol>
        </section>
      ))}
    </div>
  );
}
