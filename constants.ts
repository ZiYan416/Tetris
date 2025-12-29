import { ITetromino, TetrominoType } from './types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// Morandi / Rich Muted Palette (RGB values)
// More sophisticated, less neon, softer on eyes but distinct.
export const TETROMINOS: Record<string, ITetromino> = {
  0: { shape: [[0]], color: '30, 41, 59' }, // Dark Slate (Background)
  I: {
    shape: [
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
    ],
    color: '164, 197, 198', // Morandi Blue (Haze)
  },
  J: {
    shape: [
      [0, 'J', 0],
      [0, 'J', 0],
      ['J', 'J', 0],
    ],
    color: '136, 150, 171', // Morandi Indigo (Steel)
  },
  L: {
    shape: [
      [0, 'L', 0],
      [0, 'L', 0],
      [0, 'L', 'L'],
    ],
    color: '232, 195, 158', // Morandi Orange (Apricot)
  },
  O: {
    shape: [
      ['O', 'O'],
      ['O', 'O'],
    ],
    color: '243, 230, 182', // Morandi Yellow (Cream)
  },
  S: {
    shape: [
      [0, 'S', 'S'],
      ['S', 'S', 0],
      [0, 0, 0],
    ],
    color: '167, 196, 166', // Morandi Green (Sage)
  },
  T: {
    shape: [
      [0, 0, 0],
      ['T', 'T', 'T'],
      [0, 'T', 0],
    ],
    color: '191, 166, 199', // Morandi Purple (Lilac)
  },
  Z: {
    shape: [
      ['Z', 'Z', 0],
      [0, 'Z', 'Z'],
      [0, 0, 0],
    ],
    color: '223, 162, 162', // Morandi Red (Dusty Rose)
  },
};

export const RANDOM_TETROMINO = (): { type: TetrominoType; shape: (string|number)[][]; color: string } => {
  const tetrominos = 'IJLOSTZ';
  const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)] as TetrominoType;
  return {
    type: randTetromino,
    shape: TETROMINOS[randTetromino].shape,
    color: TETROMINOS[randTetromino].color,
  };
};