import type { Board } from '../logic/sudoku';

type SudokuBoardProps = {
  board: Board;
  puzzle: Board;
  notes: Record<number, number[]>;
  selected: number | null;
  selectedValue: number;
  conflicts: Set<number>;
  onSelect: (index: number) => void;
};

export function SudokuBoard({
  board,
  puzzle,
  notes,
  selected,
  selectedValue,
  conflicts,
  onSelect,
}: SudokuBoardProps) {
  return (
    <div className="grid grid-cols-9 overflow-hidden rounded-xl bg-slate-900 ring-2 ring-slate-700 select-none">
      {board.map((value, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        const given = puzzle[index] !== 0;
        const isSelected = selected === index;
        const sameValue = value !== 0 && value === selectedValue;
        const inPeerLine =
          selected !== null &&
          (Math.floor(selected / 9) === row ||
            selected % 9 === col ||
            (Math.floor(row / 3) === Math.floor(Math.floor(selected / 9) / 3) &&
              Math.floor(col / 3) === Math.floor((selected % 9) / 3)));
        const conflict = conflicts.has(index);
        const cellNotes = notes[index] ?? [];

        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            className={[
              'relative aspect-square text-lg font-semibold transition-colors',
              'border border-slate-800',
              col % 3 === 0 && col !== 0 ? 'border-l-2 border-l-slate-600' : '',
              row % 3 === 0 && row !== 0 ? 'border-t-2 border-t-slate-600' : '',
              isSelected
                ? 'bg-indigo-500/30'
                : sameValue
                  ? 'bg-indigo-500/15'
                  : inPeerLine
                    ? 'bg-slate-800/60'
                    : 'bg-slate-900',
              conflict ? 'text-rose-400' : given ? 'text-slate-100' : 'text-indigo-300',
            ].join(' ')}
          >
            {value !== 0 ? (
              value
            ) : cellNotes.length > 0 ? (
              <span className="absolute inset-0.5 grid grid-cols-3 grid-rows-3 text-[0.5rem] leading-none text-slate-400">
                {Array.from({ length: 9 }, (_, n) => (
                  <span key={n} className="grid place-items-center">
                    {cellNotes.includes(n + 1) ? n + 1 : ''}
                  </span>
                ))}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
