// feud-party/shared/src/reducer.ts
import type { BuzzState, FaceOffState, FeudRound, GameState, RoundState, TeamId } from "./types";
import type { GameEvent } from "./events";

function makeEmptyBuzz(): BuzzState {
  return {
    open: false,
    mode: null,
    winnerTeam: null,
    winnerSocketId: null,
    openedAt: null
  };
}

function otherTeam(team: TeamId): TeamId {
  return team === "A" ? "B" : "A";
}

function topAnswerPoints(cur: RoundState): number {
  let max = 0;
  for (const a of cur.answers) max = Math.max(max, a.points);
  return max;
}

function allAnswersRevealed(cur: RoundState): boolean {
  for (const a of cur.answers) {
    if (!cur.revealedAnswerIds[a.id]) return false;
  }
  return true;
}

function makeRoundState(round: FeudRound, roundIndex: number): RoundState {
  const revealedAnswerIds: Record<string, boolean> = {};
  for (const a of round.answers) revealedAnswerIds[a.id] = false;

  const faceOff: FaceOffState = {
    step: 0,
    firstTeam: null,
    firstAnswerId: null,
    firstPoints: null,
    secondTeam: null,
    secondAnswerId: null,
    secondPoints: null
  };

  return {
    roundIndex,
    prompt: round.prompt,
    answers: round.answers,
    revealedAnswerIds,
    strikes: 0,
    maxStrikes: round.maxStrikes ?? 3,
    controlTeam: null,
    activeTeam: null,
    roundPoints: 0,
    faceOff
  };
}

export function createInitialState(args: { hostPin: string; rounds: FeudRound[]; packId: string }): GameState {
  return {
    phase: "SETUP",
    config: { gameLength: 5, hostPin: args.hostPin },
    audio: { enabled: true, volume: 0.8 },
    teams: { A: { name: "Team A", score: 0 }, B: { name: "Team B", score: 0 } },
    packId: args.packId,
    rounds: args.rounds,
    current: null,
    buzz: makeEmptyBuzz(),
    lastEventId: 0
  };
}

