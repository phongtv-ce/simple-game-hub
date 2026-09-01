import type { Board } from '../logic/sudoku';

type SudokuControlsProps = {
  board: Board;
  selected: number | null;
  noteMode: boolean;
  historyLength: number;
  onSetValue: (index: number, value: number) => void;
  onToggleNoteMode: () => void;
  onUndo: () => void;
  onHint: () => void;
  onNewGame: () => void;
  remainingCount: (board: Board, value: number) => number;
};

export function SudokuControls({
  board,
  selected,
  noteMode,
  historyLength,
  onSetValue,
  onToggleNoteMode,
  onUndo,
  onHint,
  onNewGame,
  remainingCount,
}: SudokuControlsProps) {
  return (
    <>
      <div className="grid grid-cols-9 gap-1.5">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((value) => {
          const left = remainingCount(board, value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => selected !== null && onSetValue(selected, value)}
              disabled={selected === null}
              className="flex flex-col items-center rounded-lg bg-slate-800 py-2 text-lg font-semibold text-slate-100 transition hover:bg-slate-700 disabled:opacity-40"
            >
              {value}
              <span className="text-[0.6rem] font-normal text-slate-400">
                {left > 0 ? left : '✓'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onToggleNoteMode}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            noteMode
              ? 'bg-amber-400 text-slate-900'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
        >
          Notes {noteMode ? 'on' : 'off'}
        </button>
        <button
          type="button"
          onClick={() => selected !== null && onSetValue(selected, 0)}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
        >
          Erase
        </button>
        <button
          type="button"
          onClick={onUndo}
          disabled={historyLength === 0}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 disabled:opacity-40"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={onHint}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-emerald-400"
        >
          Hint
        </button>
        <button
          type="button"
          onClick={onNewGame}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
        >
          New game
        </button>
      </div>
    </>
  );
}
