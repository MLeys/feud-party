import { useEffect, useMemo, useState } from "react";
import type { GameEvent, GameState } from "@feud/shared";
import { socket } from "../socket";

export default function Host() {
  const [state, setState] = useState<GameState | null>(null);

  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [teamAName, setTeamAName] = useState("Team A");
  const [teamBName, setTeamBName] = useState("Team B");

  useEffect(() => {
    const onSync = (s: GameState) => {
      setState(s);
      // Keep local inputs in sync when appropriate
      if (!authed && s.phase === "SETUP") {
        setTeamAName(s.teams.A.name || "Team A");
        setTeamBName(s.teams.B.name || "Team B");
      }
    };

    socket.on("state:sync", onSync);
    return () => {
      socket.off("state:sync", onSync);
    };
  }, [authed]);


  const cur = state?.current;

  const revealButtons = useMemo(() => {
    if (!cur) return [];
    return cur.answers.map((a, i) => ({ id: a.id, label: `Reveal #${i + 1}` }));
  }, [cur]);

  const send = (event: GameEvent) => {
    if (!authed) return;
    socket.emit("game:event", event);
  };

  const auth = () => {
    setError(null);
    socket.emit("host:auth", { pin }, (res: { ok: boolean }) => {
      if (!res.ok) {
        setAuthed(false);
        setError("Invalid PIN.");
        return;
      }
      setAuthed(true);
    });
  };

  if (!state) return <div style={{ padding: 24 }}>Connecting…</div>;

  if (!authed) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 520 }}>
        <h2 style={{ marginTop: 0 }}>Host Login</h2>
        <p>Enter the Host PIN shown on the TV board.</p>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            inputMode="numeric"
            placeholder="PIN"
            style={{ fontSize: 18, padding: "10px 12px", width: 140 }}
          />
          <button onClick={auth} style={{ fontSize: 18, padding: "10px 14px" }}>
            Connect
          </button>
        </div>

        {error && <div style={{ marginTop: 12, color: "crimson" }}>{error}</div>}

        <hr style={{ margin: "18px 0" }} />

        <div style={{ fontSize: 14, opacity: 0.85 }}>
          Tip: Open <code>/board</code> on the TV first, then open <code>/host</code> on your phone.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 920 }}>
      <h2 style={{ marginTop: 0 }}>Host Console</h2>

      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={() => send({ type: "SET_AUDIO", enabled: !state.audio.enabled })}>
          {state.audio.enabled ? "Mute Board" : "Unmute Board"}
        </button>

        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          Volume
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(state.audio.volume * 100)}
            onChange={(e) => send({ type: "SET_AUDIO", volume: Number(e.target.value) / 100 })}
          />
        </label>
      </div>

      <hr style={{ margin: "18px 0" }} />

      <h3>Game Setup</h3>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          Team A
          <input value={teamAName} onChange={(e) => setTeamAName(e.target.value)} style={{ padding: "8px 10px" }} />
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          Team B
          <input value={teamBName} onChange={(e) => setTeamBName(e.target.value)} style={{ padding: "8px 10px" }} />
        </label>

        <button
          onClick={() =>
            send({ type: "SETUP_GAME", teamAName, teamBName, gameLength: 3, packId: state.packId })
          }
        >
          Start (3 rounds)
        </button>

        <button
          onClick={() =>
            send({ type: "SETUP_GAME", teamAName, teamBName, gameLength: 5, packId: state.packId })
          }
        >
          Start (5 rounds)
        </button>
      </div>

      <div style={{ marginTop: 12, opacity: 0.9 }}>
        Phase: <strong>{state.phase}</strong>
        {" · "}
        Bank: <strong>{cur?.roundPoints ?? 0}</strong>
        {" · "}
        Strikes: <strong>{cur?.strikes ?? 0}/{cur?.maxStrikes ?? 3}</strong>
      </div>

      <hr style={{ margin: "18px 0" }} />

      <h3>Round Control</h3>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => send({ type: "SET_FACE_OFF_WINNER", team: "A" })}>Face-off Winner: A</button>
        <button onClick={() => send({ type: "SET_FACE_OFF_WINNER", team: "B" })}>Face-off Winner: B</button>
        <button onClick={() => send({ type: "ADD_STRIKE" })}>Add Strike</button>
        <button onClick={() => send({ type: "START_STEAL" })}>Force Start Steal</button>
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {revealButtons.map((b) => (
          <button key={b.id} onClick={() => send({ type: "REVEAL_ANSWER", answerId: b.id })}>
            {b.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => send({ type: "STEAL_RESULT", success: true })}>Steal: Success</button>
        <button onClick={() => send({ type: "STEAL_RESULT", success: false })}>Steal: Fail</button>
        <button onClick={() => send({ type: "NEXT_ROUND" })}>Next Round</button>
        <button onClick={() => send({ type: "END_GAME" })}>End Game</button>
      </div>

      <hr style={{ margin: "18px 0" }} />

      <h3>Answer Key (Host Only)</h3>
      {cur ? (
        <div style={{ display: "grid", gap: 8, maxWidth: 680 }}>
          {cur.answers.map((a) => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700 }}>{a.text}</div>
              <div style={{ fontWeight: 900 }}>{a.points}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ opacity: 0.8 }}>No round loaded yet.</div>
      )}
    </div>
  );
}
