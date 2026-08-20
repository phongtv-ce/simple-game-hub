// --- Constants ---

const CELL_EMPTY = 0;
const PLAYER_X = 1;
const PLAYER_O = 2;

const MIN_BOARD_SIZE = 3;
const MAX_BOARD_SIZE = 15;
const DEFAULT_BOARD_SIZE = 3;

// --- DOM ---

const boardElement = document.getElementById('board');
const statusMessageElement = document.getElementById('status-message');
const boardSizeForm = document.getElementById('board-size-form');
const boardSizeInput = document.getElementById('board-size-input');
const resetButton = document.getElementById('reset-button');

// --- Game state ---

let boardSize = DEFAULT_BOARD_SIZE;
let board = [];
let currentPlayer = PLAYER_X;
let gameOver = false;

// --- Helpers ---

function getMark(player) {
  return player === PLAYER_X ? 'X' : 'O';
}

function createEmptyBoard(size) {
  return Array.from({ length: size }, () => Array(size).fill(CELL_EMPTY));
}

function indexToRowCol(index) {
  return {
    row: Math.floor(index / boardSize),
    col: index % boardSize,
  };
}

function isValidBoardSize(value) {
  return (
    Number.isInteger(value) &&
    value >= MIN_BOARD_SIZE &&
    value <= MAX_BOARD_SIZE
  );
}

// --- Rendering ---

function setCellMark(button, player) {
  button.textContent = getMark(player);
  button.classList.toggle('cell--x', player === PLAYER_X);
  button.classList.toggle('cell--o', player === PLAYER_O);
}

function createCellButton(index) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'cell';
  button.dataset.index = index;

  const { row, col } = indexToRowCol(index);
  if (board[row][col] !== CELL_EMPTY) {
    setCellMark(button, board[row][col]);
  }

  return button;
}

function renderBoard() {
  boardElement.style.setProperty('--board-size', boardSize);
  boardElement.replaceChildren(
    ...Array.from({ length: boardSize * boardSize }, (_, index) =>
      createCellButton(index),
    ),
  );
}

function setStatus(message) {
  statusMessageElement.textContent = message;
}

// --- Win detection ---

/** Returns the player who owns a full line, or CELL_EMPTY if none. */
function winnerOfLine(line) {
  const first = line[0];
  if (first === CELL_EMPTY) {
    return CELL_EMPTY;
  }
  return line.every((cell) => cell === first) ? first : CELL_EMPTY;
}

function column(colIndex) {
  return board.map((row) => row[colIndex]);
}

function mainDiagonal() {
  return board.map((row, index) => row[index]);
}

function antiDiagonal() {
  return board.map((row, index) => row[boardSize - 1 - index]);
}

/** Collect every row, column, and both diagonals to check for a win. */
function allLines() {
  const lines = [...board];
  for (let index = 0; index < boardSize; index += 1) {
    lines.push(column(index));
  }
  lines.push(mainDiagonal(), antiDiagonal());
  return lines;
}

function findWinner() {
  for (const line of allLines()) {
    const winner = winnerOfLine(line);
    if (winner !== CELL_EMPTY) {
      return winner;
    }
  }
  return CELL_EMPTY;
}

function isBoardFull() {
  return board.every((row) => row.every((cell) => cell !== CELL_EMPTY));
}

// --- Game flow ---

function switchPlayer() {
  currentPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
}

function startGame() {
  board = createEmptyBoard(boardSize);
  currentPlayer = PLAYER_X;
  gameOver = false;
  setStatus(`${getMark(currentPlayer)}'s turn`);
  renderBoard();
}

function endTurn() {
  const winner = findWinner();
  if (winner !== CELL_EMPTY) {
    gameOver = true;
    setStatus(`${getMark(winner)} wins!`);
    return;
  }

  if (isBoardFull()) {
    gameOver = true;
    setStatus("It's a draw!");
    return;
  }

  switchPlayer();
  setStatus(`${getMark(currentPlayer)}'s turn`);
}

function onCellClick(event) {
  const cell = event.target.closest('.cell');
  if (!cell || gameOver) {
    return;
  }

  const { row, col } = indexToRowCol(Number(cell.dataset.index));
  if (board[row][col] !== CELL_EMPTY) {
    return;
  }

  board[row][col] = currentPlayer;
  setCellMark(cell, currentPlayer);
  endTurn();
}

function onBoardSizeSubmit(event) {
  event.preventDefault();

  const size = Number(boardSizeInput.value);
  if (!isValidBoardSize(size)) {
    alert(
      `Board size must be a whole number between ${MIN_BOARD_SIZE} and ${MAX_BOARD_SIZE}.`,
    );
    return;
  }

  boardSize = size;
  startGame();
}

// --- Init ---

boardSizeForm.addEventListener('submit', onBoardSizeSubmit);
resetButton.addEventListener('click', startGame);
boardElement.addEventListener('click', onCellClick);

startGame();
