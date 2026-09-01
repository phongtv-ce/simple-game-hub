import type { CSSProperties } from "react";
import {
  CELL_EMPTY,
  PLAYER_X,
  PLAYER_O,
  PLAYER_MARKS,
  PLAYER_LABELS,
  type Board,
  type BoardPosition,
  type CellValue,
} from "../logic/gameLogic";

interface CellProps {
  value: CellValue;
  isWinning: boolean;
  onClick: () => void;
  disabled: boolean;
}

function Cell({ value, isWinning, onClick, disabled }: CellProps) {
  const classNames = [
    "flex aspect-square items-center justify-center rounded-[0.35rem] bg-slate-950/88 text-base font-black transition sm:text-lg md:text-xl lg:text-2xl",
    "disabled:cursor-default",
    value === CELL_EMPTY
      ? "cursor-pointer hover:bg-slate-800 hover:shadow-inner"
      : "",
    value === PLAYER_X
      ? "text-red-400 [text-shadow:0_0_14px_rgba(248,113,113,0.35)]"
      : "",
    value === PLAYER_O
      ? "text-slate-100 [text-shadow:0_0_12px_rgba(255,255,255,0.16)]"
      : "",
    isWinning ? "bg-amber-300/20 ring-2 ring-amber-300/80 ring-inset" : "",
  ];

  const markClassName =
    value === PLAYER_X
      ? "inline-block -rotate-6 tracking-[-0.08em]"
      : value === PLAYER_O
        ? "inline-block scale-[1.05] tracking-[-0.03em]"
        : "";

  return (
    <button
      type="button"
      className={classNames.filter(Boolean).join(" ")}
      onClick={onClick}
      disabled={disabled || value !== CELL_EMPTY}
      aria-label={
        value === CELL_EMPTY ? "Empty cell" : `${PLAYER_LABELS[value]} mark`
      }
    >
      {value !== CELL_EMPTY ? (
        <span className={markClassName}>{PLAYER_MARKS[value]}</span>
      ) : null}
    </button>
  );
}

interface BoardProps {
  board: Board;
  winningCells: BoardPosition[];
  isGameOver: boolean;
  onCellClick: (row: number, column: number) => void;
}

export default function Board({
  board,
  winningCells,
  isGameOver,
  onCellClick,
}: BoardProps) {
  const size = board.length;
  const winningSet = new Set(
    winningCells.map(({ row, column }) => `${row},${column}`),
  );
  const boardWidth = `min(92vw, ${size * 2.5}rem)`;
  const boardStyle = {
    gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
    width: boardWidth,
  } as CSSProperties;

  return (
    <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-900/70 p-3 shadow-2xl shadow-slate-950/40 backdrop-blur">
      <div
        className="mx-auto grid gap-px rounded bg-slate-700/70 p-px shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        style={boardStyle}
        aria-label="Five in a row board"
      >
        {board.map((row, rowIndex) =>
          row.map((cell, columnIndex) => (
            <Cell
              key={`${rowIndex}-${columnIndex}`}
              value={cell}
              isWinning={winningSet.has(`${rowIndex},${columnIndex}`)}
              disabled={isGameOver}
              onClick={() => onCellClick(rowIndex, columnIndex)}
            />
          )),
        )}
      </div>
    </div>
  );
}
