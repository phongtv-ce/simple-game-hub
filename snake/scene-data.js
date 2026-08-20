/**
 * Maze scenes and themes.
 * Layout chars: . empty, # solid wall, o pass-through gate
 * Walls are drawn as connected structures (rooms, bars, pillars) — not lone cells.
 */
const SceneData = (() => {
  const GRID_SIZE = 20;
  const INITIAL_LENGTH = 3;
  const APPLES_PER_STAGE = 5;
  const STAGE_LENGTH_GOAL = INITIAL_LENGTH + APPLES_PER_STAGE;

  const themes = {
    light: {
      id: "light",
      title: "Light",
      empty: "#ffffff",
      solidFill: "#616161",
      solidStroke: "#424242",
      passFill: "rgba(79, 195, 247, 0.35)",
      passStroke: "#0288d1",
    },
    forest: {
      id: "forest",
      title: "Forest",
      empty: "#ffffff",
      solidFill: "#33691e",
      solidStroke: "#1b5e20",
      passFill: "rgba(129, 199, 132, 0.4)",
      passStroke: "#2e7d32",
    },
    matrix: {
      id: "matrix",
      title: "Matrix",
      empty: "#ffffff",
      solidFill: "#1b5e20",
      solidStroke: "#004d40",
      passFill: "rgba(0, 255, 65, 0.3)",
      passStroke: "#00c853",
    },
  };

  function rowsToMatrix(rows) {
    const map = { ".": 0, "#": 1, o: 2 };

    return rows.map((row) => {
      if (row.length !== GRID_SIZE) {
        throw new Error(
          `Scene row must be ${GRID_SIZE} wide, got ${row.length}: ${row}`,
        );
      }

      return [...row].map((cell) => map[cell] ?? 1);
    });
  }

  const sceneDefs = [
    {
      title: "Twin Rooms",
      start: { x: 4, y: 1 },
      direction: "right",
      tickMs: 430,
      layout: [
        "....................",
        "....................",
        "...####......####...",
        "...#..o......o..#...",
        "...#..o......o..#...",
        "...####......####...",
        "....................",
        "....................",
        "........#..#........",
        "....o...#..#...o....",
        "........####........",
        "....................",
        ".....##########.....",
        ".....#........o.....",
        ".....#........#.....",
        ".....o........#.....",
        ".....##########.....",
        "....................",
        "....................",
        "....................",
      ],
    },
    {
      title: "Castle Gate",
      start: { x: 4, y: 1 },
      direction: "right",
      tickMs: 320,
      layout: [
        "....................",
        "....................",
        "...####......####...",
        "...#..#......#..#...",
        "...#..o##oo##o..#...",
        "...####......####...",
        "....................",
        ".....##########.....",
        ".....#........#.....",
        "...o.#........#.o...",
        ".....#........#.....",
        ".....##########.....",
        "....................",
        "..####........####..",
        "..#..#........#..#..",
        "..#..o........o..#..",
        "..#..#........#..#..",
        "..####........####..",
        "....................",
        "....................",
      ],
    },
    {
      title: "Crystal Vault",
      start: { x: 4, y: 1 },
      direction: "right",
      tickMs: 280,
      layout: [
        "....................",
        "....................",
        "..######....######..",
        "..#....#....#....#..",
        "..#.o..#....#..o.#..",
        "..#....#....#....#..",
        "..######....######..",
        ".......#....#.......",
        ".......o....o.......",
        ".......#....#.......",
        "..##############....",
        "..#............#....",
        "..#....####....#....",
        "..#....#..#....#....",
        "..#....#..o....#....",
        "..#....####....#....",
        "..#............#....",
        "..##############....",
        "....................",
        "....................",
      ],
    },
  ];

  const scenes = sceneDefs.map((scene) => ({
    ...scene,
    matrix: rowsToMatrix(scene.layout),
  }));

  const TOTAL_STAGES = scenes.length;

  function getStage(stageIndex) {
    const index = Math.max(0, Math.min(stageIndex, TOTAL_STAGES - 1));
    const scene = scenes[index];

    return {
      title: scene.title,
      start: { ...scene.start },
      direction: scene.direction ?? "right",
      initialLength: INITIAL_LENGTH,
      tickMs: scene.tickMs,
      cells: scene.matrix.map((row) => [...row]),
      description: `Stage ${index + 1} of ${TOTAL_STAGES}: eat ${APPLES_PER_STAGE} apples to reach length ${STAGE_LENGTH_GOAL}.`,
    };
  }

  function getTheme(themeId) {
    return themes[themeId] ?? themes.light;
  }

  function getThemeList() {
    return Object.values(themes).map(({ id, title }) => ({ id, title }));
  }

  return {
    GRID_SIZE,
    INITIAL_LENGTH,
    APPLES_PER_STAGE,
    STAGE_LENGTH_GOAL,
    TOTAL_STAGES,
    getStage,
    getTheme,
    getThemeList,
  };
})();
