import { useEffect, useMemo, useState } from "react";
import type { GameEvent, GameState } from "@feud/shared";
import { socket } from "../socket";
import HostStage from "../host/HostStage";
import "../host/host.css";

type AuthState = {
  authed: boolean;
  pin: string;
  error: string;
};

export default function Host() {
  const [state, setState] = useState<GameState | null>(null);

  const [auth, setAuth] = useState<AuthState>(() => {
    const savedPin = sessionStorage.getItem("hostPin") || "";
    const savedAuthed = sessionStorage.getItem("hostAuthed") === "1";
    return { authed: savedAuthed, pin: savedPin, error: "" };
  });

  // Always keep state updated
  useEffect(() => {
    const onSync = (s: GameState) => setState(s);

    socket.on("state:sync", onSync);

    // Critical: request snapshot after listener attaches (prevents “miss initial sync” race)
    socket.emit("state:request");

    return () => {
      socket.off("state:sync", onSync);
    };
  }, []);

  // If we think we're authed (session restore), re-auth quietly when socket reconnects
  useEffect(() => {
    const onConnect = () => {
      if (!auth.authed) return;
      if (!auth.pin) return;

      socket.emit("host:auth", { pin: auth.pin }, (res: { ok: boolean }) => {
        if (!res || !res.ok) {
          sessionStorage.removeItem("hostAuthed");
          setAuth((a) => ({ ...a, authed: false, error: "Host session expired. Re-enter PIN." }));
        }
      });
    };

    socket.on("connect", onConnect);
    return () => {
      socket.off("connect", onConnect);
    };
  }, [auth.authed, auth.pin]);

  const canShowPin = useMemo(() => {
    return Boolean(state && state.config && state.config.hostPin);
  }, [state]);

  function doAuth() {
    const pin = auth.pin.trim();
    if (!pin) {
      setAuth((a) => ({ ...a, error: "Enter the 4-digit PIN shown on the board." }));
      return;
    }

    socket.emit("host:auth", { pin }, (res: { ok: boolean }) => {
      const ok = Boolean(res && res.ok);
      if (!ok) {
        sessionStorage.removeItem("hostAuthed");
        setAuth((a) => ({ ...a, authed: false, error: "Incorrect PIN. Try again." }));
        return;
      }

      sessionStorage.setItem("hostPin", pin);
      sessionStorage.setItem("hostAuthed", "1");
      setAuth({ authed: true, pin, error: "" });
    });
  }

  function send(event: GameEvent) {
    if (!auth.authed) return;

    socket.emit("game:event", event, (res: { ok: boolean; error?: string }) => {
      if (!res || !res.ok) {
        const msg = res && res.error ? res.error : "Action failed";
        setAuth((a) => ({ ...a, error: msg }));
      }
    });
  }

  // Basic loading screen until we get state at least once
  if (!state) {
    return (
      <div className="hostRoot">
        <div className="hostShell">
          <div className="hostCard">
            <div className="hostH1">Host Console</div>
            <div className="hostMuted">Connecting to server…</div>
          </div>
        </div>
      </div>
    );
  }

  if (!auth.authed) {
    return (
      <div className="hostRoot">
        <div className="hostShell">
          <div className="hostCard">
            <div className="hostH1">Host Console</div>
            <div className="hostMuted">
              Enter the 4-digit PIN shown on the TV board to unlock host controls.
            </div>

            <div className="hostFormRow">
              <input
                className="hostInput"
                value={auth.pin}
                inputMode="numeric"
                placeholder={canShowPin ? "PIN (from board)" : "PIN"}
                onChange={(e) => setAuth((a) => ({ ...a, pin: e.target.value, error: "" }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") doAuth();
                }}
              />
              <button className="btn btnPrimary" onClick={doAuth}>
                Unlock
              </button>
            </div>

            {auth.error ? <div className="hostError">{auth.error}</div> : null}

            <div className="hostHint">
              Tip: If you don’t see a PIN on the board, refresh the TV board page once.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <HostStage state={state} send={send} clearError={() => setAuth((a) => ({ ...a, error: "" }))} />;
}
