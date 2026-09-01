import type { StatusState } from '../logic/types';

export function GameOverlay({
  state,
  score,
  onStart,
  onResume,
}: {
  state: 'playing' | 'idle' | 'paused' | 'gameover' | 'victory';
  score: number;
  onStart: () => void;
  onResume: () => void;
}) {
  if (state === 'playing') return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-slate-950/75 backdrop-blur-sm">
      <div className="text-center">
        <p className="text-xl font-bold text-white">
          {state === 'idle' && 'Press Start'}
          {state === 'paused' && 'Paused'}
          {state === 'gameover' && 'Game Over'}
          {state === 'victory' && 'Victory!'}
        </p>
        <p className="mt-2 text-sm text-slate-400">
          {state === 'idle' && 'or press Space / Enter'}
          {state === 'paused' && 'Press Space to resume'}
          {state === 'gameover' && `Final score: ${score}`}
          {state === 'victory' && `Total apples: ${score}`}
        </p>
        {(state === 'idle' || state === 'gameover' || state === 'victory') && (
          <button
            type="button"
            onClick={onStart}
            className="mt-4 rounded-lg bg-cyan-500 px-6 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            {state === 'idle' ? 'Start' : 'Play Again'}
          </button>
        )}
        {state === 'paused' && (
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

export function getOverlayState(
  statusState: StatusState,
  isGameActive: boolean,
): 'playing' | 'idle' | 'paused' | 'gameover' | 'victory' {
  if (statusState === 'playing') return 'playing';
  if (statusState === 'gameover') return 'gameover';
  if (statusState === 'victory') return 'victory';
  if (statusState === 'idle' && isGameActive) return 'paused';
  return 'idle';
}

export function Kbd({ children }: { children: string }) {
  return (
    <kbd className="rounded border border-white/10 bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-200 shadow-sm">
      {children}
    </kbd>
  );
}

export function HintList() {
  return (
    <ul className="space-y-1.5 text-sm text-slate-300">
      <li>
        <Kbd>↑</Kbd> <Kbd>↓</Kbd> <Kbd>←</Kbd> <Kbd>→</Kbd> Steer the snake
      </li>
      <li><Kbd>Space</Kbd> Pause or resume</li>
      <li>Hold an arrow key ~0.2s for 5× speed</li>
    </ul>
  );
}


export function SpeedBadge({ active }: { active: boolean }) {
  return (
    <p
      aria-live="polite"
      className={`mt-2 text-center text-xs font-semibold transition-opacity ${
        active ? 'text-amber-400 opacity-100' : 'text-slate-500 opacity-60'
      }`}
    >
      5× speed boost
    </p>
  );
}

export function Panel({
  title,
  children,
  id,
}: {
  title?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
      {title && (
        <h2
          id={id}
          className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-300/80"
        >
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number | string;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-3 text-center">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <p className="mt-1 text-2xl font-bold text-white">
        {value}
        {suffix && (
          <span className="text-base font-medium text-emerald-400">{suffix}</span>
        )}
      </p>
    </div>
  );
}
