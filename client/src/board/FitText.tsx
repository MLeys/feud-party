// feud-party/client/src/board/FitText.tsx
import { useEffect, useRef, useState } from "react";

type FitTextProps = {
  text: string;
  maxPx: number;
  minPx: number;
  className?: string;
  style?: React.CSSProperties;
  lineHeight?: number; // multiplier, e.g. 1.05
  maxLines?: number; // default 2
  fontWeight?: number;
};

function px(n: number) {
  return `${Math.round(n)}px`;
}

export default function FitText({
  text,
  maxPx,
  minPx,
  className,
  style,
  lineHeight = 1.05,
  maxLines = 2,
  fontWeight = 900
}: FitTextProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const measRef = useRef<HTMLDivElement | null>(null);
  const [fontPx, setFontPx] = useState(maxPx);

  useEffect(() => {
    const host = hostRef.current;
    const meas = measRef.current;
    if (!host || !meas) return;

    let raf = 0;

    const fit = () => {
      const rect = host.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (width <= 0 || height <= 0) return;

      // Configure the hidden measurement element to match wrapping behavior.
      meas.style.width = px(width);
      meas.style.fontWeight = String(fontWeight);
      meas.style.lineHeight = String(lineHeight);
      meas.style.whiteSpace = "normal";
      meas.style.wordBreak = "break-word";
      meas.style.overflowWrap = "anywhere";
      meas.style.display = "block";
      meas.style.position = "absolute";
      meas.style.visibility = "hidden";
      meas.style.pointerEvents = "none";
      meas.style.left = "0";
      meas.style.top = "0";

      // Binary search font size by height constraint.
      let lo = minPx;
      let hi = maxPx;
      let best = minPx;

      for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2;
        meas.style.fontSize = px(mid);
        meas.textContent = text;

        const scrollH = meas.scrollHeight;

        // Budget: must fit in host height; also cap by maxLines.
        const maxAllowedHeight = Math.min(height, maxLines * mid * lineHeight + 0.5);
        const fitsHeight = scrollH <= maxAllowedHeight + 0.5;

        if (fitsHeight) {
          best = mid;
          lo = mid;
        } else {
          hi = mid;
        }
      }

      // Avoid state churn if unchanged (helps React Compiler + reduces renders)
      setFontPx((prev) => (Math.abs(prev - best) < 0.5 ? prev : best));
    };

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    });

    ro.observe(host);
    fit();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [text, maxPx, minPx, lineHeight, maxLines, fontWeight]);

  return (
    <div ref={hostRef} className={className} style={{ ...style, position: "relative", overflow: "hidden" }}>
      <div
        style={{
          fontSize: px(fontPx),
          lineHeight,
          fontWeight,
          letterSpacing: "-0.02em",
          display: "-webkit-box",
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minWidth: 0
        }}
      >
        {text}
      </div>

      <div ref={measRef} />
    </div>
  );
}
