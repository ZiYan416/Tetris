export type TetrominoType = '0' | 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface ITetromino {
  shape: (string | number)[][];
  // Color is now handled by the Theme system, removed from here to allow dynamic switching
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
  GAME_OVER = 'GAME_OVER',
  LEADERBOARD = 'LEADERBOARD'
}

export enum Difficulty {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD'
}

export interface HighScore {
  id: string;
  player_name: string;
  score: number;
  difficulty: string;
  created_at: string;
}

export type Language = 'zh' | 'en';
export type ThemeType = 'retro' | 'cyberpunk';