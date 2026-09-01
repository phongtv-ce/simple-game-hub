# Miner

Browser-based Minesweeper with three board sizes, safe first click, flags, chording, and a timer.

**Route:** `/miner`

## Getting started

From the repo root:

```bash
pnpm install
pnpm dev
```

Then open `/miner` in the app.

## Rules

1. Every cell is either empty or contains a mine.
2. Revealed empty cells show how many adjacent mines touch that cell.
3. Win by revealing every non-mine cell.
4. Lose by revealing a mine.

Mines are placed **after your first click**, so the first reveal is never a mine.

## Controls

| Input | Action |
|-------|--------|
| **Left click** | Reveal a hidden cell |
| **Right click** | Toggle a flag on a hidden cell |
| **Click a revealed number** | Chord — auto-reveal neighbours when flagged count matches the number |

## Difficulties

| Level | Grid | Mines |
|-------|------|-------|
| Beginner | 9×9 | 10 |
| Intermediate | 16×16 | 40 |
| Expert | 16×30 | 99 |

Switch difficulty from the buttons above the board. Click the **smiley face** to start a new game at the current difficulty.

The header shows **mines remaining** (total mines minus flags) and a **timer** that starts on the first reveal.

## Project layout

```
src/games/miner/
├── MinerPage.tsx
├── components/
│   └── Cell.tsx
└── logic/
    └── game.ts    # Board, mines, reveal flood-fill, chording
```

## How it works

- `createEmptyBoard` builds a grid of hidden cells; `placeMines` seeds mines after the first click while keeping that cell safe.
- `revealCell` flood-fills through zero-adjacent cells.
- `chordCell` reveals surrounding hidden cells when the player has flagged the correct number of neighbours.
- `MinerPage` holds difficulty, timer, and win/loss state; `Cell` handles left/right click and chord.
