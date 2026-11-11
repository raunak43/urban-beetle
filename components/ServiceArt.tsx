import type { CSSProperties, ReactNode } from "react";

// Animated line illustrations, one per service and one per "why us" reason. They are plain SVG moved
// by the CSS animations in globals.css ("Illustrations"), so they cost nothing to load and keep
// looping on phones. Strokes take the text colour of whatever surface they sit on (.ln, .fl), and
// accents take --art-accent (.ac, .ac-ln); .bg matches the surface, for cut-outs.

// Duration and delay (seconds) for an animation class; a negative delay starts it part-way through.
const t = (duration: number, delay = 0): CSSProperties => ({
  animationDuration: `${duration}s`,
  animationDelay: `${delay}s`,
});

// The surface each service is printed on, wherever its illustration appears (in the order of `services`).
export const SERVICE_SURFACES = ["gold", "ink", "scarab", "paper", "ink", "gold", "scarab", "paper", "ink"] as const;

const HEART =
  "M0 5C-6-1-9-4-9-7.5-9-10.5-6.8-12.5-4.3-12.5-2.4-12.5-.9-11.4 0-9.8 .9-11.4 2.4-12.5 4.3-12.5 6.8-12.5 9-10.5 9-7.5 9-4 6-1 0 5z";

const SERVICE_ART: Record<string, ReactNode> = {
  // A mark being constructed on a grid, inside a selection box.
  branding: (
    <>
      <g className="ln ln--soft">
        <circle cx="160" cy="110" r="88" />
        <circle cx="160" cy="110" r="30" />
        <path d="M36 110h248M160 12v196M74 24l172 172M246 24L74 196" />
      </g>
      <rect className="ln" x="94" y="44" width="132" height="132" strokeDasharray="4 6" />
      {[
        [94, 44],
        [226, 44],
        [94, 176],
        [226, 176],
      ].map(([x, y], i) => (
        <rect key={i} className="fl a-pulse" x={x - 5} y={y - 5} width="10" height="10" style={t(2.4, -i * 0.6)} />
      ))}
      <path
        className="ln ln--bold a-draw"
        pathLength={1}
        d="M160 64c-28 0-44 20-44 48s16 46 44 46 44-18 44-46-16-48-44-48z"
        style={t(6)}
      />
      <path className="ln ln--bold a-draw" pathLength={1} d="M160 64v94" style={t(6, 0.5)} />
      <path className="ac-ln a-draw" pathLength={1} d="M134 62c4-15 13-22 26-24 13 2 22 9 26 24" style={t(6, 0.9)} />
      <circle className="fl a-pop" cx="252" cy="196" r="7" style={t(6, 1.2)} />
      <circle className="ac a-pop" cx="272" cy="196" r="7" style={t(6, 1.5)} />
      <circle className="ln a-pop" cx="292" cy="196" r="7" style={t(6, 1.8)} />
    </>
  ),

  // A page laying itself out in a browser window, and a cursor pressing the button.
  "website-design": (
    <>
      <rect className="ln" x="40" y="26" width="240" height="168" rx="12" />
      <path className="ln" d="M40 56h240" />
      <circle className="fl" cx="56" cy="41" r="3" />
      <circle className="fl" cx="68" cy="41" r="3" />
      <circle className="fl" cx="80" cy="41" r="3" />
      <rect className="ln ln--soft" x="100" y="35" width="120" height="12" rx="6" />
      <rect className="ac a-grow-x" x="56" y="72" width="116" height="14" rx="4" style={t(7)} />
      <rect className="fl a-grow-x" x="56" y="94" width="92" height="6" rx="3" opacity="0.45" style={t(7, 0.25)} />
      <rect className="fl a-grow-x" x="56" y="106" width="64" height="6" rx="3" opacity="0.45" style={t(7, 0.4)} />
      <rect className="ln" x="56" y="122" width="54" height="18" rx="9" />
      <circle className="ln a-ping" cx="83" cy="131" r="12" style={t(7, 2.9)} />
      <rect className="ln" x="192" y="72" width="72" height="68" rx="8" />
      <path className="ln ln--soft" d="M198 132l18-22 13 13 9-9 20 18" />
      <circle className="ac a-pulse" cx="246" cy="88" r="6" style={t(3)} />
      {[56, 128, 200].map((x, i) => (
        <rect key={x} className="ln a-bob" x={x} y="154" width="64" height="26" rx="6" style={t(3.2, -i * 0.5)} />
      ))}
      <g className="art-cursor">
        <path className="fl" d="M0 0v18l5-4 4 9 3-1.5-4-8.5h7z" />
        <path className="bg-ln" d="M0 0v18l5-4 4 9 3-1.5-4-8.5h7z" />
      </g>
    </>
  ),

  // A feed on a phone, with likes floating off it and notifications popping up.
  "social-media-marketing": (
    <>
      <rect className="ln" x="118" y="18" width="84" height="184" rx="16" />
      <path className="ln" d="M148 29h24" />
      <rect className="ac" x="128" y="44" width="64" height="66" rx="8" />
      <g transform="translate(160 84) scale(1.5)">
        <path className="bg a-pulse" d={HEART} style={t(1.6)} />
      </g>
      <path className="ln" d="M130 124h42M130 134h26" />
      <rect className="ln ln--soft" x="128" y="148" width="64" height="44" rx="8" />
      {[
        [228, 168, 4.2, 0],
        [252, 150, 5, -1.6],
        [238, 176, 4.6, -3],
      ].map(([x, y, d, delay], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path className="ac a-rise" d={HEART} style={t(d, delay)} />
        </g>
      ))}
      <g className="a-pop" style={t(5)}>
        <rect className="ln" x="40" y="56" width="58" height="26" rx="13" />
        <circle className="ac" cx="55" cy="69" r="6" />
        <path className="ln" d="M67 69h20" />
      </g>
      <g className="a-pop" style={t(5, 1.4)}>
        <rect className="ln" x="30" y="116" width="68" height="26" rx="13" />
        <circle className="fl" cx="45" cy="129" r="6" />
        <path className="ln" d="M57 129h30" />
      </g>
    </>
  ),

  // A film on the edit timeline: play button, moving playhead and a live waveform.
  "content-creation": (
    <>
      <circle className="ln ln--soft a-spin" cx="160" cy="82" r="58" strokeDasharray="3 9" style={t(26)} />
      <circle className="ln" cx="160" cy="82" r="42" />
      <path className="ac a-pulse" d="M150 64l30 18-30 18z" style={t(2.2)} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={`l${i}`}
          className="fl a-wave"
          x={44 + i * 11}
          y={82 - [10, 22, 14, 26, 12][i]}
          width="4"
          height={[20, 44, 28, 52, 24][i]}
          rx="2"
          style={t(1.1 + i * 0.13, -i * 0.3)}
        />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={`r${i}`}
          className="fl a-wave"
          x={232 + i * 11}
          y={82 - [12, 26, 14, 22, 10][i]}
          width="4"
          height={[24, 52, 28, 44, 20][i]}
          rx="2"
          style={t(1.2 + i * 0.11, -i * 0.25)}
        />
      ))}
      <path className="ln ln--soft" d="M40 170h240" />
      <rect className="fl" x="44" y="158" width="68" height="24" rx="5" opacity="0.2" />
      <rect className="ac" x="118" y="158" width="98" height="24" rx="5" />
      <rect className="ln" x="222" y="158" width="54" height="24" rx="5" />
      <g className="art-playhead">
        <path className="ln" d="M0 148v44" />
        <path className="fl" d="M-5 143h10l-5 7z" />
      </g>
    </>
  ),

  // Results climbing: bars growing under a rising trend line.
  "paid-advertising": (
    <>
      <path className="ln" d="M52 28v154h226" />
      <path className="ln ln--soft" d="M52 142h226M52 102h226M52 62h226" strokeDasharray="2 6" />
      {[40, 64, 92, 122].map((h, i) => (
        <rect
          key={h}
          className={i === 3 ? "ac a-grow-y" : "fl a-grow-y"}
          x={76 + i * 38}
          y={182 - h}
          width="22"
          height={h}
          rx="4"
          opacity={i === 3 ? 1 : 0.24}
          style={t(3.4, -i * 0.35)}
        />
      ))}
      <path className="ac-ln a-draw" pathLength={1} d="M62 152c36-8 58-26 88-42s62-30 98-64" style={t(5)} />
      <circle className="ac a-ping" cx="250" cy="44" r="9" style={t(2.4)} />
      <circle className="ac" cx="250" cy="44" r="4" />
      <g className="a-bob" style={t(3)}>
        <circle className="ln" cx="244" cy="136" r="18" />
        <text className="art-txt art-txt--lg" x="244" y="143" textAnchor="middle">
          ₹
        </text>
      </g>
    </>
  ),

  // Looking down a lens: the iris breathes, the focus ring turns and the flash fires.
  photography: (
    <>
      <path className="ln" d="M44 54V34h20M276 54V34h-20M44 166v20h20M276 166v20h-20" />
      <circle className="ln ln--soft a-spin" cx="160" cy="110" r="78" strokeDasharray="2 10" style={t(30)} />
      <circle className="ln" cx="160" cy="110" r="64" />
      <circle className="ln ln--soft" cx="160" cy="110" r="46" />
      <g className="a-orbit" style={t(16)}>
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <path key={deg} className="ln" d="M160 64l40 23" transform={`rotate(${deg} 160 110)`} />
        ))}
      </g>
      <polygon className="ac a-iris" points="160,86 180.8,98 180.8,122 160,134 139.2,122 139.2,98" style={t(4.5)} />
      <circle className="fl art-flash" cx="160" cy="110" r="64" />
      <circle className="ac a-blink" cx="64" cy="52" r="4" style={t(1.4)} />
      <text className="art-txt" x="58" y="178">
        f/1.8
      </text>
      <text className="art-txt" x="262" y="178" textAnchor="end">
        1/250
      </text>
    </>
  ),

  // A search, and one result climbing to the top.
  seo: (
    <>
      <rect className="ln" x="44" y="24" width="232" height="36" rx="18" />
      <circle className="ln" cx="66" cy="41" r="7" />
      <path className="ln" d="M71 46l6 6" />
      <rect className="fl art-type" x="88" y="37" width="104" height="8" rx="4" opacity="0.5" />
      <rect className="ac a-blink" x="198" y="32" width="2.5" height="18" style={t(1)} />
      <g className="art-rank-1">
        <rect className="ln ln--soft" x="44" y="78" width="232" height="32" rx="8" />
        <path className="ln ln--soft" d="M60 94h96" />
      </g>
      <g className="art-rank-2">
        <rect className="ln ln--soft" x="44" y="120" width="232" height="32" rx="8" />
        <path className="ln ln--soft" d="M60 136h70" />
      </g>
      <g className="art-rank">
        <rect className="ac" x="44" y="162" width="232" height="32" rx="8" />
        <path className="bg-ln" d="M60 178h112" />
        <path className="bg-ln" d="M252 185v-14m-6 6l6-6 6 6" />
      </g>
    </>
  ),

  // A creator at the centre, with an audience circling.
  "influencer-marketing": (
    <>
      <circle className="ln ln--soft" cx="160" cy="110" r="58" />
      <circle className="ln ln--soft" cx="160" cy="110" r="94" strokeDasharray="2 8" />
      <circle className="ln a-ping" cx="160" cy="110" r="30" style={t(3.2)} />
      <circle className="ln a-ping" cx="160" cy="110" r="30" style={t(3.2, -1.6)} />
      <circle className="ac" cx="160" cy="110" r="27" />
      <circle className="bg" cx="160" cy="102" r="8" />
      <path className="bg" d="M143 127c2-10 8-14 17-14s15 4 17 14z" />
      <g className="a-orbit" style={t(14)}>
        <circle className="bg" cx="218" cy="110" r="10" />
        <circle className="ln" cx="218" cy="110" r="10" />
        <circle className="fl" cx="102" cy="110" r="7" />
      </g>
      <g className="a-orbit a-orbit--rev" style={t(22)}>
        <circle className="bg" cx="160" cy="16" r="11" />
        <circle className="ln" cx="160" cy="16" r="11" />
        <circle className="ac" cx="241" cy="157" r="8" />
        <circle className="bg" cx="79" cy="157" r="9" />
        <circle className="ln" cx="79" cy="157" r="9" />
      </g>
      <circle className="fl" cx="182" cy="90" r="9" />
      <path className="bg-ln" d="M178 90l3 3 6-6" />
    </>
  ),

  // Shapes and a curve on the artboard, with its anchor points and handles.
  "creative-design": (
    <>
      <circle className="ac a-bob" cx="116" cy="104" r="44" style={t(5)} />
      <rect className="ln ln--bold a-spin" x="150" y="62" width="84" height="84" style={t(28)} />
      <path className="fl a-sway" d="M208 190l-50-86h100z" opacity="0.16" style={t(6)} />
      <path className="ln ln--soft" d="M46 178L92 98M274 48l-44 78" />
      <circle className="fl" cx="92" cy="98" r="4" />
      <circle className="fl" cx="230" cy="126" r="4" />
      <path className="ln a-draw" pathLength={1} d="M46 178C92 62 180 204 274 48" style={t(6)} />
      <rect className="bg" x="41" y="173" width="10" height="10" />
      <rect className="ln" x="41" y="173" width="10" height="10" />
      <rect className="bg" x="269" y="43" width="10" height="10" />
      <rect className="ln" x="269" y="43" width="10" height="10" />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          className={i === 1 ? "ac a-pop" : "fl a-pop"}
          x={44 + i * 20}
          y="28"
          width="14"
          height="14"
          rx="3"
          opacity={i === 1 ? 1 : 0.2 + i * 0.2}
          style={t(6, i * 0.25)}
        />
      ))}
    </>
  ),
};

