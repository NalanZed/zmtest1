
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cell, Operator, Position, GameState, TargetData, StorageItem, ItemType } from './types';
import { supabase } from './services/supabaseClient';
import { TARGET_CATALOG, GAME_PARAMS, ITEM_CONFIG, DIFF_UI } from './gameConfig';

const NUM_HEIGHT = 3;
const OP_HEIGHT = 4;
const OPERATORS: Operator[] = ['+', '-', '×', '÷'];

type Language = 'zh' | 'en';

const TRANSLATIONS = {
  zh: {
    subtitle: "数学挑战",
    high_score: "历史最高分",
    enter_game: "进入游戏",
    leaderboard: "排行榜",
    tutorial_title: "游戏教程",
    tutorial_follow: "跟我来操作",
    tutorial_next: "我知道了，下一步",
    tutorial_click_hint: "点击下方闪烁块",
    tutorial_complete_msg: "恭喜你学会了游戏规则，继续后面的游戏吧",
    game_over_title: "挑战结束",
    final_score: "最终得分",
    nickname_placeholder: "输入你的昵称",
    save_and_home: "保存并回到主页",
    play_again: "再来一局",
    global_leaderboard: "全球排行榜",
    leaderboard_empty: "虚位以待",
    pause_title: "游戏暂停",
    continue_game: "继续游戏",
    back_to_home: "回到主页",
    gacha_title: "幸运抽奖",
    gacha_new_item: "新道具发现",
    gacha_open: "点击开启",
    gacha_claim: "收下奖励",
    timer_add_msg: "时间增加",
    refresh_msg: "棋盘已刷新",
    reset_numbers: "重置数字",
    draw_progress: "抽卡进度",
    item_desc_number: "合成助手：存放在储物格中，可随时取用参与合成，帮你化解僵局。",
    item_desc_timer: "时间增益：点击即用，瞬间为你的挑战延长 15 秒倒计时。",
    item_desc_refresh: "棋盘刷新：当你觉得无计可施时，点击它来重置整个棋盘布局。",
    item_desc_score: "幸运礼包：直接获得 500 额外积分，让你的排名更进一步。",
    diff_0: "简单",
    diff_1: "普通",
    diff_2: "困难",
    diff_3: "专家",
    diff_4: "大师",
    diff_5: "传奇",
    div_zero_err: "除数不能为零",
    not_divisible_err: "不能整除",
    negative_err: "不能得到负数",
    tutorial_steps: [
      "嘿！欢迎来到 Beyond 24！这是你的目标数字，你需要用棋盘上的数算出它。",
      "这里预告了下一个挑战目标，高手都会提前做好计算规划哦！",
      "看到这个时间条了吗？它走完前必须达成目标，动作要快！",
      "这就是你的主战场！通过点击数字和符号，把它们合二为一。",
      "第一步：咱们先选中左边这个 3。",
      "第二步：点击加号 +，准备给它加点料。",
      "第三步：点击这个 1。看！3 和 1 合成了 4。",
      "瞧！它们变成了 4。现在它是选中状态，点击它可以取消选中。",
      "我们要算出 24，还差一个 4×6。现在重新选上这个 4 吧！",
      "接下来，点击乘号 ×。",
      "最后点击 6。4 × 6 = 24！刚好匹配我们的目标，简直完美！"
    ]
  },
  en: {
    subtitle: "math challenge",
    high_score: "Personal Best",
    enter_game: "Enter Game",
    leaderboard: "Leaderboard",
    tutorial_title: "Tutorial",
    tutorial_follow: "Follow Me",
    tutorial_next: "Got it, next",
    tutorial_click_hint: "Click the flashing block",
    tutorial_complete_msg: "Congratulations! You've learned the rules. Enjoy the game!",
    game_over_title: "Game Over",
    final_score: "Final Score",
    nickname_placeholder: "Enter your nickname",
    save_and_home: "Save & Home",
    play_again: "Play Again",
    global_leaderboard: "Global Leaderboard",
    leaderboard_empty: "No scores yet",
    pause_title: "Game Paused",
    continue_game: "Continue",
    back_to_home: "Back to Home",
    gacha_title: "Lucky Draw",
    gacha_new_item: "New Item Discovered",
    gacha_open: "Click to Open",
    gacha_claim: "Claim Reward",
    timer_add_msg: "Time increased",
    refresh_msg: "Grid refreshed",
    reset_numbers: "Reset Numbers",
    draw_progress: "Draw Progress",
    item_desc_number: "Synthesis Assistant: Store in a slot and use anytime to help break a deadlock.",
    item_desc_timer: "Time Boost: Click to instantly extend your countdown by 15 seconds.",
    item_desc_refresh: "Grid Refresh: When stuck, click to reset the entire board layout.",
    item_desc_score: "Lucky Pack: Instantly gain 500 extra points to boost your ranking.",
    diff_0: "EASY",
    diff_1: "NORMAL",
    diff_2: "HARD",
    diff_3: "EXPERT",
    diff_4: "MASTER",
    diff_5: "LEGEND",
    div_zero_err: "Cannot divide by zero",
    not_divisible_err: "Not divisible",
    negative_err: "Cannot be negative",
    tutorial_steps: [
      "Hey! Welcome to Beyond 24! This is your target number, you need to calculate it using numbers on the board.",
      "This previews the next target. Pro players always plan ahead!",
      "See this timer bar? You must reach the target before it runs out. Be quick!",
      "This is your main battlefield! Click numbers and symbols to combine them.",
      "Step 1: Let's select this 3 on the left.",
      "Step 2: Click the plus sign + to add something to it.",
      "Step 3: Click this 1. Look! 3 and 1 combined into 4.",
      "See! They became 4. It's now selected, you can click it again to deselect.",
      "We need to get 24, so we need 4×6. Let's select this 4 again!",
      "Next, click the multiplication sign ×.",
      "Finally, click 6. 4 × 6 = 24! Matches our target perfectly!",
    ]
  }
};

