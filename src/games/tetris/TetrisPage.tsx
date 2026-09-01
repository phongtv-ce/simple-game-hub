import { mergeBoard } from './logic/game';
import { GameOverlay, Preview, Stat, TetrisBoard } from './components/TetrisView';
import { useTetrisGame } from './hooks/useTetrisGame';

export function TetrisPage() {
  const { state, dispatch } = useTetrisGame();
  const displayBoard = mergeBoard(state.board, state.active);

  return (
    <div className="min-h-[calc(100vh-57px)] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-8 text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8">
        <header className="text-center">
          <h1 className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-4xl font-black tracking-tight text-transparent">
            Tetris
          </h1>
          <p className="mt-2 text-sm text-slate-400">Classic block puzzle — clear lines to score</p>
        </header>

        <div className="flex flex-wrap items-start justify-center gap-8">
          <div className="flex flex-col gap-4">
            <Preview type={state.hold} label="Hold" />
            <div className="rounded-xl border border-slate-600 bg-slate-900/80 p-4 text-sm">
              <Stat label="Score" value={state.score} />
              <Stat label="Lines" value={state.lines} />
              <Stat label="Level" value={state.level} />
            </div>
          </div>

          <div className="relative">
            <TetrisBoard cells={displayBoard} />
            <GameOverlay
              status={state.status}
              score={state.score}
              onStart={() => dispatch({ type: 'start' })}
              onResume={() => dispatch({ type: 'togglePause' })}
            />
          </div>

          <div className="flex flex-col gap-4">
            <Preview type={state.next} label="Next" />
            <div className="rounded-xl border border-slate-600 bg-slate-900/80 p-4 text-xs leading-relaxed text-slate-400">
              <p className="mb-2 font-semibold uppercase tracking-wider text-slate-300">Controls</p>
              <ul className="space-y-1">
                <li>← → Move</li>
                <li>↑ / X Rotate</li>
                <li>↓ Soft drop</li>
                <li>Space Hard drop</li>
                <li>C / Shift Hold</li>
                <li>P / Esc Pause</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
