const SnakeShell = (() => {
  const CELL_SIZE = 30;
  const SPEED_BOOST = 5;
  const BOOST_HOLD_MS = 180;
  const BOOST_CLEAR_MS = 80;

  function createStatusController(statusElement) {
    return function setStatus(message, state = 'idle') {
      statusElement.textContent = message;
      statusElement.className = `status-banner status-${state}`;
    };
  }

  function createLoopController({ game, speedBadgeElement, onTick }) {
    let gameLoopTimerId = null;
    let currentLoopMs = null;
    let speedBoostActive = false;
    let boostEnableTimerId = null;
    let boostClearTimerId = null;
    const heldDirectionKeys = new Set();

    function getLoopIntervalMs() {
      return speedBoostActive ? game.tickMs / SPEED_BOOST : game.tickMs;
    }

    function setSpeedBoost(active) {
      if (speedBoostActive === active) {
        return;
      }

      speedBoostActive = active;
      speedBadgeElement.classList.toggle('is-active', active);
    }

    function cancelBoostClear() {
      if (boostClearTimerId !== null) {
        clearTimeout(boostClearTimerId);
        boostClearTimerId = null;
      }
    }

    function cancelBoostEnable() {
      if (boostEnableTimerId !== null) {
        clearTimeout(boostEnableTimerId);
        boostEnableTimerId = null;
      }
    }

    function updateGameLoopSpeed() {
      if (gameLoopTimerId === null) {
        return;
      }

      const nextMs = getLoopIntervalMs();
      if (nextMs === currentLoopMs) {
        return;
      }

      currentLoopMs = nextMs;
      clearInterval(gameLoopTimerId);
      gameLoopTimerId = setInterval(onTick, currentLoopMs);
    }

    function scheduleBoostEnable() {
      if (speedBoostActive || boostEnableTimerId !== null || heldDirectionKeys.size === 0) {
        return;
      }

      boostEnableTimerId = setTimeout(() => {
        boostEnableTimerId = null;

        if (heldDirectionKeys.size > 0) {
          setSpeedBoost(true);
          updateGameLoopSpeed();
        }
      }, BOOST_HOLD_MS);
    }

    function scheduleBoostClear() {
      cancelBoostClear();
      boostClearTimerId = setTimeout(() => {
        boostClearTimerId = null;

        if (heldDirectionKeys.size === 0) {
          setSpeedBoost(false);
          updateGameLoopSpeed();
        }
      }, BOOST_CLEAR_MS);
    }

    function start() {
      if (gameLoopTimerId !== null) {
        clearInterval(gameLoopTimerId);
      }

      currentLoopMs = getLoopIntervalMs();
      gameLoopTimerId = setInterval(onTick, currentLoopMs);
    }

    function stop() {
      if (gameLoopTimerId !== null) {
        clearInterval(gameLoopTimerId);
        gameLoopTimerId = null;
      }

      currentLoopMs = null;
      cancelBoostEnable();
      cancelBoostClear();
      heldDirectionKeys.clear();
      setSpeedBoost(false);
    }

    function isRunning() {
      return gameLoopTimerId !== null;
    }

    function handleBoostKeyDown(event) {
      const direction = SnakeCore.getDirectionFromKey(event.key);
      if (!direction) {
        return;
      }

      cancelBoostClear();
      heldDirectionKeys.add(event.key);
      scheduleBoostEnable();
    }

    function handleBoostKeyUp(event) {
      const direction = SnakeCore.getDirectionFromKey(event.key);
      if (!direction || !heldDirectionKeys.delete(event.key)) {
        return;
      }

      if (heldDirectionKeys.size === 0) {
        cancelBoostEnable();
        scheduleBoostClear();
        return;
      }

      if (!speedBoostActive) {
        cancelBoostEnable();
        scheduleBoostEnable();
      }
    }

    return {
      start,
      stop,
      isRunning,
      handleBoostKeyDown,
      handleBoostKeyUp,
    };
  }

  function bindKeyboard({ loop, game, onStartWhenIdle, onPause, onResume, onDirectionChange }) {
    const { getDirectionFromKey, isStartKey } = SnakeCore;

    function handleDirectionInput(event) {
      if (game.handleDirectionKey(event)) {
        onDirectionChange?.();
      }
    }

    window.addEventListener('keydown', (event) => {
      const direction = getDirectionFromKey(event.key);

      if (isStartKey(event.key)) {
        event.preventDefault();

        if (game.isGameActive && loop.isRunning()) {
          loop.stop();
          onPause?.();
          return;
        }

        if (game.isGameActive && !loop.isRunning()) {
          loop.start();
          onResume?.();
          return;
        }

        if (!game.isGameActive && !loop.isRunning()) {
          onStartWhenIdle(undefined);
        }

        return;
      }

      if (!loop.isRunning() && direction) {
        event.preventDefault();

        if (game.isGameActive) {
          handleDirectionInput(event);
          return;
        }

        onStartWhenIdle(direction ?? undefined);

        if (loop.isRunning()) {
          loop.handleBoostKeyDown(event);
        }

        return;
      }

      if (game.isGameActive && loop.isRunning()) {
        handleDirectionInput(event);
        loop.handleBoostKeyDown(event);
        return;
      }

      if (game.isGameActive && !loop.isRunning() && direction) {
        event.preventDefault();
        handleDirectionInput(event);
      }
    });

    window.addEventListener('keyup', (event) => {
      loop.handleBoostKeyUp(event);
    });
  }

  return {
    CELL_SIZE,
    createStatusController,
    createLoopController,
    bindKeyboard,
  };
})();
