# Simple Game Hub

A unified React app with six browser games. Each game keeps its logic separate from UI components under `src/games/<name>/`.

## Quick start

```bash
pnpm install
pnpm dev
```

Open the local dev URL, pick a game from the home page, or go directly to a route (e.g. `/snake`, `/tetris`).

## Games

| Game | Route | Docs |
|------|-------|------|
| Snake | `/snake` | [Snake](docs/snake.md) — classic + maze modes, 3 stages |
| Tetris | `/tetris` | [Tetris](docs/tetris.md) — hold, levels, line scoring |
| Tic-Tac-Toe | `/tic-tac-toe` | [Tic-Tac-Toe](docs/tic-tac-toe.md) — N×N two-player board |
| Five in a Row | `/five-in-a-row` | [Five in a Row](docs/five-in-a-row.md) — Gomoku vs AI or friend |
| Miner | `/miner` | [Miner](docs/miner.md) — minesweeper, 3 difficulties |
| Sudoku | `/sudoku` | [Sudoku](docs/sudoku.md) — notes, hints, 4 difficulties |

## Project layout

```
src/
├── App.tsx              # Routes
├── pages/HomePage.tsx   # Game picker
└── games/
    └── <name>/
        ├── logic/       # Pure game engine (no React)
        ├── components/  # UI
        ├── hooks/       # React wiring (where needed)
        └── *Page.tsx    # Page entry
```

## Build

```bash
pnpm build
pnpm preview
```

Output goes to `dist/`.

## Tech stack

- **React 19** + **TypeScript**
- **Vite** for dev and production builds
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **React Router** for in-app navigation between games
