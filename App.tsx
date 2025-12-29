import React, { useState, useCallback, useRef } from 'react';
import { createBoard, checkCollision } from './utils/gameHelpers';
import { useInterval } from './hooks/useInterval';
import { BOARD_WIDTH, RANDOM_TETROMINO } from './constants';
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

  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.HOME);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.NORMAL);

  const [score, setScore] = useState(0);
  const [rows, setRows] = useState(0);
  const [level, setLevel] = useState(1);
  const [fastDrop, setFastDrop] = useState(false);

  const [board, setBoard] = useState<BoardType>(createBoard());
  const [player, setPlayer] = useState<Player>({
    pos: { x: 0, y: 0 },
    tetromino: [[0]],
    collided: false,
  });

  const appRef = useRef<HTMLDivElement>(null);

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

  const startGame = () => {
    setBoard(createBoard());
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

  const resetPlayer = useCallback(() => {
    setPlayer({
      pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
      tetromino: RANDOM_TETROMINO().shape,
      collided: false,
    });
  }, []);

  const drop = () => {
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
      const newBoard = prevBoard.map((row) =>
        row.map((cell) => (cell[1] === 'clear' ? [0, 'clear'] : cell))
      ) as BoardType;

      player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
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
            <div className="flex flex-col items-center justify-center h-full text-slate-800 space-y-4 animate-in fade-in">
                <h1 className="text-4xl font-black tracking-tighter text-slate-800/80">{t.title}</h1>
                <div className="flex gap-2">
                    {(['EASY', 'NORMAL', 'HARD'] as Difficulty[]).map((d) => (
                        <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={`px-2 py-1 text-[10px] font-bold rounded border-2 ${
                                difficulty === d 
                                ? 'bg-slate-700 text-white border-slate-700' 
                                : 'text-slate-500 border-slate-300'
                            }`}
                        >
                            {d === 'EASY' ? t.diffEasy : d === 'NORMAL' ? t.diffNormal : t.diffHard}
                        </button>
                    ))}
                </div>
                <button 
                    onClick={startGame}
                    className="animate-pulse mt-4 px-6 py-2 bg-slate-800 text-[#9ead86] font-bold rounded-sm text-sm"
                >
                    {t.start}
                </button>
                <div className="absolute top-2 right-2">
                    <button onClick={() => setLanguage(l => l === 'zh' ? 'en' : 'zh')}>
                        <Globe size={16} className="text-slate-400" />
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="relative w-full h-full">
            <Board board={board} />
            
            {(gameStatus === GameStatus.PAUSED || gameStatus === GameStatus.GAME_OVER) && (
                <div className="absolute inset-0 z-50 bg-slate-800/80 flex flex-col items-center justify-center text-[#9ead86] gap-4 p-4">
                    <h2 className="text-2xl font-bold">{gameStatus === GameStatus.GAME_OVER ? t.gameOver : t.paused}</h2>
                    {gameStatus === GameStatus.GAME_OVER && (
                        <p className="font-mono text-xl">{score}</p>
                    )}
                    <div className="flex flex-col gap-2 w-full">
                         {gameStatus === GameStatus.PAUSED && (
                             <button onClick={pauseGame} className="bg-[#9ead86] text-slate-800 p-2 font-bold text-xs rounded-sm flex items-center justify-center gap-2"><Play size={12}/> {t.resume}</button>
                         )}
                         <button onClick={startGame} className="border-2 border-[#9ead86] text-[#9ead86] p-2 font-bold text-xs rounded-sm flex items-center justify-center gap-2"><RefreshCw size={12}/> {t.restart}</button>
                         <button onClick={quitToHome} className="text-[#9ead86]/60 p-2 font-bold text-xs flex items-center justify-center gap-2"><Home size={12}/> {t.home}</button>
                    </div>
                </div>
            )}
        </div>
    );
  };

  return (
    <div 
      className="flex flex-col h-[100dvh] w-full bg-slate-900 items-center justify-center p-4 overflow-hidden touch-none" 
      ref={appRef}
      onKeyDown={handleKeyDown} 
      onKeyUp={handleKeyUp}
      tabIndex={0}
    >
        {/* CONSOLE BODY */}
        <div className="relative w-full max-w-[360px] bg-[#e4e4e7] rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5),inset_0_-8px_0_rgba(0,0,0,0.1),inset_0_4px_0_rgba(255,255,255,0.5)] p-5 pb-8 flex flex-col gap-6 select-none border border-slate-300">
            
            {/* SCREEN LENS (Dark Grey Area) */}
            <div className="bg-[#27272a] rounded-t-xl rounded-b-[2rem] p-6 pb-2 shadow-inner relative flex flex-col items-center">
                
                {/* Decorative text on lens */}
                <div className="w-full flex justify-between text-[10px] font-bold text-slate-500 mb-1 px-1">
                    <span className="flex items-center gap-1"><Battery size={10}/> BATTERY</span>
                    <span className="tracking-widest text-slate-600">DOT MATRIX</span>
                </div>

                {/* LCD SCREEN (The Game) */}
                <div className="relative bg-[#9ead86] w-[240px] h-[400px] border-4 border-[#8b9c72] shadow-inner flex items-center justify-center overflow-hidden">
                    {/* Shadow overlay for LCD effect */}
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] z-20"></div>
                    {/* Scanline effect */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 background-size-[100%_2px,3px_100%] bg-[length:100%_4px,3px_100%]"></div>
                    
                    {renderScreenContent()}
                </div>
                
                {/* Score / Level text printed on lens below screen */}
                <div className="w-full max-w-[240px] mt-2 flex justify-between items-end text-[#8b9c72]">
                    <div className="flex flex-col">
                         <span className="text-[9px] font-bold tracking-widest text-slate-500">{t.score}</span>
                         <span className="font-mono text-sm text-rose-400">{score.toString().padStart(6, '0')}</span>
                    </div>
                    <h3 className="text-slate-600 font-bold italic tracking-tighter text-lg">NEON<span className="text-rose-400">BLOCKS</span></h3>
                    <div className="flex flex-col text-right">
                         <span className="text-[9px] font-bold tracking-widest text-slate-500">{t.level}</span>
                         <span className="font-mono text-sm text-indigo-400">{level}</span>
                    </div>
                </div>
            </div>

            {/* CONTROLS AREA */}
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

            {/* Speaker Grille (Decorative) */}
            <div className="absolute bottom-6 right-6 flex gap-1 -rotate-12 opacity-20">
                <div className="w-1.5 h-12 rounded-full bg-slate-900"></div>
                <div className="w-1.5 h-12 rounded-full bg-slate-900"></div>
                <div className="w-1.5 h-12 rounded-full bg-slate-900"></div>
                <div className="w-1.5 h-12 rounded-full bg-slate-900"></div>
            </div>

        </div>
    </div>
  );
};

export default App;