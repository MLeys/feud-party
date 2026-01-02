// feud-party/client/src/board/BoardPage.tsx
import { useEffect, useRef, useState } from "react";
import type { GameState } from "@feud/shared";
import { socket } from "../socket";
import BoardStage from "./BoardStage";

/**
 * Audio files live in: client/public/sfx/
 * Public URLs (Vite) resolve from the root, e.g. /sfx/strike.mp3
 */
const SFX = {
  strike: "/sfx/strike.mp3",
  reveal: "/sfx/reveal.mp3",
  buzzOpen: "/sfx/buzz-open.mp3",
  // You do not currently have a dedicated "lock" sound; reuse buzzOpen for now.
  buzzLock: "/sfx/buzz-open.mp3",
  roundEnd: "/sfx/round-end.mp3",
  gameEnd: "/sfx/game-end.mp3",

  // Optional extras you already have (not wired yet, but ready)
  correct: "/sfx/correct.mp3",
  wrong: "/sfx/wrong.mp3"
} as const;

type SfxKey = keyof typeof SFX;

function countRevealed(state: GameState | null): number {
  const cur = state?.current;
  if (!cur) return 0;
  let c = 0;
  for (const k in cur.revealedAnswerIds) if (cur.revealedAnswerIds[k]) c++;
  return c;
}

export default function BoardPage() {
  const [state, setState] = useState<GameState | null>(null);
  const prevStateRef = useRef<GameState | null>(null);

  // Autoplay guard UX (TV browser may require one click)
  const [needsInteraction, setNeedsInteraction] = useState(false);

  // Cache HTMLAudioElements to avoid re-downloading
  const audioCacheRef = useRef<Record<string, HTMLAudioElement>>({});

  function getAudio(url: string): HTMLAudioElement {
    const cache = audioCacheRef.current;
    if (!cache[url]) {
      const a = new Audio(url);
      a.preload = "auto";
      cache[url] = a;
    }
    return cache[url];
  }

  function playSfx(next: GameState, key: SfxKey) {
    if (!next.audio.enabled) return;

    const url = SFX[key];
    const a = getAudio(url);

    // enforce state volume
    a.volume = Math.max(0, Math.min(1, next.audio.volume));

    // restart if triggered rapidly
    try {
      a.currentTime = 0;
    } catch {
      // ignore
    }

    const p = a.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        // Most common: NotAllowedError until first user interaction
        setNeedsInteraction(true);
      });
    }
  }

  function detectAndPlay(prev: GameState | null, next: GameState) {
    if (!prev) return;

    // Strike increased
    const prevStrikes = prev.current?.strikes ?? 0;
    const nextStrikes = next.current?.strikes ?? 0;
    if (nextStrikes > prevStrikes) {
      playSfx(next, "strike");
      return;
    }

    // Reveal increased
    const prevRevealed = countRevealed(prev);
    const nextRevealed = countRevealed(next);
    if (nextRevealed > prevRevealed) {
      playSfx(next, "reveal");
      return;
    }

    // Buzz opened
    const prevBuzzOpen = Boolean(prev.buzz?.open);
    const nextBuzzOpen = Boolean(next.buzz?.open);
    if (!prevBuzzOpen && nextBuzzOpen) {
      playSfx(next, "buzzOpen");
      return;
    }

    // Buzz locked (winner appears)
    const prevWinner = prev.buzz?.winnerTeam ?? null;
    const nextWinner = next.buzz?.winnerTeam ?? null;
    if (!prevWinner && nextWinner) {
      playSfx(next, "buzzLock");
      return;
    }

    // Phase transitions
    if (prev.phase !== next.phase) {
      if (next.phase === "ROUND_END") {
        playSfx(next, "roundEnd");
        return;
      }
      if (next.phase === "GAME_END") {
        playSfx(next, "gameEnd");
        return;
      }
    }
  }

  useEffect(() => {
    const onSync = (s: GameState) => {
      detectAndPlay(prevStateRef.current, s);
      prevStateRef.current = s;
      setState(s);
    };

    socket.on("state:sync", onSync);
    socket.emit("state:request");

    return () => {
      socket.off("state:sync", onSync);
    };
  }, []);

  if (!state) {
    return <div style={{ padding: 24, fontFamily: "system-ui" }}>Connecting…</div>;
  }

  return (
    <div style={{ position: "relative" }}>
      {needsInteraction && state.audio.enabled ? (
        <button
          onClick={() => {
            setNeedsInteraction(false);
            // small test sound to unlock audio
            playSfx(state, "reveal");
          }}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 9999,
            padding: "10px 12px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(0,0,0,0.5)",
            color: "rgba(255,255,255,0.9)",
            fontWeight: 700,
            cursor: "pointer",
            backdropFilter: "blur(10px)"
          }}
        >
          Click to enable sound
        </button>
      ) : null}

      <BoardStage state={state} />
    </div>
  );
}
