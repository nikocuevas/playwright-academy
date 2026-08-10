import * as React from "react";

/**
 * Renders the tiny inline markup used in lesson copy: `code`, **bold** and
 * *emphasis*.
 * Deliberately not a Markdown parser — content is authored as data, and this
 * keeps it dependency-free and safe (no dangerouslySetInnerHTML anywhere).
 */
export function RichText({ text }: { text: string }) {
  const parts = React.useMemo(() => splitInline(text), [text]);

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "code") {
          return (
            <code
              key={index}
              className="rounded border border-line bg-surface-3 px-1 py-0.5 font-mono text-[0.86em]"
            >
              {part.value}
            </code>
          );
        }
        if (part.type === "bold") {
          return (
            <strong key={index} className="font-semibold">
              {part.value}
            </strong>
          );
        }
        if (part.type === "emphasis") {
          return <em key={index}>{part.value}</em>;
        }
        return <React.Fragment key={index}>{part.value}</React.Fragment>;
      })}
    </>
  );
}

type Part = { type: "text" | "code" | "bold" | "emphasis"; value: string };

function splitInline(input: string): Part[] {
  const parts: Part[] = [];
  // Ordered so **bold** is matched before *emphasis*.
  const pattern = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*\n]+)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(input))) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: input.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) parts.push({ type: "code", value: match[1] });
    else if (match[2] !== undefined) parts.push({ type: "bold", value: match[2] });
    else parts.push({ type: "emphasis", value: match[3] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < input.length) {
    parts.push({ type: "text", value: input.slice(lastIndex) });
  }

  return parts;
}
