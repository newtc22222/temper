import { createFileRoute } from "@tanstack/react-router";
import { usePocket, useUi } from "@/content/localize";
import { copy } from "@/content/ui";
import { prefsFromMatches } from "@/lib/prefs";
import { CodeBlock } from "@/components/code-block";
import { RichText } from "@/components/rich-text";

export const Route = createFileRoute("/pocket")({
  head: ({ matches }) => {
    const ui = copy[prefsFromMatches(matches).locale];
    return { meta: [{ title: `${ui.pocket} — ${ui.siteName}` }] };
  },
  component: PocketPage,
});

function PocketPage() {
  const ui = useUi();
  const { signatures, statuses } = usePocket();
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-5xl text-ink">{ui.pocket}</h1>
      <p className="mt-4 text-lg leading-relaxed text-pretty text-ink-soft">
        <RichText text={ui.pocketLead} />
      </p>
      <h2 className="mt-12 font-display text-3xl text-ink">{ui.signatures}</h2>
      {signatures.map((item) => (
        <section key={item.code} className="min-w-0">
          <h3 className="mt-8 font-display text-2xl text-ink">{item.title}</h3>
          <CodeBlock code={item.code} caption={item.note} label="fragment" />
        </section>
      ))}
      <h2 className="mt-12 font-display text-3xl text-ink">{ui.statuses}</h2>
      <div className="mt-4 border-t border-line">
        {statuses.map((row) => (
          <div key={row.code} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-4">
            <p className="font-mono text-oxide">{row.code}</p>
            <div className="min-w-0">
              <p className="text-pretty text-ink-soft">
                <RichText text={row.when} />
              </p>
              <p className="mt-1 text-sm text-pretty text-muted">
                <span className="text-ink">{ui.who}. </span>
                <RichText text={row.who} />
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
