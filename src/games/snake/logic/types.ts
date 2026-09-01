export type Direction = 'left' | 'right' | 'up' | 'down';

export type GameMode = 'walls' | 'wrap';

export type MoveStatus = 'idle' | 'moved' | 'ate' | 'gameOver';

export type StatusState = 'idle' | 'playing' | 'gameover' | 'victory';

export type Position = { x: number; y: number };

export const Cell = {
  EMPTY: 0,
  SOLID: 1,
  PASS_THROUGH: 2,
} as const;

export type CellType = (typeof Cell)[keyof typeof Cell];

export type MazeTheme = {
  id: string;
  title: string;
  empty: string;
  solidFill: string;
  solidStroke: string;
  passFill: string;
  passStroke: string;
};

export type Scene = {
  title: string;
  start: Position;
  direction?: Direction;
  initialLength?: number;
  tickMs?: number;
  cells: CellType[][];
  description: string;
};

export type GameVariant = 'classic' | 'maze';
