import { useMemo, useState } from "react";
import type { GameEvent, GameState } from "@feud/shared";
import RevealPad from "./RevealPad";
import "./host.css";

function phaseNow(state: GameState) {
  const cur = state.current;
  const strikes = cur ? cur.strikes : 0;
  const maxStrikes = cur ? cur.maxStrikes : 3;

  if (state.phase === "SETUP") {
    return {
      action: "Start the game (set teams and rounds).",
      hint: "Pick team names, choose 3 or 5 rounds, then press Start."
    };
  }

  if (state.phase === "FACE_OFF") {
    return {
      action: "Open buzzers or choose the face-off winner.",
      hint: "Best practice: Open Buzz (Face-off). First buzz locks. Then Apply winner."
    };
  }

  if (state.phase === "PLAY") {
    if (strikes >= maxStrikes) {
      return {
        action: "Steal time.",
        hint: "Press Start Steal. The other team gets one guess."
      };
    }
    return {
      action: "Reveal correct answers, add strikes, and optionally open buzz (Play).",
      hint: "Use Open Buzz (Play) when you want teams to fight for control mid-round."
    };
  }

  if (state.phase === "STEAL") {
    return {
      action: "Resolve the steal.",
      hint: "If they guessed a remaining answer, tap it below (auto reveals + awards). Otherwise tap Steal Failed."
    };
  }

  if (state.phase === "ROUND_END") {
    return {
      action: "Advance to the next round.",
      hint: "Tap Next Round when you’re ready."
    };
  }

  if (state.phase === "GAME_END") {
    return {
      action: "Game over.",
      hint: "End Game resets back to Setup."
    };
  }

  return { action: "Waiting…", hint: "" };
}

