const CELL_EMPTY = 0;
const PLAYER_X = 1;
const PLAYER_O = 2;

const MIN_BOARD_SIZE = 3;
const MAX_BOARD_SIZE = 15;
const DEFAULT_BOARD_SIZE = 3;

const boardElement = document.getElementById('board');
const statusMessageElement = document.getElementById('status-message');
const boardSizeForm = document.getElementById('board-size-form');
const boardSizeInput = document.getElementById('board-size-input');
const resetButton = document.getElementById('reset-button');

let boardSize = DEFAULT_BOARD_SIZE;
let boardCells = [];
let activePlayer = PLAYER_X;
let isGameOver = false;

function getPlayerMark(player) {
  return player === PLAYER_X ? 'X' : 'O';
}

function createEmptyBoard(size) {
  return Array.from({ length: size }, () => Array(size).fill(CELL_EMPTY));
}

function readBoardSizeFromInput() {
  const inputValue = Number(boardSizeInput.value);
  const isValidSize =
    Number.isInteger(inputValue) &&
    inputValue >= MIN_BOARD_SIZE &&
    inputValue <= MAX_BOARD_SIZE;

  if (!isValidSize) {
    alert(`Board size must be a whole number between ${MIN_BOARD_SIZE} and ${MAX_BOARD_SIZE}.`);
    return false;
  }

  boardSize = inputValue;
  return true;
}

function updateStatusMessage(message) {
  statusMessageElement.textContent = message;
}

function getCellPosition(cellIndex) {
  return {
    row: Math.floor(cellIndex / boardSize),
    column: cellIndex % boardSize,
  };
}

function renderBoard() {
  boardElement.style.setProperty('--board-size', boardSize);
  boardElement.innerHTML = '';

  for (let cellIndex = 0; cellIndex < boardSize * boardSize; cellIndex += 1) {
    const { row, column } = getCellPosition(cellIndex);
    const cellButton = document.createElement('button');

    cellButton.type = 'button';
    cellButton.className = 'cell';
    cellButton.dataset.cellIndex = cellIndex;

    const cellValue = boardCells[row][column];
    cellButton.textContent = cellValue === CELL_EMPTY ? '' : getPlayerMark(cellValue);

    boardElement.appendChild(cellButton);
  }
}

function getWinningPlayerInLine(line) {
  const firstCell = line[0];
  const isWinningLine =
    firstCell !== CELL_EMPTY && line.every((cell) => cell === firstCell);

  return isWinningLine ? firstCell : CELL_EMPTY;
}

function getColumn(columnIndex) {
  return boardCells.map((row) => row[columnIndex]);
}

function getMainDiagonal() {
  return boardCells.map((row, rowIndex) => row[rowIndex]);
}

function getAntiDiagonal() {
  return boardCells.map((row, rowIndex) => row[boardSize - 1 - rowIndex]);
}

function findWinner() {
  for (let rowIndex = 0; rowIndex < boardSize; rowIndex += 1) {
    const rowWinner = getWinningPlayerInLine(boardCells[rowIndex]);
    if (rowWinner !== CELL_EMPTY) {
      return rowWinner;
    }
  }

  for (let columnIndex = 0; columnIndex < boardSize; columnIndex += 1) {
    const columnWinner = getWinningPlayerInLine(getColumn(columnIndex));
    if (columnWinner !== CELL_EMPTY) {
      return columnWinner;
    }
  }

  const mainDiagonalWinner = getWinningPlayerInLine(getMainDiagonal());
  if (mainDiagonalWinner !== CELL_EMPTY) {
    return mainDiagonalWinner;
  }

  return getWinningPlayerInLine(getAntiDiagonal());
}

function hasNoEmptyCells() {
  return boardCells.every((row) => row.every((cell) => cell !== CELL_EMPTY));
}

function switchPlayer() {
  activePlayer = activePlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
}

function startNewGame() {
  boardCells = createEmptyBoard(boardSize);
  activePlayer = PLAYER_X;
  isGameOver = false;
  updateStatusMessage(`${getPlayerMark(activePlayer)}'s turn`);
  renderBoard();
}

function onCellClick(event) {
  const clickedCell = event.target.closest('.cell');
  if (!clickedCell || isGameOver) {
    return;
  }

  const cellIndex = Number(clickedCell.dataset.cellIndex);
  const { row, column } = getCellPosition(cellIndex);

  if (boardCells[row][column] !== CELL_EMPTY) {
    return;
  }

  boardCells[row][column] = activePlayer;
  clickedCell.textContent = getPlayerMark(activePlayer);

  const winner = findWinner();
  if (winner !== CELL_EMPTY) {
    isGameOver = true;
    updateStatusMessage(`${getPlayerMark(winner)} wins!`);
    return;
  }

  if (hasNoEmptyCells()) {
    isGameOver = true;
    updateStatusMessage("It's a draw!");
    return;
  }

  switchPlayer();
  updateStatusMessage(`${getPlayerMark(activePlayer)}'s turn`);
}

function onBoardSizeSubmit(event) {
  event.preventDefault();

  if (!readBoardSizeFromInput()) {
    return;
  }

  startNewGame();
}

boardSizeForm.addEventListener('submit', onBoardSizeSubmit);
resetButton.addEventListener('click', startNewGame);
boardElement.addEventListener('click', onCellClick);

startNewGame();
