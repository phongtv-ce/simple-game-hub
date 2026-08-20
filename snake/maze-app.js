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
const CELL_SIZE = SnakeShell.CELL_SIZE;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const { SnakeGame } = SnakeCore;
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

const setStatus = SnakeShell.createStatusController(statusMessageElement);

function stopGameLoop(message, state = 'idle') {
  loop.stop();

  if (message) {
    setStatus(message, state);
  }
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
  canvasContext.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  drawMazeScene(canvasContext, game, CELL_SIZE, currentTheme);
  drawSnake(canvasContext, game.snakeSegments, CELL_SIZE, game.queuedDirection);

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
  if (loop.isRunning()) {
    return;
  }

  game.applyScene(currentScene);
  game.start(direction);
  setStatus(`Stage ${currentStageIndex + 1}: ${currentScene.title}. Go!`, 'playing');
  updateScorePanels();
  renderBoard();
  loop.start();
}

function resumePausedGame() {
  loop.start();
  setStatus(`Stage ${currentStageIndex + 1}: ${currentScene.title}. Go!`, 'playing');
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
  setStatus('Reach the length goal on each stage to advance. Solid walls stop you; dashed walls can be crossed; edges wrap around.');
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

const loop = SnakeShell.createLoopController({
  game,
  speedBadgeElement,
  onTick: handleTick,
});

themeSelectElement.addEventListener('change', () => {
  currentTheme = getTheme(themeSelectElement.value);
  renderBoard();
  setStatus(`Theme set to ${currentTheme.title}.`, game.isGameActive ? 'playing' : 'idle');
});

startGameButton.addEventListener('click', () => resumeStage());
resetGameButton.addEventListener('click', resetRun);

SnakeShell.bindKeyboard({
  loop,
  game,
  onStartWhenIdle: resumeStage,
  onPause: () => setStatus('Paused. Press Space to resume.', 'idle'),
  onResume: resumePausedGame,
  onDirectionChange: renderBoard,
});

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
