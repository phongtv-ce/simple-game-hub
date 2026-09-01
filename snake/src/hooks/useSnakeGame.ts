import { useCallback, useEffect, useRef, useState } from 'react';
import { LoopController } from '../game/loopController';
import {
  getDirectionFromKey,
  isStartKey,
  SnakeGame,
  type SnakeGameOptions,
} from '../game/snakeGame';
import type { Direction, StatusState } from '../game/types';

type UseSnakeGameOptions = {
  gameOptions: SnakeGameOptions;
  onTick?: (game: SnakeGame, result: { status: string }) => void;
  onStartWhenIdle?: (direction?: Direction) => void;
  initialStatusMessage?: string;
  playingStatusMessage?: string;
  pausedStatusMessage?: string;
  gameOverMessage?: string;
};

export function useSnakeGame({
  gameOptions,
  onTick,
  onStartWhenIdle,
  initialStatusMessage = 'Press Start, Space, or an arrow key to play.',
  playingStatusMessage = 'Use arrow keys to move. Space to pause. Hold a key ~0.2s for 5× speed.',
  pausedStatusMessage = 'Paused. Press Space to resume.',
  gameOverMessage = 'Game over. Press Stop to reset, or Start, Space, or an arrow key to play again.',
}: UseSnakeGameOptions) {
  const gameRef = useRef<SnakeGame>(new SnakeGame(gameOptions));
  const loopRef = useRef<LoopController | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;
  const onStartWhenIdleRef = useRef(onStartWhenIdle);
  onStartWhenIdleRef.current = onStartWhenIdle;

  const [statusMessage, setStatusMessage] = useState(initialStatusMessage);
  const [statusState, setStatusState] = useState<StatusState>('idle');
  const [score, setScore] = useState(gameRef.current.score);
  const [speedBoostActive, setSpeedBoostActive] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  const triggerRender = useCallback(() => {
    setRenderKey((k) => k + 1);
  }, []);

  const updateScore = useCallback(() => {
    setScore(gameRef.current.score);
  }, []);

  const stopLoop = useCallback(
    (message?: string, state: StatusState = 'idle') => {
      loopRef.current?.stop();
      if (message) {
        setStatusMessage(message);
        setStatusState(state);
      }
    },
    [],
  );

  const handleTick = useCallback(() => {
    const game = gameRef.current;
    const result = game.move();

    if (result.status === 'gameOver') {
      stopLoop(gameOverMessage, 'gameover');
      return;
    }

    updateScore();
    onTickRef.current?.(game, result);
    triggerRender();
  }, [gameOverMessage, stopLoop, updateScore, triggerRender]);

  useEffect(() => {
    loopRef.current = new LoopController(
      gameRef.current,
      handleTick,
      setSpeedBoostActive,
    );

    return () => {
      loopRef.current?.stop();
    };
  }, [handleTick]);

  const startGame = useCallback(
    (direction?: Direction) => {
      stopLoop();
      gameRef.current.reset();
      gameRef.current.start(direction);
      updateScore();
      setStatusMessage(playingStatusMessage);
      setStatusState('playing');
      triggerRender();
      loopRef.current?.start();
    },
    [stopLoop, updateScore, playingStatusMessage, triggerRender],
  );

  const beginStage = useCallback(
    (direction?: Direction) => {
      stopLoop();
      gameRef.current.start(direction);
      updateScore();
      setStatusMessage(playingStatusMessage);
      setStatusState('playing');
      triggerRender();
      loopRef.current?.start();
    },
    [stopLoop, updateScore, playingStatusMessage, triggerRender],
  );

  const resetGame = useCallback(() => {
    stopLoop(initialStatusMessage, 'idle');
    gameRef.current.reset();
    updateScore();
    triggerRender();
  }, [stopLoop, initialStatusMessage, updateScore, triggerRender]);

  const pauseGame = useCallback(() => {
    loopRef.current?.stop();
    setStatusMessage(pausedStatusMessage);
    setStatusState('idle');
  }, [pausedStatusMessage]);

  const resumeGame = useCallback(() => {
    loopRef.current?.start();
    setStatusMessage(playingStatusMessage);
    setStatusState('playing');
  }, [playingStatusMessage]);

  useEffect(() => {
    const loop = loopRef.current;
    const game = gameRef.current;

    function handleDirectionInput(event: KeyboardEvent) {
      if (game.handleDirectionKey(event.key)) {
        triggerRender();
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      const direction = getDirectionFromKey(event.key);

      if (isStartKey(event.key)) {
        event.preventDefault();

        if (game.isGameActive && loop?.isRunning()) {
          pauseGame();
          return;
        }

        if (game.isGameActive && !loop?.isRunning()) {
          resumeGame();
          return;
        }

        if (!game.isGameActive && !loop?.isRunning()) {
          if (onStartWhenIdleRef.current) {
            onStartWhenIdleRef.current();
          } else {
            startGame();
          }
        }

        return;
      }

      if (!loop?.isRunning() && direction) {
        event.preventDefault();

        if (game.isGameActive) {
          handleDirectionInput(event);
          return;
        }

        if (onStartWhenIdleRef.current) {
          onStartWhenIdleRef.current(direction);
        } else {
          startGame(direction);
        }

        if (loop?.isRunning()) {
          loop.handleBoostKeyDown(event.key, true);
        }

        return;
      }

      if (game.isGameActive && loop?.isRunning()) {
        handleDirectionInput(event);
        loop.handleBoostKeyDown(event.key, direction !== null);
        return;
      }

      if (game.isGameActive && !loop?.isRunning() && direction) {
        event.preventDefault();
        handleDirectionInput(event);
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      const direction = getDirectionFromKey(event.key);
      loop?.handleBoostKeyUp(event.key, direction !== null);
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [pauseGame, resumeGame, startGame, triggerRender]);

  const isLoopRunning = useCallback(() => {
    return loopRef.current?.isRunning() ?? false;
  }, []);

  const setStatus = useCallback((message: string, state: StatusState = 'idle') => {
    setStatusMessage(message);
    setStatusState(state);
  }, []);

  return {
    game: gameRef.current,
    canvasRef,
    statusMessage,
    statusState,
    score,
    speedBoostActive,
    renderKey,
    startGame,
    beginStage,
    resetGame,
    pauseGame,
    resumeGame,
    stopLoop,
    updateScore,
    triggerRender,
    setStatus,
    isLoopRunning,
  };
}
