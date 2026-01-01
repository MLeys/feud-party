import type { RoundState } from "@feud/shared";
import AnswerTile from "./AnswerTile";
import "./board.css";

type AnswerGridProps = {
  round: RoundState | null;
};

export default function AnswerGrid({ round }: AnswerGridProps) {
  const slots = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="answerGrid">
      {slots.map((slotIndex) => {
        const answer = round?.answers[slotIndex];
        const empty = !answer;

        const revealed = answer ? Boolean(round?.revealedAnswerIds[answer.id]) : false;

        return (
          <AnswerTile
            key={slotIndex}
            slotIndex={slotIndex}
            empty={empty}
            revealed={revealed}
            text={answer?.text}
            points={answer?.points}
          />
        );
      })}
    </div>
  );
}
