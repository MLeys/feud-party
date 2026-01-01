import type { GameState } from "@feud/shared";
import AnswerGrid from "./AnswerGrid";
import Overlays from "./Overlays";
import "./board.css";

type BoardStageProps = {
  state: GameState;
};

function controlLabel(state: GameState) {
  const cur = state.current;
  if (!cur || !cur.controlTeam) return "No Control";
  const teamName = state.teams[cur.controlTeam].name;
  return `${teamName} Controls`;
}

export default function BoardStage({ state }: BoardStageProps) {
  const cur = state.current;

  return (
    <div className="boardRoot">
      <div className="boardStage">
        <header className="boardHeader">
          <div className="promptWrap">
            <div className="brandLine">Family Feud</div>
            <h1 className="prompt">{cur ? cur.prompt : "Waiting for game to start…"}</h1>
          </div>

          <div className="headerRight">
            <div className="pillsRow">
              <div className="pill pillStrong">{state.phase}</div>
              <div className="pill">{controlLabel(state)}</div>
            </div>

            <div className="hostPin">
              <div className="hostPinLabel">Host PIN</div>
              <div className="hostPinValue">{state.config.hostPin}</div>
            </div>
          </div>
        </header>

        <main className="boardMainPanel">
          <Overlays state={state} />
          <AnswerGrid round={cur} />
        </main>

        <footer className="boardFooter">
          <div className="scoreBlock">
            <div className="scoreValue">{state.teams.A.score}</div>
            <div className="scoreName">{state.teams.A.name}</div>
          </div>

          <div className="centerStatus">
            <div className="bank">
              <div className="bankLabel">Bank</div>
              <div className="bankValue">{cur?.roundPoints ?? 0}</div>
            </div>

            <div className="strikes">
              <div className={cur && cur.strikes >= 1 ? "strikeX strikeXActive" : "strikeX"}>X</div>
              <div className={cur && cur.strikes >= 2 ? "strikeX strikeXActive" : "strikeX"}>X</div>
              <div className={cur && cur.strikes >= 3 ? "strikeX strikeXActive" : "strikeX"}>X</div>
            </div>
          </div>

          <div className="scoreBlock" style={{ justifySelf: "end" }}>
            <div className="scoreValue">{state.teams.B.score}</div>
            <div className="scoreName">{state.teams.B.name}</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
