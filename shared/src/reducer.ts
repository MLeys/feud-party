import type { FeudRound, GameState, RoundState, TeamId } from "./types";
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

export function createInitialState(args: { hostPin: string; rounds: FeudRound[]; packId: string }): GameState {
  return {
    phase: "SETUP",
    config: { gameLength: 5, hostPin: args.hostPin },
    audio: { enabled: true, volume: 0.8 },
    teams: { A: { name: "Team A", score: 0 }, B: { name: "Team B", score: 0 } },
    packId: args.packId,
    rounds: args.rounds,
    current: null,
    lastEventId: 0
  };
}

export function reducer(state: GameState, event: GameEvent): GameState {
  const nextEventId = state.lastEventId + 1;

  switch (event.type) {
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
        current: firstRound ? makeRoundState(firstRound, 0) : null
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
        }
      };
    }

    case "REVEAL_ANSWER": {
      const cur = state.current;
      if (!cur || state.phase !== "PLAY") return { ...state, lastEventId: nextEventId };

      if (cur.revealedAnswerIds[event.answerId]) return { ...state, lastEventId: nextEventId };

      const answer = cur.answers.find(a => a.id === event.answerId);
      if (!answer || !cur.activeTeam) return { ...state, lastEventId: nextEventId };

      return {
        ...state,
        lastEventId: nextEventId,
        current: {
          ...cur,
          revealedAnswerIds: { ...cur.revealedAnswerIds, [event.answerId]: true },
          roundPoints: cur.roundPoints + answer.points
        }
      };
    }

    case "ADD_STRIKE": {
      const cur = state.current;
      if (!cur) return { ...state, lastEventId: nextEventId };
      if (state.phase !== "PLAY" && state.phase !== "STEAL") return { ...state, lastEventId: nextEventId };

      const strikes = cur.strikes + 1;
      const reachedMax = strikes >= cur.maxStrikes;

      // In PLAY, max strikes transitions to STEAL automatically.
      if (state.phase === "PLAY" && reachedMax && cur.controlTeam) {
        return {
          ...state,
          lastEventId: nextEventId,
          phase: "STEAL",
          current: { ...cur, strikes, activeTeam: otherTeam(cur.controlTeam) }
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
        current: { ...cur, activeTeam: otherTeam(cur.controlTeam) }
      };
    }

    case "STEAL_RESULT": {
      const cur = state.current;
      if (!cur || state.phase !== "STEAL" || !cur.controlTeam || !cur.activeTeam) {
        return { ...state, lastEventId: nextEventId };
      }

      const stealTeam = cur.activeTeam;
      const winner: TeamId = event.success ? stealTeam : cur.controlTeam;

      // Optionally reveal the stolen answer and add its points (nice for showmanship).
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
        }
      };
    }

    case "NEXT_ROUND": {
      const currentIndex = state.current?.roundIndex ?? -1;
      const nextIndex = currentIndex + 1;

      if (nextIndex >= state.config.gameLength) {
        return { ...state, lastEventId: nextEventId, phase: "GAME_END" };
      }

      const nextRound = state.rounds[nextIndex];
      if (!nextRound) {
        return { ...state, lastEventId: nextEventId, phase: "GAME_END" };
      }

      return {
        ...state,
        lastEventId: nextEventId,
        phase: "FACE_OFF",
        current: makeRoundState(nextRound, nextIndex)
      };
    }

    case "END_GAME":
      return { ...state, lastEventId: nextEventId, phase: "GAME_END" };

    default:
      return { ...state, lastEventId: nextEventId };
  }
}
