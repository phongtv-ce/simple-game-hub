type GameThumbnailProps = {
  id: string;
  accent: string;
};

export function GameThumbnail({ id, accent }: GameThumbnailProps) {
  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br ${accent} shadow-inner`}
      aria-hidden
    >
      <div className="absolute inset-0 bg-slate-950/25" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {id === 'snake' && <SnakeThumb />}
        {id === 'tetris' && <TetrisThumb />}
        {id === 'tic-tac-toe' && <TicTacToeThumb />}
        {id === 'five-in-a-row' && <FiveInARowThumb />}
        {id === 'miner' && <MinerThumb />}
        {id === 'sudoku' && <SudokuThumb />}
      </div>
    </div>
  );
}

function SnakeThumb() {
  return (
    <div className="grid h-full w-full max-w-[7.5rem] grid-cols-8 grid-rows-8 gap-px rounded-md bg-slate-900/80 p-1.5 shadow-lg">
      {Array.from({ length: 64 }, (_, i) => {
        const row = Math.floor(i / 8);
        const col = i % 8;
        const isSnake =
          (row === 4 && col >= 2 && col <= 5) ||
          (col === 5 && row >= 2 && row <= 4) ||
          (row === 2 && col >= 5 && col <= 6);
        const isHead = row === 2 && col === 6;
        const isFood = row === 6 && col === 3;

        return (
          <div
            key={i}
            className={`rounded-[2px] ${
              isHead
                ? 'bg-emerald-300 ring-1 ring-emerald-100'
                : isSnake
                  ? 'bg-emerald-500'
                  : isFood
                    ? 'bg-red-400'
                    : 'bg-slate-800/60'
            }`}
          />
        );
      })}
    </div>
  );
}

function TetrisThumb() {
  const cells = [
    [0, 0, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 2, 2, 2, 0, 0, 0, 0],
    [0, 0, 2, 0, 0, 3, 3, 0],
    [0, 0, 0, 0, 0, 3, 3, 0],
    [4, 4, 0, 0, 5, 5, 5, 0],
    [4, 4, 0, 0, 0, 5, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  const colors: Record<number, string> = {
    1: 'bg-cyan-400',
    2: 'bg-purple-500',
    3: 'bg-yellow-400',
    4: 'bg-orange-500',
    5: 'bg-green-500',
  };

  return (
    <div className="grid h-full w-full max-w-[7.5rem] grid-cols-8 grid-rows-8 gap-px rounded-md border-2 border-slate-600 bg-slate-800 p-1 shadow-lg">
      {cells.flatMap((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            className={`rounded-[1px] ${cell ? colors[cell] : 'bg-slate-950/70'}`}
          />
        )),
      )}
    </div>
  );
}

function TicTacToeThumb() {
  const marks = ['X', '', 'O', '', 'X', '', 'O', '', 'X'];

  return (
    <div className="grid h-full w-full max-w-[6.5rem] grid-cols-3 grid-rows-3 gap-1 rounded-md bg-slate-900/85 p-2 shadow-lg">
      {marks.map((mark, i) => (
        <div
          key={i}
          className="flex items-center justify-center rounded bg-slate-950/70 text-sm font-black"
        >
          <span
            className={
              mark === 'X' ? 'text-red-400' : mark === 'O' ? 'text-slate-100' : 'text-transparent'
            }
          >
            {mark || '.'}
          </span>
        </div>
      ))}
    </div>
  );
}

function FiveInARowThumb() {
  const marks: Record<string, 'X' | 'O'> = {
    '3-3': 'X',
    '3-4': 'X',
    '3-5': 'X',
    '3-6': 'X',
    '3-7': 'X',
    '4-4': 'O',
    '5-5': 'O',
    '2-6': 'O',
  };

  return (
    <div className="grid h-full w-full max-w-[7rem] grid-cols-7 grid-rows-7 gap-px rounded-md bg-slate-900/85 p-1.5 shadow-lg">
      {Array.from({ length: 49 }, (_, i) => {
        const row = Math.floor(i / 7);
        const col = i % 7;
        const mark = marks[`${row}-${col}`];

        return (
          <div
            key={i}
            className="flex items-center justify-center rounded-[1px] bg-slate-950/60 text-[8px] font-black"
          >
            {mark && (
              <span className={mark === 'X' ? 'text-red-400' : 'text-slate-200'}>{mark}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MinerThumb() {
  const board = [
    ['f', 'h', 'h', '1', 'f', 'h'],
    ['h', '2', 'f', '1', 'h', 'h'],
    ['h', 'h', '3', 'f', '2', 'h'],
    ['1', '1', 'f', 'h', 'h', 'h'],
    ['h', 'h', '2', 'f', '1', 'h'],
    ['f', 'h', 'h', 'h', 'h', 'h'],
  ] as const;

  return (
    <div className="grid h-full w-full max-w-[7rem] grid-cols-6 grid-rows-6 gap-px rounded-md bg-slate-700 p-1 shadow-lg">
      {board.flatMap((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            className={`flex items-center justify-center rounded-[2px] text-[9px] font-bold ${
              cell === 'h'
                ? 'bg-slate-500'
                : cell === 'f'
                  ? 'bg-slate-500 text-base leading-none'
                  : 'bg-slate-200 text-blue-700'
            }`}
          >
            {cell === 'f' ? '🚩' : cell === 'h' ? '' : cell}
          </div>
        )),
      )}
    </div>
  );
}

function SudokuThumb() {
  const values = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ];

  return (
    <div className="grid h-full w-full max-w-[7.5rem] grid-cols-9 grid-rows-9 gap-px overflow-hidden rounded-md bg-slate-700 p-0.5 shadow-lg">
      {values.flatMap((row, r) =>
        row.map((value, c) => (
          <div
            key={`${r}-${c}`}
            className={`flex items-center justify-center bg-slate-900 text-[7px] font-semibold ${
              value ? 'text-indigo-200' : 'text-transparent'
            } ${c % 3 === 0 && c > 0 ? 'border-l border-slate-600' : ''} ${
              r % 3 === 0 && r > 0 ? 'border-t border-slate-600' : ''
            }`}
          >
            {value || ''}
          </div>
        )),
      )}
    </div>
  );
}
