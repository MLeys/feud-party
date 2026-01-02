// feud-party/shared/src/types.ts

export type TeamId = "A" | "B";

export type TeamState = {
  name: string;
  score: number;
};

export type AudioState = {
  enabled: boolean;
  volume: number; // 0..1
};

export type FeudAnswer = {
  id: string;
  text: string;
  points: number;
  aliases?: string[]; // optional synonyms for matching typed guesses
};

export type FeudRound = {
  id: string; // <-- packs use this (e.g., "r1")
  prompt: string;
  answers: FeudAnswer[];
  maxStrikes?: number;
};

export type FaceOffState = {
  step: 0 | 1 | 2; // 0 none revealed, 1 first revealed, 2 second revealed
  firstTeam: TeamId | null;
  firstAnswerId: string | null;
  firstPoints: number | null;
  secondTeam: TeamId | null;
  secondAnswerId: string | null;
  secondPoints: number | null;
};

export type RoundState = {
  roundIndex: number;
  prompt: string;
  answers: FeudAnswer[];
  revealedAnswerIds: Record<string, boolean>;

  strikes: number;
  maxStrikes: number;

  controlTeam: TeamId | null;
  activeTeam: TeamId | null;

  roundPoints: number;

  faceOff: FaceOffState;
};

export type BuzzState = {
  open: boolean;
  mode: "FACE_OFF" | "PLAY" | null;
  winnerTeam: TeamId | null;
  winnerSocketId: string | null;
  openedAt: number | null;
};

export type GamePhase = "SETUP" | "FACE_OFF" | "PLAY" | "STEAL" | "ROUND_END" | "GAME_END";

export type GameConfig = {
  gameLength: 3 | 5;
  hostPin: string;
};

export type GameState = {
  phase: GamePhase;
  config: GameConfig;

  audio: AudioState;

  teams: {
    A: TeamState;
    B: TeamState;
  };

  packId: string;
  rounds: FeudRound[];

  current: RoundState | null;

  buzz: BuzzState;

  lastEventId: number;
};
