export type GameMeta = {
  id: string;
  title: string;
  description: string;
  path: string;
  accent: string;
};

export const GAMES: GameMeta[] = [
  {
    id: 'snake',
    title: 'Snake',
    description: 'Classic snake and maze mode with multiple stages.',
    path: '/snake',
    accent: 'from-emerald-400 to-green-600',
  },
  {
    id: 'tetris',
    title: 'Tetris',
    description: 'Clear lines, hold pieces, and climb levels.',
    path: '/tetris',
    accent: 'from-cyan-400 to-purple-500',
  },
  {
    id: 'tic-tac-toe',
    title: 'Tic-Tac-Toe',
    description: 'Two-player N×N tic-tac-toe with configurable board size.',
    path: '/tic-tac-toe',
    accent: 'from-rose-400 to-red-600',
  },
  {
    id: 'five-in-a-row',
    title: 'Five in a Row',
    description: 'Gomoku-style connect-five vs computer or a friend.',
    path: '/five-in-a-row',
    accent: 'from-sky-400 to-blue-600',
  },
  {
    id: 'miner',
    title: 'Miner',
    description: 'Minesweeper with flags, chording, and three difficulties.',
    path: '/miner',
    accent: 'from-amber-400 to-orange-600',
  },
  {
    id: 'sudoku',
    title: 'Sudoku',
    description: 'Number puzzle with notes, hints, and four difficulty levels.',
    path: '/sudoku',
    accent: 'from-indigo-400 to-violet-600',
  },
];

export function getGameById(id: string): GameMeta | undefined {
  return GAMES.find((game) => game.id === id);
}
