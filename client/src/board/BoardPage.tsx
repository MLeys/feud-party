// feud-party/client/src/board/BoardPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import type { GameState } from "@feud/shared";
import { socket } from "../socket";
import BoardStage from "./BoardStage";

type SockStatus = {
  connected: boolean;
  id: string | null;
  transport: string | null;
  lastError: string | null;
  lastSyncAt: number | null;
};

function timeAgo(ms: number | null) {
  if (!ms) return "—";
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  return `${m}m ago`;
}

export default function BoardPage() {
  const [state, setState] = useState<GameState | null>(null);
  const lastEventIdRef = useRef<number>(0);

  const [sock, setSock] = useState<SockStatus>(() => ({
    connected: socket.connected,
    id: socket.id || null,
    transport: null,
    lastError: null,
    lastSyncAt: null
  }));

  useEffect(() => {
    const onConnect = () => {
      const t = socket.io.engine && socket.io.engine.transport ? socket.io.engine.transport.name : null;
      setSock((prev) => ({
        ...prev,
        connected: true,
        id: socket.id || null,
        transport: t,
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

      if (s.lastEventId > lastEventIdRef.current) {
        lastEventIdRef.current = s.lastEventId;
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("state:sync", onSync);

    // If we mounted after a connect, request immediately
    socket.emit("state:request");

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("state:sync", onSync);
    };
  }, []);

  const socketUrl = useMemo(() => {
    const host = window.location.hostname;
    const isViteDev = window.location.port === "5173";
    return isViteDev ? `http://${host}:3000` : window.location.origin;
  }, []);

  if (!state) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui", lineHeight: 1.35 }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Connecting…</div>

        <div style={{ maxWidth: 720, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Socket Diagnostics</div>

          <div>Socket URL: <code>{socketUrl}</code></div>
          <div>Connected: <strong>{sock.connected ? "Yes" : "No"}</strong></div>
          <div>Socket ID: <code>{sock.id || "—"}</code></div>
          <div>Transport: <strong>{sock.transport || "—"}</strong></div>
          <div>Last state:sync: <strong>{timeAgo(sock.lastSyncAt)}</strong></div>

          {sock.lastError ? (
            <div style={{ marginTop: 10, color: "#b00020" }}>
              <div style={{ fontWeight: 700 }}>Last Error</div>
              <div style={{ whiteSpace: "pre-wrap" }}>{sock.lastError}</div>
            </div>
          ) : null}

          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => socket.emit("state:request")}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ccc",
                background: "#fff",
                cursor: "pointer",
                fontWeight: 700
              }}
            >
              Request State
            </button>
          </div>

          <div style={{ marginTop: 10, opacity: 0.75 }}>
            If “Connected: Yes” but “Last state:sync” stays “—”, the server is not emitting to this client,
            or the event name differs.
          </div>
        </div>
      </div>
    );
  }

  return <BoardStage state={state} />;
}
