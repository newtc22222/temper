import { useState } from "react";
import { useUi } from "@/content/localize";
import type { Block } from "@/content/types";
import { CodeBlock } from "@/components/code-block";
import { RichText } from "@/components/rich-text";
import clsx from "clsx";

function Pick({ block }: { block: Extract<Block, { type: "pick" }> }) {
  const ui = useUi();
  const [choice, setChoice] = useState<"a" | "b" | null>(null);
  const sides = [
    { id: "a" as const, code: block.a.code, label: block.a.label },
    { id: "b" as const, code: block.b.code, label: block.b.label },
  ];

  return (
    <div className="my-8 min-w-0">
      <p className="text-ink">
        <RichText text={block.prompt} />
      </p>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {sides.map((side) => {
          const selected = choice === side.id;
          const right = choice !== null && side.id === block.answer;
          const wrong = selected && side.id !== block.answer;
          return (
            <button
              key={side.id}
              type="button"
              onClick={() => setChoice(side.id)}
              aria-pressed={selected}
              className={clsx(
                "min-w-0 border bg-card p-3 text-left motion-safe:transition-colors motion-safe:active:scale-[0.96]",
                right && "border-oxide bg-oxide-soft",
                wrong && "border-ink",
                !right && !wrong && "border-line",
              )}
            >
              <span className="mb-2 flex items-center justify-between font-mono text-xs text-muted">
                <span>{side.id.toUpperCase()}</span>
                {side.label === "fragment" && <span>{ui.fragment}</span>}
                {side.label === "fails" && <span className="text-oxide-deep">{ui.fails}</span>}
              </span>
              <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-ink">
                {side.code}
              </pre>
            </button>
          );
        })}
      </div>
      {choice && (
        <p className="mt-3 text-ink-soft">
          {choice === block.answer ? null : <span className="text-ink">{ui.notQuite} </span>}
          <RichText text={block.why} />
        </p>
      )}
    </div>
  );
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div>
      {blocks.map((block, index) => {
        if (block.type === "prose") {
          return (
            <p key={index} className="mt-5 text-lg leading-relaxed text-pretty text-ink-soft first:mt-0">
              <RichText text={block.text} />
            </p>
          );
        }
        if (block.type === "heading") {
          return (
            <h2 key={index} className="mt-10 font-display text-3xl text-balance text-ink">
              {block.text}
            </h2>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={index} className="mt-5 space-y-3 text-lg text-ink-soft">
              {block.items.map((item) => (
                <li key={item} className="grid grid-cols-[1rem_minmax(0,1fr)] gap-3">
                  <span className="mt-3 h-px bg-oxide" aria-hidden="true" />
                  <span className="text-pretty">
                    <RichText text={item} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === "callout") {
          return (
            <aside
              key={index}
              className={clsx(
                "my-8 border-l-2 px-4 py-3",
                block.tone === "warn" ? "border-oxide bg-oxide-soft" : "border-line bg-paper-2",
              )}
            >
              <p className="font-display text-lg text-ink">{block.title}</p>
              <p className="mt-1 text-pretty text-ink-soft">
                <RichText text={block.text} />
              </p>
            </aside>
          );
        }
        if (block.type === "code") {
          return (
            <CodeBlock
              key={index}
              code={block.code}
              file={block.file}
              label={block.label}
              lang={block.lang}
              caption={block.caption}
              output={block.output}
              outputLabel={block.outputLabel}
            />
          );
        }
        if (block.type === "pick") {
          return <Pick key={index} block={block} />;
        }
        return (
          <ul key={index} className="my-8 space-y-3">
            {block.items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center text-oxide underline decoration-line underline-offset-4"
                >
                  {item.label}
                </a>
                <p className="text-sm text-muted">{item.note}</p>
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}
