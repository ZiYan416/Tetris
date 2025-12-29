import React from 'react';
import { Board as BoardType, ThemeType } from '../types';
import Cell from './Cell';
import { BLOCK_SIZE, THEMES } from '../constants';

interface BoardProps {
  board: BoardType;
  theme: ThemeType;
}

const Board: React.FC<BoardProps> = ({ board, theme }) => {
  // Guard against empty board initialization
  if (!board || board.length === 0) return null;

  const rows = board.length;
  const cols = board[0].length;
  const currentPalette = THEMES[theme];

  return (
    <div 
        className={`inner-shadow-lg transition-all duration-300 ${
            theme === 'cyberpunk' 
            ? 'bg-slate-900/60 border-x border-slate-700/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]' 
            : 'bg-[#9ead86]/20 border-x border-[#8b9c72]/30'
        }`}
        style={{
            width: 'fit-content',
            height: 'fit-content',
            display: 'grid',
            gridTemplateRows: `repeat(${rows}, ${BLOCK_SIZE}px)`,
            gridTemplateColumns: `repeat(${cols}, ${BLOCK_SIZE}px)`,
            gap: theme === 'cyberpunk' ? '1px' : '1px',
            padding: '2px',
        }}
    >
        {board.map((row, y) =>
          row.map((cell, x) => {
              const type = cell[0] as string;
              return (
                <Cell 
                    key={`${y}-${x}`} 
                    type={cell[0] as any} 
                    color={currentPalette[type] || currentPalette[0]}
                    theme={theme}
                />
              );
          })
        )}
    </div>
  );
};

export default Board;