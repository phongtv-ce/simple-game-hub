export const CELL_EMPTY = 0;
export const PLAYER_X = 1;
export const PLAYER_O = 2;

export type CellValue = typeof CELL_EMPTY | typeof PLAYER_X | typeof PLAYER_O;
export type Player = typeof PLAYER_X | typeof PLAYER_O;

export type Board = CellValue[][];

export interface BoardPosition {
  row: number;
  column: number;
}

export interface GameState {
  boardSize: number;
  board: Board;
  activePlayer: Player;
  isGameOver: boolean;
  winner: CellValue;
  winningCells: BoardPosition[];
  statusMessage: string;
}
