export const COLS = 10;
export const ROWS = 20;

export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type Cell = PieceType | null;

export type Piece = {
  type: PieceType;
  shape: number[][];
  row: number;
  col: number;
};

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

export type GameState = {
  board: Cell[][];
  active: Piece | null;
  next: PieceType;
  hold: PieceType | null;
  canHold: boolean;
  score: number;
  lines: number;
  level: number;
  status: GameStatus;
};

const SHAPES: Record<PieceType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

export const PIECE_COLORS: Record<PieceType, string> = {
  I: 'bg-cyan-400',
  O: 'bg-yellow-400',
  T: 'bg-purple-500',
  S: 'bg-green-500',
  Z: 'bg-red-500',
  J: 'bg-blue-500',
  L: 'bg-orange-500',
};

const PIECE_TYPES: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

const LINE_SCORES = [0, 100, 300, 500, 800];

export function createEmptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null));
}

export function randomPieceType(): PieceType {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]!;
}

export function createPiece(type: PieceType): Piece {
  const shape = SHAPES[type].map((row) => [...row]);
  return {
    type,
    shape,
    row: type === 'I' ? -1 : 0,
    col: Math.floor((COLS - shape[0]!.length) / 2),
  };
}

export function clonePiece(piece: Piece): Piece {
  return {
    type: piece.type,
    shape: piece.shape.map((row) => [...row]),
    row: piece.row,
    col: piece.col,
  };
}

export function rotateShape(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0]!.length;
  const rotated = Array.from({ length: cols }, () => Array<number>(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c]![rows - 1 - r] = shape[r]![c]!;
    }
  }
  return rotated;
}

function collides(board: Cell[][], piece: Piece): boolean {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r]!.length; c++) {
      if (!piece.shape[r]![c]) continue;
      const boardRow = piece.row + r;
      const boardCol = piece.col + c;
      if (boardCol < 0 || boardCol >= COLS || boardRow >= ROWS) return true;
      if (boardRow >= 0 && board[boardRow]![boardCol]) return true;
    }
  }
  return false;
}

export function isValid(board: Cell[][], piece: Piece): boolean {
  return !collides(board, piece);
}

export function movePiece(board: Cell[][], piece: Piece, dRow: number, dCol: number): Piece | null {
  const moved = { ...piece, row: piece.row + dRow, col: piece.col + dCol };
  return isValid(board, moved) ? moved : null;
}

export function rotatePiece(board: Cell[][], piece: Piece): Piece | null {
  const rotated = {
    ...piece,
    shape: rotateShape(piece.shape),
  };
  if (isValid(board, rotated)) return rotated;

  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    const kicked = { ...rotated, col: rotated.col + kick };
    if (isValid(board, kicked)) return kicked;
  }
  return null;
}

export function lockPiece(board: Cell[][], piece: Piece): Cell[][] {
  const next = board.map((row) => [...row]);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r]!.length; c++) {
      if (!piece.shape[r]![c]) continue;
      const boardRow = piece.row + r;
      const boardCol = piece.col + c;
      if (boardRow >= 0 && boardRow < ROWS && boardCol >= 0 && boardCol < COLS) {
        next[boardRow]![boardCol] = piece.type;
      }
    }
  }
  return next;
}

export function clearLines(board: Cell[][]): { board: Cell[][]; cleared: number } {
  const remaining = board.filter((row) => row.some((cell) => cell === null));
  const cleared = ROWS - remaining.length;
  while (remaining.length < ROWS) {
    remaining.unshift(Array<Cell>(COLS).fill(null));
  }
  return { board: remaining, cleared };
}

export function mergeBoard(board: Cell[][], piece: Piece | null): Cell[][] {
  if (!piece) return board;
  const merged = board.map((row) => [...row]);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r]!.length; c++) {
      if (!piece.shape[r]![c]) continue;
      const boardRow = piece.row + r;
      const boardCol = piece.col + c;
      if (boardRow >= 0 && boardRow < ROWS && boardCol >= 0 && boardCol < COLS) {
        merged[boardRow]![boardCol] = piece.type;
      }
    }
  }
  return merged;
}

