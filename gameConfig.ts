
import { TargetData, ItemType, Cell, Operator } from './types';

/**
 * ==========================================
 * TARGET CATALOG (Comprehensive 11-200)
 * ==========================================
 * diff: 0=Easy, 1=Normal, 2=Hard, 3=Expert, 4=Master, 5=Legend
 */
export const TARGET_CATALOG: TargetData[] = [
  // LEVEL 0: EASY (20 numbers) - Highly composite and milestone numbers
  { value: 12, diff: 0, core_base: 2 }, { value: 20, diff: 0, core_base: 2 },
  { value: 24, diff: 0, core_base: 2 }, { value: 30, diff: 0, core_base: 2 },
  { value: 36, diff: 0, core_base: 2 }, { value: 40, diff: 0, core_base: 2 },
  { value: 48, diff: 0, core_base: 2 }, { value: 50, diff: 0, core_base: 2 },
  { value: 60, diff: 0, core_base: 2 }, { value: 72, diff: 0, core_base: 2 },
  { value: 80, diff: 0, core_base: 2 }, { value: 84, diff: 0, core_base: 2 },
  { value: 90, diff: 0, core_base: 2 }, { value: 100, diff: 0, core_base: 3 },
  { value: 120, diff: 0, core_base: 3 }, { value: 140, diff: 0, core_base: 3 },
  { value: 144, diff: 0, core_base: 3 }, { value: 150, diff: 0, core_base: 3 },
  { value: 160, diff: 0, core_base: 3 }, { value: 180, diff: 0, core_base: 3 },
  { value: 200, diff: 0, core_base: 3 },

  // LEVEL 1: NORMAL (42 numbers) - Common composite numbers
  { value: 14, diff: 1, core_base: 4 }, { value: 15, diff: 1, core_base: 4 },
  { value: 16, diff: 1, core_base: 4 }, { value: 18, diff: 1, core_base: 4 },
  { value: 21, diff: 1, core_base: 4 }, { value: 22, diff: 1, core_base: 4 },
  { value: 25, diff: 1, core_base: 5 }, { value: 26, diff: 1, core_base: 5 },
  { value: 27, diff: 1, core_base: 5 }, { value: 28, diff: 1, core_base: 5 },
  { value: 32, diff: 1, core_base: 5 }, { value: 33, diff: 1, core_base: 5 },
  { value: 34, diff: 1, core_base: 5 }, { value: 35, diff: 1, core_base: 5 },
  { value: 38, diff: 1, core_base: 5 }, { value: 39, diff: 1, core_base: 5 },
  { value: 42, diff: 1, core_base: 5 }, { value: 44, diff: 1, core_base: 5 },
  { value: 45, diff: 1, core_base: 5 }, { value: 46, diff: 1, core_base: 5 },
  { value: 49, diff: 1, core_base: 5 }, { value: 52, diff: 1, core_base: 5 },
  { value: 54, diff: 1, core_base: 5 }, { value: 55, diff: 1, core_base: 5 },
  { value: 56, diff: 1, core_base: 5 }, { value: 63, diff: 1, core_base: 5 },
  { value: 64, diff: 1, core_base: 5 }, { value: 65, diff: 1, core_base: 5 },
  { value: 66, diff: 1, core_base: 5 }, { value: 70, diff: 1, core_base: 5 },
  { value: 75, diff: 1, core_base: 5 }, { value: 77, diff: 1, core_base: 5 },
  { value: 78, diff: 1, core_base: 5 }, { value: 81, diff: 1, core_base: 5 },
  { value: 85, diff: 1, core_base: 5 }, { value: 88, diff: 1, core_base: 5 },
  { value: 91, diff: 1, core_base: 5 }, { value: 92, diff: 1, core_base: 5 },
  { value: 95, diff: 1, core_base: 5 }, { value: 96, diff: 1, core_base: 5 },
  { value: 98, diff: 1, core_base: 5 }, { value: 99, diff: 1, core_base: 5 },

  // LEVEL 2: HARD (34 numbers) - Small primes and trickier numbers < 100
  { value: 11, diff: 2, core_base: 6 }, { value: 13, diff: 2, core_base: 6 },
  { value: 17, diff: 2, core_base: 6 }, { value: 19, diff: 2, core_base: 6 },
  { value: 23, diff: 2, core_base: 6 }, { value: 29, diff: 2, core_base: 6 },
  { value: 31, diff: 2, core_base: 6 }, { value: 37, diff: 2, core_base: 6 },
  { value: 41, diff: 2, core_base: 6 }, { value: 43, diff: 2, core_base: 6 },
  { value: 47, diff: 2, core_base: 6 }, { value: 51, diff: 2, core_base: 6 },
  { value: 53, diff: 2, core_base: 6 }, { value: 57, diff: 2, core_base: 6 },
  { value: 58, diff: 2, core_base: 6 }, { value: 59, diff: 2, core_base: 6 },
  { value: 61, diff: 2, core_base: 6 }, { value: 62, diff: 2, core_base: 6 },
  { value: 67, diff: 2, core_base: 6 }, { value: 68, diff: 2, core_base: 6 },
  { value: 69, diff: 2, core_base: 6 }, { value: 71, diff: 2, core_base: 6 },
  { value: 73, diff: 2, core_base: 6 }, { value: 74, diff: 2, core_base: 6 },
  { value: 76, diff: 2, core_base: 6 }, { value: 79, diff: 2, core_base: 6 },
  { value: 82, diff: 2, core_base: 6 }, { value: 83, diff: 2, core_base: 6 },
  { value: 86, diff: 2, core_base: 6 }, { value: 87, diff: 2, core_base: 6 },
  { value: 89, diff: 2, core_base: 6 }, { value: 93, diff: 2, core_base: 6 },
  { value: 94, diff: 2, core_base: 6 }, { value: 97, diff: 2, core_base: 6 },

  // LEVEL 3: EXPERT (42 numbers) - Composites 100-160
  { value: 102, diff: 3, core_base: 8 }, { value: 104, diff: 3, core_base: 8 },
  { value: 105, diff: 3, core_base: 8 }, { value: 106, diff: 3, core_base: 8 },
  { value: 108, diff: 3, core_base: 8 }, { value: 110, diff: 3, core_base: 8 },
  { value: 111, diff: 3, core_base: 8 }, { value: 112, diff: 3, core_base: 8 },
  { value: 114, diff: 3, core_base: 8 }, { value: 115, diff: 3, core_base: 8 },
  { value: 116, diff: 3, core_base: 8 }, { value: 117, diff: 3, core_base: 8 },
  { value: 118, diff: 3, core_base: 8 }, { value: 119, diff: 3, core_base: 8 },
  { value: 121, diff: 3, core_base: 8 }, { value: 122, diff: 3, core_base: 8 },
  { value: 123, diff: 3, core_base: 8 }, { value: 124, diff: 3, core_base: 8 },
  { value: 125, diff: 3, core_base: 8 }, { value: 126, diff: 3, core_base: 8 },
  { value: 128, diff: 3, core_base: 8 }, { value: 129, diff: 3, core_base: 8 },
  { value: 130, diff: 3, core_base: 8 }, { value: 132, diff: 3, core_base: 8 },
  { value: 133, diff: 3, core_base: 8 }, { value: 134, diff: 3, core_base: 8 },
  { value: 135, diff: 3, core_base: 8 }, { value: 136, diff: 3, core_base: 8 },
  { value: 138, diff: 3, core_base: 8 }, { value: 141, diff: 3, core_base: 8 },
  { value: 142, diff: 3, core_base: 8 }, { value: 143, diff: 3, core_base: 8 },
  { value: 145, diff: 3, core_base: 8 }, { value: 146, diff: 3, core_base: 8 },
  { value: 147, diff: 3, core_base: 8 }, { value: 148, diff: 3, core_base: 8 },
  { value: 152, diff: 3, core_base: 8 }, { value: 153, diff: 3, core_base: 8 },
  { value: 154, diff: 3, core_base: 8 }, { value: 155, diff: 3, core_base: 8 },
  { value: 156, diff: 3, core_base: 8 }, { value: 158, diff: 3, core_base: 8 },

  // LEVEL 4: MASTER (28 numbers) - Primes and complex composites 100-180
  { value: 101, diff: 4, core_base: 10 }, { value: 103, diff: 4, core_base: 10 },
  { value: 107, diff: 4, core_base: 10 }, { value: 109, diff: 4, core_base: 10 },
  { value: 113, diff: 4, core_base: 10 }, { value: 127, diff: 4, core_base: 10 },
  { value: 131, diff: 4, core_base: 10 }, { value: 137, diff: 4, core_base: 10 },
  { value: 139, diff: 4, core_base: 10 }, { value: 149, diff: 4, core_base: 10 },
  { value: 151, diff: 4, core_base: 10 }, { value: 157, diff: 4, core_base: 10 },
  { value: 159, diff: 4, core_base: 10 }, { value: 161, diff: 4, core_base: 10 },
  { value: 162, diff: 4, core_base: 10 }, { value: 164, diff: 4, core_base: 10 },
  { value: 165, diff: 4, core_base: 10 }, { value: 166, diff: 4, core_base: 10 },
  { value: 168, diff: 4, core_base: 10 }, { value: 170, diff: 4, core_base: 10 },
  { value: 171, diff: 4, core_base: 10 }, { value: 172, diff: 4, core_base: 10 },
  { value: 174, diff: 4, core_base: 10 }, { value: 175, diff: 4, core_base: 10 },
  { value: 176, diff: 4, core_base: 10 }, { value: 177, diff: 4, core_base: 10 },
  { value: 178, diff: 4, core_base: 10 },

  // LEVEL 5: LEGEND (30 numbers) - Primes and very large numbers nearing 200
  { value: 163, diff: 5, core_base: 12 }, { value: 167, diff: 5, core_base: 12 },
  { value: 169, diff: 5, core_base: 12 }, { value: 173, diff: 5, core_base: 12 },
  { value: 179, diff: 5, core_base: 12 }, { value: 181, diff: 5, core_base: 12 },
  { value: 182, diff: 5, core_base: 12 }, { value: 183, diff: 5, core_base: 12 },
  { value: 184, diff: 5, core_base: 12 }, { value: 185, diff: 5, core_base: 12 },
  { value: 186, diff: 5, core_base: 12 }, { value: 187, diff: 5, core_base: 12 },
  { value: 188, diff: 5, core_base: 12 }, { value: 189, diff: 5, core_base: 12 },
  { value: 190, diff: 5, core_base: 12 }, { value: 191, diff: 5, core_base: 12 },
  { value: 192, diff: 5, core_base: 12 }, { value: 193, diff: 5, core_base: 12 },
  { value: 194, diff: 5, core_base: 12 }, { value: 195, diff: 5, core_base: 12 },
  { value: 196, diff: 5, core_base: 12 }, { value: 197, diff: 5, core_base: 12 },
  { value: 198, diff: 5, core_base: 12 }, { value: 199, diff: 5, core_base: 12 }
];