export function reducer(state: GameState, event: GameEvent): GameState {
  const nextEventId = state.lastEventId + 1;

  switch (event.type) {
    case "RESET_TO_SETUP": {
      return {
        ...state,
        lastEventId: nextEventId,
        phase: "SETUP",
        teams: {
          A: { ...state.teams.A, score: 0 },
          B: { ...state.teams.B, score: 0 }
        },
        current: null,
        buzz: makeEmptyBuzz()
      };
    }

    case "SETUP_GAME": {
      const firstRound = state.rounds[0];
      return {
        ...state,
        lastEventId: nextEventId,
        config: { ...state.config, gameLength: event.gameLength },
        teams: {
          A: { ...state.teams.A, name: event.teamAName, score: 0 },
          B: { ...state.teams.B, name: event.teamBName, score: 0 }
        },
        packId: event.packId,
        phase: "FACE_OFF",
        current: firstRound ? makeRoundState(firstRound, 0) : null,
        buzz: makeEmptyBuzz()
      };
    }

    case "SET_AUDIO": {
      return {
        ...state,
        lastEventId: nextEventId,
        audio: {
          enabled: event.enabled ?? state.audio.enabled,
          volume: event.volume ?? state.audio.volume
        }
      };
    }

    case "OPEN_BUZZ": {
      return {
        ...state,
        lastEventId: nextEventId,
        buzz: {
          open: true,
          mode: event.mode,
          winnerTeam: null,
          winnerSocketId: null,
          openedAt: Date.now()
        }
      };
    }

    case "RESET_BUZZ": {
      return { ...state, lastEventId: nextEventId, buzz: makeEmptyBuzz() };
    }

    case "BUZZ_LOCK": {
      if (!state.buzz.open) return { ...state, lastEventId: nextEventId };
      if (state.buzz.winnerTeam) return { ...state, lastEventId: nextEventId };

      return {
        ...state,
        lastEventId: nextEventId,
        buzz: {
          ...state.buzz,
          open: false,
          winnerTeam: event.team,
          winnerSocketId: event.socketId
        }
      };
    }

    case "OVERRIDE_BUZZ": {
      return {
        ...state,
        lastEventId: nextEventId,
        buzz: {
          ...state.buzz,
          open: false,
          winnerTeam: event.team
        }
      };
    }

    /**
     * APPLY_BUZZ in FACE_OFF:
     * - Sets ACTIVE team to buzz winner (who guesses first).
     * - Does NOT award control.
     */
    case "APPLY_BUZZ": {
      const win = state.buzz.winnerTeam;
      const cur = state.current;
      if (!win || !cur) return { ...state, lastEventId: nextEventId };

      if (state.phase !== "FACE_OFF") {
        return { ...state, lastEventId: nextEventId, buzz: makeEmptyBuzz() };
      }

      const nextFaceOff: FaceOffState = {
        ...cur.faceOff,
        firstTeam: cur.faceOff.firstTeam ?? win
      };

      return {
        ...state,
        lastEventId: nextEventId,
        current: { ...cur, activeTeam: win, faceOff: nextFaceOff },
        buzz: makeEmptyBuzz()
      };
    }

    /**
     * Host manually awards CONTROL after face-off reveals.
     * During FACE_OFF, this starts PLAY.
     */
    case "SET_FACE_OFF_WINNER": {
      const cur = state.current;
      if (!cur) return { ...state, lastEventId: nextEventId };

      if (state.phase !== "FACE_OFF") return { ...state, lastEventId: nextEventId };

      return {
        ...state,
        lastEventId: nextEventId,
        phase: "PLAY",
        current: {
          ...cur,
          controlTeam: event.team,
          activeTeam: event.team,
          strikes: 0
        },
        buzz: makeEmptyBuzz()
      };
    }

    /**
     * REVEAL_ANSWER:
     * - FACE_OFF: reveal only + record face-off; bank stays 0
     * - PLAY: reveal + bank points; all revealed -> ROUND_END score controlTeam
     */
    case "REVEAL_ANSWER": {
      const cur = state.current;
      if (!cur) return { ...state, lastEventId: nextEventId };

      if (state.phase !== "FACE_OFF" && state.phase !== "PLAY") {
        return { ...state, lastEventId: nextEventId };
      }

      if (cur.revealedAnswerIds[event.answerId]) return { ...state, lastEventId: nextEventId };

      const answer = cur.answers.find((a) => a.id === event.answerId);
      if (!answer) return { ...state, lastEventId: nextEventId };

      const revealedAnswerIds = { ...cur.revealedAnswerIds, [event.answerId]: true };

      // ----- FACE_OFF (NO BANK) -----
      if (state.phase === "FACE_OFF") {
        const active = cur.activeTeam;

        // If no active team set yet, we still reveal tile but can't attribute the guess.
        if (!active) {
          return {
            ...state,
            lastEventId: nextEventId,
            current: { ...cur, revealedAnswerIds, roundPoints: 0 }
          };
        }

        const step = cur.faceOff.step;
        const topPts = topAnswerPoints(cur);

        // First face-off reveal
        if (step === 0) {
          const nextFaceOff: FaceOffState = {
            ...cur.faceOff,
            step: 1,
            firstTeam: cur.faceOff.firstTeam ?? active,
            firstAnswerId: event.answerId,
            firstPoints: answer.points
          };

          // Optional classic convenience: top answer = instant control
          if (answer.points === topPts) {
            return {
              ...state,
              lastEventId: nextEventId,
              phase: "PLAY",
              current: {
                ...cur,
                revealedAnswerIds,
                faceOff: nextFaceOff,
                controlTeam: active,
                activeTeam: active,
                strikes: 0,
                roundPoints: 0
              },
              buzz: makeEmptyBuzz()
            };
          }

          // Otherwise swap to opponent for second guess
          return {
            ...state,
            lastEventId: nextEventId,
            current: {
              ...cur,
              revealedAnswerIds,
              faceOff: nextFaceOff,
              activeTeam: otherTeam(active),
              roundPoints: 0
            },
            buzz: makeEmptyBuzz()
          };
        }

        // Second face-off reveal
        if (step === 1) {
          const nextFaceOff: FaceOffState = {
            ...cur.faceOff,
            step: 2,
            secondTeam: active,
            secondAnswerId: event.answerId,
            secondPoints: answer.points
          };

          return {
            ...state,
            lastEventId: nextEventId,
            current: { ...cur, revealedAnswerIds, faceOff: nextFaceOff, roundPoints: 0 },
            buzz: makeEmptyBuzz()
          };
        }

        // step === 2: still in FACE_OFF; allow reveals but keep bank at 0 until PLAY begins
        return {
          ...state,
          lastEventId: nextEventId,
          current: { ...cur, revealedAnswerIds, roundPoints: 0 }
        };
      }

      // ----- PLAY (BANK POINTS) -----
      const nextRoundPoints = cur.roundPoints + answer.points;
      const nextCur: RoundState = {
        ...cur,
        revealedAnswerIds,
        roundPoints: nextRoundPoints
      };

      if (nextCur.controlTeam && allAnswersRevealed(nextCur)) {
        const winner = nextCur.controlTeam;
        return {
          ...state,
          lastEventId: nextEventId,
          phase: "ROUND_END",
          current: nextCur,
          teams: {
            ...state.teams,
            [winner]: { ...state.teams[winner], score: state.teams[winner].score + nextCur.roundPoints }
          },
          buzz: makeEmptyBuzz()
        };
      }

      return { ...state, lastEventId: nextEventId, current: nextCur };
    }

    case "ADD_STRIKE": {
      const cur = state.current;
      if (!cur) return { ...state, lastEventId: nextEventId };

      if (state.phase !== "PLAY" && state.phase !== "STEAL") {
        return { ...state, lastEventId: nextEventId };
      }

      const strikes = cur.strikes + 1;
      const reachedMax = strikes >= cur.maxStrikes;

      if (state.phase === "PLAY" && reachedMax && cur.controlTeam) {
        return {
          ...state,
          lastEventId: nextEventId,
          phase: "STEAL",
          current: { ...cur, strikes, activeTeam: otherTeam(cur.controlTeam) },
          buzz: makeEmptyBuzz()
        };
      }

      return { ...state, lastEventId: nextEventId, current: { ...cur, strikes } };
    }

    case "START_STEAL": {
      const cur = state.current;
      if (!cur || state.phase !== "PLAY" || !cur.controlTeam) return { ...state, lastEventId: nextEventId };

      return {
        ...state,
        lastEventId: nextEventId,
        phase: "STEAL",
        current: { ...cur, activeTeam: otherTeam(cur.controlTeam) },
        buzz: makeEmptyBuzz()
      };
    }

    case "STEAL_RESULT": {
      const cur = state.current;
      if (!cur || state.phase !== "STEAL" || !cur.controlTeam || !cur.activeTeam) {
        return { ...state, lastEventId: nextEventId };
      }

      const stealTeam = cur.activeTeam;
      const winner: TeamId = event.success ? stealTeam : cur.controlTeam;

      return {
        ...state,
        lastEventId: nextEventId,
        phase: "ROUND_END",
        current: cur,
        teams: {
          ...state.teams,
          [winner]: { ...state.teams[winner], score: state.teams[winner].score + cur.roundPoints }
        },
        buzz: makeEmptyBuzz()
      };
    }

    case "RESTART_ROUND": {
      const cur = state.current;
      if (!cur) return { ...state, lastEventId: nextEventId };

      const round = state.rounds[cur.roundIndex];
      if (!round) return { ...state, lastEventId: nextEventId };

      return {
        ...state,
        lastEventId: nextEventId,
        phase: "FACE_OFF",
        current: makeRoundState(round, cur.roundIndex),
        buzz: makeEmptyBuzz()
      };
    }

    case "NEXT_ROUND": {
      const currentIndex = state.current ? state.current.roundIndex : -1;
      const nextIndex = currentIndex + 1;

      if (nextIndex >= state.config.gameLength) {
        return { ...state, lastEventId: nextEventId, phase: "GAME_END", buzz: makeEmptyBuzz() };
      }

      const nextRound = state.rounds[nextIndex];
      if (!nextRound) {
        return { ...state, lastEventId: nextEventId, phase: "GAME_END", buzz: makeEmptyBuzz() };
      }

      return {
        ...state,
        lastEventId: nextEventId,
        phase: "FACE_OFF",
        current: makeRoundState(nextRound, nextIndex),
        buzz: makeEmptyBuzz()
      };
    }

    case "END_GAME":
      return { ...state, lastEventId: nextEventId, phase: "GAME_END", buzz: makeEmptyBuzz() };

    default:
      return { ...state, lastEventId: nextEventId };
  }
}
