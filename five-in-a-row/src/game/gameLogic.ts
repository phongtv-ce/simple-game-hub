import {
  CELL_EMPTY,
  PLAYER_X,
  PLAYER_O,
  type Board,
  type BoardPosition,
  type Player,
} from './types';

export {
  CELL_EMPTY,
  PLAYER_X,
  PLAYER_O,
  type Board,
  type BoardPosition,
  type CellValue,
  type GameState,
  type Player,
} from './types';

export const WIN_LENGTH = 5;
export const MIN_BOARD_SIZE = 5;
export const MAX_BOARD_SIZE = 19;
export const DEFAULT_BOARD_SIZE = 15;

export const PLAYER_MARKS: Record<Player, string> = {
  [PLAYER_X]: 'X',
  [PLAYER_O]: 'O',
};

export const PLAYER_LABELS: Record<Player, string> = {
  [PLAYER_X]: 'X',
  [PLAYER_O]: 'O',
};

const AI_DIRECTIONS: [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

export function createEmptyBoard(size: number): Board {
  return Array.from({ length: size }, () => Array(size).fill(CELL_EMPTY));
}

export function countInDirection(
  board: Board,
  row: number,
  column: number,
  rowStep: number,
  columnStep: number,
  player: Player,
): number {
  const size = board.length;
  let count = 0;

  let currentRow = row + rowStep;
  let currentColumn = column + columnStep;

  while (
    currentRow >= 0 &&
    currentRow < size &&
    currentColumn >= 0 &&
    currentColumn < size &&
    board[currentRow][currentColumn] === player
  ) {
    count += 1;
    currentRow += rowStep;
    currentColumn += columnStep;
  }

  return count;
}

export function checkWin(
  board: Board,
  row: number,
  column: number,
  player: Player,
): boolean {
  return AI_DIRECTIONS.some(([rowStep, columnStep]) => {
    const forward = countInDirection(board, row, column, rowStep, columnStep, player);
    const backward = countInDirection(board, row, column, -rowStep, -columnStep, player);
    return forward + backward + 1 >= WIN_LENGTH;
  });
}

export function isBoardFull(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell !== CELL_EMPTY));
}

export function getWinningCells(
  board: Board,
  row: number,
  column: number,
  player: Player,
): BoardPosition[] {
  for (const [rowStep, columnStep] of AI_DIRECTIONS) {
    const cells: BoardPosition[] = [{ row, column }];

    let currentRow = row + rowStep;
    let currentColumn = column + columnStep;
    while (
      currentRow >= 0 &&
      currentRow < board.length &&
      currentColumn >= 0 &&
      currentColumn < board.length &&
      board[currentRow][currentColumn] === player
    ) {
      cells.push({ row: currentRow, column: currentColumn });
      currentRow += rowStep;
      currentColumn += columnStep;
    }

    currentRow = row - rowStep;
    currentColumn = column - columnStep;
    while (
      currentRow >= 0 &&
      currentRow < board.length &&
      currentColumn >= 0 &&
      currentColumn < board.length &&
      board[currentRow][currentColumn] === player
    ) {
      cells.push({ row: currentRow, column: currentColumn });
      currentRow -= rowStep;
      currentColumn -= columnStep;
    }

    if (cells.length >= WIN_LENGTH) {
      return cells;
    }
  }

  return [];
}

function isInsideBoard(board: Board, row: number, column: number): boolean {
  return row >= 0 && row < board.length && column >= 0 && column < board.length;
}

function cloneBoardWithMove(
  board: Board,
  row: number,
  column: number,
  player: Player,
): Board {
  return board.map((boardRow, rowIndex) =>
    boardRow.map((cell, columnIndex) =>
      rowIndex === row && columnIndex === column ? player : cell,
    ),
  );
}

