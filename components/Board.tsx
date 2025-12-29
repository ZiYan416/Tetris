import React from 'react';
import { Board as BoardType } from '../types';
import Cell from './Cell';
import { BLOCK_SIZE } from '../constants';

interface BoardProps {
  board: BoardType;
}

const Board: React.FC<BoardProps> = ({ board }) => {
  // Guard against empty board initialization
  if (!board || board.length === 0) return null;

  const rows = board.length;
  const cols = board[0].length;

  return (
    <div 
        className="bg-[#9ead86]/20 inner-shadow-lg border-x border-[#8b9c72]/30 transition-all duration-300"
        style={{
            // Use fixed pixel sizes for tracks to ensure the board has dimensions.
            // Since App.tsx calculated cols/rows based on BLOCK_SIZE, this will fit perfectly.
            width: 'fit-content',
            height: 'fit-content',
            display: 'grid',
            gridTemplateRows: `repeat(${rows}, ${BLOCK_SIZE}px)`,
            gridTemplateColumns: `repeat(${cols}, ${BLOCK_SIZE}px)`,
            gap: '1px',
            padding: '2px',
        }}
    >
        {board.map((row, y) =>
          row.map((cell, x) => <Cell key={`${y}-${x}`} type={cell[0] as any} />)
        )}
    </div>
  );
};

export default Board;