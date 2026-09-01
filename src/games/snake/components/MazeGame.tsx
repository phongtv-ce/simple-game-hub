import { useCallback, useEffect, useRef, useState } from 'react';
import {
  APPLES_PER_STAGE,
  getStage,
  getTheme,
  GRID_SIZE,
  INITIAL_LENGTH,
  STAGE_LENGTH_GOAL,
  TOTAL_STAGES,
} from '../logic/sceneData';
import type { SnakeGame } from '../logic/snakeGame';
import type { Direction, MazeTheme } from '../logic/types';
import { useSnakeGame } from '../hooks/useSnakeGame';
import { CELL_SIZE, renderMazeBoard } from '../renderer/draw';
import { GameCanvas } from './GameCanvas';
import { ThemePicker } from './ThemePicker';
import { GameOverlay, getOverlayState, Kbd } from './ui';

const BOARD_PX = GRID_SIZE * CELL_SIZE;

export function MazeGame() {
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
  const overlayState = getOverlayState(snake.statusState, snake.game.isGameActive);

  const handleOverlayStart = () => {
    if (snake.statusState === 'victory' || snake.statusState === 'gameover') {
      resetRun();
      return;
    }

    resumeStage();
  };

  const handleThemeChange = (theme: MazeTheme) => {
    setCurrentTheme(theme);
    snake.triggerRender();
  };

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="relative">
          <GameCanvas
            game={snake.game}
            canvasRef={snake.canvasRef}
            renderKey={snake.renderKey}
            ariaLabel="Snake maze board"
            onRender={onRender}
          />
          <GameOverlay
            state={overlayState}
            score={totalScore}
            onStart={handleOverlayStart}
            onResume={() => resumeStage()}
          />
        </div>
      </div>

      <aside
        className="flex w-56 flex-col rounded-2xl border border-white/10 bg-slate-950/35 p-3 sm:w-60"
        style={{ height: BOARD_PX }}
      >
        <div className="space-y-2">
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-white">
                Stage {currentStageIndex + 1}/{TOTAL_STAGES}
              </p>
              <p className="truncate text-xs text-emerald-400">{currentScene.title}</p>
            </div>
            <div className="mt-1.5 flex gap-1" aria-hidden="true">
              {Array.from({ length: TOTAL_STAGES }, (_, index) => (
                <span
                  key={index}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    index < currentStageIndex
                      ? 'bg-emerald-500'
                      : index === currentStageIndex
                        ? 'bg-emerald-400'
                        : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg border border-white/10 bg-slate-900/50 px-2 py-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Apples
              </p>
              <p className="text-lg font-bold text-white">{totalScore}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/50 px-2 py-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Length
              </p>
              <p className="text-lg font-bold text-white">
                {snake.score}
                <span className="text-xs font-medium text-emerald-400">/{STAGE_LENGTH_GOAL}</span>
              </p>
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Goal</span>
              <span>
                {applesTowardGoal}/{APPLES_PER_STAGE}
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={APPLES_PER_STAGE}
              aria-valuenow={applesTowardGoal}
              className="h-1.5 overflow-hidden rounded-full bg-slate-800"
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-2">
          <ThemePicker theme={currentTheme} onChange={handleThemeChange} />

          <div className="rounded-lg border border-white/10 bg-slate-900/40 px-2.5 py-2">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Legend
            </p>
            <ul className="space-y-1 text-[11px] leading-snug text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded border border-gray-500 bg-gray-600" />
                Solid wall
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded border border-dashed border-sky-300 bg-white" />
                Gate
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded border border-white/10 bg-slate-800" />
                Wrap edges
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-white/10 bg-slate-900/40 px-2.5 py-2 text-[11px] leading-snug text-slate-400">
            <Kbd>↑↓←→</Kbd> move · <Kbd>Space</Kbd> pause
            {snake.speedBoostActive && (
              <span className="mt-1 block font-semibold text-amber-400">5× speed boost</span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
