export type TetrominoType = '0' | 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface ITetromino {
  shape: (string | number)[][];
  color: string; // RGB string
}

export type BoardCell = [string | number, string]; // [type, state] e.g. ['L', 'merged']

export type Board = BoardCell[][];

export interface Player {
  pos: { x: number; y: number };
  tetromino: (string | number)[][];
  collided: boolean;
}

export enum GameStatus {
  HOME = 'HOME',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER'
}

export enum Difficulty {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD'
}

export type Language = 'zh' | 'en';