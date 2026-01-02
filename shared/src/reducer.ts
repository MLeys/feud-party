import type { FeudRound, GameState, RoundState, TeamId, BuzzState } from "./types";
import type { GameEvent } from "./events";

function makeRoundState(round: FeudRound, roundIndex: number): RoundState {
  const revealedAnswerIds: Record<string, boolean> = {};
  for (const a of round.answers) revealedAnswerIds[a.id] = false;

  return {
    roundIndex,
    prompt: round.prompt,
    answers: round.answers,
    revealedAnswerIds,
    strikes: 0,
    maxStrikes: round.maxStrikes ?? 3,
    controlTeam: null,
    activeTeam: null,
    roundPoints: 0
  };
}

function otherTeam(team: TeamId): TeamId {
  return team === "A" ? "B" : "A";
}

function makeEmptyBuzz(): BuzzState {
  return {
    open: false,
    mode: null,
    winnerTeam: null,
    winnerSocketId: null,
    openedAt: null
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
      // Best practice: keep team names + packId, but clear scores and progress.
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

    case "RESTART_ROUND": {
      // Restart the current round content, keep overall game scores and round index.
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
      return {
        ...state,
        lastEventId: nextEventId,
        buzz: makeEmptyBuzz()
      };
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

    case "APPLY_BUZZ": {
      const win = state.buzz.winnerTeam;
      const cur = state.current;

      if (!win) return { ...state, lastEventId: nextEventId };
      if (!cur) return { ...state, lastEventId: nextEventId };

      const clearedBuzz = makeEmptyBuzz();

      if (state.phase === "FACE_OFF") {
        return {
          ...state,
          lastEventId: nextEventId,
          phase: "PLAY",
          current: {
            ...cur,
            controlTeam: win,
            activeTeam: win,
            strikes: 0,
            roundPoints: 0
          },
          buzz: clearedBuzz
        };
      }

      if (state.phase === "PLAY") {
        return {
          ...state,
          lastEventId: nextEventId,
          current: {
            ...cur,
            activeTeam: win
          },
          buzz: clearedBuzz
        };
      }

      return { ...state, lastEventId: nextEventId, buzz: clearedBuzz };
    }

    case "SET_FACE_OFF_WINNER": {
      if (!state.current) return { ...state, lastEventId: nextEventId };
      return {
        ...state,
        lastEventId: nextEventId,
        phase: "PLAY",
        current: {
          ...state.current,
          controlTeam: event.team,
          activeTeam: event.team,
          strikes: 0,
          roundPoints: 0
        },
        buzz: makeEmptyBuzz()
      };
    }

    case "REVEAL_ANSWER": {
      if (!state.current) return state;
      if (state.phase !== "PLAY") return state;

      const cur = state.current;
      const ansId = event.answerId;

      // already revealed? no-op
      if (cur.revealedAnswerIds[ansId]) return state;

      const revealedAnswerIds = {
        ...cur.revealedAnswerIds,
        [ansId]: true
      };

      // compute "all revealed"
      let revealedCount = 0;
      for (let i = 0; i < cur.answers.length; i++) {
        const id = cur.answers[i].id;
        if (revealedAnswerIds[id]) revealedCount++;
      }
      const allRevealed = revealedCount >= cur.answers.length;

      const nextCurrent = {
        ...cur,
        revealedAnswerIds
      };

      // If all answers revealed, control team wins immediately
      if (allRevealed) {
        const controlTeam = cur.controlTeam;
        if (!controlTeam) {
          // defensive: if your model guarantees controlTeam, you can remove this
          return { ...state, current: nextCurrent };
        }

        const nextTeams =
          controlTeam === "A"
            ? { ...state.teams, A: { ...state.teams.A, score: state.teams.A.score + cur.roundPoints } }
            : { ...state.teams, B: { ...state.teams.B, score: state.teams.B.score + cur.roundPoints } };

        return {
          ...state,
          teams: nextTeams,
          current: nextCurrent,
          phase: "ROUND_END",
          // optional: close buzz so board doesn't show buzz UI during round end
          buzz: state.buzz ? { ...state.buzz, open: false } : state.buzz
        };
      }

      return {
        ...state,
        current: nextCurrent
      };
    }


    case "ADD_STRIKE": {
      const cur = state.current;
      if (!cur) return { ...state, lastEventId: nextEventId };
      if (state.phase !== "PLAY" && state.phase !== "STEAL") return { ...state, lastEventId: nextEventId };

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

      return {
        ...state,
        lastEventId: nextEventId,
        current: { ...cur, strikes }
      };
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

      let updatedCur = cur;
      if (event.success && event.stolenAnswerId && !cur.revealedAnswerIds[event.stolenAnswerId]) {
        const ans = cur.answers.find(a => a.id === event.stolenAnswerId);
        if (ans) {
          updatedCur = {
            ...cur,
            revealedAnswerIds: { ...cur.revealedAnswerIds, [event.stolenAnswerId]: true },
            roundPoints: cur.roundPoints + ans.points
          };
        }
      }

      return {
        ...state,
        lastEventId: nextEventId,
        phase: "ROUND_END",
        current: updatedCur,
        teams: {
          ...state.teams,
          [winner]: { ...state.teams[winner], score: state.teams[winner].score + updatedCur.roundPoints }
        },
        buzz: makeEmptyBuzz()
      };
    }

    case "NEXT_ROUND": {
      const currentIndex = state.current?.roundIndex ?? -1;
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
