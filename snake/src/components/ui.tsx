import type { StatusState } from '../game/types';

const statusStyles: Record<StatusState, string> = {
  idle: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  playing: 'bg-sky-50 text-sky-900 border-sky-200',
  gameover: 'bg-red-50 text-red-900 border-red-200',
  victory: 'bg-amber-50 text-amber-900 border-amber-200',
};

export function StatusBanner({
  message,
  state,
}: {
  message: string;
  state: StatusState;
}) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${statusStyles[state]}`}
    >
      {message}
    </p>
  );
}

export function Kbd({ children }: { children: string }) {
  return (
    <kbd className="rounded border border-emerald-200 bg-white px-1.5 py-0.5 font-mono text-xs shadow-sm">
      {children}
    </kbd>
  );
}

export function HintList() {
  return (
    <ul className="space-y-1.5 text-sm text-emerald-800/80">
      <li>
        <Kbd>↑</Kbd> <Kbd>↓</Kbd> <Kbd>←</Kbd> <Kbd>→</Kbd> Steer the snake
      </li>
      <li><Kbd>Space</Kbd> Start, pause, or resume</li>
      <li>Hold an arrow key ~0.2s for 5× speed</li>
    </ul>
  );
}

export function GameButtons({
  onStart,
  onReset,
}: {
  onStart: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onStart}
        className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
      >
        Start
      </button>
      <button
        type="button"
        onClick={onReset}
        className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
      >
        Stop
      </button>
    </div>
  );
}

export function SpeedBadge({ active }: { active: boolean }) {
  return (
    <p
      aria-live="polite"
      className={`mt-2 text-center text-xs font-semibold transition-opacity ${
        active
          ? 'text-amber-600 opacity-100'
          : 'text-emerald-700/50 opacity-60'
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
    <section className="rounded-xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
      {title && (
        <h2
          id={id}
          className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700/70"
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
    <div className="rounded-xl border border-emerald-100 bg-white/80 p-3 text-center shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700/70">
        {label}
      </span>
      <p className="mt-1 text-2xl font-bold text-emerald-900">
        {value}
        {suffix && (
          <span className="text-base font-medium text-emerald-600">{suffix}</span>
        )}
      </p>
    </div>
  );
}
