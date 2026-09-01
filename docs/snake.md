# Snake

Browser-based Snake with two modes: **Classic** (open board) and **Maze** (three staged layouts). Both share the same core engine, renderer, and input shell.

**Route:** `/snake`

## Getting started

From the repo root:

```bash
pnpm install
pnpm dev
```

Then open `/snake` in the app.

| Mode | Description |
|------|-------------|
| Classic | 20×20 open grid; toggle wall collision or wrap-around edges |
| Maze | Three maze stages with walls, gates, and wrap-around edges |

Switch between Classic and Maze using the toggle in the page header.

## Screenshot

Maze mode — Stage 1 (**Twin Rooms**):

![Snake Maze — Twin Rooms stage with compact stats sidebar](images/snake/image.png)

The board shows solid walls (grey), pass-through gates (dashed outline on the floor), the snake with a cartoon head, and a red apple. The sidebar tracks stage progress, apples eaten, length goal, and controls.

## Controls

| Input | Action |
|-------|--------|
| **Arrow keys** | Steer the snake (direction applies immediately) |
| **Space** | Start when idle · Pause when running · Resume when paused |
| **Hold arrow ~0.2 s** | 5× speed boost while held |

Start and resume use a **canvas overlay** (same pattern as Tetris): click **Start** / **Play Again** on the board, or press **Space** / **Enter** / an arrow key.

## Classic mode

- **Grid:** 20×20, snake starts at length 3 in the center.
- **Modes:** Switch between **Wall collision** (hitting a wall or yourself ends the game) and **Wrap-around** (leaving one edge re-enters on the opposite side). Use **Switch mode** in the sidebar when idle.
- **Goal:** Eat apples to grow; avoid collisions (in wall mode) or yourself.

## Maze mode

- **Grid:** 20×20 with structured wall layouts — rooms, bars, and pillars.
- **Edges:** Always wrap-around (leave one side, re-enter the other).
- **Walls:**
  - **Solid** (`#`) — blocks movement
  - **Pass-through gates** (`o`) — same floor color as open cells, marked with a dashed border
- **Stages:** Clear all three by eating **5 apples** per stage to reach **length 8**, then advance. The game pauses between stages so you can read the next layout before continuing.

| Stage | Name | Tick speed |
|-------|------|------------|
| 1 | Twin Rooms | 430 ms |
| 2 | Castle Bricks | 320 ms |
| 3 | Crystal Vault | 280 ms |

**Color themes:** Light, Forest, Matrix — open the **Theme** button in the sidebar to pick a theme from a popup. The compact sidebar matches the board height.

## Project layout

```
src/games/snake/
├── SnakePage.tsx
├── components/
│   ├── ClassicGame.tsx
│   ├── MazeGame.tsx
│   ├── GameCanvas.tsx
│   ├── ThemePicker.tsx
│   └── ui.tsx
├── logic/
│   ├── snakeGame.ts
│   ├── sceneData.ts
│   ├── loopController.ts
│   └── types.ts
├── hooks/
│   └── useSnakeGame.ts
└── renderer/
    └── draw.ts

public/food.svg
```

Scene layouts are defined as ASCII grids in `sceneData.ts` (`.` empty, `#` solid, `o` gate).

## How it works

- `SnakeGame` in `logic/snakeGame.ts` owns movement, food spawning, collisions, and wrap mode.
- `LoopController` drives the tick loop and 5× speed boost on held keys.
- `useSnakeGame` wires keyboard input, pause/resume, and React state to the canvas.
- `draw.ts` renders classic and maze boards; maze gates use `theme.empty` fill with a dashed `passStroke` outline.

## Tips

- Food never spawns on walls, gates, or snake segments.
- After game over, use **Play Again** on the overlay or press **Space** / an arrow key to retry.
- In maze mode, clearing all three stages shows a **Victory** overlay with total apples eaten.
