// feud-party/client/src/board/AnswerGrid.tsx
import type { RoundState } from "@feud/shared";
import AnswerTile from "./AnswerTile";
import "./board.css";

type AnswerGridProps = {
  round: RoundState | null;
};

export default function AnswerGrid({ round }: AnswerGridProps) {
  // Keep 8 slots for classic board density.
  // We intentionally do NOT derive layout from answer count so the grid is always stable on TV.
  const slots = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="answerGrid" role="list" aria-label="Answer board">
      {slots.map((slotIndex) => {
        const answer = round?.answers?.[slotIndex] ?? null;

        const empty = !answer;
        const revealed = answer ? Boolean(round?.revealedAnswerIds?.[answer.id]) : false;

        return (
          <AnswerTile
            key={slotIndex}
            slotIndex={slotIndex}
            empty={empty}
            revealed={revealed}
            text={answer?.text ?? ""}
            points={answer?.points ?? 0}
          />
        );
      })}
    </div>
  );
}
