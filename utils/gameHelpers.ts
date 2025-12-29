import { Board, BoardCell, Player } from '../types';

export const createBoard = (rows: number, cols: number): Board =>
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => [0, 'clear'] as BoardCell)
  );

export const checkCollision = (
  player: Player,
  board: Board,
  { x: moveX, y: moveY }: { x: number; y: number }
): boolean => {
  // Guard clause if board isn't initialized yet
  if (!board || board.length === 0) return true;

  for (let y = 0; y < player.tetromino.length; y += 1) {
    for (let x = 0; x < player.tetromino[y].length; x += 1) {
      // 1. Check that we're on an actual Tetromino cell
      if (player.tetromino[y][x] !== 0) {
        
        const targetY = y + player.pos.y + moveY;
        const targetX = x + player.pos.x + moveX;

        if (
          // 2. Check that our move is inside the game areas height (y)
          // We shouldn't go through the bottom of the play area
          !board[targetY] ||
          // 3. Check that our move is inside the game areas width (x)
          !board[targetY][targetX] ||
          // 4. Check that the cell we're moving to isn't set to clear
          board[targetY][targetX][1] !== 'clear'
        ) {
          return true;
        }
      }
    }
  }
  return false;
};