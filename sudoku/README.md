# Sudoku

Sudoku built with React 19, TypeScript and Tailwind CSS v4 (Vite).

## Run

```bash
pnpm install   # or npm install
pnpm dev
pnpm build
```

## Features

- Puzzle generator with backtracking solver; cells are only removed while the puzzle stays uniquely solvable.
- Four difficulties (easy / medium / hard / expert) based on clue count.
- Pencil notes, erase, undo history, and a hint that reveals one correct cell.
- Live conflict highlighting, row/column/box peer highlighting, and same-number highlighting.
- Timer, mistake counter, and per-digit remaining counts.
- Keyboard controls: arrow keys move, `1`–`9` fill, `0`/Backspace erases, `N` toggles notes.

## Files

- `src/sudoku.ts` — generator, solver, validation helpers.
- `src/App.tsx` — game state and UI.
