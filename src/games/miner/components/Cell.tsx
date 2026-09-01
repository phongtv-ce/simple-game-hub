import type { Cell as CellModel } from '../logic/game';

const NUMBER_COLORS = [
  '',
  'text-blue-600',
  'text-green-700',
  'text-red-600',
  'text-indigo-800',
  'text-amber-700',
  'text-teal-600',
  'text-slate-800',
  'text-slate-500',
];

interface CellProps {
  cell: CellModel;
  disabled: boolean;
  onReveal: () => void;
  onFlag: () => void;
  onChord: () => void;
}

export default function Cell({ cell, disabled, onReveal, onFlag, onChord }: CellProps) {
  const revealed = cell.state === 'revealed';
  const base =
    'flex h-7 w-7 items-center justify-center rounded-[3px] text-sm font-bold select-none transition-colors sm:h-8 sm:w-8';

  if (revealed) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onChord}
        className={`${base} ${cell.mine ? 'bg-red-500 text-white' : 'bg-slate-200'} ${NUMBER_COLORS[cell.adjacent]}`}
      >
        {cell.mine ? '💣' : cell.adjacent > 0 ? cell.adjacent : ''}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onReveal}
      onContextMenu={(event) => {
        event.preventDefault();
        onFlag();
      }}
      className={`${base} bg-slate-400 shadow-inner hover:bg-slate-300 disabled:hover:bg-slate-400`}
    >
      {cell.state === 'flagged' ? '🚩' : ''}
    </button>
  );
}
