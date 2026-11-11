import type { ReactNode } from "react";
import Image from "next/image";

// A piece of a sentence. `{ em }` segments render in gold serif italic, and `alive` ones never stop
// moving (used for "move."). `{ chip }` sets a small photo into the line like a word.
export type Part = string | { em: string; alive?: boolean } | { chip: string };

// Wraps every word in a mask so it can slide up into view (paired with data-split / data-scrub-words).
export function Words({ parts }: { parts: Part[] }) {
  const words: { text: string; em: boolean; alive: boolean; chip?: string }[] = [];
  for (const part of parts) {
    if (typeof part !== "string" && "chip" in part) {
      words.push({ text: "", em: false, alive: false, chip: part.chip });
      continue;
    }
    const text = typeof part === "string" ? part : part.em;
    const em = typeof part !== "string";
    const alive = typeof part !== "string" && !!part.alive;
    for (const w of text.split(/\s+/).filter(Boolean)) words.push({ text: w, em, alive });
  }
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          {w.chip ? (
            <span className="sw" aria-hidden="true">
              <span className="chip">
                <Image src={w.chip} alt="" width={330} height={203} sizes="240px" />
              </span>
            </span>
          ) : (
            <span className={w.alive ? "sw sw--em sw--alive" : w.em ? "sw sw--em" : "sw"}>
              <span>{w.text}</span>
            </span>
          )}
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