export function dropDistance(board: Cell[][], piece: Piece): number {
  let distance = 0;
  while (movePiece(board, piece, distance + 1, 0)) {
    distance++;
  }
  return distance;
}

export function spawnBlocked(board: Cell[][], piece: Piece): boolean {
  return !isValid(board, piece);
}

export function initialState(): GameState {
  const next = randomPieceType();
  const active = createPiece(next);
  return {
    board: createEmptyBoard(),
    active,
    next: randomPieceType(),
    hold: null,
    canHold: true,
    score: 0,
    lines: 0,
    level: 1,
    status: 'idle',
  };
}

export function startGame(): GameState {
  const next = randomPieceType();
  const active = createPiece(next);
  const board = createEmptyBoard();
  const blocked = spawnBlocked(board, active);
  return {
    board,
    active: blocked ? null : active,
    next: randomPieceType(),
    hold: null,
    canHold: true,
    score: 0,
    lines: 0,
    level: 1,
    status: blocked ? 'gameover' : 'playing',
  };
}

export function tick(state: GameState): GameState {
  if (state.status !== 'playing' || !state.active) return state;

  const moved = movePiece(state.board, state.active, 1, 0);
  if (moved) {
    return { ...state, active: moved };
  }

  return lockAndSpawn(state);
}

export function hardDrop(state: GameState): GameState {
  if (state.status !== 'playing' || !state.active) return state;

  const distance = dropDistance(state.board, state.active);
  const dropped = {
    ...state.active,
    row: state.active.row + distance,
  };

  return lockAndSpawn({ ...state, active: dropped }, distance * 2);
}

export function softDrop(state: GameState): GameState {
  if (state.status !== 'playing' || !state.active) return state;

  const moved = movePiece(state.board, state.active, 1, 0);
  if (!moved) return lockAndSpawn(state);

  return {
    ...state,
    active: moved,
    score: state.score + 1,
  };
}

export function moveHorizontal(state: GameState, direction: -1 | 1): GameState {
  if (state.status !== 'playing' || !state.active) return state;
  const moved = movePiece(state.board, state.active, 0, direction);
  return moved ? { ...state, active: moved } : state;
}

export function rotateActive(state: GameState): GameState {
  if (state.status !== 'playing' || !state.active) return state;
  const rotated = rotatePiece(state.board, state.active);
  return rotated ? { ...state, active: rotated } : state;
}

export function holdPiece(state: GameState): GameState {
  if (state.status !== 'playing' || !state.active || !state.canHold) return state;

  const currentType = state.active.type;
  if (state.hold) {
    const swapped = createPiece(state.hold);
    if (spawnBlocked(state.board, swapped)) {
      return { ...state, status: 'gameover', active: null };
    }
    return {
      ...state,
      active: swapped,
      hold: currentType,
      canHold: false,
    };
  }

  const newActive = createPiece(state.next);
  if (spawnBlocked(state.board, newActive)) {
    return { ...state, hold: currentType, active: null, status: 'gameover', canHold: false };
  }

  return {
    ...state,
    active: newActive,
    next: randomPieceType(),
    hold: currentType,
    canHold: false,
  };
}

function lockAndSpawn(state: GameState, bonus = 0): GameState {
  if (!state.active) return state;

  const locked = lockPiece(state.board, state.active);
  const { board, cleared } = clearLines(locked);
  const lines = state.lines + cleared;
  const level = Math.floor(lines / 10) + 1;
  const score = state.score + bonus + LINE_SCORES[cleared]! * level;

  const nextActive = createPiece(state.next);
  if (spawnBlocked(board, nextActive)) {
    return {
      ...state,
      board,
      active: null,
      next: randomPieceType(),
      score,
      lines,
      level,
      status: 'gameover',
    };
  }

  return {
    ...state,
    board,
    active: nextActive,
    next: randomPieceType(),
    canHold: true,
    score,
    lines,
    level,
  };
}

export function dropIntervalMs(level: number): number {
  return Math.max(100, 800 - (level - 1) * 60);
}

export function shapeForPreview(type: PieceType): number[][] {
  return SHAPES[type].map((row) => [...row]);
}