const getTargetForAbsoluteIndex = (index: number, totalDraws: number): TargetData => {
  const GROUP_WARMUP = TARGET_CATALOG.filter(t => t.value < 40 && t.diff <= 1);
  const GROUP_LOW = TARGET_CATALOG.filter(t => t.diff <= 2);
  const GROUP_MED = TARGET_CATALOG.filter(t => t.diff === 3);
  const GROUP_HIGH = TARGET_CATALOG.filter(t => t.diff === 4);
  const GROUP_LEGEND = TARGET_CATALOG.filter(t => t.diff === 5);
  
  if (index < 3) return GROUP_WARMUP[Math.floor(Math.random() * GROUP_WARMUP.length)];
  
  const relativeIdx = index - 3;
  if (totalDraws < 2) {
    const cycleIdx = relativeIdx % 6;
    if (cycleIdx < 3) return GROUP_LOW[Math.floor(Math.random() * GROUP_LOW.length)];
    if (cycleIdx === 3) return GROUP_MED[Math.floor(Math.random() * GROUP_MED.length)];
    if (cycleIdx === 4) return GROUP_HIGH[Math.floor(Math.random() * GROUP_HIGH.length)];
    return GROUP_LEGEND[Math.floor(Math.random() * GROUP_LEGEND.length)];
  } else {
    const cycleIdx = relativeIdx % 5;
    if (cycleIdx < 2) return GROUP_LOW[Math.floor(Math.random() * GROUP_LOW.length)];
    if (cycleIdx === 2) return GROUP_MED[Math.floor(Math.random() * GROUP_MED.length)];
    if (cycleIdx === 3) return GROUP_HIGH[Math.floor(Math.random() * GROUP_HIGH.length)];
    return GROUP_LEGEND[Math.floor(Math.random() * GROUP_LEGEND.length)];
  }
};

const generateRandomId = () => Math.random().toString(36).substr(2, 9);

