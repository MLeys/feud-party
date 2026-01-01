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
    <div className={cls}>
      <div className="slotNum">{slotNum}</div>

      <div className="answerTextWrap">
        {revealed && text ? (
          <FitText
            text={text}
            maxPx={72}
            minPx={48}
            maxLines={3}
            fontWeight={950}
          />
        ) : (
          <div style={{ height: 1 }} />
        )}
      </div>

      <div className={revealed && !empty ? "points" : "points pointsHidden"}>
        {revealed && !empty ? points : ""}
      </div>
    </div>
  );
}
