# Tic-Tac-Toe

Two-player tic-tac-toe on a configurable **N × N** board (default 3×3). Built with React, TypeScript, and Tailwind CSS.

**Route:** `/tic-tac-toe`

| Player | Mark | Color |
|--------|------|-------|
| Player 1 | X | Red |
| Player 2 | O | White |

## Getting started

From the repo root:

```bash
pnpm install
pnpm dev
```

Then open `/tic-tac-toe` in the app.

## Screenshot

4×4 board with **O** winning on the main diagonal:

![Tic-Tac-Toe — 4×4 board with red X marks, white O marks, and O wins on the main diagonal](images/tic-tac-toe/image.png)

The status line shows the current turn or winner. Use **Apply** to resize the board, or **Reset** to start a new game at the current size.

## Rules

1. **X** goes first, then players alternate.
2. Click an empty cell to place your mark.
3. Win by filling an entire **row**, **column**, or **diagonal** (main or anti-diagonal).
4. If every cell is filled with no winner, the game is a draw.

## Board size

- Set **N** (3–15) and click **Apply** to start a new game on an N × N grid.
- **Reset** clears the board without changing N.

## Project layout

```
src/games/tic-tac-toe/
├── TicTacToePage.tsx
├── logic/game.ts
└── components/Board.tsx
```

## How it works

- The board is a 2D array of cell values (`0` empty, `1` = X, `2` = O).
- `applyMove` in `logic/game.ts` places a mark, checks all lines for a winner, and detects draws.
- Winning cells are highlighted on the board when a player wins.
- UI and game rules are split: `TicTacToePage` handles settings and flow; `Board` renders the grid.
