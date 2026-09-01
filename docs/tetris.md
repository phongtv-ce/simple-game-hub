# Tetris

Classic block puzzle — stack falling pieces, clear horizontal lines, and climb levels. Built with React, TypeScript, and Tailwind CSS.

**Route:** `/tetris`

## Getting started

From the repo root:

```bash
pnpm install
pnpm dev
```

Then open `/tetris` in the app.

## Rules

1. Pieces fall one row at a time; speed increases as you level up.
2. Complete a horizontal row to clear it — cleared rows above shift down.
3. The game ends when a new piece cannot spawn.
4. Score grows with lines cleared; harder clears (Tetris = 4 lines) score more at higher levels.

## Controls

| Input | Action |
|-------|--------|
| **← →** | Move piece left / right |
| **↑** or **X** | Rotate piece |
| **↓** | Soft drop (one row, +1 score) |
| **Space** | Hard drop (instant lock, bonus score) |
| **C** or **Shift** | Hold current piece (once per lock) |
| **P** or **Esc** | Pause / resume |
| **Space** / **Enter** | Start when idle or after game over |

When idle, paused, or game over, an **overlay** on the board shows **Start**, **Resume**, or **Play Again**.

## Features

| Feature | Description |
|---------|-------------|
| **Hold** | Swap the active piece with a held piece (one hold per drop) |
| **Next preview** | See the upcoming piece |
| **Levels** | Level increases every 10 lines; drop speed increases |
| **Scoring** | 1/2/3/4-line clears with level multiplier |

Board size: **10 columns × 20 rows**.

## Project layout

```
src/games/tetris/
├── TetrisPage.tsx
├── components/
│   └── TetrisView.tsx    # Board, previews, overlay, stats
├── hooks/
│   └── useTetrisGame.ts  # Reducer, keyboard, drop timer
└── logic/
    └── game.ts           # Pieces, collision, line clear, scoring
```

## How it works

- Pure game logic lives in `logic/game.ts` — board state, piece shapes, rotation with wall kicks, hold, and line clearing.
- `useTetrisGame` runs a `useReducer` over game actions and attaches keyboard listeners plus a level-based drop interval.
- `GameOverlay` hides during play and shows start/pause/game-over UI on top of the board.
