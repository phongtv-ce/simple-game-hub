const GRID_SIZE = 20;
const CELL_SIZE = 30;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const { SnakeGame, MODE, MODE_INFO, getDirectionFromKey, isStartKey } = SnakeCore;
const { drawSnake, drawFoodAt } = SnakeRenderer;

const canvas = document.getElementById('game-canvas');
const canvasContext = canvas.getContext('2d');
const statusMessageElement = document.getElementById('status-message');
const modeDisplayElement = document.getElementById('mode-display');
const modeDescriptionElement = document.getElementById('mode-description');
const scoreValueElement = document.getElementById('score-value');
const speedBadgeElement = document.getElementById('speed-badge');
const startGameButton = document.getElementById('start-game-button');
const resetGameButton = document.getElementById('reset-game-button');
const toggleModeButton = document.getElementById('toggle-mode-button');

const game = new SnakeGame({
  gridSize: GRID_SIZE,
  startPosition: { x: 9, y: 9 },
  initialDirection: 'right',
  initialLength: 3,
  gameMode: MODE.WALLS,
});

let gameLoopTimerId = null;
const SPEED_BOOST = 5;
const heldDirectionKeys = new Set();

function getLoopIntervalMs() {
  return heldDirectionKeys.size > 0 ? game.tickMs / SPEED_BOOST : game.tickMs;
}

function updateGameLoopSpeed() {
  if (gameLoopTimerId === null) {
    return;
  }

  clearInterval(gameLoopTimerId);
  gameLoopTimerId = setInterval(handleTick, getLoopIntervalMs());
}

function startGameLoop() {
  if (gameLoopTimerId !== null) {
    clearInterval(gameLoopTimerId);
  }

  gameLoopTimerId = setInterval(handleTick, getLoopIntervalMs());
}

function setSpeedBoost(active) {
  speedBadgeElement.classList.toggle('is-active', active);
}

function stopGameLoop(message, state = 'idle') {
  if (gameLoopTimerId !== null) {
    clearInterval(gameLoopTimerId);
    gameLoopTimerId = null;
  }

  heldDirectionKeys.clear();
  setSpeedBoost(false);

  if (message) {
    setStatus(message, state);
  }
}

function setStatus(message, state = 'idle') {
  statusMessageElement.textContent = message;
  statusMessageElement.className = `status-banner status-${state}`;
}

function updateScoreDisplay() {
  scoreValueElement.textContent = game.score;
}

function updateModeDisplay() {
  const { title, description } = MODE_INFO[game.gameMode];
  modeDisplayElement.textContent = title;
  modeDescriptionElement.textContent = description;
}

function renderBoard() {
  canvasContext.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  drawSnake(canvasContext, game.snakeSegments, CELL_SIZE, game.currentDirection);

  if (game.foodCell) {
    drawFoodAt(canvasContext, game.foodCell.x, game.foodCell.y, CELL_SIZE);
  }
}

function resetGameState() {
  stopGameLoop('Press Start, Space, or an arrow key to play.');
  game.reset();
  updateScoreDisplay();
  renderBoard();
}

function startNewGame(direction) {
  stopGameLoop();
  game.reset();
  game.start(direction);
  updateScoreDisplay();
  setStatus('Use arrow keys to move. Hold a key for 5× speed.', 'playing');
  renderBoard();
  startGameLoop();
}

function handleDirectionBoostKeyDown(event) {
  const direction = getDirectionFromKey(event.key);
  if (!direction) {
    return;
  }

  const wasBoosted = heldDirectionKeys.size > 0;
  heldDirectionKeys.add(event.key);
  setSpeedBoost(true);

  if (!wasBoosted && heldDirectionKeys.size > 0) {
    updateGameLoopSpeed();
  }
}

function handleDirectionBoostKeyUp(event) {
  const direction = getDirectionFromKey(event.key);
  if (!direction || !heldDirectionKeys.delete(event.key)) {
    return;
  }

  if (heldDirectionKeys.size === 0) {
    setSpeedBoost(false);
    updateGameLoopSpeed();
  }
}

function handleTick() {
  const result = game.move();

  if (result.status === 'gameOver') {
    stopGameLoop(
      'Game over. Press Stop to reset, or Start, Space, or an arrow key to play again.',
      'gameover'
    );
    return;
  }

  updateScoreDisplay();
  renderBoard();
}

function toggleWrapMode() {
  if (game.isGameActive) {
    setStatus('Stop the game before changing mode.', 'playing');
    return;
  }

  game.toggleWrapMode();
  updateModeDisplay();
  setStatus(MODE_INFO[game.gameMode].description);
}

startGameButton.addEventListener('click', () => startNewGame());
resetGameButton.addEventListener('click', resetGameState);
toggleModeButton.addEventListener('click', toggleWrapMode);

function handleKeyDown(event) {
  const direction = getDirectionFromKey(event.key);

  if (gameLoopTimerId === null && (isStartKey(event.key) || direction)) {
    event.preventDefault();
    startNewGame(direction ?? undefined);

    if (direction) {
      handleDirectionBoostKeyDown(event);
    }

    return;
  }

  if (game.isGameActive) {
    game.handleDirectionKey(event);
    handleDirectionBoostKeyDown(event);
  }
}

function handleKeyUp(event) {
  handleDirectionBoostKeyUp(event);
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
window.addEventListener('load', () => {
  updateModeDisplay();
  resetGameState();
});
