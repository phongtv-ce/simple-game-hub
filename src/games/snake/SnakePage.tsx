import { useState } from 'react';
import type { GameVariant } from './logic/types';
import { ClassicGame } from './components/ClassicGame';
import { MazeGame } from './components/MazeGame';

function ModeNav({
  mode,
  onChange,
}: {
  mode: GameVariant;
  onChange: (mode: GameVariant) => void;
}) {
  return (
    <nav
      className="inline-flex gap-1 rounded-full border border-white/10 bg-slate-900/70 p-1"
      aria-label="Game modes"
    >
      <button
        type="button"
        onClick={() => onChange('classic')}
        aria-current={mode === 'classic' ? 'page' : undefined}
        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
          mode === 'classic'
            ? 'bg-emerald-500 text-slate-950'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`}
      >
        Classic
      </button>
      <button
        type="button"
        onClick={() => onChange('maze')}
        aria-current={mode === 'maze' ? 'page' : undefined}
        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
          mode === 'maze'
            ? 'bg-emerald-500 text-slate-950'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`}
      >
        Maze
      </button>
    </nav>
  );
}

export function SnakePage() {
  const [mode, setMode] = useState<GameVariant>('classic');

  return (
    <main className="mx-auto min-h-[calc(100vh-57px)] max-w-5xl px-4 py-6 sm:px-6">
      <header className="mb-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-emerald-300/80">
              Arcade
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {mode === 'classic' ? 'Snake' : 'Snake Maze'}
            </h1>
          </div>
          <ModeNav mode={mode} onChange={setMode} />
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[auto_auto] lg:items-start">
        {mode === 'classic' ? <ClassicGame /> : <MazeGame />}
      </div>
    </main>
  );
}
