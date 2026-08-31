# Miner

A Minesweeper-style game built with React, TypeScript, Vite and Tailwind CSS v4.

## Getting started

```bash
cd miner
npm install
npm run dev
```

Then open the URL printed by Vite (usually http://localhost:5173).

To build a static bundle into `dist/`:

```bash
npm run build
npm run preview
```

## How to play

- **Left click** an unknown tile to dig it. The first click is always safe — mines are placed after it, never in the 3 × 3 area around your first tile.
- **Right click** a tile to place or remove a flag 🚩.
- **Left click a revealed number** to auto-clear its neighbours, but only when the number of flags around it matches the number shown.
- A number tells you how many mines touch that tile (including diagonals). An empty tile automatically opens the whole connected empty region.
- You win when every non-mine tile is revealed; you lose the moment you dig a mine.

## Board sizes

| Difficulty | Board | Mines |
|------------|-------|-------|
| Beginner | 9 × 9 | 10 |
| Intermediate | 16 × 16 | 40 |
| Expert | 16 × 30 | 99 |

The counter on the left shows mines remaining (mines minus flags placed), the timer on the right counts seconds, and the face button starts a new game with the current difficulty.

## Project structure

| File | Purpose |
|------|---------|
| `src/game.ts` | Pure board logic: mine placement, flood-fill reveal, chording, flags, win/lose checks. |
| `src/Cell.tsx` | Single tile rendering and click / right-click handling. |
| `src/App.tsx` | Game state, difficulty selector, timer, header and grid layout. |
| `src/index.css` | Tailwind CSS entry point. |
