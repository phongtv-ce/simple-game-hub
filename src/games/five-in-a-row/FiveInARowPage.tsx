import { useEffect, useState, type FormEvent } from 'react';
import Board from './components/Board';
import {
  CELL_EMPTY,
  PLAYER_X,
  PLAYER_O,
  PLAYER_MARKS,
  PLAYER_LABELS,
  MIN_BOARD_SIZE,
  MAX_BOARD_SIZE,
  DEFAULT_BOARD_SIZE,
  createEmptyBoard,
  checkWin,
  getBestAiMove,
  isBoardFull,
  getWinningCells,
  type GameState,
} from './logic/gameLogic';

type PlayMode = 'ai' | 'local';

function getTurnMessage(playMode: PlayMode, player: typeof PLAYER_X | typeof PLAYER_O): string {
  if (playMode === 'ai' && player === PLAYER_O) {
    return 'Computer is thinking...';
  }

  return `${PLAYER_LABELS[player]}'s turn`;
}

function getInitialState(boardSize: number, playMode: PlayMode): GameState {
  return {
    boardSize,
    board: createEmptyBoard(boardSize),
    activePlayer: PLAYER_X,
    isGameOver: false,
    winner: CELL_EMPTY,
    winningCells: [],
    statusMessage: getTurnMessage(playMode, PLAYER_X),
  };
}

function resolveMove(
  previousState: GameState,
  row: number,
  column: number,
  currentPlayMode: PlayMode,
): GameState {
  const nextBoard = previousState.board.map((boardRow, rowIndex) =>
    boardRow.map((cell, columnIndex) =>
      rowIndex === row && columnIndex === column ? previousState.activePlayer : cell,
    ),
  );

  const hasWon = checkWin(nextBoard, row, column, previousState.activePlayer);
  if (hasWon) {
    return {
      ...previousState,
      board: nextBoard,
      isGameOver: true,
      winner: previousState.activePlayer,
      winningCells: getWinningCells(nextBoard, row, column, previousState.activePlayer),
      statusMessage: `${PLAYER_LABELS[previousState.activePlayer]} wins!`,
    };
  }

  if (isBoardFull(nextBoard)) {
    return {
      ...previousState,
      board: nextBoard,
      isGameOver: true,
      statusMessage: "It's a draw!",
    };
  }

  const nextPlayer = previousState.activePlayer === PLAYER_X ? PLAYER_O : PLAYER_X;

  return {
    ...previousState,
    board: nextBoard,
    activePlayer: nextPlayer,
    statusMessage: getTurnMessage(currentPlayMode, nextPlayer),
  };
}

export function FiveInARowPage() {
  const [playMode, setPlayMode] = useState<PlayMode>('ai');
  const [boardSizeInput, setBoardSizeInput] = useState(String(DEFAULT_BOARD_SIZE));
  const [gameState, setGameState] = useState(() => getInitialState(DEFAULT_BOARD_SIZE, 'ai'));
  const isAiTurn =
    playMode === 'ai' && gameState.activePlayer === PLAYER_O && !gameState.isGameOver;
  const currentPlayerAccent =
    gameState.activePlayer === PLAYER_X ? 'text-red-400' : 'text-slate-100';

  function startNewGame(size: number) {
    setGameState(getInitialState(size, playMode));
  }

  useEffect(() => {
    if (!isAiTurn) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setGameState((previousState) => {
        if (
          previousState.isGameOver ||
          previousState.activePlayer !== PLAYER_O ||
          playMode !== 'ai'
        ) {
          return previousState;
        }

        const move = getBestAiMove(previousState.board, PLAYER_O);
        if (!move) {
          return previousState;
        }

        return resolveMove(previousState, move.row, move.column, playMode);
      });
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [isAiTurn, playMode]);

  function handleBoardSizeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedSize = Number(boardSizeInput);
    const isValidSize =
      Number.isInteger(parsedSize) &&
      parsedSize >= MIN_BOARD_SIZE &&
      parsedSize <= MAX_BOARD_SIZE;

    if (!isValidSize) {
      window.alert(
        `Board size must be a whole number between ${MIN_BOARD_SIZE} and ${MAX_BOARD_SIZE}.`,
      );
      return;
    }

    startNewGame(parsedSize);
  }

  function handleCellClick(row: number, column: number) {
    if (gameState.isGameOver || isAiTurn || gameState.board[row][column] !== CELL_EMPTY) {
      return;
    }

    setGameState((previousState) => resolveMove(previousState, row, column, playMode));
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-57px)] max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <section className="rounded-3xl border border-white/10 bg-white/8 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-sky-300/80">
              Board game
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">Five in a Row</h1>
            <p className={`mt-3 text-lg font-semibold ${currentPlayerAccent}`}>
              {gameState.statusMessage}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-red-200/75">First Player</p>
              <p className="mt-2 text-3xl font-black tracking-[-0.08em] text-red-400 [text-shadow:0_0_14px_rgba(248,113,113,0.35)]">
                {PLAYER_MARKS[PLAYER_X]}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-400/20 bg-slate-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300/75">Second Player</p>
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

            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-slate-200">Mode</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    playMode === 'ai'
                      ? 'bg-sky-500 text-slate-950'
                      : 'border border-white/10 bg-white/8 text-white hover:bg-white/12'
                  }`}
                  onClick={() => {
                    setPlayMode('ai');
                    setGameState(getInitialState(gameState.boardSize, 'ai'));
                  }}
                >
                  Vs Computer
                </button>
                <button
                  type="button"
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    playMode === 'local'
                      ? 'bg-sky-500 text-slate-950'
                      : 'border border-white/10 bg-white/8 text-white hover:bg-white/12'
                  }`}
                  onClick={() => {
                    setPlayMode('local');
                    setGameState(getInitialState(gameState.boardSize, 'local'));
                  }}
                >
                  Two Players
                </button>
              </div>
            </div>

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
                  className="w-28 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none ring-0 transition placeholder:text-slate-500 focus:border-sky-400"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400"
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
            <div className="rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-sm text-slate-200">
              Win condition: 5 in a row
            </div>
          </div>

          <Board
            board={gameState.board}
            winningCells={gameState.winningCells}
            isGameOver={gameState.isGameOver || isAiTurn}
            onCellClick={handleCellClick}
          />
        </section>
      </div>
    </main>
  );
}
