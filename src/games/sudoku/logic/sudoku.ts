export type Board = number[]; // length 81, 0 = empty

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export const CLUES_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 45,
  medium: 36,
  hard: 30,
  expert: 26,
};

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const isPlacementValid = (
  board: Board,
  index: number,
  value: number,
): boolean => {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 9; i++) {
    if (i !== col && board[row * 9 + i] === value) return false;
    if (i !== row && board[i * 9 + col] === value) return false;
  }
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      const i = r * 9 + c;
      if (i !== index && board[i] === value) return false;
    }
  }
  return true;
};

const fillBoard = (board: Board): boolean => {
  const index = board.indexOf(0);
  if (index === -1) return true;
  for (const value of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (isPlacementValid(board, index, value)) {
      board[index] = value;
      if (fillBoard(board)) return true;
      board[index] = 0;
    }
  }
  return false;
};

/** Counts solutions, stopping early once `limit` is reached. */
const countSolutions = (board: Board, limit = 2): number => {
  const index = board.indexOf(0);
  if (index === -1) return 1;
  let total = 0;
  for (let value = 1; value <= 9; value++) {
    if (!isPlacementValid(board, index, value)) continue;
    board[index] = value;
    total += countSolutions(board, limit - total);
    board[index] = 0;
    if (total >= limit) break;
  }
  return total;
};

export const generateSolution = (): Board => {
  const board: Board = new Array(81).fill(0);
  fillBoard(board);
  return board;
};

export const generatePuzzle = (
  difficulty: Difficulty,
): { puzzle: Board; solution: Board } => {
  const solution = generateSolution();
  const puzzle = [...solution];
  const targetClues = CLUES_BY_DIFFICULTY[difficulty];
  let clues = 81;

  for (const index of shuffle([...Array(81).keys()])) {
    if (clues <= targetClues) break;
    const backup = puzzle[index];
    puzzle[index] = 0;
    if (countSolutions([...puzzle]) === 1) {
      clues--;
    } else {
      puzzle[index] = backup;
    }
  }

  return { puzzle, solution };
};

export const findConflicts = (board: Board): Set<number> => {
  const conflicts = new Set<number>();
  for (let i = 0; i < 81; i++) {
    const value = board[i];
    if (value !== 0 && !isPlacementValid(board, i, value)) conflicts.add(i);
  }
  return conflicts;
};

export const isSolved = (board: Board): boolean =>
  !board.includes(0) && findConflicts(board).size === 0;

export const remainingCount = (board: Board, value: number): number =>
  9 - board.filter((cell) => cell === value).length;

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};
