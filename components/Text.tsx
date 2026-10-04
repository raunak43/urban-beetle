import type { ReactNode } from "react";

// A piece of a sentence; `{ em }` segments render in gold serif italic.
export type Part = string | { em: string };

// Wraps every word in a mask so it can slide up into view (paired with data-split / data-scrub-words).
export function Words({ parts }: { parts: Part[] }) {
  const words: { text: string; em: boolean }[] = [];
  for (const part of parts) {
    const text = typeof part === "string" ? part : part.em;
    const em = typeof part !== "string";
    for (const w of text.split(/\s+/).filter(Boolean)) words.push({ text: w, em });
  }
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <span className={w.em ? "sw sw--em" : "sw"}>
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
