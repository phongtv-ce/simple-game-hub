import { useEffect } from 'react';
import { CELL_SIZE } from '../renderer/draw';
import type { SnakeGame } from '../game/snakeGame';

type GameCanvasProps = {
  game: SnakeGame;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  renderKey: number;
  ariaLabel: string;
  onRender: (
    context: CanvasRenderingContext2D,
    game: SnakeGame,
  ) => void;
};

export function GameCanvas({
  game,
  canvasRef,
  renderKey,
  ariaLabel,
  onRender,
}: GameCanvasProps) {
  const canvasSize = game.gridSize * CELL_SIZE;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    onRender(context, game);
  }, [canvasRef, game, onRender, renderKey]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      aria-label={ariaLabel}
      className="rounded-lg border-2 border-emerald-200 bg-white shadow-lg"
    />
  );
}
