import {
  COLS,
  PIECE_COLORS,
  shapeForPreview,
  type Cell,
  type PieceType,
} from '../logic/game';

export function Preview({ type, label }: { type: PieceType | null; label: string }) {
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

export function TetrisBoard({ cells }: { cells: Cell[][] }) {
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

export function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-6 py-1">
      <span className="text-slate-400">{label}</span>
      <span className="font-mono text-lg font-bold text-cyan-300">{value}</span>
    </div>
  );
}

export function GameOverlay({
  status,
  score,
  onStart,
  onResume,
}: {
  status: string;
  score: number;
  onStart: () => void;
  onResume: () => void;
}) {
  if (status === 'playing') return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-950/75 backdrop-blur-sm">
      <div className="text-center">
        <p className="text-xl font-bold">
          {status === 'idle' && 'Press Start'}
          {status === 'paused' && 'Paused'}
          {status === 'gameover' && 'Game Over'}
        </p>
        <p className="mt-2 text-sm text-slate-400">
          {status === 'idle' && 'or press Space / Enter'}
          {status === 'paused' && 'Press P or Esc to resume'}
          {status === 'gameover' && `Final score: ${score}`}
        </p>
        {(status === 'idle' || status === 'gameover') && (
          <button
            type="button"
            onClick={onStart}
            className="mt-4 rounded-lg bg-cyan-500 px-6 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            {status === 'gameover' ? 'Play Again' : 'Start'}
          </button>
        )}
        {status === 'paused' && (
          <button
            type="button"
            onClick={onResume}
            className="mt-4 rounded-lg bg-purple-500 px-6 py-2 font-semibold transition hover:bg-purple-400"
          >
            Resume
          </button>
        )}
      </div>
    </div>
  );
}
