import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createBoard, checkCollision } from './utils/gameHelpers';
import { useInterval } from './hooks/useInterval';
import { RANDOM_TETROMINO, DEFAULT_WIDTH, DEFAULT_HEIGHT, BLOCK_SIZE, THEMES } from './constants';
import { Board as BoardType, Player, GameStatus, Difficulty, Language, ThemeType, HighScore } from './types';
import Board from './components/Board';
import Controls from './components/Controls';
import { Play, RefreshCw, Home, Globe, Battery, Zap, Sun, Trophy, Upload, ChevronLeft, Loader2 } from 'lucide-react';
import { supabase } from './supabaseClient';

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
    highScore: '最高分',
    level: '等级',
    diffEasy: '简单',
    diffNormal: '普通',
    diffHard: '困难',
    themeRetro: '复古',
    themeCyber: '赛博',
    leaderboard: '排行榜',
    upload: '上传分数',
    uploaded: '已上传',
    placeholder: '输入名字',
    rank: '排名',
    name: '名字',
    loading: '加载中...',
    noData: '暂无数据',
    error: '错误',
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
    highScore: 'HI-SCORE',
    level: 'LEVEL',
    diffEasy: 'EASY',
    diffNormal: 'NORM',
    diffHard: 'HARD',
    themeRetro: 'RETRO',
    themeCyber: 'CYBER',
    leaderboard: 'RANKING',
    upload: 'UPLOAD',
    uploaded: 'UPLOADED',
    placeholder: 'Enter Name',
    rank: 'RANK',
    name: 'NAME',
    loading: 'LOADING...',
    noData: 'NO DATA',
    error: 'ERROR',
  }
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('zh');
  const [theme, setTheme] = useState<ThemeType>('retro');
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

  // Supabase State
  const [globalHighScore, setGlobalHighScore] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<HighScore[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const [board, setBoard] = useState<BoardType>(createBoard(DEFAULT_HEIGHT, DEFAULT_WIDTH));
  const [player, setPlayer] = useState<Player>({
    pos: { x: 0, y: 0 },
    tetromino: [[0]],
    collided: false,
  });

  const appRef = useRef<HTMLDivElement>(null);

  // --- Dynamic Resizing Logic ---
  useEffect(() => {
    const calculateGrid = () => {
      if (lcdRef.current) {
        // We calculate this even if not strictly at HOME to ensure resizing works if window changes
        // but we only trigger board recreation logic if strictly needed or at appropriate times
        const { clientWidth, clientHeight } = lcdRef.current;
        
        const GAP = 1;
        const CELL_PITCH = BLOCK_SIZE + GAP; 
        const H_OVERHEAD = 8; 
        const V_OVERHEAD = 8; 

        const cols = Math.floor((clientWidth - H_OVERHEAD) / CELL_PITCH);
        const rows = Math.floor((clientHeight - V_OVERHEAD) / CELL_PITCH);
        
        const safeCols = Math.max(8, cols);
        const safeRows = Math.max(12, rows); 

        // Only update if dimensions actually changed
        setGridSize(prev => {
            if (prev.cols !== safeCols || prev.rows !== safeRows) {
                // If we are at HOME, we can safely reset the board to fit new dimensions
                if (gameStatus === GameStatus.HOME || gameStatus === GameStatus.LEADERBOARD) {
                    setBoard(createBoard(safeRows, safeCols));
                }
                return { rows: safeRows, cols: safeCols };
            }
            return prev;
        });
      }
    };

    const observer = new ResizeObserver(() => {
        requestAnimationFrame(calculateGrid);
    });

    if (lcdRef.current) {
        observer.observe(lcdRef.current);
    }
    
    calculateGrid();

    return () => observer.disconnect();
  }, [gameStatus]);

  // --- Supabase Effects ---

  // 1. Fetch highest score for current difficulty (Global High Score)
  useEffect(() => {
    const fetchHighScore = async () => {
      try {
        const { data, error } = await supabase
            .from('high_scores')
            .select('score')
            .eq('difficulty', difficulty)
            .order('score', { ascending: false })
            .limit(1)
            .single();

        if (!error && data) {
            setGlobalHighScore(data.score);
        } else {
            // If no data or error (e.g. table empty), default to 0
            setGlobalHighScore(0);
        }
      } catch (e) {
        console.error("Supabase connection error:", e);
      }
    };

    fetchHighScore();
  }, [difficulty]);

  // 2. Fetch Leaderboard Data
  const fetchLeaderboard = useCallback(async () => {
      setLoadingLeaderboard(true);
      const { data, error } = await supabase
        .from('high_scores')
        .select('*')
        .eq('difficulty', difficulty)
        .order('score', { ascending: false })
        .limit(10);
      
      setLoadingLeaderboard(false);
      if (!error && data) {
          setLeaderboard(data);
      } else {
          setLeaderboard([]);
      }
  }, [difficulty]);

  useEffect(() => {
      if (gameStatus === GameStatus.LEADERBOARD) {
          fetchLeaderboard();
      }
  }, [gameStatus, fetchLeaderboard]);


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
    setPlayer({
      pos: { x: Math.floor(gridSize.cols / 2) - 2, y: 0 },
      tetromino: RANDOM_TETROMINO().shape,
      collided: false,
    });
  }, [gridSize.cols]);

  const startGame = () => {
    setBoard(createBoard(gridSize.rows, gridSize.cols));
    setDropTime(calcDropTime(1));
    resetPlayer();
    setScore(0);
    setRows(0);
    setLevel(1);
    setFastDrop(false);
    setIsUploaded(false); // Reset upload status
    setPlayerName(''); // Reset name
    setGameStatus(GameStatus.PLAYING);
    appRef.current?.focus();
  };

  const uploadScore = async () => {
      if (!playerName.trim() || isUploading || isUploaded) return;
      
      setIsUploading(true);
      
      try {
        const { error } = await supabase.from('high_scores').insert([
            { 
                player_name: playerName.trim(), 
                score: score, 
                difficulty: difficulty 
            }
        ]);

        setIsUploading(false);
        if (!error) {
            setIsUploaded(true);
            // Refresh global high score if we beat it
            if (score > globalHighScore) {
                setGlobalHighScore(score);
            }
        } else {
            console.error("Upload failed:", error);
            alert("Upload failed. Please check internet connection.");
        }
      } catch (e) {
          setIsUploading(false);
          console.error(e);
      }
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
        // Check if we beat the global high score locally immediately
        if (score > globalHighScore) {
            setGlobalHighScore(score);
        }
      }
      setPlayer((prev) => ({ ...prev, collided: true }));
    }
  };

  const moveDownOne = () => {
      if (gameStatus !== GameStatus.PLAYING) return;
      drop();
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

  const renderScreenContent = () => {
    // --- LEADERBOARD SCREEN ---
    if (gameStatus === GameStatus.LEADERBOARD) {
         return (
             <div className={`flex flex-col h-full w-full p-2 ${theme === 'cyberpunk' ? 'text-cyan-400' : 'text-slate-800'}`}>
                <div className="flex justify-between items-center mb-2 border-b border-current/20 pb-1">
                    <button onClick={() => setGameStatus(GameStatus.HOME)} className="p-1 hover:opacity-70"><ChevronLeft size={16}/></button>
                    <h2 className="text-sm font-bold tracking-widest">{t.leaderboard}</h2>
                    <span className="text-[10px] font-mono opacity-70 border border-current px-1 rounded">{difficulty}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {loadingLeaderboard ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-2 opacity-50">
                            <Loader2 className="animate-spin" size={20}/>
                            <span className="text-xs">{t.loading}</span>
                        </div>
                    ) : (
                        <table className="w-full text-[10px] sm:text-xs border-collapse">
                            <thead className="sticky top-0 bg-inherit z-10">
                                <tr className="opacity-50 text-left border-b border-current/10">
                                    <th className="pb-1 pl-1 w-8">#</th>
                                    <th className="pb-1">{t.name}</th>
                                    <th className="pb-1 text-right pr-1">{t.score}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.length === 0 ? (
                                    <tr><td colSpan={3} className="text-center py-4 opacity-50">{t.noData}</td></tr>
                                ) : (
                                    leaderboard.map((entry, idx) => (
                                        <tr key={entry.id} className={`${idx < 3 ? 'font-bold' : ''} border-b border-current/5`}>
                                            <td className="py-1.5 pl-1">
                                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                                            </td>
                                            <td className="py-1.5 truncate max-w-[80px]">{entry.player_name}</td>
                                            <td className="py-1.5 text-right pr-1 font-mono">{entry.score}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
             </div>
         );
    }

    // --- HOME SCREEN ---
    if (gameStatus === GameStatus.HOME) {
        return (
            <div className={`flex flex-col items-center justify-center h-full space-y-3 animate-in fade-in p-2 text-center ${theme === 'cyberpunk' ? 'text-cyan-400' : 'text-slate-800'}`}>
                <h1 className={`text-2xl sm:text-4xl font-black tracking-tighter ${theme === 'cyberpunk' ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'text-slate-800/80'}`}>
                    {t.title}
                </h1>
                
                {/* Difficulty Select */}
                <div className="flex flex-wrap justify-center gap-2">
                    {(['EASY', 'NORMAL', 'HARD'] as Difficulty[]).map((d) => (
                        <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={`px-2 py-1 text-[10px] font-bold rounded border-2 transition-all ${
                                difficulty === d 
                                ? theme === 'cyberpunk' ? 'bg-cyan-900/50 text-cyan-300 border-cyan-400' : 'bg-slate-700 text-white border-slate-700' 
                                : theme === 'cyberpunk' ? 'text-slate-500 border-slate-700 hover:border-cyan-700' : 'text-slate-500 border-slate-300 hover:border-slate-400'
                            }`}
                        >
                            {d === 'EASY' ? t.diffEasy : d === 'NORMAL' ? t.diffNormal : t.diffHard}
                        </button>
                    ))}
                </div>

                {/* Theme & Leaderboard Buttons */}
                <div className="flex gap-2 bg-black/10 p-1 rounded-lg">
                    <button 
                        onClick={() => setTheme('retro')}
                        className={`p-1.5 rounded flex items-center gap-1 text-[9px] font-bold transition-all ${theme === 'retro' ? 'bg-[#9ead86] text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Sun size={10}/> {t.themeRetro}
                    </button>
                    <button 
                        onClick={() => setTheme('cyberpunk')}
                        className={`p-1.5 rounded flex items-center gap-1 text-[9px] font-bold transition-all ${theme === 'cyberpunk' ? 'bg-cyan-900 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.4)]' : 'text-slate-400 hover:text-cyan-700'}`}
                    >
                        <Zap size={10}/> {t.themeCyber}
                    </button>
                    <div className="w-[1px] bg-white/20 mx-1"></div>
                     <button 
                        onClick={() => setGameStatus(GameStatus.LEADERBOARD)}
                        className={`p-1.5 rounded flex items-center gap-1 text-[9px] font-bold transition-all ${theme === 'cyberpunk' ? 'text-yellow-400 hover:text-yellow-200' : 'text-amber-700 hover:text-amber-900'}`}
                    >
                        <Trophy size={10}/> {t.leaderboard}
                    </button>
                </div>

                <button 
                    onClick={startGame}
                    className={`animate-pulse px-6 py-2.5 font-bold rounded-sm text-xs sm:text-base transition-colors ${
                        theme === 'cyberpunk' 
                        ? 'bg-cyan-600 text-black shadow-[0_0_15px_rgba(8,145,178,0.6)] hover:bg-cyan-500' 
                        : 'bg-slate-800 text-[#9ead86] hover:bg-slate-700'
                    }`}
                >
                    {t.start}
                </button>
                
                <div className="absolute top-2 right-2">
                    <button onClick={() => setLanguage(l => l === 'zh' ? 'en' : 'zh')} className="p-1">
                        <Globe size={16} className={theme === 'cyberpunk' ? 'text-cyan-700 hover:text-cyan-400' : 'text-slate-500 hover:text-slate-800'} />
                    </button>
                </div>
            </div>
        );
    }
    
    // --- PLAYING / PAUSED / GAME OVER ---
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <Board board={board} theme={theme} />
            
            {(gameStatus === GameStatus.PAUSED || gameStatus === GameStatus.GAME_OVER) && (
                <div className="absolute inset-0 z-50 bg-slate-900/90 flex flex-col items-center justify-center gap-3 p-4 backdrop-blur-sm">
                    <h2 className={`text-xl font-bold ${theme === 'cyberpunk' ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-[#9ead86]'}`}>
                        {gameStatus === GameStatus.GAME_OVER ? t.gameOver : t.paused}
                    </h2>
                    
                    {gameStatus === GameStatus.GAME_OVER && (
                        <div className="flex flex-col items-center gap-2 mb-2 w-full max-w-[200px]">
                            <p className={`font-mono text-3xl ${theme === 'cyberpunk' ? 'text-purple-400' : 'text-[#9ead86]'}`}>{score}</p>
                            
                            {/* Score Upload Form */}
                            {!isUploaded ? (
                                <div className="flex flex-col w-full gap-2 mt-2 p-2 bg-white/5 rounded border border-white/10">
                                    <input 
                                        type="text" 
                                        maxLength={10}
                                        placeholder={t.placeholder}
                                        value={playerName}
                                        onChange={(e) => setPlayerName(e.target.value)}
                                        className="bg-transparent border-b border-white/30 text-center text-white text-sm py-1 outline-none font-mono focus:border-cyan-400 uppercase placeholder:text-white/20"
                                    />
                                    <button 
                                        onClick={uploadScore}
                                        disabled={!playerName.trim() || isUploading}
                                        className="flex items-center justify-center gap-1 bg-white/10 hover:bg-white/20 text-white text-[10px] py-1.5 rounded transition-colors disabled:opacity-50"
                                    >
                                        {isUploading ? <Loader2 size={10} className="animate-spin"/> : <Upload size={10} />}
                                        {t.upload}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-green-400 text-xs font-bold flex items-center gap-1 mt-2">
                                    <Trophy size={12}/> {t.uploaded}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col gap-2 w-full max-w-[180px]">
                         {gameStatus === GameStatus.PAUSED && (
                             <button onClick={pauseGame} className="bg-white/10 text-white p-2 font-bold text-xs rounded-sm flex items-center justify-center gap-2 hover:bg-white/20 border border-white/20"><Play size={12}/> {t.resume}</button>
                         )}
                         <button onClick={startGame} className="bg-white/10 text-white p-2 font-bold text-xs rounded-sm flex items-center justify-center gap-2 hover:bg-white/20 border border-white/20"><RefreshCw size={12}/> {t.restart}</button>
                         <button onClick={quitToHome} className="text-white/50 p-1.5 font-bold text-xs flex items-center justify-center gap-2 hover:text-white"><Home size={12}/> {t.home}</button>
                    </div>
                </div>
            )}
        </div>
    );
  };

  return (
    <div 
      className="flex flex-col h-[100dvh] w-full bg-slate-900 items-center justify-center p-1 overflow-hidden touch-none" 
      ref={appRef}
      onKeyDown={handleKeyDown} 
      onKeyUp={handleKeyUp}
      tabIndex={0}
    >
        {/* CONSOLE BODY - Reduced padding for small screens p-2 */}
        <div className="relative flex flex-col w-full h-full max-w-lg bg-[#e4e4e7] rounded-[1.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5),inset_0_-8px_0_rgba(0,0,0,0.1),inset_0_4px_0_rgba(255,255,255,0.5)] p-2 sm:p-5 border border-slate-300 select-none">
            
            {/* SCREEN LENS - Reduced padding p-2 */}
            <div className="flex-1 min-h-0 bg-[#27272a] rounded-t-xl rounded-b-[1.5rem] p-2 sm:p-4 flex flex-col shadow-inner relative">
                
                {/* Compact Header */}
                <div className="flex-none flex justify-between text-[9px] font-bold text-slate-500 mb-1 px-1">
                    <span className="flex items-center gap-1"><Battery size={9}/> BATTERY</span>
                    <span className="tracking-widest text-slate-600">DOT MATRIX</span>
                </div>

                {/* LCD SCREEN */}
                <div 
                    ref={lcdRef}
                    className={`flex-1 min-h-0 relative w-full border-4 shadow-inner rounded-sm overflow-hidden flex flex-col transition-colors duration-500 ${
                        theme === 'cyberpunk' 
                        ? 'bg-slate-900 border-slate-700' 
                        : 'bg-[#9ead86] border-[#8b9c72]'
                    }`}
                >
                    {/* Retro Filters */}
                    {theme === 'retro' && (
                        <>
                            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] z-20"></div>
                            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 background-size-[100%_2px,3px_100%] bg-[length:100%_4px,3px_100%]"></div>
                        </>
                    )}
                    {/* Cyberpunk Filters */}
                    {theme === 'cyberpunk' && (
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] z-10 bg-[length:20px_20px]"></div>
                    )}
                    
                    <div className="flex-1 w-full h-full relative z-30">
                        {renderScreenContent()}
                    </div>
                </div>
                
                {/* Footer - Compact Layout with High Score */}
                <div className={`flex-none mt-1 flex justify-between items-end transition-colors duration-500 ${theme === 'cyberpunk' ? 'text-cyan-500' : 'text-[#8b9c72]'}`}>
                    <div className="flex flex-col">
                         <span className="text-[9px] font-bold tracking-widest text-slate-500">{t.score}</span>
                         <span className={`font-mono text-sm leading-none ${theme === 'cyberpunk' ? 'text-pink-400 drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]' : 'text-rose-400'}`}>
                            {score.toString().padStart(6, '0')}
                         </span>
                    </div>
                    
                    {/* Center: High Score Display */}
                    <div className="flex flex-col items-center">
                         <span className="text-[8px] font-bold tracking-widest text-slate-600 mb-[1px]">{t.highScore}</span>
                         <span className={`font-mono text-xs leading-none ${theme === 'cyberpunk' ? 'text-yellow-400' : 'text-[#8b9c72] opacity-80'}`}>
                            {Math.max(score, globalHighScore).toString().padStart(6, '0')}
                         </span>
                    </div>

                    <div className="flex flex-col text-right">
                         <span className="text-[9px] font-bold tracking-widest text-slate-500">{t.level}</span>
                         <span className={`font-mono text-sm leading-none ${theme === 'cyberpunk' ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-indigo-400'}`}>
                            {level}
                         </span>
                    </div>
                </div>
            </div>

            {/* CONTROLS AREA */}
            <div className="flex-none pt-1">
                <Controls 
                    onMoveLeft={() => movePlayer(-1)}
                    onMoveRight={() => movePlayer(1)}
                    onMoveDown={moveDownOne}
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
            </div>

        </div>
    </div>
  );
};

export default App;