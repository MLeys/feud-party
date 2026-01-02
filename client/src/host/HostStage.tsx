// feud-party/client/src/host/HostStage.tsx
import { useMemo, useState } from "react";
import type { GameEvent, GameState, TeamId } from "@feud/shared";

type Props = {
  state: GameState;
  send: (e: GameEvent) => void;
  clearError: () => void;
  hostError?: string;
};

type Phase = GameState["phase"];

function phaseLabel(phase: Phase): string {
  switch (phase) {
    case "SETUP":
      return "Setup";
    case "FACE_OFF":
      return "Face-off";
    case "PLAY":
      return "Play";
    case "STEAL":
      return "Steal";
    case "ROUND_END":
      return "Round End";
    case "GAME_END":
      return "Game End";
    default:
      return String(phase);
  }
}

function phaseTone(phase: Phase): string {
  switch (phase) {
    case "FACE_OFF":
      return "info";
    case "PLAY":
      return "play";
    case "STEAL":
      return "danger";
    default:
      return "neutral";
  }
}

function teamName(state: GameState, t: TeamId): string {
  return t === "A" ? state.teams.A.name : state.teams.B.name;
}

function strikesText(cur: GameState["current"]): string {
  if (!cur) return "—";
  const s = cur.strikes;
  const m = cur.maxStrikes;
  const parts: string[] = [];
  for (let i = 1; i <= m; i++) parts.push(i <= s ? "X" : "•");
  return parts.join(" ");
}

// Strict gating: what is allowed in each phase
function allowed(state: GameState) {
  const phase = state.phase;
  const hasRound = Boolean(state.current);

  const allowSetupStart = phase === "SETUP";
  const allowFaceoff = phase === "FACE_OFF";
  const allowPlay = phase === "PLAY";
  const allowSteal = phase === "STEAL";
  const allowRoundEnd = phase === "ROUND_END";

  return {
    // Setup
    startGame: allowSetupStart,

    // Face-off
    openBuzzFaceoff: allowFaceoff,
    applyBuzz: allowFaceoff && Boolean(state.buzz.winnerTeam),
    resetBuzz: allowFaceoff,

    // Reveal answers: allowed during FACE_OFF and PLAY
    reveal: (allowFaceoff || allowPlay) && hasRound,

    // Award control (begins PLAY) - uses SET_FACE_OFF_WINNER
    awardControl: allowFaceoff && hasRound,

    // Play
    strike: (allowPlay || allowSteal) && hasRound,
    startSteal: allowPlay && hasRound,
    openBuzzPlay: allowPlay,

    // Steal
    stealResult: allowSteal && hasRound,

    // Round end
    nextRound: allowRoundEnd && hasRound,

    // Audio is always safe
    audio: true,

    // Admin
    restartRound: hasRound,
    resetToSetup: true,
    endGame: true
  };
}

function disabledReason(state: GameState, key: keyof ReturnType<typeof allowed>): string {
  const a = allowed(state);

  switch (key) {
    case "startGame":
      return a.startGame ? "" : "Available during Setup only.";

    case "openBuzzFaceoff":
    case "applyBuzz":
    case "resetBuzz":
    case "awardControl":
      return a.openBuzzFaceoff ? "" : "Available during Face-off only.";

    case "reveal":
      return a.reveal ? "" : "Answers can be revealed during Face-off and Play only.";

    case "strike":
      return a.strike ? "" : "Strikes are used during Play (and Steal) only.";

    case "startSteal":
      return a.startSteal ? "" : "Steal can start only after Play begins.";

    case "openBuzzPlay":
      return a.openBuzzPlay ? "" : "Play buzz is available during Play only.";

    case "stealResult":
      return a.stealResult ? "" : "Record steal outcome during Steal phase only.";

    case "nextRound":
      return a.nextRound ? "" : "Next round is available after the round ends.";

    case "audio":
      return "";

    case "restartRound":
      return a.restartRound ? "" : "No round loaded yet.";

    case "resetToSetup":
      return "";

    case "endGame":
      return "";

    default:
      return "";
  }
}

function StatusPill(props: { label: string; value: string; tone?: string }) {
  const tone = props.tone || "neutral";
  return (
    <div className={`hpill hpill-${tone}`}>
      <div className="hpillLabel">{props.label}</div>
      <div className="hpillValue">{props.value}</div>
    </div>
  );
}

