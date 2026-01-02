// feud-party/client/src/host/HostStage.tsx
import { useMemo, useState } from "react";
import type { BuzzState, GameEvent, GameState, TeamId } from "@feud/shared";

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
  // CSS hooks: neutral | info | play | danger
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
    manualPickFaceoff: allowFaceoff,
    applyBuzz: allowFaceoff && Boolean(state.buzz.winnerTeam),
    resetBuzz: allowFaceoff,

    // Play
    reveal: allowPlay && hasRound,
    strike: (allowPlay || allowSteal) && hasRound, // strikes can be used in STEAL only if you want
    startSteal: allowPlay && hasRound,
    openBuzzPlay: allowPlay, // optional

    // Steal
    stealResult: allowSteal && hasRound,

    // Round end / game end
    nextRound: allowRoundEnd && hasRound,

    // Audio is always safe
    audio: true,

    // Admin menu
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
    case "manualPickFaceoff":
    case "applyBuzz":
    case "resetBuzz":
      return a.openBuzzFaceoff ? "" : "Available during Face-off only.";

    case "reveal":
      return a.reveal ? "" : "Answers can be revealed during Play only.";

    case "strike":
      return a.strike ? "" : "Strikes are used during Play (and optionally Steal) only.";

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

/**
 * SetupCard: owns local form state. No syncing effects. Re-mount using key when returning to SETUP.
 */
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
  const phase = state.phase;

  if (phase === "SETUP") {
    // IMPORTANT: Only SetupCard starts the game because it owns the form state.
    // This prevents stale team names being sent from state.teams.* (which may not reflect current inputs).
    return (
      <div className="card cardPrimary">
        <div className="cardHeader">
          <div className="cardHeaderTitle">Next Action</div>
          <div className="cardHeaderSub">Set team names, then start the game.</div>
        </div>

        <div className="nextActionTitle">Start the game</div>

        <div className="hintSmall">
          Use the <b>Setup</b> panel to edit team names and press Start (3) or Start (5).
        </div>
      </div>
    );
  }

  if (phase === "FACE_OFF") {
    const hasBuzzWinner = Boolean(state.buzz.winnerTeam);

    return (
      <div className="card cardPrimary">
        <div className="cardHeader">
          <div className="cardHeaderTitle">Next Action</div>
          <div className="cardHeaderSub">Determine who wins the face-off.</div>
        </div>

        <div className="nextActionTitle">Run the face-off</div>

        <div className="nextActionRow">
          <button
            className="btn btnPrimary"
            disabled={!a.openBuzzFaceoff}
            title={disabledReason(state, "openBuzzFaceoff")}
            onClick={() => send({ type: "OPEN_BUZZ", mode: "FACE_OFF" })}
          >
            Open Buzz (Face-off)
          </button>

          <button
            className="btn btnGhost"
            disabled={!a.manualPickFaceoff}
            title={disabledReason(state, "manualPickFaceoff")}
            onClick={() => send({ type: "SET_FACE_OFF_WINNER", team: "A" })}
          >
            Manual: {state.teams.A.name}
          </button>

          <button
            className="btn btnGhost"
            disabled={!a.manualPickFaceoff}
            title={disabledReason(state, "manualPickFaceoff")}
            onClick={() => send({ type: "SET_FACE_OFF_WINNER", team: "B" })}
          >
            Manual: {state.teams.B.name}
          </button>
        </div>

        <div className="nextActionRow">
          <button
            className="btn btnGhost"
            disabled={!a.applyBuzz || !hasBuzzWinner}
            title={hasBuzzWinner ? disabledReason(state, "applyBuzz") : "No buzz winner yet."}
            onClick={() => send({ type: "APPLY_BUZZ" })}
          >
            Apply Buzz Winner
          </button>

          <button
            className="btn btnGhost"
            disabled={!a.resetBuzz}
            title={disabledReason(state, "resetBuzz")}
            onClick={() => send({ type: "RESET_BUZZ" })}
          >
            Reset Buzz
          </button>
        </div>

        <div className="hintSmall">Classic rule: face-off winner becomes Control Team.</div>
      </div>
    );
  }

  if (phase === "PLAY") {
    return (
      <div className="card cardPrimary">
        <div className="cardHeader">
          <div className="cardHeaderTitle">Next Action</div>
          <div className="cardHeaderSub">Control team is answering. Reveal correct answers; add strikes for misses.</div>
        </div>

        <div className="nextActionTitle">Run the round</div>

        <div className="nextActionRow">
          <button
            className="btn btnPrimary"
            disabled={!a.reveal}
            title={disabledReason(state, "reveal")}
            onClick={() => {
              const cur = state.current;
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
        </div>

        <div className="hintSmall">After max strikes, the game transitions to Steal automatically.</div>
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
          <button
            className="btn btnPrimary"
            disabled={!a.stealResult}
            title={disabledReason(state, "stealResult")}
            onClick={() => send({ type: "STEAL_RESULT", success: true })}
          >
            Steal Success
          </button>

          <button
            className="btn btnDanger"
            disabled={!a.stealResult}
            title={disabledReason(state, "stealResult")}
            onClick={() => send({ type: "STEAL_RESULT", success: false })}
          >
            Steal Failed
          </button>
        </div>

        <div className="hintSmall">Classic: steal success wins the entire bank; otherwise control team keeps it.</div>
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
          <button
            className="btn btnPrimary"
            disabled={!a.nextRound}
            title={disabledReason(state, "nextRound")}
            onClick={() => send({ type: "NEXT_ROUND" })}
          >
            Next Round
          </button>
        </div>

        <div className="hintSmall">The next round returns to Face-off.</div>
      </div>
    );
  }

  // GAME_END
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

      <div className="hintSmall">Tip: you can keep team names when resetting (we’ll add a confirm dialog next).</div>
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

  const buzz: BuzzState = state.buzz;
  const buzzWinnerTeam = buzz.winnerTeam;
  const buzzOpen = buzz.open;
  const buzzMode = buzz.mode;

  // No memo: avoids react-hooks/preserve-manual-memoization and keeps deps simple.
  const buzzStatus = (() => {
    if (buzzWinnerTeam) return `Locked: ${teamName(state, buzzWinnerTeam)}`;
    if (buzzOpen) return `Open (${buzzMode === "FACE_OFF" ? "Face-off" : "Play"})`;
    return "Closed";
  })();

  // Remount SetupCard when entering SETUP to re-seed its local fields.
  const setupKey = useMemo(() => {
    if (state.phase === "SETUP") return `setup:${state.lastEventId}`;
    return "setup:inactive";
  }, [state.phase, state.lastEventId]);

  const tone = phaseTone(state.phase);

  return (
    <div className="hostRoot">
      <div className="hostShellWide">
        {/* Sticky Status Strip */}
        <div className="statusStrip">
          <StatusPill label="PHASE" value={phaseLabel(state.phase)} tone={tone} />
          <StatusPill label="ROUND" value={roundNum > 0 ? `${roundNum}/${totalRounds}` : `—/${totalRounds}`} />
          <StatusPill label="CONTROL" value={controlName} />
          <StatusPill label="ACTIVE" value={activeName} />
          {state.phase === "PLAY" || state.phase === "STEAL" ? <StatusPill label="BANK" value={`${bankValue} pts`} tone="play" /> : null}
          <StatusPill label="STRIKES" value={strikes} tone={cur && cur.strikes > 0 ? "danger" : "neutral"} />
          <StatusPill label="BUZZ" value={buzzStatus} tone={buzzWinnerTeam || buzzOpen ? "info" : "neutral"} />
          <div className="pinPill">
            <div className="pinLabel">PIN</div>
            <div className="pinValue">{state.config.hostPin}</div>
          </div>
        </div>

        <div className="hostTopTitle">
          <div>
            <div className="hostH1">Host Console</div>
            <div className="hostMuted">Classic rules, strict mode. Only phase-legal actions are clickable.</div>
          </div>
        </div>

        {hostError ? <div className="hostError">{hostError}</div> : null}

        {/* Next Action */}
        <NextActionCard state={state} send={send} />

        {/* Main layout */}
        <div className="hostGrid">
          {/* LEFT: round running */}
          <div className="col">
            <SetupCard key={setupKey} state={state} send={send} clearError={clearError} />

            {/* Answers */}
            <div className="card">
              <div className="cardHeader">
                <div className="cardHeaderTitle">Answers</div>
                <div className="cardHeaderSub">
                  Reveal answers during Play only. ({totalAnswers ? `${revealedCount}/${totalAnswers} revealed` : "no round loaded"})
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

            {/* Play controls */}
            <div className="card">
              <div className="cardHeader">
                <div className="cardHeaderTitle">Round Controls</div>
                <div className="cardHeaderSub">Strict: actions unlock only in the correct phase.</div>
              </div>

              <div className="btnRow">
                <button
                  className="btn btnDanger"
                  disabled={!a.strike}
                  title={!a.strike ? disabledReason(state, "strike") : ""}
                  onClick={() => send({ type: "ADD_STRIKE" })}
                >
                  Add Strike
                </button>

                <button
                  className="btn btnGhost"
                  disabled={!a.startSteal}
                  title={!a.startSteal ? disabledReason(state, "startSteal") : "Optional: start steal early for a twist."}
                  onClick={() => send({ type: "START_STEAL" })}
                >
                  Start Steal (Early)
                </button>

                <button
                  className="btn btnPrimary"
                  disabled={!a.nextRound}
                  title={!a.nextRound ? disabledReason(state, "nextRound") : ""}
                  onClick={() => send({ type: "NEXT_ROUND" })}
                >
                  Next Round
                </button>
              </div>

              {!a.nextRound && state.phase !== "ROUND_END" ? <div className="hintSmall">Next Round unlocks at Round End.</div> : null}
            </div>
          </div>

          {/* RIGHT: faceoff/buzz, steal, audio, menu */}
          <div className="col">
            {/* Face-off & Buzz */}
            <div className="card">
              <div className="cardHeader">
                <div className="cardHeaderTitle">Face-off & Buzz</div>
                <div className="cardHeaderSub">Buzzing is enabled during Face-off (and optionally Play).</div>
              </div>

              <div className="btnRow">
                <button
                  className="btn btnPrimary"
                  disabled={!a.openBuzzFaceoff}
                  title={!a.openBuzzFaceoff ? disabledReason(state, "openBuzzFaceoff") : ""}
                  onClick={() => send({ type: "OPEN_BUZZ", mode: "FACE_OFF" })}
                >
                  Open Buzz (Face-off)
                </button>

                <button
                  className="btn btnGhost"
                  disabled={!a.openBuzzPlay}
                  title={!a.openBuzzPlay ? disabledReason(state, "openBuzzPlay") : "Optional: quick buzz to decide who answers next, without changing control team."}
                  onClick={() => send({ type: "OPEN_BUZZ", mode: "PLAY" })}
                >
                  Open Buzz (Play)
                </button>

                <button
                  className="btn btnGhost"
                  disabled={!a.resetBuzz}
                  title={!a.resetBuzz ? disabledReason(state, "resetBuzz") : ""}
                  onClick={() => send({ type: "RESET_BUZZ" })}
                >
                  Reset Buzz
                </button>

                <button
                  className="btn btnGhost"
                  disabled={!a.applyBuzz}
                  title={!a.applyBuzz ? disabledReason(state, "applyBuzz") : ""}
                  onClick={() => send({ type: "APPLY_BUZZ" })}
                >
                  Apply Winner
                </button>
              </div>

              <div className="btnRow">
                <button
                  className="btn btnGhost"
                  disabled={!a.manualPickFaceoff}
                  title={!a.manualPickFaceoff ? disabledReason(state, "manualPickFaceoff") : ""}
                  onClick={() => send({ type: "SET_FACE_OFF_WINNER", team: "A" })}
                >
                  Manual: {state.teams.A.name}
                </button>

                <button
                  className="btn btnGhost"
                  disabled={!a.manualPickFaceoff}
                  title={!a.manualPickFaceoff ? disabledReason(state, "manualPickFaceoff") : ""}
                  onClick={() => send({ type: "SET_FACE_OFF_WINNER", team: "B" })}
                >
                  Manual: {state.teams.B.name}
                </button>

                <button
                  className="btn btnGhost"
                  disabled={!a.openBuzzFaceoff && !a.openBuzzPlay}
                  title={!a.openBuzzFaceoff && !a.openBuzzPlay ? "Buzz is available during Face-off (and optionally Play)." : ""}
                  onClick={() => {
                    // Intentionally inert: this is a status button.
                  }}
                >
                  Winner: {buzzWinnerTeam ? teamName(state, buzzWinnerTeam) : "—"}
                </button>
              </div>

              <div className="hintSmall">Classic: face-off winner becomes Control Team. Buzz winner can be applied or overridden.</div>
            </div>

            {/* Steal */}
            <div className="card">
              <div className="cardHeader">
                <div className="cardHeaderTitle">Steal</div>
                <div className="cardHeaderSub">Enabled only during Steal phase.</div>
              </div>

              <div className="btnRow">
                <button
                  className="btn btnPrimary"
                  disabled={!a.stealResult}
                  title={!a.stealResult ? disabledReason(state, "stealResult") : ""}
                  onClick={() => send({ type: "STEAL_RESULT", success: true })}
                >
                  Steal Success
                </button>
                <button
                  className="btn btnDanger"
                  disabled={!a.stealResult}
                  title={!a.stealResult ? disabledReason(state, "stealResult") : ""}
                  onClick={() => send({ type: "STEAL_RESULT", success: false })}
                >
                  Steal Failed
                </button>
              </div>

              {!a.stealResult ? <div className="hintSmall">Steal controls unlock after max strikes.</div> : null}
            </div>

            {/* Audio */}
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

            {/* Game Menu */}
            <div className="card">
              <div className="cardHeader">
                <div className="cardHeaderTitle">Game Menu</div>
                <div className="cardHeaderSub">Admin actions (add confirmations next).</div>
              </div>

              <div className="btnRow">
                <button
                  className="btn btnGhost"
                  disabled={!a.restartRound}
                  title={!a.restartRound ? disabledReason(state, "restartRound") : ""}
                  onClick={() => send({ type: "RESTART_ROUND" })}
                >
                  Restart Round
                </button>

                <button className="btn btnDanger" onClick={() => send({ type: "RESET_TO_SETUP" })} title="Resets scores and progress. Confirm dialog is next.">
                  Reset to Setup
                </button>

                <button className="btn btnGhost" onClick={() => send({ type: "END_GAME" })} title="Ends the game immediately. Confirm dialog is next.">
                  End Game
                </button>
              </div>

              <div className="hintSmall">Next improvement: confirmations + (recommended) Undo.</div>
            </div>

            <div className="hostFooterNote">Strict mode: disabled controls stay visible. Hover or long-press for “why”.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