function hasNearbyStone(board: Board, row: number, column: number): boolean {
  for (let rowOffset = -2; rowOffset <= 2; rowOffset += 1) {
    for (let columnOffset = -2; columnOffset <= 2; columnOffset += 1) {
      if (rowOffset === 0 && columnOffset === 0) {
        continue;
      }

      const nextRow = row + rowOffset;
      const nextColumn = column + columnOffset;
      if (isInsideBoard(board, nextRow, nextColumn) && board[nextRow][nextColumn] !== CELL_EMPTY) {
        return true;
      }
    }
  }

  return false;
}

function getOpenEnds(
  board: Board,
  row: number,
  column: number,
  rowStep: number,
  columnStep: number,
  player: Player,
): number {
  const forward = countInDirection(board, row, column, rowStep, columnStep, player);
  const backward = countInDirection(board, row, column, -rowStep, -columnStep, player);

  let openEnds = 0;
  const forwardRow = row + (forward + 1) * rowStep;
  const forwardColumn = column + (forward + 1) * columnStep;
  const backwardRow = row - (backward + 1) * rowStep;
  const backwardColumn = column - (backward + 1) * columnStep;

  if (
    isInsideBoard(board, forwardRow, forwardColumn) &&
    board[forwardRow][forwardColumn] === CELL_EMPTY
  ) {
    openEnds += 1;
  }

  if (
    isInsideBoard(board, backwardRow, backwardColumn) &&
    board[backwardRow][backwardColumn] === CELL_EMPTY
  ) {
    openEnds += 1;
  }

  return openEnds;
}

function scoreMoveForPlayer(
  board: Board,
  row: number,
  column: number,
  player: Player,
): number {
  const boardWithMove = cloneBoardWithMove(board, row, column, player);
  if (checkWin(boardWithMove, row, column, player)) {
    return 1_000_000;
  }

  const center = (board.length - 1) / 2;
  const centerDistance = Math.abs(row - center) + Math.abs(column - center);
  let score = Math.max(0, 24 - centerDistance * 2);

  for (const [rowStep, columnStep] of AI_DIRECTIONS) {
    const forward = countInDirection(boardWithMove, row, column, rowStep, columnStep, player);
    const backward = countInDirection(
      boardWithMove,
      row,
      column,
      -rowStep,
      -columnStep,
      player,
    );
    const lineLength = forward + backward + 1;
    const openEnds = getOpenEnds(boardWithMove, row, column, rowStep, columnStep, player);

    score += lineLength * lineLength * 14 + openEnds * 10;
    if (lineLength >= 4) {
      score += 120;
    } else if (lineLength === 3) {
      score += 45;
    }
  }

  return score;
}

export function getBestAiMove(board: Board, aiPlayer: Player): BoardPosition | null {
  const opponent = aiPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
  const candidateMoves: BoardPosition[] = [];

  for (let row = 0; row < board.length; row += 1) {
    for (let column = 0; column < board.length; column += 1) {
      if (board[row][column] !== CELL_EMPTY) {
        continue;
      }

      // Ignore isolated cells so the AI spends time around active lines instead
      // of evaluating the entire board every turn.
      if (hasNearbyStone(board, row, column)) {
        candidateMoves.push({ row, column });
      }
    }
  }

  if (candidateMoves.length === 0) {
    const center = Math.floor(board.length / 2);
    return { row: center, column: center };
  }

  for (const move of candidateMoves) {
    const boardWithMove = cloneBoardWithMove(board, move.row, move.column, aiPlayer);
    if (checkWin(boardWithMove, move.row, move.column, aiPlayer)) {
      return move;
    }
  }

  for (const move of candidateMoves) {
    const boardWithMove = cloneBoardWithMove(board, move.row, move.column, opponent);
    if (checkWin(boardWithMove, move.row, move.column, opponent)) {
      return move;
    }
  }

  let bestMove = candidateMoves[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const move of candidateMoves) {
    const attackScore = scoreMoveForPlayer(board, move.row, move.column, aiPlayer);
    const defenseScore = scoreMoveForPlayer(board, move.row, move.column, opponent);
    // Bias slightly toward building the AI's own threats once immediate wins and
    // blocks have already been handled.
    const totalScore = attackScore * 1.15 + defenseScore;

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestMove = move;
    }
  }

  return bestMove;
}
