import type { FeudRound, GameState } from "./types";
import type { GameEvent } from "./events";
export declare function createInitialState(args: {
    hostPin: string;
    rounds: FeudRound[];
    packId: string;
}): GameState;
export declare function reducer(state: GameState, event: GameEvent): GameState;
