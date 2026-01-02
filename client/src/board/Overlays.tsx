// feud-party/client/src/board/Overlays.tsx
import { useEffect, useRef, useState } from "react";
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

function phaseSub(phase: GameState["phase"]) {
  switch (phase) {
    case "FACE_OFF":
      return "Host: pick the winner";
    case "STEAL":
      return "Other team gets one guess";
    case "ROUND_END":
      return "Host: advance to the next round";
    case "GAME_END":
      return "Thanks for playing";
    default:
      return "";
  }
}

export default function Overlays({ state }: OverlaysProps) {
  const cur = state.current;

  // ---- Strike Pop (client-side animation trigger) ----
  const prevStrikesRef = useRef<number>(cur?.strikes ?? 0);
  const prevRoundIndexRef = useRef<number>(cur?.roundIndex ?? -1);

  const [strikePop, setStrikePop] = useState<{ show: boolean; count: number }>({ show: false, count: 0 });
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const roundIndex = cur?.roundIndex ?? -1;
    const strikes = cur?.strikes ?? 0;

    const roundChanged = roundIndex !== prevRoundIndexRef.current;
    if (roundChanged) {
      prevRoundIndexRef.current = roundIndex;
      prevStrikesRef.current = strikes;
      setStrikePop({ show: false, count: 0 });
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
      return;
    }

    const prev = prevStrikesRef.current;

    // Trigger only on increases (not on reset/restart)
    if (strikes > prev) {
      prevStrikesRef.current = strikes;

      setStrikePop({ show: true, count: strikes });

      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => {
        setStrikePop((p) => ({ ...p, show: false }));
      }, 900);
      return;
    }

    prevStrikesRef.current = strikes;
  }, [cur?.roundIndex, cur?.strikes]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  // If strike pop is active, show it above everything else
  if (strikePop.show) {
    return (
      <div className="overlayLayer overlayStrikeLayer">
        <div className="strikePop" aria-live="polite">
          <div className="strikePopX">X</div>
          <div className="strikePopSub">STRIKE {strikePop.count}</div>
        </div>
      </div>
    );
  }

  // ---- Existing overlays (unchanged behavior) ----

  // Buzzer overlay takes priority
  if (state.buzz && state.buzz.open) {
    const mode = state.buzz.mode ? state.buzz.mode : "—";
    return (
      <div className="overlayLayer">
        <div className="overlayCard">
          <h2 className="overlayTitle">Buzz Now!</h2>
          <div className="overlaySub">Phones: open /buzz · Mode: {mode}</div>
        </div>
      </div>
    );
  }

  if (state.buzz && !state.buzz.open && state.buzz.winnerTeam) {
    return (
      <div className="overlayLayer">
        <div className="overlayCard">
          <h2 className="overlayTitle">Team {state.buzz.winnerTeam} Buzzed!</h2>
          <div className="overlaySub">Host: Apply winner or override</div>
        </div>
      </div>
    );
  }

  const title = phaseTitle(state.phase);
  if (!title) return null;

  const sub = phaseSub(state.phase);

  return (
    <div className="overlayLayer">
      <div className="overlayCard">
        <h2 className="overlayTitle">{title}</h2>
        <div className="overlaySub">{sub}</div>
      </div>
    </div>
  );
}
