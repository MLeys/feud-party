import { useEffect, useRef, useState } from "react";
import type { GameState } from "@feud/shared";
import { socket } from "../socket";

function clamp01(n: number) {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export default function Board() {
  const [state, setState] = useState<GameState | null>(null);

  // Minimal audio wiring placeholder (we’ll swap in real sound set next).
  const lastEventIdRef = useRef<number>(0);

  useEffect(() => {
    const onSync = (s: GameState) => {
      setState(s);
      if (s.audio.enabled && s.lastEventId > lastEventIdRef.current) {
        // placeholder
      }
      lastEventIdRef.current = s.lastEventId;
    };

    socket.on("state:sync", onSync);
    return () => {
      socket.off("state:sync", onSync);
    };
  }, []);


  if (!state) return <div style={{ padding: 24 }}>Connecting…</div>;
  const cur = state.current;

  const volumePct = Math.round(clamp01(state.audio.volume) * 100);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 48,
        background: "radial-gradient(circle at top, #1a0a2a 0%, #05050a 55%, #05050a 100%)",
        color: "white",
        fontFamily: "system-ui"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 24 }}>
        <div>
          <div style={{ fontSize: 20, opacity: 0.85 }}>Family Feud</div>
          <h1 style={{ margin: 0, fontSize: 64, lineHeight: 1.05 }}>
            {cur ? cur.prompt : "Waiting for game to start…"}
          </h1>
        </div>

        <div style={{ textAlign: "right", opacity: 0.9 }}>
          <div style={{ fontSize: 16 }}>Host PIN</div>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: 2 }}>{state.config.hostPin}</div>
          <div style={{ fontSize: 14, opacity: 0.85 }}>
            Sound: <strong>{state.audio.enabled ? "On" : "Muted"}</strong> · Vol: <strong>{volumePct}%</strong>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, fontSize: 22, opacity: 0.92 }}>
        Phase: <strong>{state.phase}</strong>
        {" · "}
        Bank: <strong>{cur?.roundPoints ?? 0}</strong>
        {" · "}
        Strikes: <strong>{cur?.strikes ?? 0}/{cur?.maxStrikes ?? 3}</strong>
      </div>

      <div style={{ marginTop: 34, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 22 }}>
        {cur?.answers.map((a, idx) => {
          const revealed = cur.revealedAnswerIds[a.id];
          return (
            <div
              key={a.id}
              style={{
                borderRadius: 18,
                padding: "26px 28px",
                border: "3px solid rgba(255,255,255,0.16)",
                background: revealed
                  ? "linear-gradient(90deg, rgba(255,185,0,0.28), rgba(255,120,0,0.12))"
                  : "rgba(255,255,255,0.06)",
                minHeight: 110,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: revealed ? "0 0 28px rgba(255, 185, 0, 0.14)" : "none"
              }}
            >
              <div style={{ display: "flex", gap: 18, alignItems: "center", fontSize: 40 }}>
                <div style={{ width: 56, opacity: 0.9, fontWeight: 800 }}>{idx + 1}</div>
                <div style={{ fontWeight: 700 }}>{revealed ? a.text : "—"}</div>
              </div>

              <div style={{ minWidth: 100, textAlign: "right", fontSize: 44, fontWeight: 900 }}>
                {revealed ? a.points : ""}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 36, display: "flex", gap: 28, fontSize: 28, opacity: 0.95 }}>
        <div>
          <strong>{state.teams.A.name}</strong>: {state.teams.A.score}
        </div>
        <div>
          <strong>{state.teams.B.name}</strong>: {state.teams.B.score}
        </div>
      </div>
    </div>
  );
}
