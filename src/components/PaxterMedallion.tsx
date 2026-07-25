import type { CSSProperties } from "react";
import symbolAsset from "@/assets/parxis-symbol.png.asset.json";

interface PaxterMedallionProps {
  size?: number;
}

export function PaxterMedallion({ size = 38 }: PaxterMedallionProps) {
  const outerR = Math.round(size * 0.28);
  const innerR = Math.round(size * 0.22);
  const innerPad = Math.round(size * 0.07);

  return (
    <span
      className="pax-medallion"
      style={{ "--pax-r": `${outerR}px`, borderRadius: outerR } as CSSProperties}
      aria-hidden="true"
    >
      <span
        className="pax-medallion-inner"
        style={{ borderRadius: innerR, padding: innerPad }}
      >
        <span className="pax-symbol-wrap" style={{ width: size, height: size }}>
          <img
            src={symbolAsset.url}
            alt=""
            draggable={false}
            className="pax-symbol-img"
          />
          <span className="pax-glint" aria-hidden="true" />
        </span>
      </span>
    </span>
  );
}
