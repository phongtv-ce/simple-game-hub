import type { Direction, MazeTheme } from '../game/types';
import { Cell } from '../game/types';
import type { SnakeGame } from '../game/snakeGame';

const foodImage = new Image();
foodImage.src = './food.svg';

const SEGMENT_PADDING = 3;
const SEGMENT_RADIUS = 8;
const SEGMENT_FILL = '#7cb342';
const SEGMENT_STROKE = '#33691e';

function gridToPixel(x: number, y: number, cellSize: number) {
  return { x: x * cellSize, y: y * cellSize };
}

function drawSnakeSegmentShape(
  context: CanvasRenderingContext2D,
  pixelX: number,
  pixelY: number,
  cellSize: number,
) {
  const size = cellSize - SEGMENT_PADDING * 2;

  context.fillStyle = SEGMENT_FILL;
  context.strokeStyle = SEGMENT_STROKE;
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(
    pixelX + SEGMENT_PADDING,
    pixelY + SEGMENT_PADDING,
    size,
    size,
    SEGMENT_RADIUS,
  );
  context.fill();
  context.stroke();
}

function drawSnakeBodyAt(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
) {
  const { x: pixelX, y: pixelY } = gridToPixel(x, y, cellSize);
  drawSnakeSegmentShape(context, pixelX, pixelY, cellSize);
}

function drawSnakeHeadAt(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
  direction: Direction,
) {
  const { x: pixelX, y: pixelY } = gridToPixel(x, y, cellSize);
  const size = cellSize - SEGMENT_PADDING * 2;
  const centerX = pixelX + cellSize / 2;
  const centerY = pixelY + cellSize / 2;

  context.save();
  drawSnakeSegmentShape(context, pixelX, pixelY, cellSize);

  context.fillStyle = '#ffffff';
  const eyeOffset = 5;
  const eyeRadius = 3;

  if (direction === 'left') {
    context.beginPath();
    context.arc(centerX - eyeOffset, centerY - 4, eyeRadius, 0, Math.PI * 2);
    context.arc(centerX - eyeOffset, centerY + 4, eyeRadius, 0, Math.PI * 2);
    context.fill();
  } else if (direction === 'right') {
    context.beginPath();
    context.arc(centerX + eyeOffset, centerY - 4, eyeRadius, 0, Math.PI * 2);
    context.arc(centerX + eyeOffset, centerY + 4, eyeRadius, 0, Math.PI * 2);
    context.fill();
  } else if (direction === 'up') {
    context.beginPath();
    context.arc(centerX - 4, centerY - eyeOffset, eyeRadius, 0, Math.PI * 2);
    context.arc(centerX + 4, centerY - eyeOffset, eyeRadius, 0, Math.PI * 2);
    context.fill();
  } else {
    context.beginPath();
    context.arc(centerX - 4, centerY + eyeOffset, eyeRadius, 0, Math.PI * 2);
    context.arc(centerX + 4, centerY + eyeOffset, eyeRadius, 0, Math.PI * 2);
    context.fill();
  }

  context.fillStyle = '#111111';
  const pupilRadius = 1.5;
  if (direction === 'left') {
    context.beginPath();
    context.arc(
      centerX - eyeOffset - 1,
      centerY - 4,
      pupilRadius,
      0,
      Math.PI * 2,
    );
    context.arc(
      centerX - eyeOffset - 1,
      centerY + 4,
      pupilRadius,
      0,
      Math.PI * 2,
    );
    context.fill();
  } else if (direction === 'right') {
    context.beginPath();
    context.arc(
      centerX + eyeOffset + 1,
      centerY - 4,
      pupilRadius,
      0,
      Math.PI * 2,
    );
    context.arc(
      centerX + eyeOffset + 1,
      centerY + 4,
      pupilRadius,
      0,
      Math.PI * 2,
    );
    context.fill();
  } else if (direction === 'up') {
    context.beginPath();
    context.arc(
      centerX - 4,
      centerY - eyeOffset - 1,
      pupilRadius,
      0,
      Math.PI * 2,
    );
    context.arc(
      centerX + 4,
      centerY - eyeOffset - 1,
      pupilRadius,
      0,
      Math.PI * 2,
    );
    context.fill();
  } else {
    context.beginPath();
    context.arc(
      centerX - 4,
      centerY + eyeOffset + 1,
      pupilRadius,
      0,
      Math.PI * 2,
    );
    context.arc(
      centerX + 4,
      centerY + eyeOffset + 1,
      pupilRadius,
      0,
      Math.PI * 2,
    );
    context.fill();
  }

  context.strokeStyle = '#e53935';
  context.lineWidth = 2;
  context.beginPath();
  if (direction === 'left') {
    context.moveTo(pixelX + SEGMENT_PADDING + 2, centerY);
    context.lineTo(pixelX + SEGMENT_PADDING - 4, centerY - 3);
    context.moveTo(pixelX + SEGMENT_PADDING + 2, centerY);
    context.lineTo(pixelX + SEGMENT_PADDING - 4, centerY + 3);
  } else if (direction === 'right') {
    context.moveTo(pixelX + SEGMENT_PADDING + size - 2, centerY);
    context.lineTo(pixelX + SEGMENT_PADDING + size + 4, centerY - 3);
    context.moveTo(pixelX + SEGMENT_PADDING + size - 2, centerY);
    context.lineTo(pixelX + SEGMENT_PADDING + size + 4, centerY + 3);
  } else if (direction === 'up') {
    context.moveTo(centerX, pixelY + SEGMENT_PADDING + 2);
    context.lineTo(centerX - 3, pixelY + SEGMENT_PADDING - 4);
    context.moveTo(centerX, pixelY + SEGMENT_PADDING + 2);
    context.lineTo(centerX + 3, pixelY + SEGMENT_PADDING - 4);
  } else {
    context.moveTo(centerX, pixelY + SEGMENT_PADDING + size - 2);
    context.lineTo(centerX - 3, pixelY + SEGMENT_PADDING + size + 4);
    context.moveTo(centerX, pixelY + SEGMENT_PADDING + size - 2);
    context.lineTo(centerX + 3, pixelY + SEGMENT_PADDING + size + 4);
  }
  context.stroke();
  context.restore();
}

