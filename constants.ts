import { ITetromino, TetrominoType, ThemeType } from './types';

// Default values for initialization only, actual values are calculated dynamically
export const DEFAULT_WIDTH = 10;
export const DEFAULT_HEIGHT = 20;
export const BLOCK_SIZE = 22; 

// Shapes Definition
export const TETROMINO_SHAPES: Record<string, (string | number)[][]> = {
  0: [[0]], 
  I: [
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
  ],
  J: [
      [0, 'J', 0],
      [0, 'J', 0],
      ['J', 'J', 0],
  ],
  L: [
      [0, 'L', 0],
      [0, 'L', 0],
      [0, 'L', 'L'],
  ],
  O: [
      ['O', 'O'],
      ['O', 'O'],
  ],
  S: [
      [0, 'S', 'S'],
      ['S', 'S', 0],
      [0, 0, 0],
  ],
  T: [
      [0, 0, 0],
      ['T', 'T', 'T'],
      [0, 'T', 0],
  ],
  Z: [
      ['Z', 'Z', 0],
      [0, 'Z', 'Z'],
      [0, 0, 0],
  ],
};

// Color Palettes
// Using RGBA strings for easier CSS manipulation
export const THEMES: Record<ThemeType, Record<string, string>> = {
    retro: {
        0: '30, 41, 59',    // Dark Slate
        I: '164, 197, 198', // Morandi Blue
        J: '136, 150, 171', // Morandi Indigo
        L: '232, 195, 158', // Morandi Orange
        O: '243, 230, 182', // Morandi Yellow
        S: '167, 196, 166', // Morandi Green
        T: '191, 166, 199', // Morandi Purple
        Z: '223, 162, 162', // Morandi Red
    },
    cyberpunk: {
        0: '15, 23, 42',    // Deep Navy
        I: '6, 182, 212',   // Cyan Neon
        J: '59, 130, 246',  // Blue Neon
        L: '249, 115, 22',  // Orange Neon
        O: '250, 204, 21',  // Yellow Neon
        S: '34, 197, 94',   // Green Neon
        T: '168, 85, 247',  // Purple Neon
        Z: '236, 72, 153',  // Pink Neon
    }
};

export const RANDOM_TETROMINO = (): { type: TetrominoType; shape: (string|number)[][] } => {
  const tetrominos = 'IJLOSTZ';
  const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)] as TetrominoType;
  return {
    type: randTetromino,
    shape: TETROMINO_SHAPES[randTetromino],
  };
};