export default function HostStage({
  state,
  authed,
  onAuth,
  send
}: {
  state: GameState;
  authed: boolean;
  onAuth: (pin: string) => void;
  send: (e: GameEvent) => void;
}) {
  const cur = state.current;

  const [pin, setPin] = useState("");
  const [teamAName, setTeamAName] = useState("Team A");
  const [teamBName, setTeamBName] = useState("Team B");
  const [confirmEnd, setConfirmEnd] = useState(false);

  // Sync names only in SETUP
  useMemo(() => {
    if (state.phase === "SETUP") {
      setTeamAName(state.teams.A.name || "Team A");
      setTeamBName(state.teams.B.name || "Team B");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  const now = phaseNow(state);

  const controlTeam =
    cur && cur.controlTeam ? state.teams[cur.controlTeam].name : "—";
  const activeTeam =
    cur && cur.activeTeam ? state.teams[cur.activeTeam].name : "—";
  const bank = cur ? cur.roundPoints : 0;
  const strikes = cur ? cur.strikes : 0;
  const maxStrikes = cur ? cur.maxStrikes : 3;

  const canReveal = authed && (state.phase === "PLAY" || state.phase === "STEAL");
  const canStrike = authed && state.phase === "PLAY" && strikes < maxStrikes;
  const canStartSteal = authed && state.phase === "PLAY" && strikes >= maxStrikes;
  const canFaceOff = authed && state.phase === "FACE_OFF";
  const canNextRound = authed && state.phase === "ROUND_END";
  const canEndGame =
    authed &&
    (state.phase === "GAME_END" ||
      state.phase === "ROUND_END" ||
      state.phase === "SETUP");

  const unrevealed = useMemo(() => {
    if (!cur) return [];
    const out = [];
    for (let i = 0; i < cur.answers.length; i++) {
      const a = cur.answers[i];
      const isRev = cur.revealedAnswerIds && cur.revealedAnswerIds[a.id];
      if (!isRev) out.push(a);
    }
    return out;
  }, [cur]);

  if (!authed) {
    return (
      <div className="hostRoot">
        <div className="hostStage">
          <div className="hostTopBar">
            <div className="hostTitle">
              <h1>Host Console</h1>
              <div>Enter the PIN shown on the TV Board</div>
            </div>
            <div className="hostChip">Not Connected</div>
          </div>

          <div className="card">
            <div className="cardHeader">
              <div className="cardHeaderTitle">Connect</div>
              <div className="cardHeaderSub">
                On the TV, look for <strong>Host PIN</strong>. Enter it here.
              </div>
            </div>

            <div className="row2">
              <input
                className="input"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                inputMode="numeric"
                placeholder="PIN"
              />
              <button className="btn btnPrimary" onClick={() => onAuth(pin)}>
                Connect
              </button>
            </div>

            <div className="small" style={{ marginTop: 10 }}>
              Tip: your device must be on the same Wi-Fi as the laptop running the server.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const buzzStatus = state.buzz
    ? state.buzz.open
      ? "OPEN (" + (state.buzz.mode || "—") + ")"
      : state.buzz.winnerTeam
      ? "LOCKED: Team " + state.buzz.winnerTeam
      : "CLOSED"
    : "—";

  const canApplyBuzz =
    authed &&
    state.buzz &&
    Boolean(state.buzz.winnerTeam) &&
    (state.phase === "FACE_OFF" || state.phase === "PLAY");

  return (
    <div className="hostRoot">
      <div className="hostStage">
        <div className="hostTopBar">
          <div className="hostTitle">
            <h1>Host Console</h1>
            <div>
              Phase: <strong>{state.phase}</strong> · Control:{" "}
              <strong>{controlTeam}</strong> · Active:{" "}
              <strong>{activeTeam}</strong>
            </div>
          </div>
          <div className="hostChip">Connected</div>
        </div>

        {state.phase !== "SETUP" ? (
          <div className="activeBanner">
            <div>
              <div className="activeBannerTitle">Active Team</div>
              <div className="activeBannerTeam">{activeTeam}</div>
            </div>
            <div className="activeBadge">{state.phase}</div>
          </div>
        ) : null}

        <div className="nowBanner">
          <div className="nowTitle">Now</div>
          <div className="nowAction">{now.action}</div>
          {now.hint ? <div className="nowHint">{now.hint}</div> : null}
        </div>

        <div className="kpiRow">
          <div className="kpi">
            <div className="kpiLabel">Team A</div>
            <div className="kpiValue">
              {state.teams.A.name}: {state.teams.A.score}
            </div>
          </div>

          <div className="kpi">
            <div className="kpiLabel">Bank</div>
            <div className="kpiValue">{bank}</div>
          </div>

          <div className="kpi">
            <div className="kpiLabel">Team B</div>
            <div className="kpiValue">
              {state.teams.B.name}: {state.teams.B.score}
            </div>
          </div>
        </div>

        <div className="hostGrid">
          {/* LEFT: main phase controls */}
          <div className="row">
            {/* SETUP */}
            {state.phase === "SETUP" ? (
              <div className="card">
                <div className="cardHeader">
                  <div className="cardHeaderTitle">Game Setup</div>
                  <div className="cardHeaderSub">
                    Set team names and start a 3 or 5 round game.
                  </div>
                </div>

                <div className="row2">
                  <input
                    className="input"
                    value={teamAName}
                    onChange={(e) => setTeamAName(e.target.value)}
                  />
                  <input
                    className="input"
                    value={teamBName}
                    onChange={(e) => setTeamBName(e.target.value)}
                  />
                </div>

                <div className="row2" style={{ marginTop: 10 }}>
                  <button
                    className="btn btnPrimary"
                    onClick={() =>
                      send({
                        type: "SETUP_GAME",
                        teamAName,
                        teamBName,
                        gameLength: 3,
                        packId: state.packId
                      })
                    }
                  >
                    Start (3 rounds)
                  </button>
                  <button
                    className="btn btnPrimary"
                    onClick={() =>
                      send({
                        type: "SETUP_GAME",
                        teamAName,
                        teamBName,
                        gameLength: 5,
                        packId: state.packId
                      })
                    }
                  >
                    Start (5 rounds)
                  </button>
                </div>
              </div>
            ) : null}

            {/* FACE-OFF (manual fallback still available) */}
            {state.phase === "FACE_OFF" ? (
              <div className="card">
                <div className="cardHeader">
                  <div className="cardHeaderTitle">Face-Off</div>
                  <div className="cardHeaderSub">
                    Best practice: Open Buzz (Face-off), then Apply winner. Manual buttons remain as fallback.
                  </div>
                </div>

                <div className="row2">
                  <button
                    className="btn btnPrimary"
                    disabled={!canFaceOff}
                    onClick={() => send({ type: "SET_FACE_OFF_WINNER", team: "A" })}
                  >
                    {state.teams.A.name} Wins (Manual)
                  </button>
                  <button
                    className="btn btnPrimary"
                    disabled={!canFaceOff}
                    onClick={() => send({ type: "SET_FACE_OFF_WINNER", team: "B" })}
                  >
                    {state.teams.B.name} Wins (Manual)
                  </button>
                </div>
              </div>
            ) : null}

            {/* PLAY / STEAL */}
            {state.phase === "PLAY" || state.phase === "STEAL" ? (
              <div className="card">
                <div className="cardHeader">
                  <div className="cardHeaderTitle">
                    {state.phase === "STEAL" ? "Steal Resolution" : "Round Controls"}
                  </div>
                  <div className="cardHeaderSub">
                    {state.phase === "STEAL"
                      ? "If they guessed a remaining answer, tap it below. Otherwise, mark steal failed."
                      : "Reveal correct answers or add strikes for wrong guesses."}
                  </div>
                </div>

                <RevealPad
                  round={cur}
                  disabled={!canReveal}
                  onReveal={(answerId) => send({ type: "REVEAL_ANSWER", answerId })}
                />

                <div className="sep" />

                {state.phase === "PLAY" ? (
                  <div className="row2">
                    <button
                      className="btn btnDanger"
                      disabled={!canStrike}
                      onClick={() => send({ type: "ADD_STRIKE" })}
                    >
                      Add Strike ({strikes}/{maxStrikes})
                    </button>

                    <button
                      className="btn btnPrimary"
                      disabled={!canStartSteal}
                      onClick={() => send({ type: "START_STEAL" })}
                    >
                      Start Steal
                    </button>
                  </div>
                ) : null}

                {state.phase === "STEAL" ? (
                  <div className="row" style={{ marginTop: 10 }}>
                    <div className="small">Unrevealed answers (tap to mark steal success)</div>

                    {unrevealed.length === 0 ? (
                      <div className="small">No unrevealed answers remaining.</div>
                    ) : (
                      unrevealed.map((a) => (
                        <button
                          key={a.id}
                          className="btn btnPrimary"
                          onClick={() => {
                            send({ type: "REVEAL_ANSWER", answerId: a.id });
                            send({ type: "STEAL_RESULT", success: true });
                          }}
                        >
                          Steal Success: {a.text} ({a.points})
                        </button>
                      ))
                    )}

                    <button
                      className="btn btnDanger"
                      onClick={() => send({ type: "STEAL_RESULT", success: false })}
                    >
                      Steal Failed
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* ROUND END */}
            {state.phase === "ROUND_END" ? (
              <div className="card">
                <div className="cardHeader">
                  <div className="cardHeaderTitle">Round Complete</div>
                  <div className="cardHeaderSub">
                    Confirm everyone saw the result on the TV, then advance.
                  </div>
                </div>

                <div className="row2">
                  <button
                    className="btn btnPrimary"
                    disabled={!canNextRound}
                    onClick={() => send({ type: "NEXT_ROUND" })}
                  >
                    Next Round
                  </button>

                  <button
                    className="btn btnDanger"
                    disabled={!canEndGame}
                    onClick={() => setConfirmEnd(true)}
                  >
                    End Game
                  </button>
                </div>
              </div>
            ) : null}

            {/* GAME END */}
            {state.phase === "GAME_END" ? (
              <div className="card">
                <div className="cardHeader">
                  <div className="cardHeaderTitle">Game Over</div>
                  <div className="cardHeaderSub">
                    End the game to return to Setup and start a new one.
                  </div>
                </div>

                <button
                  className="btn btnDanger"
                  disabled={!canEndGame}
                  onClick={() => send({ type: "END_GAME" })}
                >
                  End Game (Reset)
                </button>
              </div>
            ) : null}
          </div>

          {/* RIGHT: sticky control desk (laptop) / stacked (mobile) */}
          <div className="row sideCard">
            <div className="card">
              <div className="cardHeader">
                <div className="cardHeaderTitle">Control Desk</div>
                <div className="cardHeaderSub">Buzzer, audio, and safety controls.</div>
              </div>

              <div className="row">
                <div className="small">
                  Buzzer: <strong>{buzzStatus}</strong>
                </div>

                <button
                  className="btn btnPrimary"
                  disabled={state.phase !== "FACE_OFF"}
                  onClick={() => send({ type: "OPEN_BUZZ", mode: "FACE_OFF" })}
                >
                  Open Buzz (Face-off)
                </button>

                <button
                  className="btn btnPrimary"
                  disabled={state.phase !== "PLAY"}
                  onClick={() => send({ type: "OPEN_BUZZ", mode: "PLAY" })}
                >
                  Open Buzz (Play)
                </button>

                <button className="btn btnGhost" onClick={() => send({ type: "RESET_BUZZ" })}>
                  Reset Buzz
                </button>

                <div className="row2">
                  <button className="btn btnGhost" onClick={() => send({ type: "OVERRIDE_BUZZ", team: "A" })}>
                    Override → A
                  </button>
                  <button className="btn btnGhost" onClick={() => send({ type: "OVERRIDE_BUZZ", team: "B" })}>
                    Override → B
                  </button>
                </div>

                <button className="btn btnPrimary" disabled={!canApplyBuzz} onClick={() => send({ type: "APPLY_BUZZ" })}>
                  Apply Winner to Game
                </button>

                <div className="sep" />

                <button
                  className="btn btnGhost"
                  onClick={() => send({ type: "SET_AUDIO", enabled: !state.audio.enabled })}
                >
                  {state.audio.enabled ? "Mute Board" : "Unmute Board"}
                </button>

                <label className="small">
                  Volume: {Math.round(state.audio.volume * 100)}%
                  <input
                    style={{ width: "100%", marginTop: 8 }}
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(state.audio.volume * 100)}
                    onChange={(e) => send({ type: "SET_AUDIO", volume: Number(e.target.value) / 100 })}
                  />
                </label>

                <button
                  className="btn btnDanger"
                  disabled={!canEndGame}
                  onClick={() => setConfirmEnd(true)}
                >
                  End Game
                </button>
              </div>
            </div>

            {confirmEnd ? (
              <div
                className="nowBanner"
                style={{
                  borderColor: "rgba(255,90,90,0.45)",
                  background: "rgba(255,70,70,0.12)"
                }}
              >
                <div className="nowTitle">Confirm</div>
                <div className="nowAction">End the game now?</div>
                <div className="nowHint">This resets the flow back to setup.</div>

                <div className="actionRow" style={{ marginTop: 10 }}>
                  <button className="btn btnDanger" onClick={() => send({ type: "END_GAME" })}>
                    Yes, End
                  </button>
                  <button className="btn btnGhost" onClick={() => setConfirmEnd(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
