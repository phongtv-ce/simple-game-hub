const GRID_SIZE = 20;
const CELL_SIZE = SnakeShell.CELL_SIZE;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const { SnakeGame, MODE, MODE_INFO } = SnakeCore;
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

const setStatus = SnakeShell.createStatusController(statusMessageElement);

function stopGameLoop(message, state = 'idle') {
  loop.stop();

  if (message) {
    setStatus(message, state);
  }
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
  drawSnake(canvasContext, game.snakeSegments, CELL_SIZE, game.queuedDirection);

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
  setStatus('Use arrow keys to move. Space to pause. Hold a key ~0.2s for 5× speed.', 'playing');
  renderBoard();
  loop.start();
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

const loop = SnakeShell.createLoopController({
  game,
  speedBadgeElement,
  onTick: handleTick,
});

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

SnakeShell.bindKeyboard({
  loop,
  game,
  onStartWhenIdle: startNewGame,
  onPause: () => setStatus('Paused. Press Space to resume.', 'idle'),
  onResume: () => setStatus('Use arrow keys to move. Space to pause. Hold a key ~0.2s for 5× speed.', 'playing'),
  onDirectionChange: renderBoard,
});

window.addEventListener('load', () => {
  updateModeDisplay();
  resetGameState();
});