export function ServiceArt({ slug, className }: { slug: string; className?: string }) {
  return (
    <svg className={className ? `art ${className}` : "art"} viewBox="0 0 320 220" aria-hidden="true">
      {SERVICE_ART[slug] ?? SERVICE_ART.branding}
    </svg>
  );
}

// One small glyph per reason in the "Why Urban Beetle" grid, in the order of `reasons` in lib/content.ts.
const REASON_GLYPHS: ReactNode[] = [
  // One team: circles that overlap, turning together.
  <>
    <g className="a-orbit a-orbit--sm" style={t(18)}>
      <circle className="ln" cx="60" cy="42" r="24" />
      <circle className="ln" cx="44" cy="70" r="24" />
      <circle className="ln" cx="76" cy="70" r="24" />
    </g>
    <circle className="ac a-pulse" cx="60" cy="61" r="7" style={t(2.4)} />
  </>,
  // Craft: a loupe's crosshair over the detail.
  <>
    <circle className="ln" cx="60" cy="60" r="36" />
    <circle className="ln ln--soft a-spin" cx="60" cy="60" r="22" strokeDasharray="3 7" style={t(14)} />
    <path className="ln" d="M60 12v22M60 86v22M12 60h22M86 60h22" />
    <rect className="ac a-spin" x="53" y="53" width="14" height="14" style={t(9)} />
  </>,
  // Measured: bars that keep being counted.
  <>
    <path className="ln" d="M18 22v80h86" />
    {[26, 44, 34, 62].map((h, i) => (
      <rect
        key={i}
        className={i === 3 ? "ac a-grow-y" : "fl a-grow-y"}
        x={30 + i * 18}
        y={102 - h}
        width="11"
        height={h}
        rx="2"
        opacity={i === 3 ? 1 : 0.3}
        style={t(3, -i * 0.3)}
      />
    ))}
  </>,
  // Momentum: arrows that never stop arriving.
  <>
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        className={i === 2 ? "ac-ln a-streak" : "ln ln--bold a-streak"}
        d={`M${26 + i * 22} 34l26 26-26 26`}
        style={t(1.8, -i * 0.3)}
      />
    ))}
  </>,
  // AI: sparks.
  <>
    <path className="ac a-pulse" d="M56 22c3 22 12 31 34 34-22 3-31 12-34 34-3-22-12-31-34-34 22-3 31-12 34-34z" style={t(2.6)} />
    <path className="fl a-twinkle" d="M94 18c1 9 5 13 14 14-9 1-13 5-14 14-1-9-5-13-14-14 9-1 13-5 14-14z" style={t(2, -0.7)} />
    <path className="fl a-twinkle" d="M92 78c1 7 4 10 11 11-7 1-10 4-11 11-1-7-4-10-11-11 7-1 10-4 11-11z" style={t(2.4, -1.4)} />
  </>,
  // Partners: two rings that stay linked.
  <>
    <circle className="ln ln--bold a-link" cx="46" cy="60" r="26" style={t(4)} />
    <circle className="ac-ln a-link a-link--rev" cx="74" cy="60" r="26" style={t(4)} />
  </>,
];

export function ReasonGlyph({ index, className }: { index: number; className?: string }) {
  return (
    <svg className={className ? `art ${className}` : "art"} viewBox="0 0 120 120" aria-hidden="true">
      {REASON_GLYPHS[index % REASON_GLYPHS.length]}
    </svg>
  );
}
