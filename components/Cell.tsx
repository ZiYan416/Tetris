import React from 'react';
import { TetrominoType, ThemeType } from '../types';

interface CellProps {
  type: TetrominoType | 0;
  color: string;
  theme: ThemeType;
}

const Cell: React.FC<CellProps> = ({ type, color, theme }) => {
  const isFilled = type !== 0;
  
  // Custom styles based on theme
  const getStyle = () => {
      const baseStyle: React.CSSProperties = {
        backgroundColor: isFilled ? `rgb(${color})` : 'transparent',
        opacity: isFilled ? 1 : 0,
        transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
      };

      if (!isFilled) return baseStyle;

      if (theme === 'retro') {
          return {
              ...baseStyle,
              boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.25), inset -1px -1px 0 rgba(0,0,0,0.1)',
              borderRadius: '3px'
          };
      } else {
          // Cyberpunk Style: Glow and sharper edges
          return {
              ...baseStyle,
              boxShadow: `0 0 8px rgba(${color}, 0.6), inset 0 0 4px rgba(255,255,255,0.4)`,
              border: `1px solid rgba(${color}, 0.8)`,
              borderRadius: '1px'
          };
      }
  };
  
  return (
    <div
      className="w-full h-full"
      style={getStyle()}
    />
  );
};

export default React.memo(Cell);