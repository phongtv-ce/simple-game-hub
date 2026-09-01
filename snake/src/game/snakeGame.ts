import type { Direction, GameMode, MoveStatus, Position } from './types';
import { Cell, type CellType } from './types';

const DIRECTION: Record<Direction, Position> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};

const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  left: 'right',
  right: 'left',
  up: 'down',
  down: 'up',
};

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowLeft: 'left',
  ArrowUp: 'up',
  ArrowRight: 'right',
  ArrowDown: 'down',
};

export const MODE = {
  WALLS: 'walls' as GameMode,
  WRAP: 'wrap' as GameMode,
};

export const MODE_INFO = {
  walls: {
    title: 'Wall collision',
    description: 'Hitting a wall or yourself ends the game.',
  },
  wrap: {
    title: 'Wrap around',
    description: 'Leaving one edge re-enters on the opposite side.',
  },
} satisfies Record<GameMode, { title: string; description: string }>;

type Blockers = {
  isBlocked: (x: number, y: number, game: SnakeGame) => boolean;
  getCellType: (x: number, y: number, game: SnakeGame) => CellType;
};

function createSnakeSegments(
  startPosition: Position,
  direction: Direction,
  length: number,
): Position[] {
  const step = DIRECTION[direction];
  const segments: Position[] = [];

  for (let index = length - 1; index >= 0; index -= 1) {
    segments.push({
      x: startPosition.x - step.x * index,
      y: startPosition.y - step.y * index,
    });
  }

  return segments;
}

function createClassicBlockers(): Blockers {
  return {
    isBlocked(x, y, game) {
      return game.gameMode === MODE.WALLS && !game.isInsideGrid(x, y);
    },
    getCellType(x, y, game) {
      return game.isInsideGrid(x, y) ? Cell.EMPTY : Cell.SOLID;
    },
  };
}

function createMazeBlockers(cells: CellType[][]): Blockers {
  return {
    isBlocked(x, y, game) {
      if (!game.isInsideGrid(x, y)) {
        return true;
      }

      return cells[y][x] === Cell.SOLID;
    },
    getCellType(x, y) {
      if (y < 0 || y >= cells.length || x < 0 || x >= cells[0].length) {
        return Cell.SOLID;
      }

      return cells[y][x];
    },
  };
}

export type SnakeGameOptions = {
  gridSize?: number;
  tickMs?: number;
  startPosition?: Position;
  initialDirection?: Direction;
  initialLength?: number;
  gameMode?: GameMode;
  blockers?: Blockers;
};

export class SnakeGame {
  gridSize: number;
  tickMs: number;
  startPosition: Position;
  initialDirection: Direction;
  initialLength: number;
  gameMode: GameMode;
  blockers: Blockers;

  snakeSegments: Position[] = [];
  currentDirection: Direction = 'right';
  queuedDirection: Direction = 'right';
  score = 0;
  foodCell: Position | null = null;
  isGameActive = false;

  constructor(options: SnakeGameOptions = {}) {
    this.gridSize = options.gridSize ?? 20;
    this.tickMs = options.tickMs ?? 500;
    this.startPosition = { ...(options.startPosition ?? { x: 9, y: 9 }) };
    this.initialDirection = options.initialDirection ?? 'right';
    this.initialLength = options.initialLength ?? 3;
    this.gameMode = options.gameMode ?? MODE.WALLS;
    this.blockers = options.blockers ?? createClassicBlockers();

    this.reset();
  }

  reset() {
    this.snakeSegments = createSnakeSegments(
      this.startPosition,
      this.initialDirection,
      this.initialLength,
    );
    this.currentDirection = this.initialDirection;
    this.queuedDirection = this.initialDirection;
    this.score = this.initialLength;
    this.foodCell = null;
    this.isGameActive = false;
  }

  isInsideGrid(x: number, y: number) {
    return x >= 0 && y >= 0 && x < this.gridSize && y < this.gridSize;
  }

  getHeadSegment() {
    return this.snakeSegments[this.snakeSegments.length - 1];
  }

