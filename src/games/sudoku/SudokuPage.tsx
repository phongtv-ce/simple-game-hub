import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  formatTime,
  findConflicts,
  generatePuzzle,
  isSolved,
  remainingCount,
  type Board,
  type Difficulty,
} from './logic/sudoku';
import { SudokuBoard } from './components/SudokuBoard';
import { SudokuControls } from './components/SudokuControls';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

type Notes = Record<number, number[]>;

type Snapshot = { board: Board; notes: Notes };

type Game = {
  puzzle: Board;
  solution: Board;
  board: Board;
  notes: Notes;
};

const newGame = (difficulty: Difficulty): Game => {
  const { puzzle, solution } = generatePuzzle(difficulty);
  return { puzzle, solution, board: [...puzzle], notes: {} };
};

export function SudokuPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [game, setGame] = useState<Game>(() => newGame('easy'));
  const [selected, setSelected] = useState<number | null>(null);
  const [noteMode, setNoteMode] = useState(false);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const { board, puzzle, solution, notes } = game;
  const conflicts = useMemo(() => findConflicts(board), [board]);
  const solved = useMemo(() => isSolved(board), [board]);

  useEffect(() => {
    if (solved) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [solved]);

  const startGame = useCallback((next: Difficulty) => {
    setDifficulty(next);
    setGame(newGame(next));
    setSelected(null);
    setHistory([]);
    setSeconds(0);
    setMistakes(0);
  }, []);

  const pushHistory = useCallback((current: Game) => {
    setHistory((prev) =>
      [...prev, { board: [...current.board], notes: { ...current.notes } }].slice(-100),
    );
  }, []);

  const setValue = useCallback(
    (index: number, value: number) => {
      if (solved || puzzle[index] !== 0) return;
      setGame((prev) => {
        pushHistory(prev);
        if (noteMode && value !== 0) {
          const existing = prev.notes[index] ?? [];
          const nextNotes = existing.includes(value)
            ? existing.filter((n) => n !== value)
            : [...existing, value].sort();
          return {
            ...prev,
            board: prev.board.map((cell, i) => (i === index ? 0 : cell)),
            notes: { ...prev.notes, [index]: nextNotes },
          };
        }
        const { [index]: _dropped, ...restNotes } = prev.notes;
        return {
          ...prev,
          board: prev.board.map((cell, i) => (i === index ? value : cell)),
          notes: restNotes,
        };
      });
      if (!noteMode && value !== 0 && solution[index] !== value) {
        setMistakes((m) => m + 1);
      }
    },
    [noteMode, pushHistory, puzzle, solution, solved],
  );

  const undo = useCallback(() => {
    setHistory((prev) => {
      const last = prev.at(-1);
      if (!last) return prev;
      setGame((current) => ({ ...current, board: last.board, notes: last.notes }));
      return prev.slice(0, -1);
    });
  }, []);

  const hint = useCallback(() => {
    if (solved) return;
    const empties = board
      .map((cell, i) => (cell === 0 || cell !== solution[i] ? i : -1))
      .filter((i) => i >= 0);
    if (empties.length === 0) return;
    const index = empties[Math.floor(Math.random() * empties.length)];
    setGame((prev) => {
      pushHistory(prev);
      const { [index]: _dropped, ...restNotes } = prev.notes;
      return {
        ...prev,
        board: prev.board.map((cell, i) => (i === index ? solution[i] : cell)),
        notes: restNotes,
      };
    });
    setSelected(index);
  }, [board, pushHistory, solution, solved]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'n') {
        setNoteMode((prev) => !prev);
        return;
      }
      if (selected === null) return;
      const row = Math.floor(selected / 9);
      const col = selected % 9;
      const move = (dr: number, dc: number) => {
        event.preventDefault();
        const r = (row + dr + 9) % 9;
        const c = (col + dc + 9) % 9;
        setSelected(r * 9 + c);
      };
      switch (event.key) {
        case 'ArrowUp':
          return move(-1, 0);
        case 'ArrowDown':
          return move(1, 0);
        case 'ArrowLeft':
          return move(0, -1);
        case 'ArrowRight':
          return move(0, 1);
        case 'Backspace':
        case 'Delete':
        case '0':
          return setValue(selected, 0);
      }
      if (/^[1-9]$/.test(event.key)) setValue(selected, Number(event.key));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected, setValue]);

  const selectedValue = selected === null ? 0 : board[selected];

  return (
    <div className="min-h-[calc(100vh-57px)] bg-slate-950 bg-[radial-gradient(60rem_60rem_at_50%_-20%,#1e293b,transparent)] px-4 py-8 text-slate-100">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <header className="flex flex-col gap-1 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Sudoku</h1>
          <p className="text-sm text-slate-400">
            Arrow keys to move, 1–9 to fill, N toggles notes.
          </p>
        </header>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {DIFFICULTIES.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => startGame(level)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
                difficulty === level
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-xl bg-slate-900/70 px-4 py-2 text-sm text-slate-300 ring-1 ring-slate-800">
          <span>
            Time <span className="font-mono text-slate-100">{formatTime(seconds)}</span>
          </span>
          <span>
            Mistakes <span className="font-semibold text-rose-400">{mistakes}</span>
          </span>
          <span>
            Empty{' '}
            <span className="font-semibold text-slate-100">
              {board.filter((cell) => cell === 0).length}
            </span>
          </span>
        </div>

        <SudokuBoard
          board={board}
          puzzle={puzzle}
          notes={notes}
          selected={selected}
          selectedValue={selectedValue}
          conflicts={conflicts}
          onSelect={setSelected}
        />

        <SudokuControls
          board={board}
          selected={selected}
          noteMode={noteMode}
          historyLength={history.length}
          onSetValue={setValue}
          onToggleNoteMode={() => setNoteMode((prev) => !prev)}
          onUndo={undo}
          onHint={hint}
          onNewGame={() => startGame(difficulty)}
          remainingCount={remainingCount}
        />

        {solved && (
          <div className="rounded-xl bg-emerald-500/15 px-4 py-3 text-center text-emerald-300 ring-1 ring-emerald-500/40">
            Solved in {formatTime(seconds)} with {mistakes} mistake
            {mistakes === 1 ? '' : 's'}.
          </div>
        )}
      </div>
    </div>
  );
}
