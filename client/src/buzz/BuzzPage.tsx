// feud-party/client/src/buzz/BuzzPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import type { BuzzState, GameState, TeamId } from "@feud/shared";
import { socket } from "../socket";
import "./buzz.css";

type Team = TeamId;

type SockStatus = {
  connected: boolean;
  id: string | null;
  lastError: string | null;
  lastSyncAt: number | null;
};

function teamLabel(state: GameState | null, t: TeamId): string {
  if (!state) return t === "A" ? "Team A" : "Team B";
  return t === "A" ? state.teams.A.name : state.teams.B.name;
}

function timeAgo(ms: number | null) {
  if (!ms) return "—";
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  return `${m}m ago`;
}

export default function BuzzPage() {
  const [state, setState] = useState<GameState | null>(null);

  const [team, setTeam] = useState<Team>(() => {
    const saved = localStorage.getItem("buzzTeam");
    return saved === "B" ? "B" : "A";
  });

  const [sock, setSock] = useState<SockStatus>(() => ({
    connected: socket.connected,
    id: socket.id || null,
    lastError: null,
    lastSyncAt: null
  }));

  const lastPressAtRef = useRef<number>(0);

  useEffect(() => {
    localStorage.setItem("buzzTeam", team);
  }, [team]);

  useEffect(() => {
    const onConnect = () => {
      setSock((prev) => ({
        ...prev,
        connected: true,
        id: socket.id || null,
        lastError: null
      }));
      socket.emit("state:request");
    };

    const onDisconnect = () => {
      setSock((prev) => ({
        ...prev,
        connected: false,
        id: socket.id || null
      }));
    };

    const onConnectError = (err: unknown) => {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : String(err);

      setSock((prev) => ({
        ...prev,
        connected: false,
        id: socket.id || null,
        lastError: msg
      }));
    };

    const onSync = (s: GameState) => {
      setState(s);
      setSock((prev) => ({ ...prev, lastSyncAt: Date.now() }));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("state:sync", onSync);

    // Kick-start a snapshot in case we mounted after connect
    socket.emit("state:request");

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("state:sync", onSync);
    };
  }, []);

  const buzz: BuzzState | null = state ? state.buzz : null;

  const teamAName = useMemo(() => teamLabel(state, "A"), [state]);
  const teamBName = useMemo(() => teamLabel(state, "B"), [state]);

  const isOpen = Boolean(buzz && buzz.open);
  const winnerTeam: TeamId | null = buzz && buzz.winnerTeam ? buzz.winnerTeam : null;

  const iWon = Boolean(buzz && buzz.winnerSocketId && sock.id && buzz.winnerSocketId === sock.id);

  const canBuzz = Boolean(buzz && buzz.open && !buzz.winnerTeam);

  const statusText = useMemo(() => {
    if (!state) return "Connecting to game…";
    if (!buzz) return "Loading buzzer…";

    if (buzz.open && !buzz.winnerTeam) return "Buzz is OPEN. Tap BUZZ now.";

    if (buzz.winnerTeam) {
      return iWon ? "Locked: YOU buzzed first." : "Locked: another device buzzed first.";
    }

    return "Buzz is closed. Wait for the host to open it.";
  }, [state, buzz, iWon]);

  function pressBuzz() {
    if (!canBuzz) return;

    // Throttle double-taps / accidental repeats
    const now = Date.now();
    if (now - lastPressAtRef.current < 250) return;
    lastPressAtRef.current = now;

    socket.emit("buzz:press", { team });

    if (navigator.vibrate) navigator.vibrate(35);
  }

  const winnerName = winnerTeam ? (winnerTeam === "A" ? teamAName : teamBName) : null;

  return (
    <div className="buzzRoot">
      <div className="buzzCard">
        <h1 className="buzzTitle">Buzzer</h1>

        <div className="teamRow">
          <button
            className={team === "A" ? "teamBtn teamBtnActive" : "teamBtn"}
            onClick={() => setTeam("A")}
            disabled={isOpen || Boolean(winnerTeam)}
            title={isOpen || winnerTeam ? "Team selection is locked while buzz is active." : ""}
          >
            {teamAName}
          </button>
          <button
            className={team === "B" ? "teamBtn teamBtnActive" : "teamBtn"}
            onClick={() => setTeam("B")}
            disabled={isOpen || Boolean(winnerTeam)}
            title={isOpen || winnerTeam ? "Team selection is locked while buzz is active." : ""}
          >
            {teamBName}
          </button>
        </div>

        <button className="bigBuzz" disabled={!canBuzz} onClick={pressBuzz}>
          BUZZ
        </button>

        <div className="status">
          <div>
            <strong>Status:</strong> {statusText}
          </div>

          <div style={{ marginTop: 8, opacity: 0.85 }}>
            Winner: {winnerName ? <strong>{winnerName}</strong> : "—"}
            {" · "}
            Open: {isOpen ? <strong>Yes</strong> : <strong>No</strong>}
            {winnerTeam && iWon ? (
              <>
                {" · "}
                <strong>You won</strong>
              </>
            ) : null}
          </div>

          {/* Lightweight diagnostics so you can debug on a phone */}
          <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12, lineHeight: 1.2 }}>
            Socket: <strong>{sock.connected ? "connected" : "disconnected"}</strong>
            {" · "}
            ID: <code>{sock.id || "—"}</code>
            {" · "}
            Last sync: <strong>{timeAgo(sock.lastSyncAt)}</strong>
            {sock.lastError ? (
              <>
                {" · "}
                Error: <span style={{ whiteSpace: "pre-wrap" }}>{sock.lastError}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
