import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createBoard, checkCollision } from './utils/gameHelpers';
import { useInterval } from './hooks/useInterval';
import { RANDOM_TETROMINO, DEFAULT_WIDTH, DEFAULT_HEIGHT, BLOCK_SIZE } from './constants';
import { Board as BoardType, Player, GameStatus, Difficulty, Language } from './types';
import Board from './components/Board';
import Controls from './components/Controls';
import { Play, RefreshCw, Home, Globe, Battery } from 'lucide-react';

const TRANSLATIONS = {
  zh: {
    title: '俄罗斯方块',
    start: '点击开始',
    resume: '继续',
    restart: '重来',
    home: '主菜单',
    paused: '暂停',
    gameOver: '游戏结束',
    score: '分数',
    level: '等级',
    diffEasy: '简单',
    diffNormal: '普通',
    diffHard: '困难',
  },
  en: {
    title: 'TETRIS',
    start: 'PRESS START',
    resume: 'RESUME',
    restart: 'RESTART',
    home: 'HOME',
    paused: 'PAUSED',
    gameOver: 'GAME OVER',
    score: 'SCORE',
    level: 'LEVEL',
    diffEasy: 'EASY',
    diffNormal: 'NORM',
    diffHard: 'HARD',
  }
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('zh');
  const t = TRANSLATIONS[language];

  // Dynamic Grid Dimensions
  const [gridSize, setGridSize] = useState({ rows: DEFAULT_HEIGHT, cols: DEFAULT_WIDTH });
  const lcdRef = useRef<HTMLDivElement>(null);

  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.HOME);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.NORMAL);

  const [score, setScore] = useState(0);
  const [rows, setRows] = useState(0);
  const [level, setLevel] = useState(1);
  const [fastDrop, setFastDrop] = useState(false);

  const [board, setBoard] = useState<BoardType>(createBoard(DEFAULT_HEIGHT, DEFAULT_WIDTH));
  const [player, setPlayer] = useState<Player>({
    pos: { x: 0, y: 0 },
    tetromino: [[0]],
    collided: false,
  });

  const appRef = useRef<HTMLDivElement>(null);

  // --- Dynamic Resizing Logic ---
  useEffect(() => {
    // Function to calculate grid based on container size
    const calculateGrid = () => {
      if (lcdRef.current && gameStatus === GameStatus.HOME) {
        const { clientWidth, clientHeight } = lcdRef.current;
        
        // Precise Calculation of Grid Dimensions
        const GAP = 1;
        const CELL_PITCH = BLOCK_SIZE + GAP; // 25px
        
        // Horizontal Overhead: 
        // 2px padding-left/right + 1px border-left/right = 6px.
        // Increased to 12px for safety buffer.
        const H_OVERHEAD = 12; 
        
        // Vertical Overhead:
        // 2px padding-top/bottom = 4px.
        // Increased to 12px for safety buffer to prevent bottom row clipping.
        // This ensures that even if the footer layout shifts slightly, we don't cut off the last row.
        const V_OVERHEAD = 12;

        const cols = Math.floor((clientWidth - H_OVERHEAD) / CELL_PITCH);
        const rows = Math.floor((clientHeight - V_OVERHEAD) / CELL_PITCH);
        
        // Ensure reasonable minimums
        const safeCols = Math.max(8, cols);
        const safeRows = Math.max(10, rows);

        // Only update if dimensions actually changed to avoid render loops
        setGridSize(prev => {
            if (prev.cols !== safeCols || prev.rows !== safeRows) {
                // Side effect in setState callback is generally safe here as we need synchronized update
                setBoard(createBoard(safeRows, safeCols));
                return { rows: safeRows, cols: safeCols };
            }
            return prev;
        });
      }
    };

    // Use ResizeObserver to detect container size changes (e.g. when Footer renders/shifts)
    // This is more robust than window.resize for Flexbox layouts
    const observer = new ResizeObserver(() => {
        // Wrap in requestAnimationFrame to avoid "ResizeObserver loop limit exceeded"
        requestAnimationFrame(calculateGrid);
    });

    if (lcdRef.current) {
        observer.observe(lcdRef.current);
    }
    
    // Initial calculation
    calculateGrid();

    return () => observer.disconnect();
  }, [gameStatus]); // Removed gridSize dependency to prevent loops, added logic inside setter


  // Speed Calculation
  const calcDropTime = useCallback((lvl: number) => {
    let baseSpeed = 1000;
    let multiplier = 0.8;

    if (difficulty === Difficulty.EASY) {
      baseSpeed = 1200;
      multiplier = 0.6;
    } else if (difficulty === Difficulty.HARD) {
      baseSpeed = 800;
      multiplier = 1.0;
    }
    return Math.max(100, baseSpeed / (lvl * multiplier + 0.2));
  }, [difficulty]);

  const resetPlayer = useCallback(() => {
    // Dynamically center the player based on current grid columns
    setPlayer({
      pos: { x: Math.floor(gridSize.cols / 2) - 2, y: 0 },
      tetromino: RANDOM_TETROMINO().shape,
      collided: false,
    });
  }, [gridSize.cols]);

  const startGame = () => {
    // Create board with current dimensions
    setBoard(createBoard(gridSize.rows, gridSize.cols));
    setDropTime(calcDropTime(1));
    resetPlayer();
    setScore(0);
    setRows(0);
    setLevel(1);
    setFastDrop(false);
    setGameStatus(GameStatus.PLAYING);
    appRef.current?.focus();
  };

  const pauseGame = () => {
    if (gameStatus === GameStatus.PLAYING) {
      setGameStatus(GameStatus.PAUSED);
      setDropTime(null);
    } else if (gameStatus === GameStatus.PAUSED) {
      setGameStatus(GameStatus.PLAYING);
      setDropTime(fastDrop ? 50 : calcDropTime(level));
    }
  };

  const quitToHome = () => {
    setGameStatus(GameStatus.HOME);
    setDropTime(null);
  };

  const drop = () => {
    // Increase level every 10 cleared rows
    if (rows > (level + 1) * 10) {
      setLevel((prev) => prev + 1);
      if (!fastDrop) {
        setDropTime(calcDropTime(level + 1));
      }
    }

    if (!checkCollision(player, board, { x: 0, y: 1 })) {
      setPlayer((prev) => ({
        ...prev,
        pos: { x: prev.pos.x, y: prev.pos.y + 1 },
      }));
    } else {
      if (player.pos.y < 1) {
        setGameStatus(GameStatus.GAME_OVER);
        setDropTime(null);
      }
      setPlayer((prev) => ({ ...prev, collided: true }));
    }
  };

  const startSoftDrop = () => {
    if (gameStatus !== GameStatus.PLAYING) return;
    setFastDrop(true);
    setDropTime(50);
  };

  const stopSoftDrop = () => {
    if (gameStatus !== GameStatus.PLAYING) return;
    setFastDrop(false);
    setDropTime(calcDropTime(level));
  };

  const movePlayer = (dir: number) => {
    if (gameStatus !== GameStatus.PLAYING) return;
    if (!checkCollision(player, board, { x: dir, y: 0 })) {
      setPlayer((prev) => ({
        ...prev,
        pos: { x: prev.pos.x + dir, y: prev.pos.y },
      }));
    }
  };

  const playerRotate = () => {
    if (gameStatus !== GameStatus.PLAYING) return;
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    const m = clonedPlayer.tetromino.map((_: any, index: number) => 
        clonedPlayer.tetromino.map((col: any[]) => col[index])
    );
    const rotatedTetromino = m.map((row: any[]) => row.reverse());
    clonedPlayer.tetromino = rotatedTetromino;

    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, board, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.tetromino[0].length) {
        return; 
      }
    }
    setPlayer(clonedPlayer);
  };

  const handleKeyDown = ({ keyCode }: { keyCode: number }) => {
    if (gameStatus === GameStatus.PLAYING) {
      if (keyCode === 37) movePlayer(-1);
      else if (keyCode === 39) movePlayer(1);
      else if (keyCode === 40) { if (!fastDrop) startSoftDrop(); }
      else if (keyCode === 38) playerRotate();
      else if (keyCode === 27) pauseGame();
    }
  };

  const handleKeyUp = ({ keyCode }: { keyCode: number }) => {
    if (gameStatus === GameStatus.PLAYING) {
      if (keyCode === 40) stopSoftDrop();
    }
  };

  useInterval(() => {
    if (gameStatus === GameStatus.PLAYING) drop();
  }, dropTime);

  React.useEffect(() => {
    const updateBoard = (prevBoard: BoardType): BoardType => {
      // Create new board
      const newBoard = prevBoard.map((row) =>
        row.map((cell) => (cell[1] === 'clear' ? [0, 'clear'] : cell))
      ) as BoardType;

      player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            // Check boundaries based on dynamic board size
            if (
              newBoard[y + player.pos.y] &&
              newBoard[y + player.pos.y][x + player.pos.x]
            ) {
              newBoard[y + player.pos.y][x + player.pos.x] = [
                value,
                `${player.collided ? 'merged' : 'clear'}`,
              ];
            }
          }
        });
      });

      if (player.collided) {
        resetPlayer();
        setFastDrop(false); 
        setDropTime(calcDropTime(level));
        return sweepRows(newBoard);
      }
      return newBoard;
    };

    const sweepRows = (newBoard: BoardType): BoardType => {
      let rowsCleared = 0;
      const sweptBoard = newBoard.reduce((acc, row) => {
        if (row.findIndex((cell) => cell[0] === 0) === -1) {
          rowsCleared += 1;
          // Dynamically fill new rows based on current cols
          acc.unshift(new Array(newBoard[0].length).fill([0, 'clear']));
          return acc;
        }
        acc.push(row);
        return acc;
      }, [] as BoardType);

      if (rowsCleared > 0) {
        setRows((prev) => prev + rowsCleared);
        setScore((prev) => prev + [40, 100, 300, 1200][rowsCleared - 1] * level);
      }
      return sweptBoard;
    };

    if (gameStatus === GameStatus.PLAYING) {
        setBoard((prev) => updateBoard(prev));
    }
  }, [player.collided, player.pos.x, player.pos.y, player.tetromino, resetPlayer, level, gameStatus, calcDropTime]);


  // --- Render Sections ---

  const renderScreenContent = () => {
    if (gameStatus === GameStatus.HOME) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-800 space-y-6 animate-in fade-in p-4 text-center">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-800/80">{t.title}</h1>
                <div className="flex flex-wrap justify-center gap-2">
                    {(['EASY', 'NORMAL', 'HARD'] as Difficulty[]).map((d) => (
                        <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={`px-3 py-1.5 text-xs font-bold rounded border-2 transition-all ${
                                difficulty === d 
                                ? 'bg-slate-700 text-white border-slate-700' 
                                : 'text-slate-500 border-slate-300 hover:border-slate-400'
                            }`}
                        >
                            {d === 'EASY' ? t.diffEasy : d === 'NORMAL' ? t.diffNormal : t.diffHard}
                        </button>
                    ))}
                </div>
                <button 
                    onClick={startGame}
                    className="animate-pulse px-8 py-3 bg-slate-800 text-[#9ead86] font-bold rounded-sm text-sm sm:text-base hover:bg-slate-700"
                >
                    {t.start}
                </button>
                <div className="absolute top-2 right-2">
                    <button onClick={() => setLanguage(l => l === 'zh' ? 'en' : 'zh')} className="p-1">
                        <Globe size={18} className="text-slate-500 hover:text-slate-800" />
                    </button>
                </div>
                
                {/* Debug Info */}
                <div className="absolute bottom-2 text-[9px] text-slate-400 font-mono">
                    GRID: {gridSize.cols}x{gridSize.rows}
                </div>
            </div>
        );
    }
    
    return (
        // Flex center ensures the dynamic board is centered if it doesn't fill pixel-perfectly
        <div className="relative w-full h-full flex items-center justify-center">
            <Board board={board} />
            
            {(gameStatus === GameStatus.PAUSED || gameStatus === GameStatus.GAME_OVER) && (
                <div className="absolute inset-0 z-50 bg-slate-800/80 flex flex-col items-center justify-center text-[#9ead86] gap-4 p-4">
                    <h2 className="text-2xl font-bold">{gameStatus === GameStatus.GAME_OVER ? t.gameOver : t.paused}</h2>
                    {gameStatus === GameStatus.GAME_OVER && (
                        <p className="font-mono text-xl">{score}</p>
                    )}
                    <div className="flex flex-col gap-2 w-full max-w-[200px]">
                         {gameStatus === GameStatus.PAUSED && (
                             <button onClick={pauseGame} className="bg-[#9ead86] text-slate-800 p-2.5 font-bold text-xs rounded-sm flex items-center justify-center gap-2 hover:bg-[#b0bf98]"><Play size={14}/> {t.resume}</button>
                         )}
                         <button onClick={startGame} className="border-2 border-[#9ead86] text-[#9ead86] p-2.5 font-bold text-xs rounded-sm flex items-center justify-center gap-2 hover:bg-[#9ead86]/10"><RefreshCw size={14}/> {t.restart}</button>
                         <button onClick={quitToHome} className="text-[#9ead86]/70 p-2 font-bold text-xs flex items-center justify-center gap-2 hover:text-[#9ead86]"><Home size={14}/> {t.home}</button>
                    </div>
                </div>
            )}
        </div>
    );
  };

  return (
    <div 
      className="flex flex-col h-[100dvh] w-full bg-slate-900 items-center justify-center p-2 overflow-hidden touch-none" 
      ref={appRef}
      onKeyDown={handleKeyDown} 
      onKeyUp={handleKeyUp}
      tabIndex={0}
    >
        {/* CONSOLE BODY - Responsive Container */}
        <div className="relative flex flex-col w-full h-full max-w-lg bg-[#e4e4e7] rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5),inset_0_-8px_0_rgba(0,0,0,0.1),inset_0_4px_0_rgba(255,255,255,0.5)] p-4 sm:p-5 border border-slate-300 select-none">
            
            {/* SCREEN LENS Section - Flex Grow to take available space */}
            <div className="flex-1 min-h-0 bg-[#27272a] rounded-t-xl rounded-b-[2rem] p-4 sm:p-5 flex flex-col shadow-inner relative">
                
                {/* Header Info */}
                <div className="flex-none flex justify-between text-[10px] font-bold text-slate-500 mb-2 px-1">
                    <span className="flex items-center gap-1"><Battery size={10}/> BATTERY</span>
                    <span className="tracking-widest text-slate-600">DOT MATRIX</span>
                </div>

                {/* LCD SCREEN Wrapper - Flex Grow to fill Lens */}
                <div 
                    ref={lcdRef}
                    className="flex-1 min-h-0 relative w-full bg-[#9ead86] border-4 border-[#8b9c72] shadow-inner rounded-sm overflow-hidden flex flex-col"
                >
                    {/* Inner Shadow & Scanlines */}
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] z-20"></div>
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 background-size-[100%_2px,3px_100%] bg-[length:100%_4px,3px_100%]"></div>
                    
                    {/* The Content */}
                    <div className="flex-1 w-full h-full relative z-30">
                        {renderScreenContent()}
                    </div>
                </div>
                
                {/* Footer Info */}
                <div className="flex-none mt-2 flex justify-between items-end text-[#8b9c72]">
                    <div className="flex flex-col">
                         <span className="text-[9px] font-bold tracking-widest text-slate-500">{t.score}</span>
                         <span className="font-mono text-sm text-rose-400 leading-none">{score.toString().padStart(6, '0')}</span>
                    </div>
                    <h3 className="text-slate-600 font-bold italic tracking-tighter text-lg hidden sm:block">NEON<span className="text-rose-400">BLOCKS</span></h3>
                    <div className="flex flex-col text-right">
                         <span className="text-[9px] font-bold tracking-widest text-slate-500">{t.level}</span>
                         <span className="font-mono text-sm text-indigo-400 leading-none">{level}</span>
                    </div>
                </div>
            </div>

            {/* CONTROLS AREA - Fixed height (doesn't shrink) */}
            <div className="flex-none pt-2 sm:pt-4">
                <Controls 
                    onMoveLeft={() => movePlayer(-1)}
                    onMoveRight={() => movePlayer(1)}
                    onRotate={playerRotate}
                    onSoftDropStart={startSoftDrop}
                    onSoftDropEnd={stopSoftDrop}
                    onPause={pauseGame}
                    isPlaying={true} 
                    isPaused={gameStatus === GameStatus.PAUSED}
                />
            </div>

            {/* Speaker Grille */}
            <div className="absolute bottom-6 right-5 sm:right-6 flex gap-1.5 -rotate-12 opacity-20 pointer-events-none">
                <div className="w-1 h-10 sm:h-12 rounded-full bg-slate-900"></div>
                <div className="w-1 h-10 sm:h-12 rounded-full bg-slate-900"></div>
                <div className="w-1 h-10 sm:h-12 rounded-full bg-slate-900"></div>
                <div className="w-1 h-10 sm:h-12 rounded-full bg-slate-900"></div>
            </div>

        </div>
    </div>
  );
};

export default App;