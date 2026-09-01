import type { SnakeGame } from './snakeGame';

const SPEED_BOOST = 5;
const BOOST_HOLD_MS = 180;
const BOOST_CLEAR_MS = 80;

export class LoopController {
  private gameLoopTimerId: ReturnType<typeof setInterval> | null = null;
  private currentLoopMs: number | null = null;
  private speedBoostActive = false;
  private boostEnableTimerId: ReturnType<typeof setTimeout> | null = null;
  private boostClearTimerId: ReturnType<typeof setTimeout> | null = null;
  private heldDirectionKeys = new Set<string>();
  private onSpeedBoostChange?: (active: boolean) => void;

  constructor(
    private game: SnakeGame,
    private onTick: () => void,
    onSpeedBoostChange?: (active: boolean) => void,
  ) {
    this.onSpeedBoostChange = onSpeedBoostChange;
  }

  private getLoopIntervalMs() {
    return this.speedBoostActive
      ? this.game.tickMs / SPEED_BOOST
      : this.game.tickMs;
  }

  private setSpeedBoost(active: boolean) {
    if (this.speedBoostActive === active) {
      return;
    }

    this.speedBoostActive = active;
    this.onSpeedBoostChange?.(active);
  }

  private cancelBoostClear() {
    if (this.boostClearTimerId !== null) {
      clearTimeout(this.boostClearTimerId);
      this.boostClearTimerId = null;
    }
  }

  private cancelBoostEnable() {
    if (this.boostEnableTimerId !== null) {
      clearTimeout(this.boostEnableTimerId);
      this.boostEnableTimerId = null;
    }
  }

  private updateGameLoopSpeed() {
    if (this.gameLoopTimerId === null) {
      return;
    }

    const nextMs = this.getLoopIntervalMs();
    if (nextMs === this.currentLoopMs) {
      return;
    }

    this.currentLoopMs = nextMs;
    clearInterval(this.gameLoopTimerId);
    this.gameLoopTimerId = setInterval(this.onTick, this.currentLoopMs);
  }

  private scheduleBoostEnable() {
    if (
      this.speedBoostActive ||
      this.boostEnableTimerId !== null ||
      this.heldDirectionKeys.size === 0
    ) {
      return;
    }

    this.boostEnableTimerId = setTimeout(() => {
      this.boostEnableTimerId = null;

      if (this.heldDirectionKeys.size > 0) {
        this.setSpeedBoost(true);
        this.updateGameLoopSpeed();
      }
    }, BOOST_HOLD_MS);
  }

  private scheduleBoostClear() {
    this.cancelBoostClear();
    this.boostClearTimerId = setTimeout(() => {
      this.boostClearTimerId = null;

      if (this.heldDirectionKeys.size === 0) {
        this.setSpeedBoost(false);
        this.updateGameLoopSpeed();
      }
    }, BOOST_CLEAR_MS);
  }

  start() {
    if (this.gameLoopTimerId !== null) {
      clearInterval(this.gameLoopTimerId);
    }

    this.currentLoopMs = this.getLoopIntervalMs();
    this.gameLoopTimerId = setInterval(this.onTick, this.currentLoopMs);
  }

  stop() {
    if (this.gameLoopTimerId !== null) {
      clearInterval(this.gameLoopTimerId);
      this.gameLoopTimerId = null;
    }

    this.currentLoopMs = null;
    this.cancelBoostEnable();
    this.cancelBoostClear();
    this.heldDirectionKeys.clear();
    this.setSpeedBoost(false);
  }

  isRunning() {
    return this.gameLoopTimerId !== null;
  }

  handleBoostKeyDown(key: string, isDirectionKey: boolean) {
    if (!isDirectionKey) {
      return;
    }

    this.cancelBoostClear();
    this.heldDirectionKeys.add(key);
    this.scheduleBoostEnable();
  }

  handleBoostKeyUp(key: string, isDirectionKey: boolean) {
    if (!isDirectionKey || !this.heldDirectionKeys.delete(key)) {
      return;
    }

    if (this.heldDirectionKeys.size === 0) {
      this.cancelBoostEnable();
      this.scheduleBoostClear();
      return;
    }

    if (!this.speedBoostActive) {
      this.cancelBoostEnable();
      this.scheduleBoostEnable();
    }
  }
}
