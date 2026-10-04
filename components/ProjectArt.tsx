import type { CSSProperties } from "react";
import type { work } from "@/lib/content";

type Project = (typeof work)[number];

// Typographic "poster" standing in for project imagery: each project gets its own pattern and accent.
// PLACEHOLDER: replace with real campaign photography / mockups when available.
export default function ProjectArt({ project, index, total }: { project: Project; index: number; total: number }) {
  return (
    <div className={`art art--${project.slug}`} style={{ "--accent": project.accent } as CSSProperties}>
      <div className="art__pattern" aria-hidden="true" />
      <div className="art__glow" aria-hidden="true" />
      <span className="art__mark" aria-hidden="true">
        {project.mark}
      </span>
      <span className="art__ghost" aria-hidden="true">
        {project.name}
      </span>
      <span className="art__index" aria-hidden="true">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
      <span className="art__seal" aria-hidden="true">
        Urban Beetle × {project.name}
      </span>
    </div>
  );
}
