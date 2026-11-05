import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { totalMinutes } from "@/content/lessons";
import { useUi } from "@/content/localize";
import { copy } from "@/content/ui";
import { prefsFromMatches } from "@/lib/prefs";
import { PathList } from "@/components/path-list";
import { useCourseProgress } from "@/lib/course-progress";

export const Route = createFileRoute("/path")({
  head: ({ matches }) => {
    const ui = copy[prefsFromMatches(matches).locale];
    return { meta: [{ title: `${ui.path} — ${ui.siteName}` }] };
  },
  component: PathPage,
});

function PathPage() {
  const ui = useUi();
  const { answers, reset } = useCourseProgress();
  const [armed, setArmed] = useState(false);

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-5xl text-ink">{ui.path}</h1>
      <p className="mt-4 text-lg text-pretty text-ink-soft">{ui.pathLead}</p>
      <p className="mt-3 text-sm text-muted">
        <span className="font-mono tabular-nums">{totalMinutes()}</span> {ui.about}
      </p>
      <PathList answers={answers} />
      <button
        type="button"
        className="mt-10 inline-flex min-h-11 items-center text-muted underline decoration-line underline-offset-4"
        onClick={() => {
          if (!armed) {
            setArmed(true);
            return;
          }
          reset();
          setArmed(false);
        }}
      >
        {armed ? ui.clearConfirm : ui.clear}
      </button>
    </main>
  );
}
