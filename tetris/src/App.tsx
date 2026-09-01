import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  COLS,
  type Cell,
  type GameState,
  type PieceType,
  PIECE_COLORS,
  dropIntervalMs,
  hardDrop,
  holdPiece,
  initialState,
  mergeBoard,
  moveHorizontal,
  rotateActive,
  shapeForPreview,
  softDrop,
  startGame,
  tick,
} from './game';

type Action =
  | { type: 'start' }
  | { type: 'togglePause' }
  | { type: 'tick' }
  | { type: 'move'; direction: -1 | 1 }
  | { type: 'rotate' }
  | { type: 'softDrop' }
  | { type: 'hardDrop' }
  | { type: 'hold' };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'start':
      return startGame();
    case 'togglePause':
      if (state.status === 'playing') return { ...state, status: 'paused' };
      if (state.status === 'paused') return { ...state, status: 'playing' };
      return state;
    case 'tick':
      return tick(state);
    case 'move':
      return moveHorizontal(state, action.direction);
    case 'rotate':
      return rotateActive(state);
    case 'softDrop':
      return softDrop(state);
    case 'hardDrop':
      return hardDrop(state);
    case 'hold':
      return holdPiece(state);
    default:
      return state;
  }
}

function Preview({ type, label }: { type: PieceType | null; label: string }) {
  const shape = type ? shapeForPreview(type) : null;

  return (
    <div className="rounded-xl border border-slate-600 bg-slate-900/80 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <div
        className="grid gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${shape?.[0]?.length ?? 4}, 1.25rem)`,
        }}
      >
        {shape
          ? shape.flatMap((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`h-5 w-5 rounded-sm border border-slate-800 ${
                    cell ? PIECE_COLORS[type!] : 'bg-slate-950/60'
                  }`}
                />
              )),
            )
          : Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="h-5 w-5 rounded-sm border border-slate-800 bg-slate-950/60" />
            ))}
      </div>
    </div>
  );
}

function Board({ cells }: { cells: Cell[][] }) {
  return (
    <div
      className="grid gap-px rounded-xl border-4 border-slate-600 bg-slate-800 p-1 shadow-2xl shadow-cyan-900/30"
      style={{ gridTemplateColumns: `repeat(${COLS}, 1.5rem)` }}
    >
      {cells.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            className={`h-6 w-6 rounded-[2px] border border-slate-900/50 ${
              cell ? `${PIECE_COLORS[cell]} shadow-inner` : 'bg-slate-950/80'
            }`}
          />
        )),
      )}
    </div>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const current = stateRef.current;
    if (current.status === 'idle' || current.status === 'gameover') {
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        dispatch({ type: 'start' });
      }
      return;
    }

    switch (event.code) {
      case 'ArrowLeft':
        event.preventDefault();
        dispatch({ type: 'move', direction: -1 });
        break;
      case 'ArrowRight':
        event.preventDefault();
        dispatch({ type: 'move', direction: 1 });
        break;
      case 'ArrowUp':
      case 'KeyX':
        event.preventDefault();
        dispatch({ type: 'rotate' });
        break;
      case 'KeyZ':
        event.preventDefault();
        dispatch({ type: 'rotate' });
        break;
      case 'ArrowDown':
        event.preventDefault();
        dispatch({ type: 'softDrop' });
        break;
      case 'Space':
        event.preventDefault();
        dispatch({ type: 'hardDrop' });
        break;
      case 'KeyC':
      case 'ShiftLeft':
      case 'ShiftRight':
        event.preventDefault();
        dispatch({ type: 'hold' });
        break;
      case 'KeyP':
      case 'Escape':
        event.preventDefault();
        dispatch({ type: 'togglePause' });
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (state.status !== 'playing') return;

    const id = window.setInterval(() => {
      dispatch({ type: 'tick' });
    }, dropIntervalMs(state.level));

    return () => window.clearInterval(id);
  }, [state.status, state.level]);

  const displayBoard = mergeBoard(state.board, state.active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-8 text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8">
        <header className="text-center">
          <h1 className="text-4xl font-black tracking-tight text-transparent bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text">
            Tetris
          </h1>
          <p className="mt-2 text-sm text-slate-400">Classic block puzzle — clear lines to score</p>
        </header>

        <div className="flex flex-wrap items-start justify-center gap-8">
          <div className="flex flex-col gap-4">
            <Preview type={state.hold} label="Hold" />
            <div className="rounded-xl border border-slate-600 bg-slate-900/80 p-4 text-sm">
              <Stat label="Score" value={state.score} />
              <Stat label="Lines" value={state.lines} />
              <Stat label="Level" value={state.level} />
            </div>
          </div>

          <div className="relative">
            <Board cells={displayBoard} />
            {state.status !== 'playing' && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-950/75 backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-xl font-bold">
                    {state.status === 'idle' && 'Press Start'}
                    {state.status === 'paused' && 'Paused'}
                    {state.status === 'gameover' && 'Game Over'}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    {state.status === 'idle' && 'or press Space / Enter'}
                    {state.status === 'paused' && 'Press P or Esc to resume'}
                    {state.status === 'gameover' && `Final score: ${state.score}`}
                  </p>
                  {(state.status === 'idle' || state.status === 'gameover') && (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'start' })}
                      className="mt-4 rounded-lg bg-cyan-500 px-6 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                      {state.status === 'gameover' ? 'Play Again' : 'Start'}
                    </button>
                  )}
                  {state.status === 'paused' && (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'togglePause' })}
                      className="mt-4 rounded-lg bg-purple-500 px-6 py-2 font-semibold transition hover:bg-purple-400"
                    >
                      Resume
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <Preview type={state.next} label="Next" />
            <div className="rounded-xl border border-slate-600 bg-slate-900/80 p-4 text-xs leading-relaxed text-slate-400">
              <p className="mb-2 font-semibold uppercase tracking-wider text-slate-300">Controls</p>
              <ul className="space-y-1">
                <li>← → Move</li>
                <li>↑ / X Rotate</li>
                <li>↓ Soft drop</li>
                <li>Space Hard drop</li>
                <li>C / Shift Hold</li>
                <li>P / Esc Pause</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-6 py-1">
      <span className="text-slate-400">{label}</span>
      <span className="font-mono text-lg font-bold text-cyan-300">{value}</span>
    </div>
  );
}
