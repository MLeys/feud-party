import type { TeamId } from "./types";

export type GameEvent =
  | { type: "SETUP_GAME"; teamAName: string; teamBName: string; gameLength: 3 | 5; packId: string }
  | { type: "SET_AUDIO"; enabled?: boolean; volume?: number }
  | { type: "SET_FACE_OFF_WINNER"; team: TeamId }
  | { type: "REVEAL_ANSWER"; answerId: string }
  | { type: "ADD_STRIKE" }
  | { type: "START_STEAL" }
  | { type: "STEAL_RESULT"; success: boolean; stolenAnswerId?: string }
  | { type: "NEXT_ROUND" }
  | { type: "END_GAME" }

  // ===== Game Admin (host) =====
  | { type: "RESET_TO_SETUP" }     // clears game progress and scores; returns to SETUP
  | { type: "RESTART_ROUND" }      // restarts current round (same prompt), keeps overall scores

  // ===== Buzz system (host + server) =====
  | { type: "OPEN_BUZZ"; mode: "FACE_OFF" | "PLAY" }
  | { type: "RESET_BUZZ" }
  | { type: "OVERRIDE_BUZZ"; team: TeamId }
  | { type: "APPLY_BUZZ" }
  | { type: "BUZZ_LOCK"; team: TeamId; socketId: string };
