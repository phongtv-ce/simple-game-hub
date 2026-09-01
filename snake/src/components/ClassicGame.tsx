import { useCallback, useEffect } from 'react';
import {
  MODE,
  MODE_INFO,
  SnakeGame,
} from '../game/snakeGame';
import type { StatusState } from '../game/types';
import { useSnakeGame } from '../hooks/useSnakeGame';
import { renderClassicBoard } from '../renderer/draw';
import { GameCanvas } from './GameCanvas';
import {
  GameButtons,
  HintList,
  Panel,
  SpeedBadge,
  StatCard,
} from './ui';

const GRID_SIZE = 20;

export function ClassicGame({
  onStatusChange,
}: {
  onStatusChange?: (status: { message: string; state: StatusState }) => void;
}) {
  const snake = useSnakeGame({
    gameOptions: {
      gridSize: GRID_SIZE,
      startPosition: { x: 9, y: 9 },
      initialDirection: 'right',
      initialLength: 3,
      gameMode: MODE.WALLS,
    },
  });

  const toggleMode = () => {
    if (snake.game.isGameActive) {
      snake.setStatus('Stop the game before changing mode.', 'playing');
      return;
    }

    snake.game.toggleWrapMode();
    snake.setStatus(MODE_INFO[snake.game.gameMode].description);
    snake.triggerRender();
  };

  const onRender = useCallback(
    (context: CanvasRenderingContext2D, game: SnakeGame) => {
      renderClassicBoard(context, game);
    },
    [],
  );

  const modeInfo = MODE_INFO[snake.game.gameMode];

  useEffect(() => {
    onStatusChange?.({
      message: snake.statusMessage,
      state: snake.statusState,
    });
  }, [snake.statusMessage, snake.statusState, onStatusChange]);

  return (
  <>
    <div className="flex flex-col items-center">
      <GameCanvas
        game={snake.game}
        canvasRef={snake.canvasRef}
        renderKey={snake.renderKey}
        ariaLabel="Snake game board"
        onRender={onRender}
      />
      <SpeedBadge active={snake.speedBoostActive} />
    </div>

    <aside className="flex flex-col gap-4">
      <Panel title="Mode" id="mode-heading">
        <p className="text-base font-semibold text-emerald-900">{modeInfo.title}</p>
        <p className="mt-1 text-sm text-emerald-800/80">{modeInfo.description}</p>
      </Panel>

      <StatCard label="Score" value={snake.score} />

      <Panel title="Controls" id="controls-heading">
        <HintList />
      </Panel>

      <GameButtons onStart={() => snake.startGame()} onReset={snake.resetGame} />

      <button
        type="button"
        onClick={toggleMode}
        className="w-full rounded-lg border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition-colors hover:bg-emerald-50"
      >
        Switch mode
      </button>
    </aside>
  </>
  );
}
