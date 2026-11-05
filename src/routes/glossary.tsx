import { createFileRoute } from "@tanstack/react-router";
import { useGlossary, useUi } from "@/content/localize";
import { copy } from "@/content/ui";
import { prefsFromMatches } from "@/lib/prefs";
import { RichText } from "@/components/rich-text";

export const Route = createFileRoute("/glossary")({
  head: ({ matches }) => {
    const ui = copy[prefsFromMatches(matches).locale];
    return { meta: [{ title: `${ui.glossary} — ${ui.siteName}` }] };
  },
  component: GlossaryPage,
});

function GlossaryPage() {
  const ui = useUi();
  const entries = useGlossary();
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-5xl text-ink">{ui.glossary}</h1>
      <p className="mt-4 text-lg text-pretty text-ink-soft">{ui.glossaryLead}</p>
      <dl className="mt-10 border-t border-line">
        {entries.map((entry) => (
          <div key={entry.term} className="border-b border-line py-5">
            <dt className="font-display text-2xl text-ink">{entry.term}</dt>
            <dd className="mt-2 text-pretty text-ink-soft">
              <RichText text={entry.body} />
            </dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
