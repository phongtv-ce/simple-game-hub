import { useState } from 'react';
import type { GameVariant, StatusState } from './game/types';
import { ClassicGame } from './components/ClassicGame';
import { MazeGame } from './components/MazeGame';
import { StatusBanner } from './components/ui';

function ModeNav({
  mode,
  onChange,
}: {
  mode: GameVariant;
  onChange: (mode: GameVariant) => void;
}) {
  return (
    <nav
      className="inline-flex gap-1 rounded-full border border-emerald-200 bg-white p-1 shadow-md"
      aria-label="Game modes"
    >
      <button
        type="button"
        onClick={() => onChange('classic')}
        aria-current={mode === 'classic' ? 'page' : undefined}
        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
          mode === 'classic'
            ? 'bg-emerald-600 text-white'
            : 'text-emerald-700/70 hover:text-emerald-900'
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
            ? 'bg-emerald-600 text-white'
            : 'text-emerald-700/70 hover:text-emerald-900'
        }`}
      >
        Maze
      </button>
    </nav>
  );
}

export default function App() {
  const [mode, setMode] = useState<GameVariant>('classic');
  const [status, setStatus] = useState<{
    message: string;
    state: StatusState;
  }>({
    message: 'Press Start, Space, or an arrow key to play.',
    state: 'idle',
  });

  return (
    <main className="mx-auto max-w-5xl px-5 py-6">
      <header className="mb-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-950">
            {mode === 'classic' ? 'Snake' : 'Snake Maze'}
          </h1>
          <ModeNav mode={mode} onChange={setMode} />
        </div>
        <StatusBanner message={status.message} state={status.state} />
      </header>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-start">
        {mode === 'classic' ? (
          <ClassicGame onStatusChange={setStatus} />
        ) : (
          <MazeGame onStatusChange={setStatus} />
        )}
      </div>
    </main>
  );
}
