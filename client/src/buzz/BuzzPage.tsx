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

  useEffect(() => {
    localStorage.setItem("buzzTeam", team);
  }, [team]);

  useEffect(() => {
    const onSync = (s: GameState) => setState(s);
    socket.on("state:sync", onSync);
    return () => {
      socket.off("state:sync", onSync);
    };
  }, []);

  const buzz = state ? state.buzz : null;
  const mySocketId = socket.id || null;

  const isOpen = Boolean(buzz && buzz.open);
  const hasWinner = Boolean(buzz && buzz.winnerTeam);
  const winnerTeam = buzz && buzz.winnerTeam ? buzz.winnerTeam : null;

  const iWon = Boolean(
    buzz &&
      buzz.winnerSocketId &&
      mySocketId &&
      buzz.winnerSocketId === mySocketId
  );

  const canBuzz = Boolean(buzz && buzz.open && !buzz.winnerTeam);

  const statusText = useMemo(() => {
    if (!state) return "Connecting to game…";
    if (!buzz) return "Loading buzzer…";

    if (buzz.open) {
      return "Buzz is OPEN. Tap BUZZ now.";
    }

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

        <div className="teamRow">
          <button
            className={team === "A" ? "teamBtn teamBtnActive" : "teamBtn"}
            onClick={() => setTeam("A")}
          >
            Team A
          </button>
          <button
            className={team === "B" ? "teamBtn teamBtnActive" : "teamBtn"}
            onClick={() => setTeam("B")}
          >
            Team B
          </button>
        </div>

        <button
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
            <div style={{ marginTop: 6, opacity: 0.85 }}>
              Winner:{" "}
              {winnerTeam ? <strong>Team {winnerTeam}</strong> : "—"} {" · "}
              Open: {isOpen ? <strong>Yes</strong> : <strong>No</strong>}
              {hasWinner && iWon ? (
                <>
                  {" · "}
                  <strong>You won</strong>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
