import { useCallback, useEffect, useMemo, useState } from "react";
import Cell from "./Cell";
import {
  DIFFICULTIES,
  chordCell,
  countFlags,
  createEmptyBoard,
  hasHitMine,
  isCleared,
  placeMines,
  revealAllMines,
  revealCell,
  toggleFlag,
  type Board,
  type Difficulty,
  type GameStatus,
} from "./game";

export default function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTIES[0]);
  const [board, setBoard] = useState<Board>(() =>
    createEmptyBoard(DIFFICULTIES[0].rows, DIFFICULTIES[0].cols),
  );
  const [status, setStatus] = useState<GameStatus>("ready");
  const [seconds, setSeconds] = useState(0);

  const newGame = useCallback((next: Difficulty) => {
    setDifficulty(next);
    setBoard(createEmptyBoard(next.rows, next.cols));
    setStatus("ready");
    setSeconds(0);
  }, []);

  useEffect(() => {
    if (status !== "playing") return;
    const id = window.setInterval(
      () => setSeconds((value) => Math.min(value + 1, 999)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [status]);

  const finish = (next: Board) => {
    if (hasHitMine(next)) {
      setBoard(revealAllMines(next));
      setStatus("lost");
    } else if (isCleared(next)) {
      setBoard(next);
      setStatus("won");
    } else {
      setBoard(next);
    }
  };

  const handleReveal = (row: number, col: number) => {
    if (status === "won" || status === "lost") return;
    if (status === "ready") {
      const seeded = placeMines(board, difficulty.mines, row, col);
      setStatus("playing");
      finish(revealCell(seeded, row, col));
      return;
    }
    finish(revealCell(board, row, col));
  };

  const handleFlag = (row: number, col: number) => {
    if (status === "won" || status === "lost") return;
    setBoard(toggleFlag(board, row, col));
  };

  const handleChord = (row: number, col: number) => {
    if (status !== "playing") return;
    finish(chordCell(board, row, col));
  };

  const minesLeft = useMemo(
    () => difficulty.mines - countFlags(board),
    [difficulty, board],
  );
  const face = status === "won" ? "😎" : status === "lost" ? "💀" : "🙂";

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-slate-900 px-4 py-10 text-slate-100">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Miner</h1>
        <p className="mt-1 text-sm text-slate-400">
          Left click to dig, right click to flag, click a number to auto-clear
          its neighbours.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {DIFFICULTIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => newGame(item)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              item.id === difficulty.id
                ? "bg-emerald-500 text-slate-900"
                : "bg-slate-700 text-slate-200 hover:bg-slate-600"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-slate-800 p-3 shadow-xl">
        <div className="mb-3 flex items-center justify-between gap-4 rounded-lg bg-slate-700 px-3 py-2">
          <span className="min-w-14 font-mono text-lg text-red-400">
            💣 {String(Math.max(minesLeft, 0)).padStart(3, "0")}
          </span>
          <button
            type="button"
            onClick={() => newGame(difficulty)}
            className="rounded-md bg-slate-200 px-3 py-1 text-xl hover:bg-white"
            aria-label="New game"
          >
            {face}
          </button>
          <span className="min-w-14 text-right font-mono text-lg text-amber-300">
            ⏱ {String(seconds).padStart(3, "0")}
          </span>
        </div>

        <div className="overflow-x-auto">
          <div
            className="grid gap-0.5"
            style={{
              gridTemplateColumns: `repeat(${difficulty.cols}, minmax(0, 1fr))`,
            }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => (
                <Cell
                  key={`${r}-${c}`}
                  cell={cell}
                  disabled={status === "won" || status === "lost"}
                  onReveal={() => handleReveal(r, c)}
                  onFlag={() => handleFlag(r, c)}
                  onChord={() => handleChord(r, c)}
                />
              )),
            )}
          </div>
        </div>
      </div>

      <p className="h-6 text-lg font-semibold">
        {status === "won" && (
          <span className="text-emerald-400">Cleared in {seconds}s!</span>
        )}
        {status === "lost" && (
          <span className="text-red-400">Boom! You hit a mine.</span>
        )}
      </p>
    </div>
  );
}
