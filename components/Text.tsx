import type { ReactNode } from "react";

// A piece of a sentence; `{ em }` segments render in gold serif italic, and `alive` ones never stop
// moving (used for "move.").
export type Part = string | { em: string; alive?: boolean };

// Wraps every word in a mask so it can slide up into view (paired with data-split / data-scrub-words).
export function Words({ parts }: { parts: Part[] }) {
  const words: { text: string; em: boolean; alive: boolean }[] = [];
  for (const part of parts) {
    const text = typeof part === "string" ? part : part.em;
    const em = typeof part !== "string";
    const alive = typeof part !== "string" && !!part.alive;
    for (const w of text.split(/\s+/).filter(Boolean)) words.push({ text: w, em, alive });
  }
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <span className={w.alive ? "sw sw--em sw--alive" : w.em ? "sw sw--em" : "sw"}>
            <span>{w.text}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}

export function Eyebrow({ index, children }: { index: string; children: ReactNode }) {
  return (
    <p className="eyebrow" data-reveal="">
      <span>({index})</span> {children}
    </p>
  );
}

export const pad2 = (n: number) => String(n).padStart(2, "0");