function SetupCard(props: { state: GameState; send: (e: GameEvent) => void; clearError: () => void }) {
  const { state, send, clearError } = props;

  const [teamA, setTeamA] = useState(state.teams.A.name || "Team A");
  const [teamB, setTeamB] = useState(state.teams.B.name || "Team B");
  const [len, setLen] = useState<3 | 5>(state.config.gameLength);

  const a = allowed(state);

  function startGame(gameLength: 3 | 5) {
    clearError();
    send({
      type: "SETUP_GAME",
      teamAName: teamA || "Team A",
      teamBName: teamB || "Team B",
      gameLength,
      packId: state.packId
    });
  }

  const dis = !a.startGame;
  const reason = disabledReason(state, "startGame");

  return (
    <div className="card">
      <div className="cardHeader">
        <div className="cardHeaderTitle">Setup</div>
        <div className="cardHeaderSub">Set team names and start the game.</div>
      </div>

      <div className="row2">
        <div>
          <div className="label">Team A</div>
          <input className="input" value={teamA} onChange={(e) => setTeamA(e.target.value)} disabled={dis} />
        </div>
        <div>
          <div className="label">Team B</div>
          <input className="input" value={teamB} onChange={(e) => setTeamB(e.target.value)} disabled={dis} />
        </div>
      </div>

      <div className="row">
        <div className="label">Game Length</div>
        <div className="segRow">
          <button className={len === 3 ? "seg segActive" : "seg"} onClick={() => setLen(3)} disabled={dis}>
            3 Rounds
          </button>
          <button className={len === 5 ? "seg segActive" : "seg"} onClick={() => setLen(5)} disabled={dis}>
            5 Rounds
          </button>
        </div>

        <div className="btnRow">
          <button className="btn btnPrimary" onClick={() => startGame(3)} disabled={dis} title={reason}>
            Start (3)
          </button>
          <button className="btn btnPrimary" onClick={() => startGame(5)} disabled={dis} title={reason}>
            Start (5)
          </button>
        </div>

        {!a.startGame ? <div className="hintSmall">Setup is locked once the game begins.</div> : null}
      </div>
    </div>
  );
}

