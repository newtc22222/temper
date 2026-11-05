import { useState } from "react";
import { useUi } from "@/content/localize";
import type { SnipLabel } from "@/content/types";
import { highlightRust, type SpanKind } from "@/lib/highlight";

const kindClass: Record<SpanKind, string> = {
  plain: "text-code-fg",
  key: "text-code-key",
  str: "text-code-str",
  dim: "text-code-dim",
};

export function CodeBlock({
  code,
  file,
  label,
  lang = "rust",
  caption,
  output,
  outputLabel,
}: {
  code: string;
  file?: string;
  label?: SnipLabel;
  lang?: "rust" | "plain";
  caption?: string;
  output?: string;
  outputLabel?: string;
}) {
  const ui = useUi();
  const [copied, setCopied] = useState(false);
  const lines = lang === "rust" ? highlightRust(code) : code.replace(/\n$/, "").split("\n").map((text) => [{ kind: "plain" as const, text }]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code.replace(/\n$/, ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <figure className="my-8 min-w-0">
      <div className="overflow-hidden border border-code-line bg-code">
        <div className="flex items-center justify-between gap-3 border-b border-code-line px-4 py-2 font-mono text-xs text-code-dim">
          <span className="min-w-0 truncate">{file}</span>
          <span className="flex shrink-0 items-center gap-3">
            {label === "fragment" && <span>{ui.fragment}</span>}
            {label === "fails" && <span className="text-code-key">{ui.fails}</span>}
            <button type="button" onClick={() => void copyCode()} className="min-h-11 text-code-fg">
              {copied ? ui.copied : ui.copy}
            </button>
          </span>
        </div>
        <pre className="overflow-x-auto px-4 py-4 font-mono text-sm leading-relaxed text-code-fg select-text">
          <code>
            {lines.map((spans, lineNo) => (
              <span key={lineNo} className="block">
                <span className="mr-4 inline-block w-6 select-none text-right text-code-dim">
                  {lineNo + 1}
                </span>
                {spans.map((span, index) => (
                  <span key={index} className={kindClass[span.kind]}>
                    {span.text}
                  </span>
                ))}
                {spans.length === 1 && spans[0]?.text === "" ? "\u00a0" : null}
              </span>
            ))}
          </code>
        </pre>
        {output && (
          <>
            <div className="border-t border-code-line px-4 py-2 font-mono text-xs text-code-dim">
              {outputLabel ?? ui.output}
            </div>
            <pre className="overflow-x-auto border-t border-code-line px-4 py-4 font-mono text-sm leading-relaxed text-code-dim select-text">
              {output.replace(/\n$/, "")}
            </pre>
          </>
        )}
      </div>
      {caption && <figcaption className="mt-2 text-sm text-muted">{caption}</figcaption>}
    </figure>
  );
}
