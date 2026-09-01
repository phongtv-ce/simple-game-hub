# Five in a Row

Browser-based Gomoku (Five in a Row). Connect five marks in a row to win. Play vs a computer opponent or with a friend on the same keyboard.

**Route:** `/five-in-a-row`

## Getting started

From the repo root:

```bash
pnpm install
pnpm dev
```

Then open `/five-in-a-row` in the app.

## Screenshot

15×15 board on first load — **Vs Computer** mode, waiting for X's first move:

![Five in a Row — dark UI with sidebar showing player cards, board settings, and a 15×15 empty game board](images/five-in-a-row/image.png)

| Player | Mark | Color | Controlled by |
|--------|------|-------|---------------|
| Player 1 | X | Red | Human |
| Player 2 | O | White | Human or AI |

## Rules

1. **X** always goes first, then players alternate.
2. Click an empty cell to place your mark.
3. Win by connecting **five marks in an unbroken line** — horizontally, vertically, or diagonally.
4. If the board fills with no winner the game ends in a draw.

## Game modes

| Mode | Description |
|------|-------------|
| **Vs Computer** | You play X; the AI plays O automatically after a short delay. |
| **Two Players** | Both X and O are controlled by the people at the keyboard. |

Switch mode at any time from the **Board Settings** panel. Switching resets the current match.

## Board size

- Set **N** (5–19) and click **Apply** to start a new game on an N × N grid. Default is 15.
- **Reset** clears the board without changing N or mode.

## AI opponent

The computer opponent (`O`) uses a greedy heuristic search:

1. **Win immediately** — take any cell that completes five in a row.
2. **Block** — if the human is one move from winning, block that cell.
3. **Score remaining candidates** — each empty cell within two steps of an existing stone is scored by line length, open ends, bonuses for lines of 3 or 4, and a centre bias.
4. Attack and defence scores are combined with a slight offensive bias (`×1.15`).

The AI evaluates only cells near existing stones, which keeps it fast even on a 19×19 board. A 350 ms delay before the AI move makes turn handoffs feel natural.

## Project layout

```
src/games/five-in-a-row/
├── FiveInARowPage.tsx
├── components/Board.tsx
└── logic/
    ├── types.ts
    └── gameLogic.ts
```

## How it works

- The board is a 2D array (`CellValue[][]`) held in React state alongside `activePlayer`, `isGameOver`, `winningCells`, and `statusMessage`.
- After every human move, `resolveMove()` in `FiveInARowPage.tsx` checks for a win or draw and returns the next `GameState`.
- When it is the AI's turn, a `useEffect` fires a timeout that calls `getBestAiMove()` and applies the chosen cell.
- The board is disabled during the AI turn to prevent double-clicks.
- Winning cells are highlighted via a `Set` built from `winningCells`.
