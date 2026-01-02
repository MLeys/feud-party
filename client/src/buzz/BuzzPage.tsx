// feud-party/client/src/buzz/BuzzPage.tsx
import { useEffect, useMemo, useState } from "react";
import type { GameState } from "@feud/shared";
import { socket } from "../socket";
import "./buzz.css";

type Team = "A" | "B";

export default function BuzzPage() {
  const [state, setState] = useState<GameState | null>(null);

  const [team, setTeam] = useState<Team>(() => {
    const saved = localStorage.getItem("buzzTeam");
    return saved === "B" ? "B" : "A";
  });

  // Persist selection
  useEffect(() => {
    localStorage.setItem("buzzTeam", team);
  }, [team]);

  // Subscribe to state
  useEffect(() => {
    const onSync = (s: GameState) => setState(s);

    socket.on("state:sync", onSync);
    socket.emit("state:request");

    return () => {
      socket.off("state:sync", onSync);
    };
  }, []);

  const buzz = state ? state.buzz : null;
  const mySocketId = socket.id || null;

  const teamAName = state ? state.teams.A.name : "Team A";
  const teamBName = state ? state.teams.B.name : "Team B";

  const isOpen = Boolean(buzz && buzz.open);
  const winnerTeam = buzz && buzz.winnerTeam ? buzz.winnerTeam : null;

  const iWon = Boolean(buzz && buzz.winnerSocketId && mySocketId && buzz.winnerSocketId === mySocketId);

  const canBuzz = Boolean(buzz && buzz.open && !buzz.winnerTeam);

  const statusText = useMemo(() => {
    if (!state) return "Connecting to game…";
    if (!buzz) return "Loading buzzer…";

    if (buzz.open) return "Buzz is OPEN. Tap BUZZ now.";

    if (buzz.winnerTeam) {
      if (iWon) return "You WON the buzz.";
      return "Locked: another device buzzed first.";
    }

    return "Buzz is closed. Wait for the host to open it.";
  }, [state, buzz, iWon]);

  return (
    <div className="buzzRoot">
      <div className="buzzCard">
        <h1 className="buzzTitle">Buzzer</h1>

        <div className="teamRow" role="group" aria-label="Choose Team">
          <button
            type="button"
            className={team === "A" ? "teamBtn teamBtnActive" : "teamBtn"}
            onClick={() => setTeam("A")}
          >
            {teamAName}
          </button>
          <button
            type="button"
            className={team === "B" ? "teamBtn teamBtnActive" : "teamBtn"}
            onClick={() => setTeam("B")}
          >
            {teamBName}
          </button>
        </div>

        <button
          type="button"
          className="bigBuzz"
          disabled={!canBuzz}
          onClick={() => {
            socket.emit("buzz:press", { team });
            if (navigator.vibrate) navigator.vibrate(35);
          }}
        >
          BUZZ
        </button>

        <div className="status">
          <div>
            <strong>Status:</strong> {statusText}
          </div>

          {state ? (
            <div className="statusMeta">
              Winner:{" "}
              {winnerTeam ? <strong>{winnerTeam === "A" ? teamAName : teamBName}</strong> : "—"}
              {" · "}
              Open: {isOpen ? <strong>Yes</strong> : <strong>No</strong>}
              {winnerTeam && iWon ? (
                <>
                  {" · "}
                  <strong>You won</strong>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="hint">
          Tip: Select your team first. When the host opens the buzz, tap BUZZ immediately.
        </div>
      </div>
    </div>
  );
}
