export type SpanKind = "plain" | "key" | "str" | "dim";

export type Span = { kind: SpanKind; text: string };

const KEYWORDS = new Set([
  "as",
  "async",
  "await",
  "const",
  "crate",
  "else",
  "enum",
  "false",
  "fn",
  "for",
  "if",
  "impl",
  "in",
  "let",
  "loop",
  "match",
  "mod",
  "move",
  "mut",
  "pub",
  "ref",
  "return",
  "self",
  "Self",
  "static",
  "struct",
  "super",
  "trait",
  "true",
  "type",
  "use",
  "where",
  "while",
]);

export function highlightRust(source: string): Span[][] {
  const lines = source.replace(/\n$/, "").split("\n");
  return lines.map(tokenizeLine);
}

function tokenizeLine(line: string): Span[] {
  const spans: Span[] = [];
  const push = (kind: SpanKind, text: string) => {
    if (!text) return;
    const last = spans[spans.length - 1];
    if (last && last.kind === kind) last.text += text;
    else spans.push({ kind, text });
  };

  let i = 0;
  while (i < line.length) {
    if (line.startsWith("//", i)) {
      push("dim", line.slice(i));
      break;
    }

    const ch = line[i] ?? "";

    if (ch === '"') {
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === "\\") {
          j += 2;
          continue;
        }
        if (line[j] === '"') {
          j += 1;
          break;
        }
        j += 1;
      }
      push("str", line.slice(i, j));
      i = j;
      continue;
    }

    if (ch === "'") {
      const rest = line.slice(i + 1);
      if (/^\\.'/.test(rest) || /^[^'\\]'/.test(rest)) {
        const end = line.indexOf("'", i + 1);
        const j = end === -1 ? line.length : end + 1;
        push("str", line.slice(i, j));
        i = j;
        continue;
      }
      const life = /^'[A-Za-z_][A-Za-z0-9_]*/.exec(line.slice(i));
      if (life) {
        push("dim", life[0]);
        i += life[0].length;
        continue;
      }
    }

    if (/[A-Za-z_]/.test(ch)) {
      const word = /^[A-Za-z_][A-Za-z0-9_]*/.exec(line.slice(i));
      if (word) {
        push(KEYWORDS.has(word[0]) ? "key" : "plain", word[0]);
        i += word[0].length;
        continue;
      }
    }

    if (/[0-9]/.test(ch)) {
      const num = /^[0-9][0-9_]*/.exec(line.slice(i));
      if (num) {
        push("plain", num[0]);
        i += num[0].length;
        continue;
      }
    }

    push(/\s/.test(ch) ? "plain" : "dim", ch);
    i += 1;
  }

  return spans.length > 0 ? spans : [{ kind: "plain", text: "" }];
}
