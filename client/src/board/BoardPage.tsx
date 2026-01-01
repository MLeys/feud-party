import { useEffect, useRef, useState } from "react";
import type { GameState } from "@feud/shared";
import { socket } from "../socket";
import BoardStage from "./BoardStage";

export default function BoardPage() {
  const [state, setState] = useState<GameState | null>(null);
  const lastEventIdRef = useRef<number>(0);

  useEffect(() => {
    const onSync = (s: GameState) => {
      setState(s);

      // Hook point for event-based overlays/sounds:
      // Use s.lastEventId monotonic changes.
      if (s.lastEventId > lastEventIdRef.current) {
        lastEventIdRef.current = s.lastEventId;
      }
    };

    socket.on("state:sync", onSync);
    return () => {
      socket.off("state:sync", onSync);
    };
  }, []);

  if (!state) {
    return <div style={{ padding: 24, fontFamily: "system-ui" }}>Connecting…</div>;
  }

  return <BoardStage state={state} />;
}
