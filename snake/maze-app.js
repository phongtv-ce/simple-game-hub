const CELL_SIZE = 30;
const {
  GRID_SIZE,
  TOTAL_STAGES,
  STAGE_LENGTH_GOAL,
  INITIAL_LENGTH,
  APPLES_PER_STAGE,
  getStage,
  getTheme,
  getThemeList,
} = SceneData;
const { SnakeGame, getDirectionFromKey, isStartKey } = SnakeCore;
const { drawSnake, drawFoodAt, drawMazeScene } = SnakeRenderer;

const canvas = document.getElementById('game-canvas');
const canvasContext = canvas.getContext('2d');
const statusMessageElement = document.getElementById('status-message');
const sceneDisplayElement = document.getElementById('scene-display');
const sceneDescriptionElement = document.getElementById('scene-description');
const stageDisplayElement = document.getElementById('stage-display');
const stageStepperElement = document.getElementById('stage-stepper');
const totalScoreValueElement = document.getElementById('total-score-value');
const lengthValueElement = document.getElementById('length-value');
const lengthProgressElement = document.getElementById('length-progress');
const progressTextElement = document.getElementById('progress-text');
const progressBarElement = document.querySelector('.progress-bar');
const speedBadgeElement = document.getElementById('speed-badge');
const themeSelectElement = document.getElementById('theme-select');
const startGameButton = document.getElementById('start-game-button');
const resetGameButton = document.getElementById('reset-game-button');

const game = new SnakeGame({ gridSize: GRID_SIZE, initialLength: INITIAL_LENGTH });
let currentStageIndex = 0;
let currentScene = getStage(0);
let currentTheme = getTheme('light');
let totalScore = 0;
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

function updateStageStepper() {
  const steps = stageStepperElement.querySelectorAll('.stage-step');

  steps.forEach((step, index) => {
    step.classList.remove('is-active', 'is-complete');

    if (index < currentStageIndex) {
      step.classList.add('is-complete');
    } else if (index === currentStageIndex) {
      step.classList.add('is-active');
    }
  });
}

function updateStageDisplay() {
  stageDisplayElement.textContent = `Stage ${currentStageIndex + 1} / ${TOTAL_STAGES}`;
  sceneDisplayElement.textContent = currentScene.title;
  sceneDescriptionElement.textContent = currentScene.description;
  updateStageStepper();
}

function updateScorePanels() {
  const applesTowardGoal = Math.max(0, Math.min(APPLES_PER_STAGE, game.score - INITIAL_LENGTH));

  totalScoreValueElement.textContent = totalScore;
  lengthValueElement.textContent = game.score;
  lengthProgressElement.style.width = `${(applesTowardGoal / APPLES_PER_STAGE) * 100}%`;
  progressTextElement.textContent = `${applesTowardGoal} / ${APPLES_PER_STAGE} apples`;
  progressBarElement.setAttribute('aria-valuenow', String(applesTowardGoal));
}

function renderBoard() {
  drawMazeScene(canvasContext, game, CELL_SIZE, currentTheme);
  drawSnake(canvasContext, game.snakeSegments, CELL_SIZE, game.currentDirection);

  if (game.foodCell) {
    drawFoodAt(canvasContext, game.foodCell.x, game.foodCell.y, CELL_SIZE);
  }
}

function applyStage(stageIndex) {
  currentStageIndex = stageIndex;
  currentScene = getStage(stageIndex);
  game.applyScene(currentScene);
  updateStageDisplay();
  updateScorePanels();
  renderBoard();
}

function resumeStage(direction) {
  if (gameLoopTimerId !== null) {
    return;
  }

  game.start(direction);
  setStatus(`Stage ${currentStageIndex + 1}: ${currentScene.title}. Go!`, 'playing');
  updateScorePanels();
  renderBoard();
  startGameLoop();
}

function advanceStage() {
  if (currentStageIndex >= TOTAL_STAGES - 1) {
    game.isGameActive = false;
    stopGameLoop(
      `Victory! You cleared all ${TOTAL_STAGES} stages with ${totalScore} apples.`,
      'victory'
    );
    return;
  }

  stopGameLoop();
  applyStage(currentStageIndex + 1);
  setStatus(
    `Stage ${currentStageIndex + 1}: ${currentScene.title}. Press Start, Space, or an arrow key to begin.`,
    'idle'
  );
}

function resetRun() {
  stopGameLoop('Press Start, Space, or an arrow key to play.');
  totalScore = 0;
  applyStage(0);
  setStatus('Reach the length goal on each stage to advance. Solid walls stop you; dashed walls can be crossed.');
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
      'Game over. Press Stop to reset, or Start, Space, or an arrow key to try again.',
      'gameover'
    );
    return;
  }

  updateScorePanels();

  if (result.status === 'ate') {
    totalScore += 1;
    updateScorePanels();

    if (game.score >= STAGE_LENGTH_GOAL) {
      advanceStage();
      return;
    }
  }

  renderBoard();
}

themeSelectElement.addEventListener('change', () => {
  currentTheme = getTheme(themeSelectElement.value);
  renderBoard();
  setStatus(`Theme set to ${currentTheme.title}.`, game.isGameActive ? 'playing' : 'idle');
});

startGameButton.addEventListener('click', () => resumeStage());
resetGameButton.addEventListener('click', resetRun);

function handleKeyDown(event) {
  const direction = getDirectionFromKey(event.key);

  if (gameLoopTimerId === null && (isStartKey(event.key) || direction)) {
    event.preventDefault();
    resumeStage(direction ?? undefined);

    if (direction) {
      handleDirectionBoostKeyDown(event);
    }

    return;
  }

  if (game.isGameActive && gameLoopTimerId !== null) {
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
  getThemeList().forEach((theme) => {
    const option = document.createElement('option');
    option.value = theme.id;
    option.textContent = theme.title;
    themeSelectElement.appendChild(option);
  });

  themeSelectElement.value = currentTheme.id;
  resetRun();
});