export function drawFoodAt(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
) {
  const { x: pixelX, y: pixelY } = gridToPixel(x, y, cellSize);
  context.drawImage(foodImage, pixelX, pixelY, cellSize, cellSize);
}

export function drawSnake(
  context: CanvasRenderingContext2D,
  snakeSegments: { x: number; y: number }[],
  cellSize: number,
  direction: Direction,
) {
  snakeSegments.forEach((segment, index) => {
    if (index === snakeSegments.length - 1) {
      drawSnakeHeadAt(context, segment.x, segment.y, cellSize, direction);
    } else {
      drawSnakeBodyAt(context, segment.x, segment.y, cellSize);
    }
  });
}

function drawMazeCell(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
  cellType: number,
  theme: MazeTheme,
) {
  const { x: pixelX, y: pixelY } = gridToPixel(x, y, cellSize);

  if (cellType === Cell.EMPTY) {
    context.fillStyle = theme.empty;
    context.fillRect(pixelX, pixelY, cellSize, cellSize);
    return;
  }

  if (cellType === Cell.SOLID) {
    context.fillStyle = theme.solidFill;
    context.strokeStyle = theme.solidStroke;
    context.lineWidth = 2;
    context.fillRect(pixelX + 1, pixelY + 1, cellSize - 2, cellSize - 2);
    context.strokeRect(pixelX + 1, pixelY + 1, cellSize - 2, cellSize - 2);
    return;
  }

  context.fillStyle = theme.passFill;
  context.strokeStyle = theme.passStroke;
  context.lineWidth = 2;
  context.setLineDash([5, 4]);
  context.fillRect(pixelX + 2, pixelY + 2, cellSize - 4, cellSize - 4);
  context.strokeRect(pixelX + 2, pixelY + 2, cellSize - 4, cellSize - 4);
  context.setLineDash([]);
}

export function drawMazeScene(
  context: CanvasRenderingContext2D,
  game: SnakeGame,
  cellSize: number,
  theme: MazeTheme,
) {
  for (let y = 0; y < game.gridSize; y += 1) {
    for (let x = 0; x < game.gridSize; x += 1) {
      drawMazeCell(
        context,
        x,
        y,
        cellSize,
        game.getCellType(x, y),
        theme,
      );
    }
  }
}

export const CELL_SIZE = 30;

export function renderClassicBoard(
  context: CanvasRenderingContext2D,
  game: SnakeGame,
) {
  const canvasSize = game.gridSize * CELL_SIZE;
  context.clearRect(0, 0, canvasSize, canvasSize);
  drawSnake(
    context,
    game.snakeSegments,
    CELL_SIZE,
    game.queuedDirection,
  );

  if (game.foodCell) {
    drawFoodAt(context, game.foodCell.x, game.foodCell.y, CELL_SIZE);
  }
}

export function renderMazeBoard(
  context: CanvasRenderingContext2D,
  game: SnakeGame,
  theme: MazeTheme,
) {
  const canvasSize = game.gridSize * CELL_SIZE;
  context.clearRect(0, 0, canvasSize, canvasSize);
  drawMazeScene(context, game, CELL_SIZE, theme);
  drawSnake(
    context,
    game.snakeSegments,
    CELL_SIZE,
    game.queuedDirection,
  );

  if (game.foodCell) {
    drawFoodAt(context, game.foodCell.x, game.foodCell.y, CELL_SIZE);
  }
}
