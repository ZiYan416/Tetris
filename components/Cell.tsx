import React from 'react';
import { TETROMINOS } from '../constants';
import { TetrominoType } from '../types';

interface CellProps {
  type: TetrominoType | 0;
}

const Cell: React.FC<CellProps> = ({ type }) => {
  const isFilled = type !== 0;
  const color = isFilled ? TETROMINOS[type as string].color : '0, 0, 0'; 
  
  return (
    <div
      className="w-full h-full rounded-[3px]"
      style={{
        backgroundColor: isFilled ? `rgb(${color})` : 'transparent',
        opacity: isFilled ? 1 : 0,
        // Soft bevel for a tactile feel, less digital/harsh
        boxShadow: isFilled 
            ? 'inset 1px 1px 0 rgba(255,255,255,0.25), inset -1px -1px 0 rgba(0,0,0,0.1)' 
            : 'none',
        transition: 'background-color 0.15s ease'
      }}
    />
  );
};

export default React.memo(Cell);