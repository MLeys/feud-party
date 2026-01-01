export type TeamId = "A" | "B";
export type FeudAnswer = {
    id: string;
    text: string;
    points: number;
    aliases?: string[];
};
export type FeudRound = {
    id: string;
    prompt: string;
    answers: FeudAnswer[];
    maxStrikes?: number;
};
export type GameConfig = {
    gameLength: 3 | 5;
    hostPin: string;
};
export type AudioState = {
    enabled: boolean;
    volume: number;
};
export type Phase = "SETUP" | "FACE_OFF" | "PLAY" | "STEAL" | "ROUND_END" | "GAME_END";
export type TeamState = {
    name: string;
    score: number;
};
export type BuzzMode = "FACE_OFF" | "PLAY";
export type BuzzState = {
    open: boolean;
    mode: BuzzMode | null;
    winnerTeam: TeamId | null;
    winnerSocketId: string | null;
    openedAt: number | null;
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
};
export type GameState = {
    phase: Phase;
    config: GameConfig;
    audio: AudioState;
    teams: Record<TeamId, TeamState>;
    packId: string;
    rounds: FeudRound[];
    current: RoundState | null;
    buzz: BuzzState;
    lastEventId: number;
};
