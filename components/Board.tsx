import React from 'react';
import { Board as BoardType } from '../types';
import Cell from './Cell';

interface BoardProps {
  board: BoardType;
}

const Board: React.FC<BoardProps> = ({ board }) => {
  return (
    <div className="w-full h-full bg-[#9ead86]/20 inner-shadow-lg">
      <div className="grid grid-rows-[repeat(20,minmax(0,1fr))] grid-cols-[repeat(10,minmax(0,1fr))] gap-[1px] w-full h-full p-[2px]">
        {board.map((row, y) =>
          row.map((cell, x) => <Cell key={`${y}-${x}`} type={cell[0] as any} />)
        )}
      </div>
    </div>
  );
};

export default Board;