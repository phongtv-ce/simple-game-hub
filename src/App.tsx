import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { HomePage } from './pages/HomePage';
import { SnakePage } from './games/snake/SnakePage';
import { TetrisPage } from './games/tetris/TetrisPage';
import { TicTacToePage } from './games/tic-tac-toe/TicTacToePage';
import { FiveInARowPage } from './games/five-in-a-row/FiveInARowPage';
import { MinerPage } from './games/miner/MinerPage';
import { SudokuPage } from './games/sudoku/SudokuPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="snake" element={<SnakePage />} />
        <Route path="tetris" element={<TetrisPage />} />
        <Route path="tic-tac-toe" element={<TicTacToePage />} />
        <Route path="five-in-a-row" element={<FiveInARowPage />} />
        <Route path="miner" element={<MinerPage />} />
        <Route path="sudoku" element={<SudokuPage />} />
      </Route>
    </Routes>
  );
}
