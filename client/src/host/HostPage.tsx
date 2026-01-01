import { useEffect, useState } from "react";
import type { GameEvent, GameState } from "@feud/shared";
import { socket } from "../socket";
import HostStage from "./HostStage";
import "./host.css";

export default function HostPage() {
  const [state, setState] = useState<GameState | null>(null);
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const onSync = (s: GameState) => {
      setState(s);
    };

    socket.on("state:sync", onSync);
    return () => {
      socket.off("state:sync", onSync);
    };
  }, []);

  const onAuth = (pin: string) => {
    setAuthError(null);
    socket.emit("host:auth", { pin }, (res: { ok: boolean }) => {
      if (!res.ok) {
        setAuthed(false);
        setAuthError("Invalid PIN. Check the TV board.");
        return;
      }
      setAuthed(true);
    });
  };

  const send = (e: GameEvent) => {
    if (!authed) return;
    socket.emit("game:event", e);
  };

  if (!state) {
    return (
      <div className="hostRoot">
        <div className="hostStage">
          <div className="card">
            <div className="cardHeader">
              <div className="cardHeaderTitle">Connecting…</div>
              <div className="cardHeaderSub">Waiting for server state.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <HostStage state={state} authed={authed} onAuth={onAuth} send={send} />
      {authError ? (
        <div style={{ position: "fixed", left: 12, right: 12, bottom: 12 }}>
          <div className="card" style={{ borderColor: "rgba(255,90,90,0.45)", background: "rgba(255,70,70,0.12)" }}>
            <div style={{ fontWeight: 950 }}>Auth Error</div>
            <div className="small" style={{ marginTop: 4 }}>
              {authError}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
