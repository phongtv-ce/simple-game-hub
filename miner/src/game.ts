export type CellState = 'hidden' | 'revealed' | 'flagged';

export interface Cell {
  mine: boolean;
  adjacent: number;
  state: CellState;
}

export type Board = Cell[][];

export type GameStatus = 'ready' | 'playing' | 'won' | 'lost';

export interface Difficulty {
  id: string;
  label: string;
  rows: number;
  cols: number;
  mines: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'beginner', label: 'Beginner', rows: 9, cols: 9, mines: 10 },
  { id: 'intermediate', label: 'Intermediate', rows: 16, cols: 16, mines: 40 },
  { id: 'expert', label: 'Expert', rows: 16, cols: 30, mines: 99 },
];

export function createEmptyBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ mine: false, adjacent: 0, state: 'hidden' as CellState })),
  );
}

const NEIGHBOURS = [-1, 0, 1];

function forEachNeighbour(board: Board, row: number, col: number, fn: (r: number, c: number) => void) {
  for (const dr of NEIGHBOURS) {
    for (const dc of NEIGHBOURS) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < board.length && c >= 0 && c < board[0].length) fn(r, c);
    }
  }
}

/** Mines are placed after the first click so the first move is never a loss. */
export function placeMines(board: Board, mines: number, safeRow: number, safeCol: number): Board {
  const rows = board.length;
  const cols = board[0].length;
  const next = board.map((row) => row.map((cell) => ({ ...cell })));

  const candidates: number[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1) continue;
      candidates.push(r * cols + c);
    }
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  for (const index of candidates.slice(0, Math.min(mines, candidates.length))) {
    next[Math.floor(index / cols)][index % cols].mine = true;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let count = 0;
      forEachNeighbour(next, r, c, (nr, nc) => {
        if (next[nr][nc].mine) count++;
      });
      next[r][c].adjacent = count;
    }
  }

  return next;
}

export function revealCell(board: Board, row: number, col: number): Board {
  const next = board.map((r) => r.map((cell) => ({ ...cell })));
  const stack: [number, number][] = [[row, col]];

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    const cell = next[r][c];
    if (cell.state !== 'hidden') continue;
    cell.state = 'revealed';
    if (!cell.mine && cell.adjacent === 0) {
      forEachNeighbour(next, r, c, (nr, nc) => {
        if (next[nr][nc].state === 'hidden') stack.push([nr, nc]);
      });
    }
  }

  return next;
}

/** Reveals hidden neighbours when the flag count around a revealed number matches it. */
export function chordCell(board: Board, row: number, col: number): Board {
  const cell = board[row][col];
  if (cell.state !== 'revealed' || cell.adjacent === 0) return board;

  let flags = 0;
  forEachNeighbour(board, row, col, (r, c) => {
    if (board[r][c].state === 'flagged') flags++;
  });
  if (flags !== cell.adjacent) return board;

  let next = board;
  forEachNeighbour(board, row, col, (r, c) => {
    if (next[r][c].state === 'hidden') next = revealCell(next, r, c);
  });
  return next;
}

export function toggleFlag(board: Board, row: number, col: number): Board {
  const cell = board[row][col];
  if (cell.state === 'revealed') return board;
  const next = board.map((r) => r.map((c) => ({ ...c })));
  next[row][col].state = cell.state === 'flagged' ? 'hidden' : 'flagged';
  return next;
}

export function revealAllMines(board: Board): Board {
  return board.map((row) =>
    row.map((cell) => (cell.mine && cell.state !== 'flagged' ? { ...cell, state: 'revealed' } : cell)),
  );
}

export function hasHitMine(board: Board): boolean {
  return board.some((row) => row.some((cell) => cell.mine && cell.state === 'revealed'));
}

export function isCleared(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell.mine || cell.state === 'revealed'));
}

export function countFlags(board: Board): number {
  return board.reduce(
    (total, row) => total + row.filter((cell) => cell.state === 'flagged').length,
    0,
  );
}
