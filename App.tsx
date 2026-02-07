
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cell, Operator, Position, GameState, TargetData, StorageItem, ItemType, LevelStartState } from './types';
import { supabase } from './services/supabaseClient';

const NUM_HEIGHT = 3;
const OP_HEIGHT = 4;
const OPERATORS: Operator[] = ['+', '-', '×', '÷'];
const GACHA_THRESHOLD = 30;
const STORAGE_SIZE = 4;
const TIMER_MULTIPLIER = 18; // Changed from 20 to 18

const TARGET_CATALOG: TargetData[] = [
  { value: 24, diff: 0, core_base: 2 }, { value: 26, diff: 0, core_base: 2 }, { value: 48, diff: 0, core_base: 2 },
  { value: 60, diff: 0, core_base: 2 }, { value: 72, diff: 0, core_base: 2 }, { value: 12, diff: 0, core_base: 2 },
  { value: 20, diff: 0, core_base: 2 }, { value: 25, diff: 1, core_base: 5 }, { value: 49, diff: 1, core_base: 5 },
  { value: 64, diff: 1, core_base: 5 }, { value: 81, diff: 1, core_base: 5 }, { value: 11, diff: 1, core_base: 5 },
  { value: 29, diff: 1, core_base: 5 }, { value: 23, diff: 1, core_base: 5 }, { value: 17, diff: 1, core_base: 5 },
  { value: 27, diff: 1, core_base: 5 }, { value: 47, diff: 2, core_base: 6 }, { value: 53, diff: 2, core_base: 6 },
  { value: 91, diff: 2, core_base: 6 }, { value: 58, diff: 2, core_base: 6 }, { value: 62, diff: 2, core_base: 6 },
  { value: 61, diff: 3, core_base: 8 }, { value: 71, diff: 3, core_base: 8 }, { value: 79, diff: 3, core_base: 8 },
  { value: 94, diff: 3, core_base: 8 }, { value: 98, diff: 3, core_base: 8 }, { value: 67, diff: 4, core_base: 10 },
  { value: 83, diff: 4, core_base: 10 }, { value: 89, diff: 4, core_base: 10 }, { value: 97, diff: 4, core_base: 10 }
];

const getTargetForAbsoluteIndex = (index: number, totalDraws: number): TargetData => {
  const GROUP_WARMUP = TARGET_CATALOG.filter(t => t.value < 40 && t.diff <= 1);
  const GROUP_LOW = TARGET_CATALOG.filter(t => t.diff <= 2);
  const GROUP_MED = TARGET_CATALOG.filter(t => t.diff === 3);
  const GROUP_HIGH = TARGET_CATALOG.filter(t => t.diff === 4);

  // Initial warmup targets
  if (index < 3) return GROUP_WARMUP[Math.floor(Math.random() * GROUP_WARMUP.length)];
  
  const relativeIdx = index - 3;
  
  if (totalDraws < 2) {
    // 5 targets per set: 3 low, 1 med, 1 high
    const cycleIdx = relativeIdx % 5;
    if (cycleIdx < 3) return GROUP_LOW[Math.floor(Math.random() * GROUP_LOW.length)];
    if (cycleIdx === 3) return GROUP_MED[Math.floor(Math.random() * GROUP_MED.length)];
    return GROUP_HIGH[Math.floor(Math.random() * GROUP_HIGH.length)];
  } else {
    // 4 targets per set: 2 low, 1 med, 1 high
    const cycleIdx = relativeIdx % 4;
    if (cycleIdx < 2) return GROUP_LOW[Math.floor(Math.random() * GROUP_LOW.length)];
    if (cycleIdx === 2) return GROUP_MED[Math.floor(Math.random() * GROUP_MED.length)];
    return GROUP_HIGH[Math.floor(Math.random() * GROUP_HIGH.length)];
  }
};

const getDiffInfo = (diff: number) => {
  if (diff === 3) return { label: 'HARD', color: 'text-orange-500', bg: 'bg-orange-100/50', border: 'border-orange-200' };
  if (diff === 4) return { label: 'EXPERT', color: 'text-rose-500', bg: 'bg-rose-100/50', border: 'border-rose-200' };
  return null;
};

const generateRandomId = () => Math.random().toString(36).substr(2, 9);

