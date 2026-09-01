import { useCallback, useEffect, useRef, useState } from 'react';
import {
  APPLES_PER_STAGE,
  getStage,
  getTheme,
  getThemeList,
  INITIAL_LENGTH,
  STAGE_LENGTH_GOAL,
  TOTAL_STAGES,
} from '../game/sceneData';
import type { SnakeGame } from '../game/snakeGame';
import type { Direction, MazeTheme, StatusState } from '../game/types';
import { useSnakeGame } from '../hooks/useSnakeGame';
import { renderMazeBoard } from '../renderer/draw';
import { GameCanvas } from './GameCanvas';
import {
  GameButtons,
  Kbd,
  Panel,
  SpeedBadge,
  StatCard,
} from './ui';

export function MazeGame({
  onStatusChange,
}: {
  onStatusChange?: (status: { message: string; state: StatusState }) => void;
}) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [currentScene, setCurrentScene] = useState(() => getStage(0));
  const [currentTheme, setCurrentTheme] = useState<MazeTheme>(() =>
    getTheme('light'),
  );
  const [totalScore, setTotalScore] = useState(0);

  const advanceStageRef = useRef<() => void>(() => {});
  const resumeStageRef = useRef<(direction?: Direction) => void>(() => {});

  const snake = useSnakeGame({
    gameOptions: { initialLength: INITIAL_LENGTH },
    initialStatusMessage:
      'Reach the length goal on each stage to advance. Solid walls stop you; dashed walls can be crossed; edges wrap around.',
    onStartWhenIdle: (direction) => resumeStageRef.current(direction),
    onTick: (game, result) => {
      if (result.status === 'ate') {
        setTotalScore((prev) => prev + 1);

        if (game.score >= STAGE_LENGTH_GOAL) {
          advanceStageRef.current();
        }
      }
    },
  });

  const applyStage = useCallback(
    (stageIndex: number) => {
      const scene = getStage(stageIndex);
      setCurrentStageIndex(stageIndex);
      setCurrentScene(scene);
      snake.game.applyScene(scene);
      snake.updateScore();
      snake.triggerRender();
    },
    [snake],
  );

  const advanceStage = useCallback(() => {
    if (currentStageIndex >= TOTAL_STAGES - 1) {
      snake.game.isGameActive = false;
      snake.stopLoop(
        `Victory! You cleared all ${TOTAL_STAGES} stages with ${totalScore} apples.`,
        'victory',
      );
      return;
    }

    snake.stopLoop();
    const nextIndex = currentStageIndex + 1;
    applyStage(nextIndex);
    snake.setStatus(
      `Stage ${nextIndex + 1}: ${getStage(nextIndex).title}. Press Start, Space, or an arrow key to begin.`,
      'idle',
    );
  }, [currentStageIndex, totalScore, snake, applyStage]);

  advanceStageRef.current = advanceStage;

  useEffect(() => {
    applyStage(0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resetRun = () => {
    snake.stopLoop('Press Start, Space, or an arrow key to play.');
    setTotalScore(0);
    applyStage(0);
    snake.setStatus(
      'Reach the length goal on each stage to advance. Solid walls stop you; dashed walls can be crossed; edges wrap around.',
    );
  };

  const resumeStage = (direction?: Direction) => {
    if (snake.isLoopRunning()) {
      return;
    }

    snake.game.applyScene(currentScene);
    snake.beginStage(direction);
    snake.setStatus(
      `Stage ${currentStageIndex + 1}: ${currentScene.title}. Go!`,
      'playing',
    );
  };

  resumeStageRef.current = resumeStage;

  const onRender = useCallback(
    (context: CanvasRenderingContext2D, game: SnakeGame) => {
      renderMazeBoard(context, game, currentTheme);
    },
    [currentTheme],
  );

  const applesTowardGoal = Math.max(
    0,
    Math.min(APPLES_PER_STAGE, snake.score - INITIAL_LENGTH),
  );
  const progressPercent = (applesTowardGoal / APPLES_PER_STAGE) * 100;

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
          ariaLabel="Snake maze board"
          onRender={onRender}
        />
        <SpeedBadge active={snake.speedBoostActive} />
      </div>

      <aside className="flex flex-col gap-4">
        <Panel title="Stage" id="scene-heading">
          <p className="text-base font-semibold text-emerald-900">
            Stage {currentStageIndex + 1} / {TOTAL_STAGES}
          </p>
          <p className="mt-1 text-base font-semibold text-emerald-900">
            {currentScene.title}
          </p>
          <p className="mt-1 text-sm text-emerald-800/80">
            {currentScene.description}
          </p>
          <div className="mt-3 flex gap-2" aria-hidden="true">
            {Array.from({ length: TOTAL_STAGES }, (_, index) => (
              <span
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index < currentStageIndex
                    ? 'bg-emerald-500'
                    : index === currentStageIndex
                      ? 'bg-emerald-600 ring-2 ring-emerald-300'
                      : 'bg-emerald-100'
                }`}
              />
            ))}
          </div>
        </Panel>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Apples" value={totalScore} />
          <StatCard
            label="Length"
            value={snake.score}
            suffix={`/ ${STAGE_LENGTH_GOAL}`}
          />
        </div>

        <div className="rounded-xl border border-emerald-100 bg-white/80 p-3 shadow-sm">
          <div className="mb-2 flex justify-between text-xs font-semibold text-emerald-700/70">
            <span>Stage goal</span>
            <span>
              {applesTowardGoal} / {APPLES_PER_STAGE} apples
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={APPLES_PER_STAGE}
            aria-valuenow={applesTowardGoal}
            className="h-2.5 overflow-hidden rounded-full bg-emerald-100"
          >
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <Panel>
          <label
            htmlFor="theme-select"
            className="mb-2 block text-xs font-bold uppercase tracking-wider text-emerald-700/70"
          >
            Color theme
          </label>
          <select
            id="theme-select"
            value={currentTheme.id}
            onChange={(event) => {
              const theme = getTheme(event.target.value);
              setCurrentTheme(theme);
              snake.triggerRender();
              snake.setStatus(
                `Theme set to ${theme.title}.`,
                snake.game.isGameActive ? 'playing' : 'idle',
              );
            }}
            className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {getThemeList().map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.title}
              </option>
            ))}
          </select>
        </Panel>

        <Panel title="Legend">
          <ul className="space-y-1.5 text-sm text-emerald-800/80">
            <li className="flex items-center gap-2">
              <span className="h-4 w-4 rounded border-2 border-gray-600 bg-gray-500" />
              Solid wall — blocks you
            </li>
            <li className="flex items-center gap-2">
              <span className="h-4 w-4 rounded border-2 border-dashed border-sky-600 bg-sky-200/50" />
              Dashed wall — walk through
            </li>
            <li className="flex items-center gap-2">
              <span className="h-4 w-4 rounded border border-emerald-200 bg-white" />
              Open floor
            </li>
          </ul>
        </Panel>

        <Panel title="Controls">
          <ul className="space-y-1.5 text-sm text-emerald-800/80">
            <li>
              <Kbd>↑</Kbd> <Kbd>↓</Kbd> <Kbd>←</Kbd> <Kbd>→</Kbd> Steer the
              snake
            </li>
            <li><Kbd>Space</Kbd> Start, pause, or resume</li>
            <li>
              Board edges wrap around — leave one side, re-enter the other
            </li>
            <li>Hold an arrow key ~0.2s for 5× speed</li>
          </ul>
        </Panel>

        <GameButtons
          onStart={() => resumeStage()}
          onReset={resetRun}
        />
      </aside>
    </>
  );
}
