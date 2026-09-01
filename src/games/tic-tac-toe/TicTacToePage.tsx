import { useState, type FormEvent } from 'react';
import Board from './components/Board';
import {
  PLAYER_X,
  PLAYER_O,
  PLAYER_MARKS,
  MIN_BOARD_SIZE,
  MAX_BOARD_SIZE,
  DEFAULT_BOARD_SIZE,
  isValidBoardSize,
  getInitialState,
  applyMove,
  type GameState,
} from './logic/game';

export function TicTacToePage() {
  const [boardSizeInput, setBoardSizeInput] = useState(String(DEFAULT_BOARD_SIZE));
  const [gameState, setGameState] = useState<GameState>(() => getInitialState(DEFAULT_BOARD_SIZE));

  const currentPlayerAccent =
    gameState.activePlayer === PLAYER_X ? 'text-red-400' : 'text-slate-100';

  function startNewGame(size: number) {
    setGameState(getInitialState(size));
  }

  function handleBoardSizeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedSize = Number(boardSizeInput);
    if (!isValidBoardSize(parsedSize)) {
      window.alert(
        `Board size must be a whole number between ${MIN_BOARD_SIZE} and ${MAX_BOARD_SIZE}.`,
      );
      return;
    }

    startNewGame(parsedSize);
  }

  function handleCellClick(row: number, column: number) {
    setGameState((previousState) => applyMove(previousState, row, column));
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-57px)] max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <section className="rounded-3xl border border-white/10 bg-white/8 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-rose-300/80">
              Board game
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">Tic-Tac-Toe</h1>
            <p className={`mt-3 text-lg font-semibold ${currentPlayerAccent}`}>
              {gameState.statusMessage}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-red-200/75">Player 1</p>
              <p className="mt-2 text-3xl font-black tracking-[-0.08em] text-red-400 [text-shadow:0_0_14px_rgba(248,113,113,0.35)]">
                {PLAYER_MARKS[PLAYER_X]}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-400/20 bg-slate-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300/75">Player 2</p>
              <p className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-100 [text-shadow:0_0_12px_rgba(255,255,255,0.16)]">
                {PLAYER_MARKS[PLAYER_O]}
              </p>
            </div>
          </div>

          <section
            aria-labelledby="settings-title"
            className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
          >
            <h2 id="settings-title" className="text-base font-semibold text-white">
              Board Settings
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Choose a size from {MIN_BOARD_SIZE} to {MAX_BOARD_SIZE}, then start a fresh match.
            </p>

            <form className="mt-4 space-y-3" onSubmit={handleBoardSizeSubmit}>
              <label htmlFor="board-size-input" className="block text-sm font-medium text-slate-200">
                N (N x N board)
              </label>
              <div className="flex flex-wrap gap-3">
                <input
                  id="board-size-input"
                  type="number"
                  min={MIN_BOARD_SIZE}
                  max={MAX_BOARD_SIZE}
                  value={boardSizeInput}
                  onChange={(event) => setBoardSizeInput(event.target.value)}
                  className="w-28 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none ring-0 transition placeholder:text-slate-500 focus:border-rose-400"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-rose-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-rose-400"
                >
                  Apply
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15"
                  onClick={() => startNewGame(gameState.boardSize)}
                >
                  Reset
                </button>
              </div>
            </form>
          </section>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/6 p-4 shadow-2xl shadow-slate-950/30 backdrop-blur sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Game Board</h2>
              <p className="text-sm text-slate-300">
                Current size: {gameState.boardSize} x {gameState.boardSize}
              </p>
            </div>
          </div>

          <Board
            board={gameState.board}
            winningCells={gameState.winningCells}
            isGameOver={gameState.isGameOver}
            onCellClick={handleCellClick}
          />
        </section>
      </div>
    </main>
  );
}
