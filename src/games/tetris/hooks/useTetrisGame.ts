import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  dropIntervalMs,
  hardDrop,
  holdPiece,
  initialState,
  moveHorizontal,
  rotateActive,
  softDrop,
  startGame,
  tick,
  type GameState,
} from '../logic/game';

type Action =
  | { type: 'start' }
  | { type: 'togglePause' }
  | { type: 'tick' }
  | { type: 'move'; direction: -1 | 1 }
  | { type: 'rotate' }
  | { type: 'softDrop' }
  | { type: 'hardDrop' }
  | { type: 'hold' };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'start':
      return startGame();
    case 'togglePause':
      if (state.status === 'playing') return { ...state, status: 'paused' };
      if (state.status === 'paused') return { ...state, status: 'playing' };
      return state;
    case 'tick':
      return tick(state);
    case 'move':
      return moveHorizontal(state, action.direction);
    case 'rotate':
      return rotateActive(state);
    case 'softDrop':
      return softDrop(state);
    case 'hardDrop':
      return hardDrop(state);
    case 'hold':
      return holdPiece(state);
    default:
      return state;
  }
}

export function useTetrisGame() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const current = stateRef.current;
    if (current.status === 'idle' || current.status === 'gameover') {
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        dispatch({ type: 'start' });
      }
      return;
    }

    switch (event.code) {
      case 'ArrowLeft':
        event.preventDefault();
        dispatch({ type: 'move', direction: -1 });
        break;
      case 'ArrowRight':
        event.preventDefault();
        dispatch({ type: 'move', direction: 1 });
        break;
      case 'ArrowUp':
      case 'KeyX':
        event.preventDefault();
        dispatch({ type: 'rotate' });
        break;
      case 'KeyZ':
        event.preventDefault();
        dispatch({ type: 'rotate' });
        break;
      case 'ArrowDown':
        event.preventDefault();
        dispatch({ type: 'softDrop' });
        break;
      case 'Space':
        event.preventDefault();
        dispatch({ type: 'hardDrop' });
        break;
      case 'KeyC':
      case 'ShiftLeft':
      case 'ShiftRight':
        event.preventDefault();
        dispatch({ type: 'hold' });
        break;
      case 'KeyP':
      case 'Escape':
        event.preventDefault();
        dispatch({ type: 'togglePause' });
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (state.status !== 'playing') return;

    const id = window.setInterval(() => {
      dispatch({ type: 'tick' });
    }, dropIntervalMs(state.level));

    return () => window.clearInterval(id);
  }, [state.status, state.level]);

  return { state, dispatch };
}
