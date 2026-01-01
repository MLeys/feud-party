import type { RoundState } from "@feud/shared";
import "./host.css";

type RevealPadProps = {
  round: RoundState | null;
  onReveal: (answerId: string) => void;
  disabled?: boolean;
};

export default function RevealPad({ round, onReveal, disabled }: RevealPadProps) {
  const slots = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="row">
      <div className="small">Reveal Pad (matches TV slots 1–8)</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {slots.map((i) => {
          const a = round?.answers[i];
          const empty = !a;
          const revealed = a ? Boolean(round?.revealedAnswerIds[a.id]) : false;

          const label = empty ? `${i + 1}` : revealed ? `✓ ${i + 1}` : `${i + 1}`;

          return (
            <button
              key={i}
              className="btn btnPrimary"
              disabled={disabled || empty || revealed}
              onClick={() => {
                if (!a) return;
                onReveal(a.id);
              }}
              style={{
                padding: "18px 12px",
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <span style={{ fontWeight: 950 }}>{label}</span>
              <span style={{ opacity: empty ? 0.45 : 0.85, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
                {a?.text ?? "—"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
