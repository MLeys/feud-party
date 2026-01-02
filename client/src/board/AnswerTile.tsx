// feud-party/client/src/board/AnswerTile.tsx
import FitText from "./FitText";
import "./board.css";

type AnswerTileProps = {
  slotIndex: number; // 0..7
  revealed: boolean;
  empty: boolean;
  text?: string;
  points?: number;
};

export default function AnswerTile({ slotIndex, revealed, empty, text, points }: AnswerTileProps) {
  const slotNum = slotIndex + 1;

  const cls = [
    "tile",
    empty ? "tileEmpty" : "",
    !empty && !revealed ? "tileHidden" : "",
    revealed ? "tileRevealed" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} role="listitem">
      <div className="slotNum" aria-label={`Slot ${slotNum}`}>
        {slotNum}
      </div>

      <div className="answerTextWrap">
        {revealed && !empty && text ? (
          <FitText
            text={text}
            // TV-first: allow big type on 4K, but still collapse safely on long answers.
            // These are conservative so we never push layout taller than the tile.
            maxPx={64}
            minPx={32}
            maxLines={2}
            fontWeight={950}
            lineHeight={1.06}
            className="answerFit"
          />
        ) : (
          // Keep layout stable even when hidden
          <div className="answerFitPlaceholder" aria-hidden="true" />
        )}
      </div>

      <div className={revealed && !empty ? "points" : "points pointsHidden"} aria-label="Points">
        {revealed && !empty ? points : ""}
      </div>
    </div>
  );
}
