export const CELL_EMPTY = 0;
export const PLAYER_X = 1;
export const PLAYER_O = 2;

export type CellValue = typeof CELL_EMPTY | typeof PLAYER_X | typeof PLAYER_O;
export type Player = typeof PLAYER_X | typeof PLAYER_O;
export type Board = CellValue[][];
export type BoardPosition = { row: number; column: number };

export const MIN_BOARD_SIZE = 3;
export const MAX_BOARD_SIZE = 15;
export const DEFAULT_BOARD_SIZE = 3;

export const PLAYER_MARKS: Record<Player, string> = {
  [PLAYER_X]: 'X',
  [PLAYER_O]: 'O',
};

export const PLAYER_LABELS: Record<Player, string> = {
  [PLAYER_X]: 'X',
  [PLAYER_O]: 'O',
};

export type GameState = {
  boardSize: number;
  board: Board;
  activePlayer: Player;
  isGameOver: boolean;
  winner: CellValue;
  winningCells: BoardPosition[];
  statusMessage: string;
};

export function createEmptyBoard(size: number): Board {
  return Array.from({ length: size }, () => Array<CellValue>(size).fill(CELL_EMPTY));
}

function winnerOfLine(line: CellValue[]): CellValue {
  const first = line[0];
  if (first === CELL_EMPTY) {
    return CELL_EMPTY;
  }
  return line.every((cell) => cell === first) ? first : CELL_EMPTY;
}

function column(board: Board, colIndex: number): CellValue[] {
  return board.map((row) => row[colIndex]);
}

function mainDiagonal(board: Board): CellValue[] {
  return board.map((row, index) => row[index]);
}

function antiDiagonal(board: Board): CellValue[] {
  const size = board.length;
  return board.map((row, index) => row[size - 1 - index]);
}

function allLines(board: Board): CellValue[][] {
  const size = board.length;
  const lines = [...board];
  for (let index = 0; index < size; index += 1) {
    lines.push(column(board, index));
  }
  lines.push(mainDiagonal(board), antiDiagonal(board));
  return lines;
}

function positionsForLine(board: Board, lineIndex: number): BoardPosition[] {
  const size = board.length;
  const lineCount = size + 2;

  if (lineIndex < size) {
    return Array.from({ length: size }, (_, column) => ({ row: lineIndex, column }));
  }

  const columnIndex = lineIndex - size;
  if (columnIndex < size) {
    return Array.from({ length: size }, (_, row) => ({ row, column: columnIndex }));
  }

  if (lineIndex === lineCount - 2) {
    return Array.from({ length: size }, (_, index) => ({ row: index, column: index }));
  }

  return Array.from({ length: size }, (_, index) => ({
    row: index,
    column: size - 1 - index,
  }));
}

export function findWinner(board: Board): { winner: CellValue; winningCells: BoardPosition[] } {
  const lines = allLines(board);

  for (let index = 0; index < lines.length; index += 1) {
    const winner = winnerOfLine(lines[index]);
    if (winner !== CELL_EMPTY) {
      return { winner, winningCells: positionsForLine(board, index) };
    }
  }

  return { winner: CELL_EMPTY, winningCells: [] };
}

export function isBoardFull(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell !== CELL_EMPTY));
}

export function isValidBoardSize(value: number): boolean {
  return Number.isInteger(value) && value >= MIN_BOARD_SIZE && value <= MAX_BOARD_SIZE;
}

export function getInitialState(boardSize: number): GameState {
  return {
    boardSize,
    board: createEmptyBoard(boardSize),
    activePlayer: PLAYER_X,
    isGameOver: false,
    winner: CELL_EMPTY,
    winningCells: [],
    statusMessage: `${PLAYER_LABELS[PLAYER_X]}'s turn`,
  };
}

export function applyMove(state: GameState, row: number, column: number): GameState {
  if (state.isGameOver || state.board[row][column] !== CELL_EMPTY) {
    return state;
  }

  const nextBoard = state.board.map((boardRow, rowIndex) =>
    boardRow.map((cell, columnIndex) =>
      rowIndex === row && columnIndex === column ? state.activePlayer : cell,
    ),
  );

  const { winner, winningCells } = findWinner(nextBoard);
  if (winner !== CELL_EMPTY) {
    return {
      ...state,
      board: nextBoard,
      isGameOver: true,
      winner,
      winningCells,
      statusMessage: `${PLAYER_LABELS[winner as Player]} wins!`,
    };
  }

  if (isBoardFull(nextBoard)) {
    return {
      ...state,
      board: nextBoard,
      isGameOver: true,
      statusMessage: "It's a draw!",
    };
  }

  const nextPlayer = state.activePlayer === PLAYER_X ? PLAYER_O : PLAYER_X;

  return {
    ...state,
    board: nextBoard,
    activePlayer: nextPlayer,
    statusMessage: `${PLAYER_LABELS[nextPlayer]}'s turn`,
  };
}