function NextActionCard(props: { state: GameState; send: (e: GameEvent) => void }) {
  const { state, send } = props;
  const a = allowed(state);

  const cur = state.current;
  const phase = state.phase;

  const buzzOpen = Boolean(state.buzz.open);
  const buzzWinner = state.buzz.winnerTeam;

  if (phase === "SETUP") {
    return (
      <div className="card cardPrimary">
        <div className="cardHeader">
          <div className="cardHeaderTitle">Next Action</div>
          <div className="cardHeaderSub">Start a new game.</div>
        </div>

        <div className="nextActionTitle">Start the game</div>

        <div className="nextActionRow">
          <button
            className="btn btnPrimary"
            disabled={!a.startGame}
            title={disabledReason(state, "startGame")}
            onClick={() =>
              send({
                type: "SETUP_GAME",
                teamAName: state.teams.A.name || "Team A",
                teamBName: state.teams.B.name || "Team B",
                gameLength: 3,
                packId: state.packId
              })
            }
          >
            Start (3 rounds)
          </button>

          <button
            className="btn btnPrimary"
            disabled={!a.startGame}
            title={disabledReason(state, "startGame")}
            onClick={() =>
              send({
                type: "SETUP_GAME",
                teamAName: state.teams.A.name || "Team A",
                teamBName: state.teams.B.name || "Team B",
                gameLength: 5,
                packId: state.packId
              })
            }
          >
            Start (5 rounds)
          </button>
        </div>

        <div className="hintSmall">Edit team names in the Setup panel before starting.</div>
      </div>
    );
  }

  if (phase === "FACE_OFF") {
    const active = cur && cur.activeTeam ? cur.activeTeam : null;
    const activeLabel = active ? teamName(state, active) : "—";

    function setActive(team: TeamId) {
      // These are valid GameEvents per your events.ts
      send({ type: "OVERRIDE_BUZZ", team });
      send({ type: "APPLY_BUZZ" });
    }

    return (
      <div className="card cardPrimary">
        <div className="cardHeader">
          <div className="cardHeaderTitle">Face-off Flow (Classic)</div>
          <div className="cardHeaderSub">
            1) Open buzz → 2) Set ACTIVE team → 3) Reveal Team 1 guess → 4) Reveal Team 2 guess → 5) Award CONTROL.
          </div>
        </div>

        <div className="nextActionTitle">Run the face-off</div>

        <div className="nextActionRow">
          <button
            className="btn btnPrimary"
            disabled={!a.openBuzzFaceoff}
            title={disabledReason(state, "openBuzzFaceoff")}
            onClick={() => send({ type: "OPEN_BUZZ", mode: "FACE_OFF" })}
          >
            Open Buzz
          </button>

          <button
            className="btn btnGhost"
            disabled={!a.resetBuzz}
            title={disabledReason(state, "resetBuzz")}
            onClick={() => send({ type: "RESET_BUZZ" })}
          >
            Reset Buzz
          </button>

          <button
            className="btn btnGhost"
            disabled={!a.applyBuzz || !buzzWinner}
            title={buzzWinner ? "Sets ACTIVE team to the buzz winner." : "No buzz winner yet."}
            onClick={() => send({ type: "APPLY_BUZZ" })}
          >
            Apply Buzz Winner → ACTIVE
          </button>
        </div>

        <div className="nextActionRow">
          <button
            className="btn btnGhost"
            disabled={!a.openBuzzFaceoff}
            title={!a.openBuzzFaceoff ? disabledReason(state, "openBuzzFaceoff") : "Set ACTIVE team to Team A (who guesses next)."}
            onClick={() => setActive("A")}
          >
            Set ACTIVE: {state.teams.A.name}
          </button>

          <button
            className="btn btnGhost"
            disabled={!a.openBuzzFaceoff}
            title={!a.openBuzzFaceoff ? disabledReason(state, "openBuzzFaceoff") : "Set ACTIVE team to Team B (who guesses next)."}
            onClick={() => setActive("B")}
          >
            Set ACTIVE: {state.teams.B.name}
          </button>

          <button className="btn btnGhost" disabled>
            ACTIVE: {activeLabel}
            {buzzOpen ? " · Buzz OPEN" : ""}
            {buzzWinner ? " · Buzz LOCKED" : ""}
          </button>
        </div>

        <div className="nextActionRow">
          <button
            className="btn btnPrimary"
            disabled={!a.awardControl}
            title={!a.awardControl ? disabledReason(state, "awardControl") : "Award control to Team A and begin PLAY."}
            onClick={() => send({ type: "SET_FACE_OFF_WINNER", team: "A" })}
          >
            Award CONTROL → {state.teams.A.name}
          </button>

          <button
            className="btn btnPrimary"
            disabled={!a.awardControl}
            title={!a.awardControl ? disabledReason(state, "awardControl") : "Award control to Team B and begin PLAY."}
            onClick={() => send({ type: "SET_FACE_OFF_WINNER", team: "B" })}
          >
            Award CONTROL → {state.teams.B.name}
          </button>
        </div>

        <div className="hintSmall">
          Tip: Use the Answers panel to reveal face-off guesses (enabled during Face-off). After awarding control, Play begins.
        </div>
      </div>
    );
  }

  if (phase === "PLAY") {
    return (
      <div className="card cardPrimary">
        <div className="cardHeader">
          <div className="cardHeaderTitle">Next Action</div>
          <div className="cardHeaderSub">Reveal correct answers; add strikes for misses. Revealing all tiles ends the round automatically.</div>
        </div>

        <div className="nextActionTitle">Run the round</div>

        <div className="nextActionRow">
          <button
            className="btn btnPrimary"
            disabled={!a.reveal}
            title={disabledReason(state, "reveal")}
            onClick={() => {
              if (!cur) return;
              const next = cur.answers.find((ans) => !cur.revealedAnswerIds[ans.id]);
              if (!next) return;
              send({ type: "REVEAL_ANSWER", answerId: next.id });
            }}
          >
            Reveal Next Answer
          </button>

          <button
            className="btn btnDanger"
            disabled={!a.strike}
            title={disabledReason(state, "strike")}
            onClick={() => send({ type: "ADD_STRIKE" })}
          >
            Add Strike
          </button>

          <button
            className="btn btnGhost"
            disabled={!a.openBuzzPlay}
            title={disabledReason(state, "openBuzzPlay")}
            onClick={() => send({ type: "OPEN_BUZZ", mode: "PLAY" })}
          >
            Open Buzz (Play)
          </button>
        </div>
      </div>
    );
  }

  if (phase === "STEAL") {
    return (
      <div className="card cardPrimary">
        <div className="cardHeader">
          <div className="cardHeaderTitle">Next Action</div>
          <div className="cardHeaderSub">Other team gets one guess. Record the outcome.</div>
        </div>

        <div className="nextActionTitle">Score the steal</div>

        <div className="nextActionRow">
          <button className="btn btnPrimary" disabled={!a.stealResult} title={disabledReason(state, "stealResult")} onClick={() => send({ type: "STEAL_RESULT", success: true })}>
            Steal Success
          </button>

          <button className="btn btnDanger" disabled={!a.stealResult} title={disabledReason(state, "stealResult")} onClick={() => send({ type: "STEAL_RESULT", success: false })}>
            Steal Failed
          </button>
        </div>
      </div>
    );
  }

  if (phase === "ROUND_END") {
    return (
      <div className="card cardPrimary">
        <div className="cardHeader">
          <div className="cardHeaderTitle">Next Action</div>
          <div className="cardHeaderSub">Round is scored. Advance when ready.</div>
        </div>

        <div className="nextActionTitle">Advance</div>

        <div className="nextActionRow">
          <button className="btn btnPrimary" disabled={!a.nextRound} title={disabledReason(state, "nextRound")} onClick={() => send({ type: "NEXT_ROUND" })}>
            Next Round
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card cardPrimary">
      <div className="cardHeader">
        <div className="cardHeaderTitle">Next Action</div>
        <div className="cardHeaderSub">Game is finished. Reset to play again.</div>
      </div>

      <div className="nextActionTitle">Reset</div>

      <div className="nextActionRow">
        <button className="btn btnDanger" onClick={() => send({ type: "RESET_TO_SETUP" })} title="Resets scores and returns to Setup.">
          Reset to Setup
        </button>
      </div>
    </div>
  );
}

