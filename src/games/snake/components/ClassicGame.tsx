import { useCallback } from 'react';
import {
  MODE,
  MODE_INFO,
  SnakeGame,
} from '../logic/snakeGame';
import { useSnakeGame } from '../hooks/useSnakeGame';
import { renderClassicBoard } from '../renderer/draw';
import { GameCanvas } from './GameCanvas';
import {
  GameOverlay,
  getOverlayState,
  HintList,
  Panel,
  SpeedBadge,
  StatCard,
} from './ui';

const GRID_SIZE = 20;

export function ClassicGame() {
  const snake = useSnakeGame({
    gameOptions: {
      gridSize: GRID_SIZE,
      startPosition: { x: 9, y: 9 },
      initialDirection: 'right',
      initialLength: 3,
      gameMode: MODE.WALLS,
    },
    gameOverMessage: 'Game over. Press Start, Space, or an arrow key to play again.',
  });

  const toggleMode = () => {
    if (snake.game.isGameActive) {
      return;
    }

    snake.game.toggleWrapMode();
    snake.triggerRender();
  };

  const onRender = useCallback(
    (context: CanvasRenderingContext2D, game: SnakeGame) => {
      renderClassicBoard(context, game);
    },
    [],
  );

  const modeInfo = MODE_INFO[snake.game.gameMode];
  const overlayState = getOverlayState(snake.statusState, snake.game.isGameActive);

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="relative">
          <GameCanvas
            game={snake.game}
            canvasRef={snake.canvasRef}
            renderKey={snake.renderKey}
            ariaLabel="Snake game board"
            onRender={onRender}
          />
          <GameOverlay
            state={overlayState}
            score={snake.score}
            onStart={() => snake.startGame()}
            onResume={() => snake.resumeGame()}
          />
        </div>
        <SpeedBadge active={snake.speedBoostActive} />
      </div>

      <aside className="flex flex-col gap-4">
        <Panel title="Mode" id="mode-heading">
          <p className="text-base font-semibold text-white">{modeInfo.title}</p>
          <p className="mt-1 text-sm text-slate-300">{modeInfo.description}</p>
        </Panel>

        <StatCard label="Score" value={snake.score} />

        <Panel title="Controls" id="controls-heading">
          <HintList />
        </Panel>

        <button
          type="button"
          onClick={toggleMode}
          disabled={snake.game.isGameActive}
          className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Switch mode
        </button>
      </aside>
    </>
  );
}
