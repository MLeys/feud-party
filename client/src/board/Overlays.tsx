import type { GameState } from "@feud/shared";
import "./board.css";

type OverlaysProps = {
  state: GameState;
};

function phaseTitle(phase: GameState["phase"]) {
  switch (phase) {
    case "FACE_OFF":
      return "Face-Off";
    case "STEAL":
      return "Steal!";
    case "ROUND_END":
      return "Round Over";
    case "GAME_END":
      return "Game Over";
    default:
      return "";
  }
}

export default function Overlays({ state }: OverlaysProps) {
  const title = phaseTitle(state.phase);
  if (!title) return null;

  const sub =
    state.phase === "FACE_OFF"
      ? "Host: pick the winner"
      : state.phase === "STEAL"
      ? "Other team gets one guess"
      : state.phase === "ROUND_END"
      ? "Host: advance to the next round"
      : "Thanks for playing";

  return (
    <div className="overlayLayer">
      <div className="overlayCard">
        <h2 className="overlayTitle">{title}</h2>
        <div className="overlaySub">{sub}</div>
      </div>
    </div>
  );
}
