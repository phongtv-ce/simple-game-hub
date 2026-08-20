const SnakeRenderer = (() => {
  const images = {
    food: new Image(),
  };

  images.food.src = './food.svg';

  const SEGMENT_PADDING = 3;
  const SEGMENT_RADIUS = 8;
  const SEGMENT_FILL = '#7cb342';
  const SEGMENT_STROKE = '#33691e';

  function gridToPixel(x, y, cellSize) {
    return { x: x * cellSize, y: y * cellSize };
  }

  function drawSnakeSegmentShape(context, pixelX, pixelY, cellSize) {
    const size = cellSize - SEGMENT_PADDING * 2;

    context.fillStyle = SEGMENT_FILL;
    context.strokeStyle = SEGMENT_STROKE;
    context.lineWidth = 2;
    context.beginPath();
    context.roundRect(pixelX + SEGMENT_PADDING, pixelY + SEGMENT_PADDING, size, size, SEGMENT_RADIUS);
    context.fill();
    context.stroke();
  }

  function drawSnakeBodyAt(context, x, y, cellSize) {
    const { x: pixelX, y: pixelY } = gridToPixel(x, y, cellSize);
    drawSnakeSegmentShape(context, pixelX, pixelY, cellSize);
  }

  function drawSnakeHeadAt(context, x, y, cellSize, direction) {
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
      context.arc(centerX - eyeOffset - 1, centerY - 4, pupilRadius, 0, Math.PI * 2);
      context.arc(centerX - eyeOffset - 1, centerY + 4, pupilRadius, 0, Math.PI * 2);
      context.fill();
    } else if (direction === 'right') {
      context.beginPath();
      context.arc(centerX + eyeOffset + 1, centerY - 4, pupilRadius, 0, Math.PI * 2);
      context.arc(centerX + eyeOffset + 1, centerY + 4, pupilRadius, 0, Math.PI * 2);
      context.fill();
    } else if (direction === 'up') {
      context.beginPath();
      context.arc(centerX - 4, centerY - eyeOffset - 1, pupilRadius, 0, Math.PI * 2);
      context.arc(centerX + 4, centerY - eyeOffset - 1, pupilRadius, 0, Math.PI * 2);
      context.fill();
    } else {
      context.beginPath();
      context.arc(centerX - 4, centerY + eyeOffset + 1, pupilRadius, 0, Math.PI * 2);
      context.arc(centerX + 4, centerY + eyeOffset + 1, pupilRadius, 0, Math.PI * 2);
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

  function drawFoodAt(context, x, y, cellSize) {
    const { x: pixelX, y: pixelY } = gridToPixel(x, y, cellSize);
    context.drawImage(images.food, pixelX, pixelY, cellSize, cellSize);
  }

  function drawSnake(context, snakeSegments, cellSize, direction) {
    snakeSegments.forEach((segment, index) => {
      if (index === snakeSegments.length - 1) {
        drawSnakeHeadAt(context, segment.x, segment.y, cellSize, direction);
      } else {
        drawSnakeBodyAt(context, segment.x, segment.y, cellSize);
      }
    });
  }

  function drawMazeCell(context, x, y, cellSize, cellType, theme) {
    const { x: pixelX, y: pixelY } = gridToPixel(x, y, cellSize);
    const { CELL } = SnakeCore;

    if (cellType === CELL.EMPTY) {
      context.fillStyle = theme.empty;
      context.fillRect(pixelX, pixelY, cellSize, cellSize);
      return;
    }

    if (cellType === CELL.SOLID) {
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

  function drawMazeScene(context, game, cellSize, theme) {
    for (let y = 0; y < game.gridSize; y += 1) {
      for (let x = 0; x < game.gridSize; x += 1) {
        drawMazeCell(context, x, y, cellSize, game.getCellType(x, y), theme);
      }
    }
  }

  return {
    drawSnake,
    drawFoodAt,
    drawMazeScene,
  };
})();
