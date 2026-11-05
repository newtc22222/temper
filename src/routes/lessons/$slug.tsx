import { createFileRoute } from "@tanstack/react-router";
import { getLesson, lessonNo } from "@/content/lessons";
import { localizeLesson, useUi } from "@/content/localize";
import { copy } from "@/content/ui";
import { prefsFromMatches } from "@/lib/prefs";
import { LessonView } from "@/components/lesson-view";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/lessons/$slug")({
  loader: ({ params }) => getLesson(params.slug) ?? null,
  head: ({ loaderData, matches }) => {
    const locale = prefsFromMatches(matches).locale;
    const ui = copy[locale];
    const lesson = loaderData ? localizeLesson(loaderData, locale) : null;
    return {
      meta: [
        {
          title: lesson ? `${lessonNo(lesson.number)}. ${lesson.title} — ${ui.siteName}` : ui.siteName,
        },
      ],
    };
  },
  component: LessonPage,
});

function LessonPage() {
  const ui = useUi();
  const lesson = Route.useLoaderData();
  if (!lesson) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="font-display text-4xl text-ink">{ui.notOnPath}</h1>
        <p className="mt-4 text-ink-soft">{ui.missingLesson}</p>
        <Link to="/path" className="mt-8 inline-flex min-h-11 items-center text-oxide">
          {ui.path}
        </Link>
      </main>
    );
  }
  return <LessonView lesson={lesson} />;
}