const createCell = (type: 'number' | 'operator', value?: number | Operator): Cell => ({
  id: generateRandomId(),
  value: value !== undefined ? value : (type === 'number' ? Math.floor(Math.random() * 9) + 1 : OPERATORS[Math.floor(Math.random() * OPERATORS.length)]),
  type
});

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'game'>('home');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [isGachaModalOpen, setIsGachaModalOpen] = useState(false);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawResult, setDrawResult] = useState<StorageItem | null>(null);
  const [isNewDiscovery, setIsNewDiscovery] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [maxTime, setMaxTime] = useState(0);
  const [personalHighScore, setPersonalHighScore] = useState(0);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('game_lang');
    return (saved as Language) || 'zh';
  });
  const timerRef = useRef<number | null>(null);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    localStorage.setItem('game_lang', language);
  }, [language]);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('personal_high_score');
    if (savedHighScore) setPersonalHighScore(parseInt(savedHighScore, 10));
    
    const savedUsername = localStorage.getItem('last_username');
    if (savedUsername) setUsername(savedUsername);

    fetchLeaderboard();
  }, []);

  // Timer logic
  useEffect(() => {
    if (gameState && !gameState.isGameOver && !gameState.isPaused && !isSynthesizing && !showLeaderboard && !isGachaModalOpen && !isPauseModalOpen && gameState.tutorialStep === null) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            setGameState(g => g ? { ...g, isGameOver: true } : null);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState?.isGameOver, gameState?.isPaused, isSynthesizing, showLeaderboard, isGachaModalOpen, isPauseModalOpen, gameState?.tutorialStep]);

  // Timer reset logic when target cleared
  useEffect(() => {
    if (gameState && gameState.totalTargetsCleared > 0 && !gameState.isGameOver && gameState.tutorialStep === null) {
      const newDuration = gameState.currentTarget.core_base * GAME_PARAMS.TIMER_MULTIPLIER;
      setTimeLeft(newDuration);
      setMaxTime(newDuration);
    }
  }, [gameState?.totalTargetsCleared]);

  // Gacha trigger logic
  useEffect(() => {
    if (gameState && gameState.totalTargetsCleared > 0 && gameState.totalTargetsCleared % GAME_PARAMS.GACHA_TARGETS_THRESHOLD === 0 && !isGachaModalOpen && gameState.tutorialStep === null) {
      // Check if we already handled this threshold to prevent double trigger
      const lastHandled = (gameState as any).lastGachaThreshold || 0;
      if (gameState.totalTargetsCleared > lastHandled) {
        if (gameState.storage.some(s => s === null)) {
          setGameState(prev => prev ? ({ ...prev, lastGachaThreshold: prev.totalTargetsCleared } as any) : null);
          setIsGachaModalOpen(true);
        }
      }
    }
  }, [gameState?.totalTargetsCleared, isGachaModalOpen, gameState?.tutorialStep]);

  const startTutorial = () => {
    const grid: Cell[][] = [
      [createCell('number', 3), createCell('number', 1), createCell('number', 6)],
      OPERATORS.map(op => createCell('operator', op)),
      [createCell('number', 9), createCell('number', 3), createCell('number', 6)]
    ];
    const initialTarget = { value: 24, diff: 0, core_base: 2 };
    setGameState({
      grid,
      previewCells: [createCell('number'), createCell('number'), createCell('number')],
      currentTarget: initialTarget,
      nextTarget: { value: 12, diff: 0, core_base: 2 },
      totalTargetsCleared: 0, score: 0, selectedNum: null, selectedOp: null, combo: 0,
      isGameOver: false, isPaused: false, numbersUsed: 0, totalDraws: 0, storage: Array(GAME_PARAMS.STORAGE_SIZE).fill(null),
      levelStartState: null, tutorialStep: 0
    });
    setTimeLeft(100); setMaxTime(100);
    setCurrentView('game');
  };

  const nextTutorialStep = () => {
    setGameState(prev => {
      if (!prev || prev.tutorialStep === null) return prev;
      if (prev.tutorialStep < 3) return { ...prev, tutorialStep: prev.tutorialStep + 1 };
      if (prev.tutorialStep === 3) return { ...prev, tutorialStep: 4 };
      return prev;
    });
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase.from('high_scores').select('*').order('score', { ascending: false }).limit(10);
      if (!error && data) setLeaderboard(data);
    } catch (e) { console.error(e); }
  };

  const resetGame = () => {
    const firstTarget = getTargetForAbsoluteIndex(0, 0);
    const initialDuration = firstTarget.core_base * GAME_PARAMS.TIMER_MULTIPLIER;
    const initialGrid = [
      Array.from({ length: NUM_HEIGHT }, () => createCell('number')),
      OPERATORS.map(op => createCell('operator', op)),
      Array.from({ length: NUM_HEIGHT }, () => createCell('number'))
    ];
    setGameState({
      grid: initialGrid, previewCells: [createCell('number'), createCell('number'), createCell('number')],
      currentTarget: firstTarget, nextTarget: getTargetForAbsoluteIndex(1, 0),
      totalTargetsCleared: 0, score: 0, selectedNum: null, selectedOp: null, combo: 0,
      isGameOver: false, isPaused: false, numbersUsed: 0, totalDraws: 0, storage: Array(GAME_PARAMS.STORAGE_SIZE).fill(null),
      levelStartState: { grid: JSON.parse(JSON.stringify(initialGrid)), storage: Array(GAME_PARAMS.STORAGE_SIZE).fill(null), numbersUsed: 0 },
      tutorialStep: null
    });
    setTimeLeft(initialDuration); setMaxTime(initialDuration);
  };

  const handleCellClick = (col: number, row: number) => {
    if (!gameState || isSynthesizing || gameState.isGameOver || gameState.isPaused) return;
    
    if (gameState.tutorialStep !== null) {
      if (gameState.tutorialStep < 4) return;
      const expected = [
        { c: 0, r: 0 }, { c: 1, r: 0 }, { c: 0, r: 1 }, { c: 0, r: 1 }, { c: 0, r: 1 }, { c: 1, r: 2 }, { c: 2, r: 2 }
      ];
      const curIdx = gameState.tutorialStep - 4;
      if (curIdx >= expected.length || col !== expected[curIdx].c || row !== expected[curIdx].r) return;
    }

    const cell = gameState.grid[col][row];
    if (!cell) return;
    if (cell.type === 'number') {
      if (gameState.selectedNum?.col === col && gameState.selectedNum?.row === row && gameState.selectedNum.source === 'grid') {
        setGameState(prev => prev ? ({ ...prev, selectedNum: null, selectedOp: null, tutorialStep: prev.tutorialStep !== null ? prev.tutorialStep + 1 : null }) : null);
        return;
      }
      if (gameState.selectedNum && gameState.selectedOp) {
        performSynthesis(gameState.selectedNum, gameState.selectedOp, { col, row, source: 'grid' });
        return;
      }
      setGameState(prev => prev ? ({ ...prev, selectedNum: { col, row, source: 'grid' }, tutorialStep: prev.tutorialStep !== null ? prev.tutorialStep + 1 : null }) : null);
    } else {
      if (!gameState.selectedNum) return;
      setGameState(prev => prev ? ({ ...prev, selectedOp: { col, row, source: 'grid' }, tutorialStep: prev.tutorialStep !== null ? prev.tutorialStep + 1 : null }) : null);
    }
  };

  const performSynthesis = (numPos1: Position, opPos: Position, numPos2: Position) => {
    if (!gameState) return;
    setIsSynthesizing(true);
    const getVal = (p: Position) => p.source === 'grid' ? gameState.grid[p.col][p.row].value as number : gameState.storage[p.storageIndex!]?.value as number;
    const v1 = getVal(numPos1); const v2 = getVal(numPos2);
    const op = gameState.grid[opPos.col][opPos.row].value as Operator;

    // Check for integer division
    if (op === '÷' && (v2 === 0 || v1 % v2 !== 0)) {
      setMessage(v2 === 0 ? t.div_zero_err : t.not_divisible_err);
      setGameState(prev => prev ? ({ ...prev, selectedNum: null, selectedOp: null }) : null);
      setIsSynthesizing(false);
      return;
    }

    let result = 0;
    switch (op) {
      case '+': result = v1 + v2; break;
      case '-': result = v1 - v2; break;
      case '×': result = v1 * v2; break;
      case '÷': result = Math.floor(v1 / v2); break;
    }

    if (result < 0) {
      setMessage(t.negative_err);
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
        
        if (numPos1.source === 'grid') newGrid[numPos1.col][numPos1.row] = null as any;
        else newStorage[numPos1.storageIndex!] = null;

        if (numPos2.source === 'grid') {
          if (isMatch) newGrid[numPos2.col][numPos2.row] = null as any;
          else newGrid[numPos2.col][numPos2.row] = { ...newGrid[numPos2.col][numPos2.row], value: result, id: resultId };
        } else {
          newStorage[numPos2.storageIndex!] = null;
          if (!isMatch) newStorage[numPos2.storageIndex!] = { id: resultId, type: 'number', value: result };
        }
        
        let processedGrid = newGrid.map((col, idx) => idx === 1 ? col : col.filter(cell => cell !== null));
        let { totalTargetsCleared, currentTarget, nextTarget, score, combo, numbersUsed, totalDraws } = prev;
        numbersUsed += 2;
        
        if (isMatch) {
          score += (prev.currentTarget.core_base * GAME_PARAMS.BASE_SCORE_MULTIPLIER) + (combo * GAME_PARAMS.COMBO_SCORE_BONUS);
          combo += 1; totalTargetsCleared += 1;
          
          if (prev.tutorialStep !== null) {
            setMessage(t.tutorial_complete_msg);
            setTimeout(() => { 
              localStorage.setItem('quest_visited', 'true');
              resetGame(); 
            }, 2300);
            return { ...prev, tutorialStep: null };
          }
          
          currentTarget = nextTarget; nextTarget = getTargetForAbsoluteIndex(totalTargetsCleared + 1, totalDraws);
          processedGrid = processedGrid.map((col, colIdx) => {
            if (colIdx === 1) return col;
            const filled = [...col];
            if (filled.length < NUM_HEIGHT) filled.unshift({ ...prev.previewCells[colIdx === 0 ? 0 : 2], id: generateRandomId() });
            while (filled.length < NUM_HEIGHT) filled.unshift(createCell('number'));
            return filled;
          });
        } else {
          processedGrid = processedGrid.map((col, colIdx) => {
             const h = colIdx === 1 ? OP_HEIGHT : NUM_HEIGHT;
             const padded = [...col]; while (padded.length < h) padded.unshift(null as any);
             return padded;
          });
        }
        
        let newSelectedNum: Position | null = null;
        if (!isMatch) {
           const gridNumsCount = processedGrid.reduce((acc, col) => acc + col.filter(c => c?.type === 'number').length, 0);
           const storageNumsCount = newStorage.filter(s => s?.type === 'number').length;
           if (gridNumsCount + storageNumsCount < 2) {
             setTimeout(() => setGameState(s => s ? { ...s, isGameOver: true } : null), 1200);
           }
          if (numPos2.source === 'grid') {
            const rIdx = processedGrid[numPos2.col].findIndex(cell => cell?.id === resultId);
            if (rIdx !== -1) newSelectedNum = { col: numPos2.col, row: rIdx, source: 'grid' };
          } else {
            newSelectedNum = { col: -1, row: -1, source: 'storage', storageIndex: numPos2.storageIndex };
          }
        }

        const levelStartState = isMatch 
          ? { grid: JSON.parse(JSON.stringify(processedGrid)), storage: JSON.parse(JSON.stringify(newStorage)), numbersUsed } 
          : prev.levelStartState;
        
        return { 
          ...prev, 
          grid: processedGrid, storage: newStorage,
          selectedNum: newSelectedNum, selectedOp: null, 
          score, combo, 
          currentTarget, nextTarget, 
          totalTargetsCleared, numbersUsed, 
          levelStartState,
          tutorialStep: prev.tutorialStep !== null ? prev.tutorialStep + 1 : null 
        };
      });
      setIsSynthesizing(false);
    }, 400);
  };

  const updateHighScore = (score: number) => {
    if (score > personalHighScore) {
      setPersonalHighScore(score);
      localStorage.setItem('personal_high_score', score.toString());
    }
  };

  const getTutorialHintText = () => {
    if (!gameState || gameState.tutorialStep === null) return "";
    return t.tutorial_steps[gameState.tutorialStep] || "";
  };

  const TutorialView = () => {
    if (gameState?.tutorialStep === null) return null;
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, scale: 0.9 }} 
          className={`absolute inset-0 z-[1100] flex items-center justify-center p-4 pointer-events-none`}
        >
          <div className="bg-white rounded-[28px] p-6 ios-shadow border border-gray-100 text-center w-full h-full flex flex-col justify-center pointer-events-auto max-h-[160px]">
            <h3 className="text-lg font-black text-gray-900 mb-1">{gameState!.tutorialStep! < 4 ? t.tutorial_title : t.tutorial_follow}</h3>
            <p className="text-gray-600 leading-snug text-xs font-medium mb-4">{getTutorialHintText()}</p>
            {gameState!.tutorialStep! < 4 ? (
              <button onClick={nextTutorialStep} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm active:scale-95 transition-all shadow-lg shadow-blue-500/20">{t.tutorial_next}</button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-blue-600 font-bold animate-bounce text-xs"><i className="fas fa-hand-pointer"></i><span>{t.tutorial_click_hint}</span></div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const drawProgress = useMemo(() => {
    if (!gameState) return 0;
    return Math.min(100, (gameState.numbersUsed / GAME_PARAMS.GACHA_THRESHOLD) * 100);
  }, [gameState?.numbersUsed]);

  const currentDiff = useMemo(() => {
    if (!gameState) return null;
    return DIFF_UI[gameState.currentTarget.diff] || null;
  }, [gameState?.currentTarget.diff]);

  if (currentView === 'home') {
    return (
      <div className="h-dvh flex flex-col items-center justify-center bg-[#FDFDFD] p-8 text-center safe-top safe-bottom overflow-hidden relative">
        {/* Language Toggle - Keep it but make it subtle */}
        <div className="absolute top-8 right-8 z-20">
          <button 
            onClick={() => setLanguage(l => l === 'zh' ? 'en' : 'zh')}
            className="px-4 py-2 bg-white border border-gray-100 rounded-full text-[10px] font-black text-gray-300 shadow-sm active:scale-95 transition-all"
          >
            {language === 'zh' ? 'EN' : '中文'}
          </button>
        </div>

        <div className="relative z-10 w-full flex flex-col items-center">
          <motion.div 
            initial={{ y: -20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="mb-16 relative w-full max-w-xs"
          >
            <h1 className="text-6xl font-black tracking-tighter text-[#1E293B] leading-none mb-4 whitespace-nowrap">
              BEYOND <span className="text-[#34D399]">24</span>
            </h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[1px] flex-1 bg-gray-100"></div>
              <div className="flex items-center gap-2 text-yellow-500">
                <i className="fas fa-crown text-xs"></i>
                <span className="text-[11px] font-bold text-gray-400 tracking-widest">{t.high_score}</span>
              </div>
              <div className="h-[1px] flex-1 bg-gray-100"></div>
            </div>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ delay: 0.2 }} 
              className="flex flex-col items-center"
            >
              <div className="text-6xl font-black text-[#1E293B] tracking-tighter drop-shadow-sm">
                {personalHighScore}
              </div>
            </motion.div>
          </motion.div>

          <div className="flex flex-col gap-6 w-full max-w-[280px]">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { 
                const hasVisited = localStorage.getItem('quest_visited');
                if (!hasVisited) {
                  startTutorial();
                } else {
                  resetGame(); 
                  setCurrentView('game'); 
                }
              }}
              className="w-full py-5 bg-gradient-to-r from-[#A7F3D0] to-[#6EE7B7] text-[#065F46] rounded-[32px] font-black text-xl shadow-lg shadow-emerald-200/50 transition-all"
            >
              {t.enter_game}
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLeaderboard(true)}
              className="w-full py-5 bg-white text-[#1E293B] rounded-[32px] font-black text-xl shadow-sm border border-gray-100 active:bg-gray-50 transition-all"
            >
              {t.leaderboard}
            </motion.button>
          </div>
        </div>

        {/* Global Footer Credits */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-12 text-[10px] text-gray-300 font-bold uppercase tracking-widest"
        >
          Powered by Gemini & Supabase
        </motion.div>
        
        {/* Reuse Leaderboard Overlay */}
        <AnimatePresence>
          {showLeaderboard && (
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-[2500] bg-white flex flex-col pt-safe">
              <div className="flex justify-between items-center p-6 border-b border-gray-50">
                <h2 className="text-xl font-black tracking-tight text-gray-800">{t.global_leaderboard}</h2>
                <button onClick={() => setShowLeaderboard(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 active:scale-90"><i className="fas fa-xmark text-lg"></i></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                {leaderboard.length > 0 ? leaderboard.map((entry, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={entry.id} 
                    className="flex items-center justify-between bg-gray-50 p-5 rounded-3xl border border-gray-100"
                  >
                    <div className="flex items-center gap-5">
                      <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${i < 3 ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</span>
                      <span className="font-bold text-gray-700">{entry.username}</span>
                    </div>
                    <span className="font-black text-xl text-emerald-600 tracking-tight">{entry.score}</span>
                  </motion.div>
                )) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-300">
                    <i className="fas fa-trophy text-6xl mb-4 opacity-10"></i>
                    <p className="font-bold">{t.leaderboard_empty}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (!gameState) return null;

  const timerWidth = maxTime > 0 ? Math.max(0, Math.min(100, (timeLeft / maxTime) * 100)) : 0;

  return (
    <div className="h-dvh flex flex-col items-center bg-[#f2f2f7] text-black px-4 pt-4 pb-12 overflow-hidden relative selection:bg-blue-500/20 safe-top safe-bottom">
      
      {/* Top Bar */}
      <div className="w-full max-w-md flex justify-between items-center px-2 mb-2 shrink-0">
        <div className="flex flex-col items-start">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Score</span>
          <span className="text-2xl font-black text-gray-900 leading-none">{gameState.score}</span>
        </div>
        <button 
          onClick={() => { setIsPauseModalOpen(true); setGameState(p => p ? ({ ...p, isPaused: true }) : null); }}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white ios-shadow text-gray-400 active:scale-90 transition-all border border-gray-100"
        >
          <i className="fas fa-pause text-sm"></i>
        </button>
      </div>

      <AnimatePresence>
        {gameState.tutorialStep !== null && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[900] bg-black/70 pointer-events-none" />}
      </AnimatePresence>

      <div className="w-full max-w-md relative mb-2 shrink-0 h-[140px]">
        <motion.div layout id="target-card" className={`absolute inset-0 bg-white/70 ios-blur ios-shadow rounded-[32px] pt-4 pb-3 px-6 flex flex-col items-center border border-white/50 transition-all duration-300 ${gameState.tutorialStep !== null && gameState.tutorialStep < 3 ? 'z-[1001] !bg-white scale-105 ring-4 ring-blue-400 shadow-2xl' : ''}`}>
          <div className={`flex flex-col items-center transition-all ${gameState.tutorialStep === 0 ? 'scale-110' : ''}`}>
            <div className="flex items-center gap-2 mb-0">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Target</div>
              <div className="text-[10px] font-black text-blue-400/60 tabular-nums">{timeLeft.toFixed(1)}s</div>
            </div>
            <motion.div key={gameState.currentTarget.value} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`text-4xl font-black tracking-tighter leading-none ${currentDiff ? currentDiff.color : 'text-blue-600'}`}>{gameState.currentTarget.value}</motion.div>
            <AnimatePresence mode="wait">{currentDiff && <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className={`mt-0.5 px-3 py-0.5 rounded-full text-[8px] font-black tracking-widest border ${currentDiff.bg} ${currentDiff.color} ${currentDiff.border}`}>{t[`diff_${gameState.currentTarget.diff}`]}</motion.div>}</AnimatePresence>
          </div>
          <div className={`mt-1.5 flex items-center gap-2 mb-2 rounded-full px-3 py-1 transition-all ${gameState.tutorialStep === 1 ? 'bg-blue-600 !text-white ring-4 ring-blue-300 scale-105' : 'text-gray-400 bg-gray-100/50'}`}>
            <span className={`text-[9px] font-bold uppercase tracking-widest ${gameState.tutorialStep === 1 ? 'text-blue-100' : 'text-gray-300'}`}>Next:</span>
            <span className="text-[11px] font-bold">{gameState.nextTarget.value}</span>
          </div>

          {/* Progress Bar - Simple & Reliable */}
          <div className="w-full h-2 bg-gray-200/50 rounded-full overflow-hidden relative border border-gray-100/50 mt-auto">
            <div 
              className="absolute inset-y-0 left-0 transition-all duration-150 ease-linear shadow-[0_0_8px_rgba(37,99,235,0.4)]"
              style={{ 
                width: `${timerWidth}%`, 
                backgroundColor: timerWidth < 30 ? '#ef4444' : '#2563eb' 
              }}
            />
          </div>
        </motion.div>
        {gameState.tutorialStep !== null && gameState.tutorialStep >= 3 && <TutorialView />}
      </div>

      {/* Reset Numbers Button - Positioned between target and grid */}
      <div className="w-full max-w-md flex justify-center mb-2 shrink-0">
        <button 
          onClick={() => {
            if (!gameState.levelStartState) return;
            setGameState(prev => prev ? ({
              ...prev,
              grid: JSON.parse(JSON.stringify(prev.levelStartState!.grid)),
              storage: JSON.parse(JSON.stringify(prev.levelStartState!.storage)),
              numbersUsed: prev.levelStartState!.numbersUsed,
              selectedNum: null,
              selectedOp: null,
              combo: 0
            }) : null);
          }}
          className="flex items-center gap-2 px-6 py-2 bg-white/80 ios-blur rounded-full text-xs font-black text-gray-500 ios-shadow active:scale-95 transition-all border border-white/50"
        >
          <i className="fas fa-rotate-left"></i>
          <span>{t.reset_numbers}</span>
        </button>
      </div>

      <div className={`w-full max-w-md relative flex-grow flex flex-col justify-center overflow-visible`}>
        <div className={`grid grid-cols-3 gap-3 px-1 transition-all duration-500 ${gameState.tutorialStep === 3 ? 'z-[1001] bg-white/20 p-4 rounded-3xl ring-4 ring-blue-400 scale-105 shadow-2xl' : ''}`}>
          {gameState.grid.map((column, colIdx) => (
            <div key={`col-${colIdx}`} className="flex flex-col gap-2.5 justify-center">
              {column.map((cell, rowIdx) => {
                if (!cell) return null;
                const isSelected = gameState.selectedNum?.source === 'grid' && gameState.selectedNum?.col === colIdx && gameState.selectedNum?.row === rowIdx || gameState.selectedOp?.col === colIdx && gameState.selectedOp?.row === rowIdx;
                let isGuided = false;
                if (gameState.tutorialStep !== null) {
                  const guideMap = [{ c: 0, r: 0 }, { c: 1, r: 0 }, { c: 0, r: 1 }, { c: 0, r: 1 }, { c: 0, r: 1 }, { c: 1, r: 2 }, { c: 2, r: 2 }];
                  const curActionIdx = gameState.tutorialStep - 4;
                  if (curActionIdx >= 0 && curActionIdx < guideMap.length) {
                    const targetPos = guideMap[curActionIdx];
                    if (colIdx === targetPos.c && rowIdx === targetPos.r) isGuided = true;
                  }
                }
                return (
                  <motion.button key={cell.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileTap={{ scale: 0.94 }} onClick={() => handleCellClick(colIdx, rowIdx)} className={`relative h-14 sm:h-18 w-full flex items-center justify-center rounded-[20px] text-xl font-bold transition-all duration-300 ios-shadow ${cell.type === 'operator' ? 'bg-orange-50/80 text-orange-500 border border-orange-100' : 'bg-white text-black border border-white/50'} ${isSelected ? 'ring-4 ring-blue-500/30 !bg-blue-600 !text-white !border-blue-600 shadow-lg scale-110' : ''} ${isGuided ? 'z-[1001] ring-4 ring-blue-500 animate-pulse !shadow-2xl' : ''}`}>
                    {cell.value}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
        {gameState.tutorialStep !== null && gameState.tutorialStep < 3 && <div className="absolute inset-0 z-[1002] flex items-center justify-center p-4"><TutorialView /></div>}
      </div>

      <div className={`w-full max-w-md mt-2 px-2 shrink-0 ${gameState.tutorialStep !== null ? 'opacity-10 pointer-events-none' : ''}`}>
        <div className="flex justify-between items-end mb-1.5">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.draw_progress}</span>
          <span className="text-[10px] font-bold text-blue-400">{Math.floor(drawProgress)}%</span>
        </div>
        <div className="w-full h-1 bg-gray-200 rounded-full mb-3 overflow-hidden">
          <motion.div animate={{ width: `${drawProgress}%` }} className="h-full bg-blue-600" transition={{ duration: 0.3 }} />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {gameState.storage.map((item, i) => (
            <button 
              key={item?.id || `empty-${i}`} 
              onClick={() => {
                if (!item) return;
                if (item.type === 'number') {
                  if (gameState.selectedNum?.source === 'storage' && gameState.selectedNum.storageIndex === i) {
                    setGameState(p => p ? { ...p, selectedNum: null, selectedOp: null } : null); return;
                  }
                  if (gameState.selectedNum && gameState.selectedOp) {
                    performSynthesis(gameState.selectedNum, gameState.selectedOp, { col: -1, row: -1, source: 'storage', storageIndex: i }); return;
                  }
                  setGameState(p => p ? { ...p, selectedNum: { col: -1, row: -1, source: 'storage', storageIndex: i } } : null);
                } else if (item.type === 'timer') {
                  setTimeLeft(prev => Math.min(maxTime, prev + ITEM_CONFIG.TIMER_ADD_SECONDS));
                  setGameState(p => {
                    if (!p) return null;
                    const nextStorage = [...p.storage]; nextStorage[i] = null;
                    return { ...p, storage: nextStorage };
                  });
                  setMessage(`${t.timer_add_msg} ${ITEM_CONFIG.TIMER_ADD_SECONDS}s`);
                } else if (item.type === 'refresh') {
                   resetGame(); setMessage(t.refresh_msg);
                }
              }}
              className={`aspect-square rounded-[16px] ios-shadow border flex items-center justify-center transition-all ${item ? 'bg-white border-white/50 active:scale-90' : 'bg-gray-100/50 border-dashed border-gray-200'} ${gameState.selectedNum?.source === 'storage' && gameState.selectedNum.storageIndex === i ? 'ring-2 ring-blue-500 scale-105' : ''}`}
            >
              {item?.type === 'number' && <span className="text-lg font-black">{item.value}</span>}
              {item?.type === 'timer' && <i className="fas fa-stopwatch text-rose-500 text-lg"></i>}
              {item?.type === 'refresh' && <i className="fas fa-sync-alt text-emerald-500 text-lg"></i>}
            </button>
          ))}
        </div>
      </div>

      {/* Pause Modal */}
      <AnimatePresence>
        {isPauseModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[4500] bg-black/40 ios-blur flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[32px] p-8 w-full max-w-xs ios-shadow text-center">
              <h2 className="text-2xl font-black mb-8 tracking-tight">{t.pause_title}</h2>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { setIsPauseModalOpen(false); setGameState(p => p ? ({ ...p, isPaused: false }) : null); }}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold active:scale-95 shadow-lg shadow-blue-500/20"
                >
                  {t.continue_game}
                </button>
                <button 
                  onClick={() => { setIsPauseModalOpen(false); setCurrentView('home'); setGameState(null); }}
                  className="w-full py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold active:scale-95"
                >
                  {t.back_to_home}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGachaModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-black/60 ios-blur flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[32px] p-8 w-full max-w-xs ios-shadow text-center relative overflow-hidden">
              <h2 className="text-2xl font-black mb-6 tracking-tight">{t.gacha_title}</h2>
              <div className="min-h-32 flex flex-col items-center justify-center mb-6">
                {isDrawing ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.5, ease: 'linear' }} className="text-5xl text-blue-600"><i className="fas fa-spinner"></i></motion.div>
                ) : drawResult ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-[24px] flex items-center justify-center mb-4">
                      {drawResult.type === 'score' && <i className="fas fa-star text-yellow-500 text-3xl"></i>}
                      {drawResult.type === 'number' && <span className="text-4xl font-black text-blue-600">{drawResult.value}</span>}
                      {drawResult.type === 'timer' && <i className="fas fa-stopwatch text-rose-500 text-4xl"></i>}
                      {drawResult.type === 'refresh' && <i className="fas fa-sync-alt text-emerald-500 text-4xl"></i>}
                    </div>
                    {isNewDiscovery && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 px-6">
                         <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-2 inline-block">{t.gacha_new_item}</div>
                         <p className="text-gray-500 text-xs font-medium leading-relaxed">{t[`item_desc_${drawResult.type}`]}</p>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <i className="fas fa-gift text-6xl text-gray-200"></i>
                )}
              </div>
              {!drawResult ? (
                <button 
                  onClick={() => {
                    setIsDrawing(true);
                    setTimeout(() => {
                      const pool: ItemType[] = ['score', 'number', 'timer', 'refresh'];
                      const type = pool[Math.floor(Math.random() * pool.length)];
                      const result = { id: generateRandomId(), type, value: type === 'number' ? Math.floor(Math.random() * 9) + 1 : undefined };
                      const storageKey = `seen_item_${type}`;
                      const hasSeen = localStorage.getItem(storageKey);
                      if (!hasSeen) { setIsNewDiscovery(true); localStorage.setItem(storageKey, 'true'); } else { setIsNewDiscovery(false); }
                      setGameState(prev => {
                        if (!prev) return null;
                        let { score, numbersUsed, totalDraws, storage } = prev;
                        if (type === 'score') score += ITEM_CONFIG.SCORE_PACK_POINTS;
                        else { const idx = storage.indexOf(null); if (idx !== -1) storage[idx] = result; }
                        return { ...prev, score, numbersUsed: 0, totalDraws: totalDraws + 1, storage: [...storage] };
                      });
                      setDrawResult(result); setIsDrawing(false);
                    }, 1500);
                  }} 
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold active:scale-95 shadow-lg shadow-blue-500/20"
                >{t.gacha_open}</button>
              ) : (
                <button onClick={() => { setIsGachaModalOpen(false); setDrawResult(null); setIsNewDiscovery(false); }} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold active:scale-95">{t.gacha_claim}</button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState.isGameOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[3000] bg-black/40 ios-blur flex items-center justify-center p-6 text-center">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[32px] p-8 w-full max-sm ios-shadow">
              <h2 className="text-3xl font-black mb-4">{t.game_over_title}</h2>
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{t.final_score}</div>
                <div className="text-4xl font-black text-blue-600">{gameState.score}</div>
              </div>
              <input type="text" placeholder={t.nickname_placeholder} value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-gray-50 border-gray-100 border rounded-xl px-4 py-4 mb-4 text-center font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
              <button 
                onClick={() => { 
                  updateHighScore(gameState.score);
                  if (!username.trim() || gameState.score === 0) { 
                    setCurrentView('home'); 
                    return; 
                  }
                  localStorage.setItem('last_username', username.trim());
                  supabase.from('high_scores').insert([{ username, score: gameState.score }]).then(fetchLeaderboard); 
                  setCurrentView('home'); 
                }} 
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold mb-2 shadow-xl shadow-blue-500/20 active:scale-95"
              >
                {t.save_and_home}
              </button>
              <button onClick={() => { updateHighScore(gameState.score); resetGame(); }} className="w-full py-3 text-gray-400 font-bold active:scale-95">{t.play_again}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLeaderboard && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-[2500] bg-white flex flex-col pt-safe">
            <div className="flex justify-between items-center p-6 border-b border-gray-50">
              <h2 className="text-xl font-black tracking-tight text-gray-800">{t.global_leaderboard}</h2>
              <button onClick={() => setShowLeaderboard(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 active:scale-90"><i className="fas fa-xmark text-lg"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {leaderboard.length > 0 ? leaderboard.map((entry, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={entry.id} 
                  className="flex items-center justify-between bg-gray-50 p-5 rounded-3xl border border-gray-100"
                >
                  <div className="flex items-center gap-5">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${i < 3 ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</span>
                    <span className="font-bold text-gray-700">{entry.username}</span>
                  </div>
                  <span className="font-black text-xl text-emerald-600 tracking-tight">{entry.score}</span>
                </motion.div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                  <i className="fas fa-trophy text-6xl mb-4 opacity-10"></i>
                  <p className="font-bold">{t.leaderboard_empty}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }} className="fixed inset-x-0 top-1/2 -translate-y-1/2 mx-auto z-[4000] w-fit max-w-[80vw] bg-gray-900/95 text-white text-center font-bold px-10 py-6 rounded-3xl ios-shadow ios-blur" onAnimationComplete={() => setTimeout(() => setMessage(null), 2300)}>
            <div className="text-4xl mb-3">✨</div><div className="text-lg">{message}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