export default function HostStage({ state, send, clearError, hostError }: Props) {
  const cur = state.current;
  const a = allowed(state);

  const roundIndex = cur ? cur.roundIndex : -1;
  const roundNum = roundIndex >= 0 ? roundIndex + 1 : 0;
  const totalRounds = state.config.gameLength;

  const revealedCount = useMemo(() => {
    if (!cur) return 0;
    return Object.values(cur.revealedAnswerIds).filter(Boolean).length;
  }, [cur]);

  const totalAnswers = cur ? cur.answers.length : 0;

  const controlName = cur && cur.controlTeam ? teamName(state, cur.controlTeam) : "—";
  const activeName = cur && cur.activeTeam ? teamName(state, cur.activeTeam) : "—";

  const bankValue = cur ? String(cur.roundPoints) : "0";
  const strikes = strikesText(cur);

  const buzzStatus = (() => {
    if (state.buzz.winnerTeam) return `Locked: ${teamName(state, state.buzz.winnerTeam)}`;
    if (state.buzz.open) return `Open (${state.buzz.mode === "FACE_OFF" ? "Face-off" : "Play"})`;
    return "Closed";
  })();

  const setupKey = useMemo(() => {
    if (state.phase === "SETUP") return `setup:${state.lastEventId}`;
    return "setup:inactive";
  }, [state.phase, state.lastEventId]);

  const tone = phaseTone(state.phase);

  return (
    <div className="hostRoot">
      <div className="hostShellWide">
        <div className="statusStrip">
          <StatusPill label="PHASE" value={phaseLabel(state.phase)} tone={tone} />
          <StatusPill label="ROUND" value={roundNum > 0 ? `${roundNum}/${totalRounds}` : `—/${totalRounds}`} />
          <StatusPill label="CONTROL" value={controlName} />
          <StatusPill label="ACTIVE" value={activeName} />
          {state.phase === "PLAY" || state.phase === "STEAL" ? <StatusPill label="BANK" value={`${bankValue} pts`} tone="play" /> : null}
          <StatusPill label="STRIKES" value={strikes} tone={cur && cur.strikes > 0 ? "danger" : "neutral"} />
          <StatusPill label="BUZZ" value={buzzStatus} tone={state.buzz.open || Boolean(state.buzz.winnerTeam) ? "info" : "neutral"} />
          <div className="pinPill">
            <div className="pinLabel">PIN</div>
            <div className="pinValue">{state.config.hostPin}</div>
          </div>
        </div>

        <div className="hostTopTitle">
          <div>
            <div className="hostH1">Host Console</div>
            <div className="hostMuted">Face-off: reveal both teams’ guesses, then manually award control to start Play.</div>
          </div>
        </div>

        {hostError ? <div className="hostError">{hostError}</div> : null}

        <NextActionCard state={state} send={send} />

        <div className="hostGrid">
          <div className="col">
            <SetupCard key={setupKey} state={state} send={send} clearError={clearError} />

            <div className="card">
              <div className="cardHeader">
                <div className="cardHeaderTitle">Answers</div>
                <div className="cardHeaderSub">
                  Reveal answers during Face-off and Play. ({totalAnswers ? `${revealedCount}/${totalAnswers} revealed` : "no round loaded"})
                </div>
              </div>

              {!cur ? (
                <div className="hostMuted">No round loaded yet. Start a game.</div>
              ) : (
                <div className="revealGrid">
                  {cur.answers.map((ans) => {
                    const revealed = Boolean(cur.revealedAnswerIds[ans.id]);
                    const dis = !a.reveal || revealed;
                    const reason = revealed ? "Already revealed." : disabledReason(state, "reveal");

                    return (
                      <button
                        key={ans.id}
                        className={revealed ? "btn btnReveal btnRevealOn" : "btn btnReveal"}
                        disabled={dis}
                        title={dis ? reason : ""}
                        onClick={() => send({ type: "REVEAL_ANSWER", answerId: ans.id })}
                      >
                        <span className="revealText">{ans.text}</span>
                        <span className="revealPts">{ans.points}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card">
              <div className="cardHeader">
                <div className="cardHeaderTitle">Round Controls</div>
                <div className="cardHeaderSub">Strikes apply only after Play begins.</div>
              </div>

              <div className="btnRow">
                <button className="btn btnDanger" disabled={!a.strike} title={!a.strike ? disabledReason(state, "strike") : ""} onClick={() => send({ type: "ADD_STRIKE" })}>
                  Add Strike
                </button>

                <button className="btn btnGhost" disabled={!a.startSteal} title={!a.startSteal ? disabledReason(state, "startSteal") : ""} onClick={() => send({ type: "START_STEAL" })}>
                  Start Steal
                </button>

                <button className="btn btnPrimary" disabled={!a.nextRound} title={!a.nextRound ? disabledReason(state, "nextRound") : ""} onClick={() => send({ type: "NEXT_ROUND" })}>
                  Next Round
                </button>
              </div>

              {!a.nextRound && state.phase !== "ROUND_END" ? <div className="hintSmall">Next Round unlocks at Round End.</div> : null}
            </div>
          </div>

          <div className="col">
            <div className="card">
              <div className="cardHeader">
                <div className="cardHeaderTitle">Audio</div>
                <div className="cardHeaderSub">Safe at any time.</div>
              </div>

              <div className="row">
                <button className="btn btnGhost" onClick={() => send({ type: "SET_AUDIO", enabled: !state.audio.enabled })}>
                  {state.audio.enabled ? "Mute Board" : "Unmute Board"}
                </button>

                <div>
                  <div className="label">Volume</div>
                  <input
                    className="range"
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(state.audio.volume * 100)}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      send({ type: "SET_AUDIO", volume: v / 100 });
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="cardHeader">
                <div className="cardHeaderTitle">Game Menu</div>
                <div className="cardHeaderSub">Admin actions.</div>
              </div>

              <div className="btnRow">
                <button className="btn btnGhost" disabled={!a.restartRound} title={!a.restartRound ? disabledReason(state, "restartRound") : ""} onClick={() => send({ type: "RESTART_ROUND" })}>
                  Restart Round
                </button>

                <button className="btn btnDanger" onClick={() => send({ type: "RESET_TO_SETUP" })}>
                  Reset to Setup
                </button>

                <button className="btn btnGhost" onClick={() => send({ type: "END_GAME" })}>
                  End Game
                </button>
              </div>

              <div className="hintSmall">Recommended next: Undo + confirmation dialogs.</div>
            </div>

            <div className="hostFooterNote">Face-off: reveal both teams’ guesses first, then award control.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