  isOnSnake(x: number, y: number) {
    return this.snakeSegments.some(
      (segment) => segment.x === x && segment.y === y,
    );
  }

  canPlaceFoodAt(x: number, y: number) {
    if (!this.isInsideGrid(x, y) || this.isOnSnake(x, y)) {
      return false;
    }

    return this.getCellType(x, y) === Cell.EMPTY;
  }

  getCellType(x: number, y: number) {
    return this.blockers.getCellType(x, y, this);
  }

  getNextHeadPosition(headSegment: Position) {
    const step = DIRECTION[this.currentDirection];
    let x = headSegment.x + step.x;
    let y = headSegment.y + step.y;

    if (this.gameMode === MODE.WRAP) {
      if (x >= this.gridSize) x = 0;
      if (x < 0) x = this.gridSize - 1;
      if (y >= this.gridSize) y = 0;
      if (y < 0) y = this.gridSize - 1;
    }

    return { x, y };
  }

  canSnakeMoveTo(position: Position) {
    if (this.isOnSnake(position.x, position.y)) {
      return false;
    }

    return !this.blockers.isBlocked(position.x, position.y, this);
  }

  spawnFood() {
    const validCells: Position[] = [];

    for (let y = 0; y < this.gridSize; y += 1) {
      for (let x = 0; x < this.gridSize; x += 1) {
        if (this.canPlaceFoodAt(x, y)) {
          validCells.push({ x, y });
        }
      }
    }

    if (validCells.length === 0) {
      this.foodCell = null;
      return null;
    }

    const index = Math.floor(Math.random() * validCells.length);
    this.foodCell = validCells[index];
    return this.foodCell;
  }

  queueDirection(direction: Direction) {
    if (OPPOSITE_DIRECTION[direction] === this.queuedDirection) {
      return false;
    }

    this.queuedDirection = direction;
    return true;
  }

  handleDirectionKey(key: string) {
    const nextDirection = KEY_TO_DIRECTION[key];
    if (!nextDirection) {
      return false;
    }

    return this.queueDirection(nextDirection);
  }

  toggleWrapMode() {
    this.gameMode =
      this.gameMode === MODE.WALLS ? MODE.WRAP : MODE.WALLS;
    return this.gameMode;
  }

  start(direction?: Direction) {
    this.isGameActive = true;

    if (direction) {
      this.queueDirection(direction);
    }

    this.spawnFood();
  }

  move(): { status: MoveStatus } {
    if (!this.isGameActive) {
      return { status: 'idle' };
    }

    this.currentDirection = this.queuedDirection;

    const nextHead = this.getNextHeadPosition(this.getHeadSegment());

    if (!this.canSnakeMoveTo(nextHead)) {
      this.isGameActive = false;
      return { status: 'gameOver' };
    }

    this.snakeSegments.push(nextHead);

    let ateFood = false;
    if (
      this.foodCell &&
      nextHead.x === this.foodCell.x &&
      nextHead.y === this.foodCell.y
    ) {
      this.score += 1;
      ateFood = true;
      this.spawnFood();
    }

    if (this.score < this.snakeSegments.length) {
      this.snakeSegments.shift();
    }

    return { status: ateFood ? 'ate' : 'moved' };
  }

  applyScene(scene: {
    cells: CellType[][];
    start: Position;
    direction?: Direction;
    initialLength?: number;
    tickMs?: number;
  }) {
    this.gridSize = scene.cells.length;
    this.startPosition = { ...scene.start };
    this.initialDirection = scene.direction ?? 'right';
    this.initialLength = scene.initialLength ?? 3;
    this.gameMode = MODE.WRAP;
    this.blockers = createMazeBlockers(scene.cells);
    this.tickMs = scene.tickMs ?? this.tickMs;
    this.reset();
  }
}

export function getDirectionFromKey(key: string): Direction | null {
  return KEY_TO_DIRECTION[key] ?? null;
}

export function isStartKey(key: string) {
  return key === ' ' || key === 'Spacebar';
}