/**
 * ==========================================
 * GAME BALANCE PARAMETERS
 * ==========================================
 */
export const GAME_PARAMS = {
  GACHA_THRESHOLD: 30,      // Progress needed to trigger a draw
  GACHA_TARGETS_THRESHOLD: 6, // Targets cleared to trigger a gacha draw
  TIMER_MULTIPLIER: 18,     // Seconds per core_base unit (e.g., 2 * 18 = 36s)
  STORAGE_SIZE: 4,          // Number of item slots
  COMBO_SCORE_BONUS: 20,    // Points per combo
  BASE_SCORE_MULTIPLIER: 50 // Points per core_base unit
};

/**
 * ==========================================
 * ITEM CONFIGURATION & DESCRIPTIONS
 * ==========================================
 */
export const ITEM_CONFIG = {
  TIMER_ADD_SECONDS: 15,
  SCORE_PACK_POINTS: 500,
  DESCRIPTIONS: {
    number: "合成助手：存放在储物格中，可随时取用参与合成，帮你化解僵局。",
    timer: `时间增益：点击即用，瞬间为你的挑战延长 ${15} 秒倒计时。`,
    refresh: "棋盘刷新：当你觉得无计可施时，点击它来重置整个棋盘布局。",
    score: `幸运礼包：直接获得 ${500} 额外积分，让你的排名更进一步。`
  } as Record<ItemType, string>
};

/**
 * ==========================================
 * UI DISPLAY NAMES
 * ==========================================
 */
export const DIFF_UI = {
  0: { label: 'EASY', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  1: { label: 'NORMAL', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  2: { label: 'HARD', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  3: { label: 'EXPERT', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
  4: { label: 'MASTER', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  5: { label: 'LEGEND', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
} as Record<number, { label: string; color: string; bg: string; border: string }>;

/**
 * ==========================================
 * GRID CONSTANTS
 * ==========================================
 */
export const NUM_HEIGHT = 3;
export const OP_HEIGHT = 4;
export const OPERATORS: Operator[] = ['+', '-', '×', '÷'];

/**
 * ==========================================
 * UTILITY FUNCTIONS
 * ==========================================
 */
export const generateRandomId = () => Math.random().toString(36).substr(2, 9);

export const createCell = (type: 'number' | 'operator', value?: number | Operator): Cell => ({
  id: generateRandomId(),
  value: value !== undefined ? value : (type === 'number' ? Math.floor(Math.random() * 9) + 1 : OPERATORS[Math.floor(Math.random() * OPERATORS.length)]),
  type
});

export const getTargetForAbsoluteIndex = (index: number, totalDraws: number): TargetData => {
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
