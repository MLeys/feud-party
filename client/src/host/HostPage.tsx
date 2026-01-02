import { useEffect, useState } from "react";
import type { GameEvent, GameState } from "@feud/shared";
import { socket } from "../socket";
import HostStage from "./HostStage";
import "./host.css";

type Auth = {
  authed: boolean;
  pin: string;
  error: string;
};

export default function HostPage() {
  const [state, setState] = useState<GameState | null>(null);

  const [auth, setAuth] = useState<Auth>(() => {
    const pin = sessionStorage.getItem("hostPin") || "";
    const authed = sessionStorage.getItem("hostAuthed") === "1";
    return { authed, pin, error: "" };
  });

  useEffect(() => {
    const onSync = (s: GameState) => setState(s);

    socket.on("state:sync", onSync);

    // Request snapshot after listener attaches (prevents missing initial sync)
    socket.emit("state:request");

    return () => {
      socket.off("state:sync", onSync);
    };
  }, []);

  // Re-auth on reconnect if previously authed
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

      // Also request state on reconnect
      socket.emit("state:request");
    };

    socket.on("connect", onConnect);
    return () => {
      socket.off("connect", onConnect);
    };
  }, [auth.authed, auth.pin]);

  function doAuth(pin: string) {
    const cleaned = (pin || "").trim();
    if (!cleaned) {
      setAuth((a) => ({ ...a, error: "Enter the PIN shown on the board." }));
      return;
    }

    socket.emit("host:auth", { pin: cleaned }, (res: { ok: boolean }) => {
      const ok = Boolean(res && res.ok);
      if (!ok) {
        sessionStorage.removeItem("hostAuthed");
        setAuth((a) => ({ ...a, authed: false, error: "Incorrect PIN. Try again." }));
        return;
      }

      sessionStorage.setItem("hostPin", cleaned);
      sessionStorage.setItem("hostAuthed", "1");
      setAuth({ authed: true, pin: cleaned, error: "" });

      socket.emit("state:request");
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

  // Loading
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

  // Auth gate
  if (!auth.authed) {
    return (
      <div className="hostRoot">
        <div className="hostShell">
          <div className="hostCard">
            <div className="hostH1">Host Console</div>
            <div className="hostMuted">Enter the PIN shown on the TV board to unlock host controls.</div>

            <div className="hostFormRow">
              <input
                className="hostInput"
                value={auth.pin}
                inputMode="numeric"
                placeholder="PIN"
                onChange={(e) => setAuth((a) => ({ ...a, pin: e.target.value, error: "" }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") doAuth(auth.pin);
                }}
              />
              <button className="btn btnPrimary" onClick={() => doAuth(auth.pin)}>
                Unlock
              </button>
            </div>

            {auth.error ? <div className="hostError">{auth.error}</div> : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <HostStage
      state={state}
      send={send}
      clearError={() => setAuth((a) => ({ ...a, error: "" }))}
      hostError={auth.error}
    />
  );
}
