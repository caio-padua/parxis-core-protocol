import { useId, type CSSProperties } from "react";
import symbolAsset from "@/assets/parxis-symbol.png.asset.json";

const PAXTER_GLINT_STYLE = `
  .tf-flash {
    fill: none; stroke-linecap: round; stroke-linejoin: round;
    stroke-dasharray: 6 100; stroke-dashoffset: 110; opacity: 0;
    animation: tfFlash var(--tf-flash, 12000ms) cubic-bezier(.42,0,.18,1) var(--tf-flash-delay, 0ms) infinite backwards;
  }
  @keyframes tfFlash {
    0%   { stroke-dashoffset: 110; opacity: 0; }
    5%   { stroke-dashoffset: 110; opacity: 0; }
    8%   { opacity: 1; }
    20%  { stroke-dashoffset: -8;  opacity: 1; }
    24%  { stroke-dashoffset: -8;  opacity: 0; }
    100% { stroke-dashoffset: -8;  opacity: 0; }
  }
  @keyframes pspAura {
    0%,100% { opacity: .40; transform: scale(1);    }
    50%     { opacity: .72; transform: scale(1.06); }
  }
  .pax-aura { animation: pspAura 3800ms ease-in-out infinite; }
  @keyframes paxDomeShine {
    0%,100% { opacity: .55; }
    50%     { opacity: .75; }
  }
  .pax-dome-shine { animation: paxDomeShine 4200ms ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) {
    .tf-flash { display: none; }
    .pax-aura { animation: none; opacity: .45; }
    .pax-dome-shine { animation: none; }
  }
`;

const TRACE_DELAY_STEP_MS = 1450;
const SYMBOL_TRACE_FRAME =
  "M216 766 L216 296 Q216 162 352 162 L692 162 Q782 162 822 219 Q856 268 821 330 Q796 374 720 454 L579 609";
const SYMBOL_TRACE_HOOK =
  "M843 386 L843 626 Q843 735 749 764 Q656 792 586 712 L521 633";
const SYMBOL_TRACE_RISING_DIAGONAL = "M303 764 L535 529 L711 355";
const SYMBOL_TRACE_DESCENDING_DIAGONAL = "M338 408 L704 768";
const SYMBOL_TRACE_BOWL_TOP =
  "M303 302 Q308 362 389 364 L503 364 Q601 365 624 442";
const SYMBOL_TRACE_BOWL_RETURN = "M624 442 Q638 520 552 557 L392 487";
const SYMBOL_PATHS = [
  SYMBOL_TRACE_FRAME,
  SYMBOL_TRACE_BOWL_TOP,
  SYMBOL_TRACE_BOWL_RETURN,
  SYMBOL_TRACE_RISING_DIAGONAL,
  SYMBOL_TRACE_DESCENDING_DIAGONAL,
  SYMBOL_TRACE_HOOK,
];
const SYMBOL_VIEWBOX = "0 0 1024 1024";

interface GlintPremiumProps {
  d: string | string[];
  size?: number;
  viewBox?: string;
  glintWidth?: number;
  flashMs?: number;
  flashDelay?: number;
  className?: string;
  style?: CSSProperties;
}

function PaxterGlintPremium({
  d,
  size = 150,
  viewBox = SYMBOL_VIEWBOX,
  glintWidth = 32,
  flashMs = 12000,
  flashDelay = 0,
  className,
  style,
}: GlintPremiumProps) {
  const uid = useId().replace(/:/g, "");
  const glowId = `pmg-${uid}`;
  const paths = Array.isArray(d) ? d : [d];
  const wOuter = glintWidth + 8;
  const wInner = Math.max(1, glintWidth - 14);
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ mixBlendMode: "plus-lighter", overflow: "visible", ...style }}
      aria-hidden="true"
    >
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5.8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {paths.map((p, i) => (
        <g key={`gl${i}`}>
          <path
            d={p}
            pathLength={100}
            className="tf-flash"
            fill="none"
            stroke="#ffcf73"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={wOuter}
            strokeOpacity={0.85}
            filter={`url(#${glowId})`}
            style={{
              ["--tf-flash" as string]: `${flashMs}ms`,
              ["--tf-flash-delay" as string]: `${flashDelay + i * TRACE_DELAY_STEP_MS}ms`,
            } as CSSProperties}
          />
          <path
            d={p}
            pathLength={100}
            className="tf-flash"
            fill="none"
            stroke="#ffe6a3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={wInner}
            style={{
              ["--tf-flash" as string]: `${flashMs}ms`,
              ["--tf-flash-delay" as string]: `${flashDelay + i * TRACE_DELAY_STEP_MS}ms`,
            } as CSSProperties}
          />
        </g>
      ))}
    </svg>
  );
}

interface PaxterMedalhaoProps {
  size?: number;
  tone?: "dark" | "light";
  className?: string;
}

export function PaxterMedalhao({
  size = 38,
  tone = "dark",
  className = "",
}: PaxterMedalhaoProps) {
  const uid = useId().replace(/:/g, "");
  const outerR = Math.round(size * 0.30);
  const innerR = Math.round(size * 0.24);
  const innerPad = Math.round(size * 0.07);
  const innerBg =
    tone === "light"
      ? "linear-gradient(180deg,#2a2113 0%,#160f06 100%)"
      : "linear-gradient(180deg,#102140 0%,#070f22 100%)";
  return (
    <>
      <style>{PAXTER_GLINT_STYLE}</style>
      <span
        className={`pax-med ${className}`}
        aria-hidden="true"
        style={{
          position: "relative",
          display: "inline-flex",
          padding: "2px",
          flexShrink: 0,
          borderRadius: outerR,
          background:
            "linear-gradient(135deg,#6f5421 0%,#f6e6a8 16%,#c9a24e 38%,#8a6d2f 56%,#f1dd9a 76%,#927235 100%)",
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.50), 0 0 18px rgba(194,160,90,0.35)",
        } as CSSProperties}
      >
        <span
          className="pax-dome-shine"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: outerR,
            pointerEvents: "none",
            zIndex: 3,
            background:
              "linear-gradient(180deg,rgba(255,255,255,.62) 0%,rgba(255,255,255,.18) 10%,rgba(255,255,255,.04) 22%,transparent 32%)," +
              "radial-gradient(80% 30% at 50% 2%,rgba(255,255,255,.56) 0%,transparent 70%)",
            mixBlendMode: "screen",
          }}
        />
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
            zIndex: 1,
            borderRadius: innerR,
            padding: innerPad,
            background: innerBg,
          }}
        >
          <span
            key={uid}
            className="pax-aura"
            style={{
              position: "absolute",
              inset: -size * 0.18,
              mixBlendMode: "screen",
              filter: "blur(6px)",
              background:
                "radial-gradient(circle,rgba(255,201,112,.40),rgba(255,201,112,.10) 50%,transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <span
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: size,
              height: size,
            }}
          >
            <img
              src={symbolAsset.url}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                mixBlendMode: "screen",
                filter: "contrast(1.1) saturate(1.16) brightness(1.05)",
              }}
            />
            <PaxterGlintPremium
              d={SYMBOL_PATHS}
              size={size}
              viewBox={SYMBOL_VIEWBOX}
              glintWidth={34}
              flashMs={12000}
              flashDelay={0}
              style={{ position: "absolute", inset: 0 }}
            />
          </span>
        </span>
      </span>
    </>
  );
}

export default PaxterMedalhao;