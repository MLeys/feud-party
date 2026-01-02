// feud-party/client/src/buzz/BuzzPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import type { BuzzState, GameState, TeamId } from "@feud/shared";
import { socket } from "../socket";
import "./buzz.css";

type Team = TeamId;

function getTeamLabel(state: GameState | null, t: TeamId): string {
  if (!state) return t === "A" ? "Team A" : "Team B";
  return t === "A" ? state.teams.A.name : state.teams.B.name;
}

type BuzzUiStatus = "CONNECTING" | "CLOSED" | "OPEN" | "LOCKED_ME" | "LOCKED_OTHER";

function computeUiStatus(state: GameState | null): BuzzUiStatus {
  if (!state) return "CONNECTING";
  const buzz = state.buzz;

  if (buzz.open && !buzz.winnerTeam) return "OPEN";
  if (buzz.winnerTeam) {
    const myId = socket.id || null;
    const iWon = Boolean(buzz.winnerSocketId && myId && buzz.winnerSocketId === myId);
    return iWon ? "LOCKED_ME" : "LOCKED_OTHER";
  }
  return "CLOSED";
}

export default function BuzzPage() {
  const [state, setState] = useState<GameState | null>(null);

  const [team, setTeam] = useState<Team>(() => {
    const saved = localStorage.getItem("buzzTeam");
    return saved === "B" ? "B" : "A";
  });

  const lastPressAtRef = useRef<number>(0);

  useEffect(() => {
    localStorage.setItem("buzzTeam", team);
  }, [team]);

  useEffect(() => {
    const onSync = (s: GameState) => setState(s);
    socket.on("state:sync", onSync);
    socket.emit("state:request");

    return () => {
      socket.off("state:sync", onSync);
    };
  }, []);

  const buzz: BuzzState | null = state ? state.buzz : null;

  const teamAName = useMemo(() => getTeamLabel(state, "A"), [state]);
  const teamBName = useMemo(() => getTeamLabel(state, "B"), [state]);

  const uiStatus = useMemo(() => computeUiStatus(state), [state]);
  const canBuzz = uiStatus === "OPEN";

  const winnerTeam: TeamId | null = buzz && buzz.winnerTeam ? buzz.winnerTeam : null;
  const isOpen = Boolean(buzz && buzz.open);

  const statusText = useMemo(() => {
    switch (uiStatus) {
      case "CONNECTING":
        return "Connecting to game…";
      case "OPEN":
        return "Buzz is OPEN. Tap BUZZ now.";
      case "LOCKED_ME":
        return "Locked: YOU buzzed first.";
      case "LOCKED_OTHER":
        return "Locked: another device buzzed first.";
      case "CLOSED":
      default:
        return "Buzz is closed. Wait for the host to open it.";
    }
  }, [uiStatus]);

  const hintText = useMemo(() => {
    if (uiStatus === "OPEN") return "Be ready. First tap wins.";
    if (uiStatus === "LOCKED_ME") return "Hold on—host will apply the winner.";
    if (uiStatus === "LOCKED_OTHER") return "Wait—host may reset and reopen.";
    return "Choose your team and wait.";
  }, [uiStatus]);

  const bigBuzzLabel = useMemo(() => {
    if (uiStatus === "OPEN") return "BUZZ";
    if (uiStatus === "LOCKED_ME") return "LOCKED (YOU)";
    if (uiStatus === "LOCKED_OTHER") return "LOCKED";
    if (uiStatus === "CONNECTING") return "CONNECTING";
    return "WAIT";
  }, [uiStatus]);

  function pressBuzz() {
    // Safety: should be disabled anyway, but keep logic bulletproof.
    if (!canBuzz) return;

    // Throttle spam taps (mobile double-tap, long-press quirks)
    const now = Date.now();
    if (now - lastPressAtRef.current < 250) return;
    lastPressAtRef.current = now;

    socket.emit("buzz:press", { team });

    // Light haptic feedback on supported devices
    if (navigator.vibrate) navigator.vibrate(35);
  }

  const showWinnerName =
    winnerTeam ? (winnerTeam === "A" ? teamAName : teamBName) : null;

  return (
    <div className="buzzRoot">
      <div className="buzzCard">
        <h1 className="buzzTitle">Buzzer</h1>

        <div className="teamRow">
          <button
            className={team === "A" ? "teamBtn teamBtnActive" : "teamBtn"}
            onClick={() => setTeam("A")}
            disabled={uiStatus !== "CLOSED" && uiStatus !== "CONNECTING"}
            title={
              uiStatus === "OPEN" || uiStatus === "LOCKED_ME" || uiStatus === "LOCKED_OTHER"
                ? "Team is locked while buzz is active."
                : ""
            }
          >
            {teamAName}
          </button>
          <button
            className={team === "B" ? "teamBtn teamBtnActive" : "teamBtn"}
            onClick={() => setTeam("B")}
            disabled={uiStatus !== "CLOSED" && uiStatus !== "CONNECTING"}
            title={
              uiStatus === "OPEN" || uiStatus === "LOCKED_ME" || uiStatus === "LOCKED_OTHER"
                ? "Team is locked while buzz is active."
                : ""
            }
          >
            {teamBName}
          </button>
        </div>

        <button
          className={`bigBuzz ${uiStatus === "OPEN" ? "bigBuzzOpen" : ""} ${
            uiStatus === "LOCKED_ME" ? "bigBuzzWin" : ""
          }`}
          disabled={!canBuzz}
          onClick={pressBuzz}
          aria-disabled={!canBuzz}
        >
          {bigBuzzLabel}
        </button>

        <div className="status">
          <div>
            <strong>Status:</strong> {statusText}
          </div>

          <div style={{ marginTop: 6, opacity: 0.85 }}>
            {hintText}
          </div>

          {state ? (
            <div style={{ marginTop: 10, opacity: 0.85 }}>
              Winner: {showWinnerName ? <strong>{showWinnerName}</strong> : "—"}
              {" · "}
              Open: {isOpen ? <strong>Yes</strong> : <strong>No</strong>}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
