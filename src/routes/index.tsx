import { createFileRoute, Link } from "@tanstack/react-router";
import { lessons, totalMinutes } from "@/content/lessons";
import { useUi } from "@/content/localize";
import { copy } from "@/content/ui";
import { prefsFromMatches } from "@/lib/prefs";
import { PathList } from "@/components/path-list";
import { RichText } from "@/components/rich-text";
import { useCourseProgress } from "@/lib/course-progress";

export const Route = createFileRoute("/")({
  head: ({ matches }) => {
    const ui = copy[prefsFromMatches(matches).locale];
    return { meta: [{ title: `${ui.siteName} — ${ui.kicker}` }] };
  },
  component: Home,
});

function Home() {
  const ui = useUi();
  const { answers } = useCourseProgress();
  const first = lessons[0];

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <p className="font-display text-lg italic text-oxide">{ui.kicker}</p>
      <h1 className="mt-3 font-display text-5xl text-balance text-ink sm:text-6xl">{ui.siteName}</h1>
      <p className="mt-6 text-lg leading-relaxed text-pretty text-ink">
        {ui.ledeBefore}
        <a href="https://patina-rust.netlify.app" className="border-b border-oxide text-oxide">
          {ui.languageCourse}
        </a>
        {ui.ledeAfter}
      </p>
      <p className="mt-3 text-lg leading-relaxed text-pretty text-ink-soft">
        <RichText text={ui.know} />
      </p>
      {first && (
        <Link
          to="/lessons/$slug"
          params={{ slug: first.slug }}
          className="mt-8 inline-flex min-h-11 items-center border-b border-oxide text-oxide"
        >
          {ui.start}
        </Link>
      )}
      <h2 className="mt-12 font-display text-3xl text-ink">{ui.rulesTitle}</h2>
      <ol className="mt-4 border-t border-line">
        {ui.rules.map((rule, index) => (
          <li key={rule} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 border-b border-line py-4">
            <span className="font-mono text-sm text-oxide">0{index + 1}</span>
            <p className="text-pretty leading-relaxed text-ink-soft">
              <RichText text={rule} />
            </p>
          </li>
        ))}
      </ol>
      <p className="mt-10 text-sm text-muted">
        <span className="font-mono tabular-nums">{totalMinutes()}</span> {ui.about}
      </p>
      <PathList answers={answers} />
    </main>
  );
}