const createCell = (type: 'number' | 'operator'): Cell => {
  if (type === 'number') {
    return { id: generateRandomId(), value: Math.floor(Math.random() * 9) + 1, type: 'number' };
  } else {
    return { id: generateRandomId(), value: OPERATORS[Math.floor(Math.random() * OPERATORS.length)], type: 'operator' };
  }
};

const generateInitialGrid = (): Cell[][] => {
  const grid: Cell[][] = [];
  grid[0] = Array.from({ length: NUM_HEIGHT }, () => createCell('number'));
  grid[1] = OPERATORS.map(op => ({ id: `fixed-${op}`, value: op, type: 'operator' }));
  grid[2] = Array.from({ length: NUM_HEIGHT }, () => createCell('number'));
  return grid;
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [rulesLang, setRulesLang] = useState<'zh' | 'en'>('zh');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  
  // Gacha System State
  const [isGachaModalOpen, setIsGachaModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawResult, setDrawResult] = useState<StorageItem | null>(null);

  // Timer State
  const [timeLeft, setTimeLeft] = useState(0);
  const [maxTime, setMaxTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    resetGame();
    fetchLeaderboard();
    const hasVisited = localStorage.getItem('quest_visited');
    if (!hasVisited) {
      setShowRules(true);
      localStorage.setItem('quest_visited', 'true');
    }
  }, []);

  useEffect(() => {
    if (gameState && !gameState.isGameOver && !gameState.isPaused && !isSynthesizing && !showRules && !showLeaderboard && !isGachaModalOpen) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            setGameState(g => g ? { ...g, isGameOver: true } : null);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState?.isGameOver, gameState?.isPaused, isSynthesizing, showRules, showLeaderboard, isGachaModalOpen]);

  useEffect(() => {
    if (gameState && gameState.numbersUsed >= GACHA_THRESHOLD && !isGachaModalOpen) {
      const hasRoom = gameState.storage.some(s => s === null);
      if (hasRoom) {
        setIsGachaModalOpen(true);
      }
    }
  }, [gameState?.numbersUsed]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase.from('high_scores').select('*').order('score', { ascending: false }).limit(10);
      if (!error && data) setLeaderboard(data);
    } catch (e) { console.error("Leaderboard fetch failed", e); }
  };

  const saveScore = async () => {
    if (!gameState || !username.trim() || gameState.score === 0) return;
    try {
      const { error } = await supabase.from('high_scores').insert([{ username, score: gameState.score }]);
      if (!error) {
        setMessage(rulesLang === 'zh' ? "分数保存成功！" : "Score saved successfully!");
        fetchLeaderboard();
        resetGame();
        setUsername('');
      }
    } catch (e) { console.error("Score save failed", e); }
  };

  const resetGame = () => {
    const firstTarget = getTargetForAbsoluteIndex(0, 0);
    const initialDuration = firstTarget.core_base * TIMER_MULTIPLIER;
    const initialGrid = generateInitialGrid();
    const initialStorage = Array(STORAGE_SIZE).fill(null);

    setGameState({
      grid: initialGrid,
      previewCells: [createCell('number'), createCell('number'), createCell('number')],
      currentTarget: firstTarget,
      nextTarget: getTargetForAbsoluteIndex(1, 0),
      totalTargetsCleared: 0,
      score: 0,
      selectedNum: null,
      selectedOp: null,
      combo: 0,
      isGameOver: false,
      isPaused: false,
      numbersUsed: 0,
      totalDraws: 0,
      storage: initialStorage,
      levelStartState: {
        grid: JSON.parse(JSON.stringify(initialGrid)),
        storage: JSON.parse(JSON.stringify(initialStorage)),
        numbersUsed: 0
      }
    });
    setTimeLeft(initialDuration);
    setMaxTime(initialDuration);
  };

  const handlePause = () => {
    setGameState(prev => prev ? ({ ...prev, isPaused: !prev.isPaused }) : null);
  };

  const handleResetLevel = () => {
    setGameState(prev => {
      if (!prev || !prev.levelStartState) return prev;
      const { grid, storage, numbersUsed } = prev.levelStartState;
      return {
        ...prev,
        grid: JSON.parse(JSON.stringify(grid)),
        storage: JSON.parse(JSON.stringify(storage)),
        numbersUsed: numbersUsed,
        selectedNum: null,
        selectedOp: null
      };
    });
    setMessage(rulesLang === 'zh' ? "已重置本关" : "Level Reset");
  };

  const handleCellClick = (col: number, row: number) => {
    if (!gameState || isSynthesizing || gameState.isGameOver || gameState.isPaused) return;
    const cell = gameState.grid[col][row];
    if (!cell) return;

    if (cell.type === 'number') {
      if (gameState.selectedNum?.col === col && gameState.selectedNum?.row === row && gameState.selectedNum.source === 'grid') {
        setGameState(prev => prev ? ({ ...prev, selectedNum: null, selectedOp: null }) : null);
        return;
      }
      if (gameState.selectedNum && gameState.selectedOp) {
        performSynthesis(gameState.selectedNum, gameState.selectedOp, { col, row, source: 'grid' });
        return;
      }
      setGameState(prev => prev ? ({ ...prev, selectedNum: { col, row, source: 'grid' } }) : null);
    } else {
      if (!gameState.selectedNum) return;
      if (gameState.selectedOp?.col === col && gameState.selectedOp?.row === row) {
        setGameState(prev => prev ? ({ ...prev, selectedOp: null }) : null);
      } else {
        setGameState(prev => prev ? ({ ...prev, selectedOp: { col, row, source: 'grid' } }) : null);
      }
    }
  };

  const handleStorageClick = (index: number) => {
    if (!gameState || isSynthesizing || gameState.isGameOver || gameState.isPaused) return;
    const item = gameState.storage[index];
    if (!item) return;

    if (item.type === 'number') {
      if (gameState.selectedNum?.source === 'storage' && gameState.selectedNum?.storageIndex === index) {
        setGameState(prev => prev ? ({ ...prev, selectedNum: null, selectedOp: null }) : null);
        return;
      }
      if (gameState.selectedNum && gameState.selectedOp) {
        performSynthesis(gameState.selectedNum, gameState.selectedOp, { col: -1, row: -1, source: 'storage', storageIndex: index });
        return;
      }
      setGameState(prev => prev ? ({ ...prev, selectedNum: { col: -1, row: -1, source: 'storage', storageIndex: index } }) : null);
    } else if (item.type === 'timer') {
      setTimeLeft(prev => Math.min(prev + 30, maxTime + 30));
      setMaxTime(prev => prev + 30);
      consumeStorageItem(index);
      setMessage(rulesLang === 'zh' ? "时间 +30s" : "Time +30s");
    } else if (item.type === 'refresh') {
      refreshGrid();
      consumeStorageItem(index);
      setMessage(rulesLang === 'zh' ? "刷新成功" : "Refreshed");
    }
  };

  const consumeStorageItem = (index: number) => {
    setGameState(prev => {
      if (!prev) return null;
      const newStorage = [...prev.storage];
      newStorage[index] = null;
      return { ...prev, storage: newStorage };
    });
  };

  const refreshGrid = () => {
    setGameState(prev => {
      if (!prev) return null;
      const newGrid = [...prev.grid];
      newGrid[0] = Array.from({ length: NUM_HEIGHT }, () => createCell('number'));
      newGrid[2] = Array.from({ length: NUM_HEIGHT }, () => createCell('number'));
      return { ...prev, grid: newGrid, selectedNum: null, selectedOp: null };
    });
  };

  const performSynthesis = (numPos1: Position, opPos: Position, numPos2: Position) => {
    if (!gameState) return;
    setIsSynthesizing(true);
    
    const getVal = (p: Position) => {
      if (p.source === 'grid') return gameState.grid[p.col][p.row].value as number;
      return gameState.storage[p.storageIndex!]?.value as number;
    };

    const v1 = getVal(numPos1);
    const v2 = getVal(numPos2);
    const op = gameState.grid[opPos.col][opPos.row].value as Operator;

    let result = 0;
    switch (op) {
      case '+': result = v1 + v2; break;
      case '-': result = v1 - v2; break;
      case '×': result = v1 * v2; break;
      case '÷': result = v2 !== 0 ? Math.floor(v1 / v2) : 0; break;
    }

    if (result < 0) {
      setMessage(rulesLang === 'zh' ? "结果不能为负数" : "Result cannot be negative");
      setGameState(prev => prev ? ({ ...prev, selectedNum: null, selectedOp: null }) : null);
      setIsSynthesizing(false);
      return;
    }

    setTimeout(() => {
      setGameState(prev => {
        if (!prev) return null;
        let newGrid = prev.grid.map(col => [...col]);
        let newStorage = [...prev.storage];
        const isMatch = result === prev.currentTarget.value;
        const resultId = generateRandomId();

        if (numPos1.source === 'grid') { // @ts-ignore
          newGrid[numPos1.col][numPos1.row] = null;
        } else { newStorage[numPos1.storageIndex!] = null; }

        if (numPos2.source === 'grid') { // @ts-ignore
          if (isMatch) newGrid[numPos2.col][numPos2.row] = null;
          else newGrid[numPos2.col][numPos2.row] = { ...newGrid[numPos2.col][numPos2.row], value: result, id: resultId };
        } else {
           newStorage[numPos2.storageIndex!] = null;
           if (!isMatch) {
             newStorage[numPos2.storageIndex!] = { id: resultId, type: 'number', value: result };
           }
        }

        let processedGrid = newGrid.map((col, idx) => idx === 1 ? col : col.filter(cell => cell !== null));
        let totalTargetsCleared = prev.totalTargetsCleared;
        let currentTarget = prev.currentTarget;
        let nextTarget = prev.nextTarget;
        let score = prev.score;
        let combo = prev.combo;
        let isGameOver = false;
        let numbersUsed = prev.numbersUsed + 2;
        let levelStartState = prev.levelStartState;

        if (isMatch) {
          score += (prev.currentTarget.core_base * 50) + (combo * 20);
          combo += 1;
          totalTargetsCleared += 1;
          
          currentTarget = nextTarget;
          nextTarget = getTargetForAbsoluteIndex(totalTargetsCleared + 1, prev.totalDraws);
          
          const newDuration = currentTarget.core_base * TIMER_MULTIPLIER;
          setTimeLeft(newDuration); setMaxTime(newDuration);

          processedGrid = processedGrid.map((col, colIdx) => {
            if (colIdx === 1) return col;
            const filled = [...col];
            if (filled.length < NUM_HEIGHT) filled.unshift({ ...prev.previewCells[colIdx === 0 ? 0 : 2], id: generateRandomId() });
            while (filled.length < NUM_HEIGHT) filled.unshift(createCell('number'));
            return filled;
          });

          levelStartState = {
            grid: JSON.parse(JSON.stringify(processedGrid)),
            storage: JSON.parse(JSON.stringify(newStorage)),
            numbersUsed: numbersUsed
          };
        } else {
          const numberCount = processedGrid[0].length + processedGrid[2].length + newStorage.filter(s => s?.type === 'number').length;
          if (numberCount < 2) isGameOver = true;
          processedGrid = processedGrid.map((col, colIdx) => {
             const h = colIdx === 1 ? OP_HEIGHT : NUM_HEIGHT;
             const padded = [...col];
             while (padded.length < h) padded.unshift(null as any);
             return padded;
          });
        }

        let newSelectedNum: Position | null = null;
        if (!isMatch && !isGameOver) {
          if (numPos2.source === 'grid') {
            const rowIdx = processedGrid[numPos2.col].findIndex(cell => cell?.id === resultId);
            if (rowIdx !== -1) newSelectedNum = { col: numPos2.col, row: rowIdx, source: 'grid' };
          } else {
            newSelectedNum = { col: -1, row: -1, source: 'storage', storageIndex: numPos2.storageIndex };
          }
        }

        return { ...prev, grid: processedGrid, storage: newStorage, selectedNum: newSelectedNum, selectedOp: null, score, combo, currentTarget, nextTarget, totalTargetsCleared, numbersUsed, isGameOver, levelStartState };
      });
      setIsSynthesizing(false);
    }, 400);
  };

  const triggerDraw = () => {
    setIsDrawing(true);
    const pool: ItemType[] = ['score', 'number', 'timer', 'refresh'];
    const type = pool[Math.floor(Math.random() * pool.length)];
    
    setTimeout(() => {
      let result: StorageItem;
      if (type === 'score') {
        result = { id: generateRandomId(), type: 'score' };
        setGameState(prev => prev ? ({ ...prev, score: prev.score + 500, numbersUsed: 0, totalDraws: prev.totalDraws + 1 }) : null);
        setMessage("+500 Score!");
      } else {
        result = { id: generateRandomId(), type, value: type === 'number' ? Math.floor(Math.random() * 9) + 1 : undefined };
        setGameState(prev => {
          if (!prev) return null;
          const newStorage = [...prev.storage];
          const emptyIdx = newStorage.indexOf(null);
          if (emptyIdx !== -1) newStorage[emptyIdx] = result;
          return { ...prev, storage: newStorage, numbersUsed: 0, totalDraws: prev.totalDraws + 1 };
        });
      }
      setDrawResult(result);
      setIsDrawing(false);
    }, 1500);
  };

  if (!gameState) return null;
  const currentDiff = getDiffInfo(gameState.currentTarget.diff);
  const nextDiff = getDiffInfo(gameState.nextTarget.diff);
  const drawProgress = Math.min(100, (gameState.numbersUsed / GACHA_THRESHOLD) * 100);
  const isStorageFull = gameState.storage.every(s => s !== null);

  return (
    <div className="h-dvh flex flex-col items-center bg-[#f2f2f7] text-black px-4 pt-4 pb-12 overflow-hidden relative selection:bg-blue-500/20 safe-top safe-bottom">
      
      {/* iOS Style HUD */}
      <div className="w-full max-w-md flex justify-between items-center mb-2 px-2 shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">{rulesLang === 'zh' ? '当前得分' : 'Score'}</span>
          <span className="text-2xl font-bold tracking-tight">{gameState.score}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePause} className="w-10 h-10 flex items-center justify-center rounded-full bg-white ios-shadow active:scale-90 transition-all text-blue-500">
            <i className={`fas ${gameState.isPaused ? 'fa-play' : 'fa-pause'} text-base`}></i>
          </button>
          <button onClick={() => setShowLeaderboard(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white ios-shadow active:scale-90 transition-all text-blue-600"><i className="fas fa-trophy text-base"></i></button>
          <button onClick={resetGame} className="w-10 h-10 flex items-center justify-center rounded-full bg-white ios-shadow active:scale-90 transition-all text-gray-400"><i className="fas fa-arrow-rotate-left text-base"></i></button>
        </div>
      </div>

      {/* Target Card */}
      <motion.div layout className="w-full max-w-md bg-white/70 ios-blur ios-shadow rounded-[24px] pt-4 pb-3 px-4 mb-4 flex flex-col items-center border border-white/50 relative overflow-hidden shrink-0">
        <div className="flex flex-col items-center">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-1">Target</div>
          <motion.div key={gameState.currentTarget.value} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`text-6xl font-black tracking-tighter ${currentDiff ? currentDiff.color : 'text-blue-600'}`}>{gameState.currentTarget.value}</motion.div>
          <AnimatePresence mode="wait">{currentDiff && <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className={`mt-1 px-3 py-0.5 rounded-full text-[9px] font-black tracking-widest border ${currentDiff.bg} ${currentDiff.color} ${currentDiff.border}`}>{currentDiff.label}</motion.div>}</AnimatePresence>
        </div>
        <div className="mt-3 flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Next:</span>
          <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full ${nextDiff ? `${nextDiff.bg} ${nextDiff.color}` : 'text-gray-500 bg-gray-100/50'}`}>{gameState.nextTarget.value}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
          <motion.div className={`absolute inset-y-0 left-0 transition-colors duration-500 ${(timeLeft/maxTime)*100 < 25 ? 'bg-rose-500' : (timeLeft/maxTime)*100 < 50 ? 'bg-orange-400' : 'bg-blue-500'}`} initial={{ width: '100%' }} animate={{ width: `${(timeLeft / maxTime) * 100}%` }} transition={{ duration: 0.1, ease: 'linear' }} />
        </div>
      </motion.div>

      {/* Main Grid Controls */}
      <div className="w-full max-w-md flex justify-end mb-2 px-1">
        <button onClick={handleResetLevel} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 ios-shadow text-[11px] font-bold text-gray-500 active:scale-95 transition-all">
          <i className="fas fa-undo"></i>
          {rulesLang === 'zh' ? '重置本关' : 'Reset Level'}
        </button>
      </div>

      {/* Main Grid */}
      <div className="w-full max-w-md grid grid-cols-3 gap-2 px-1 flex-grow flex items-center justify-center overflow-visible">
        {gameState.grid.map((column, colIdx) => (
          <div key={`col-${colIdx}`} className="flex flex-col gap-2 justify-center">
            {column.map((cell, rowIdx) => {
              if (!cell) return null;
              const isSelected = gameState.selectedNum?.source === 'grid' && gameState.selectedNum?.col === colIdx && gameState.selectedNum?.row === rowIdx ||
                                 gameState.selectedOp?.col === colIdx && gameState.selectedOp?.row === rowIdx;
              return (
                <motion.button key={cell.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileTap={{ scale: 0.94 }} onClick={() => handleCellClick(colIdx, rowIdx)} className={`relative h-16 sm:h-20 w-full flex items-center justify-center rounded-[20px] text-2xl font-bold transition-all duration-300 ios-shadow ${cell.type === 'operator' ? 'bg-orange-50/80 text-orange-500 border border-orange-100' : 'bg-white text-black border border-white/50'} ${isSelected ? 'ring-4 ring-blue-500/30 !bg-blue-600 !text-white !border-blue-600 shadow-[0_8px_20px_rgba(37,99,235,0.3)]' : ''}`}>{cell.value}</motion.button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Gacha System UI */}
      <div className="w-full max-w-md mt-6 px-2 shrink-0">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
            {isStorageFull 
              ? (rulesLang === 'zh' ? '暂存栏已满，请使用道具' : 'Storage full, use an item')
              : (rulesLang === 'zh' ? `再消耗 ${Math.max(0, GACHA_THRESHOLD - gameState.numbersUsed)} 个数字进行抽卡` : `Use ${Math.max(0, GACHA_THRESHOLD - gameState.numbersUsed)} more for a draw`)}
          </span>
          <span className="text-[10px] font-bold text-blue-600">{Math.floor(drawProgress)}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-200 rounded-full mb-4 overflow-hidden">
          <motion.div animate={{ width: `${drawProgress}%` }} className="h-full bg-blue-600" />
        </div>

        {/* Storage Slots */}
        <div className="grid grid-cols-4 gap-3">
          {gameState.storage.map((item, i) => {
            const isSelected = gameState.selectedNum?.source === 'storage' && gameState.selectedNum?.storageIndex === i;
            return (
              <button
                key={item?.id || `empty-${i}`}
                onClick={() => handleStorageClick(i)}
                className={`aspect-square rounded-[18px] flex items-center justify-center transition-all duration-300 ios-shadow border ${item ? 'bg-white border-white/50' : 'bg-gray-100/50 border-dashed border-gray-200'} ${isSelected ? 'ring-4 ring-blue-500/30 !bg-blue-600 !text-white !border-blue-600' : ''}`}
              >
                {item?.type === 'number' && <span className="text-xl font-black">{item.value}</span>}
                {item?.type === 'timer' && <i className="fas fa-stopwatch text-rose-500 text-xl"></i>}
                {item?.type === 'refresh' && <i className="fas fa-sync-alt text-emerald-500 text-xl"></i>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pause Modal */}
      <AnimatePresence>
        {gameState.isPaused && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[160] bg-black/40 ios-blur flex items-center justify-center">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[32px] p-10 flex flex-col items-center ios-shadow">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-pause text-blue-600 text-3xl"></i>
              </div>
              <h2 className="text-2xl font-black mb-8">{rulesLang === 'zh' ? '游戏已暂停' : 'Game Paused'}</h2>
              <button onClick={handlePause} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                {rulesLang === 'zh' ? '继续游戏' : 'Resume'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gacha Modal */}
      <AnimatePresence>
        {isGachaModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] bg-black/60 ios-blur flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[32px] p-8 w-full max-w-xs ios-shadow text-center relative overflow-hidden">
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-blue-50 rounded-full opacity-50 blur-3xl"></div>
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-orange-50 rounded-full opacity-50 blur-3xl"></div>
              
              <h2 className="text-2xl font-black mb-6 tracking-tight">{rulesLang === 'zh' ? '幸运抽奖' : 'Lucky Draw'}</h2>
              
              <div className="h-32 flex items-center justify-center mb-8">
                <AnimatePresence mode="wait">
                  {isDrawing ? (
                    <motion.div key="spinning" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.5, ease: 'linear' }} className="text-5xl text-blue-600"><i className="fas fa-spinner"></i></motion.div>
                  ) : drawResult ? (
                    <motion.div key="result" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-blue-50 rounded-[24px] flex items-center justify-center mb-4">
                        {drawResult.type === 'score' && <i className="fas fa-star text-yellow-500 text-3xl"></i>}
                        {drawResult.type === 'number' && <span className="text-4xl font-black text-blue-600">{drawResult.value}</span>}
                        {drawResult.type === 'timer' && <i className="fas fa-stopwatch text-rose-500 text-4xl"></i>}
                        {drawResult.type === 'refresh' && <i className="fas fa-sync-alt text-emerald-500 text-4xl"></i>}
                      </div>
                      <p className="text-sm font-bold text-gray-500">
                        {drawResult.type === 'score' ? '+500 Points' : 
                         drawResult.type === 'number' ? (rulesLang === 'zh' ? '数字道具' : 'Number Item') :
                         drawResult.type === 'timer' ? (rulesLang === 'zh' ? '加时道具' : 'Time Boost') : 
                         (rulesLang === 'zh' ? '刷新道具' : 'Refresh Board')}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div className="text-6xl text-gray-100"><i className="fas fa-gift"></i></motion.div>
                  )}
                </AnimatePresence>
              </div>

              {!drawResult ? (
                <button onClick={triggerDraw} disabled={isDrawing} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                  {isDrawing ? '...' : (rulesLang === 'zh' ? '抽奖' : 'Draw')}
                </button>
              ) : (
                <button onClick={() => { setIsGachaModalOpen(false); setDrawResult(null); }} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold active:scale-95 transition-all">
                  {rulesLang === 'zh' ? '收下' : 'Collect'}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/40 ios-blur flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[32px] p-8 w-full max-w-sm ios-shadow relative">
              <button onClick={() => setRulesLang(rulesLang === 'zh' ? 'en' : 'zh')} className="absolute top-6 left-6 px-3 py-1 rounded-full bg-gray-100 text-[10px] font-bold border border-gray-200">{rulesLang === 'zh' ? 'EN' : '中文'}</button>
              <button onClick={() => setShowRules(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"><i className="fas fa-xmark"></i></button>
              <h2 className="text-2xl font-black mb-6 mt-4">? {rulesLang === 'zh' ? '玩法介绍' : 'How to Play'}</h2>
              <div className="space-y-4 text-sm text-gray-600">
                <p>1. {rulesLang === 'zh' ? '点击数字、运算符、数字进行合成。' : 'Combine number, operator, and number.'}</p>
                <p>2. {rulesLang === 'zh' ? '合成目标值可得分并延长生命。' : 'Matching targets score points and reset timer.'}</p>
                <p>3. {rulesLang === 'zh' ? `每消耗 ${GACHA_THRESHOLD} 个数字可获得特殊道具。` : `Draw special items every ${GACHA_THRESHOLD} numbers used.`}</p>
              </div>
              <button onClick={() => setShowRules(false)} className="w-full mt-8 py-4 bg-blue-600 text-white rounded-2xl font-bold">{rulesLang === 'zh' ? '明白' : 'Got it'}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameState.isGameOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] bg-black/20 ios-blur flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[32px] p-8 w-full max-w-sm ios-shadow text-center">
              <h2 className="text-3xl font-black mb-4">Game Over</h2>
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Score</div>
                <div className="text-4xl font-black text-blue-600">{gameState.score}</div>
              </div>
              <input type="text" placeholder={rulesLang === 'zh' ? '输入昵称' : 'Name'} value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-4 py-3 mb-4 text-center font-bold" />
              <button onClick={saveScore} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">Save & Restart</button>
              <button onClick={resetGame} className="w-full mt-2 py-2 text-gray-400 font-bold">Discard</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard Slide-up */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[180] bg-white flex flex-col pt-safe"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-50">
              <h2 className="text-xl font-black tracking-tight">{rulesLang === 'zh' ? '排行榜' : 'Leaderboard'}</h2>
              <button onClick={() => setShowLeaderboard(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 active:scale-90"><i className="fas fa-xmark text-lg"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {leaderboard.map((entry, i) => (
                <div key={entry.id} className="flex items-center justify-between bg-gray-50/50 p-5 rounded-3xl border border-gray-100">
                  <div className="flex items-center gap-5">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-600' : i === 1 ? 'bg-gray-200 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}>{i + 1}</span>
                    <span className="font-bold text-gray-800 truncate max-w-[150px]">{entry.username}</span>
                  </div>
                  <span className="font-black text-xl text-blue-600 tracking-tight">{entry.score}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Message */}
      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-8 z-[210] bg-gray-900/90 text-white text-[11px] font-bold px-6 py-3 rounded-full ios-blur ios-shadow" onAnimationComplete={() => setTimeout(() => setMessage(null), 2000)}>
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
