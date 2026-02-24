import { supabase } from './supabaseClient';

const DEVICE_ID_KEY = 'device_id';

function getOrGenerateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export interface GameSessionData {
  score: number;
  targetsCleared: number;
  highestCombo: number;
  highestDifficulty: number;
  endReason: 'time_up' | 'settle';
}

let currentSessionId: string | null = null;
let sessionStartTime: number | null = null;
let currentUserId: string | null = null;

export const userAnalytics = {
  // 获取或创建设备用户
  async getOrCreateUser(): Promise<string | null> {
    if (currentUserId) return currentUserId;

    const deviceId = getOrGenerateDeviceId();

    // 先尝试查找已有用户
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('device_id', deviceId)
      .single();

    if (existingUser) {
      currentUserId = existingUser.id;
      return currentUserId;
    }

    // 创建新用户
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{ device_id: deviceId }])
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create user:', error);
      return null;
    }

    currentUserId = newUser.id;
    return currentUserId;
  },

  // 开始游戏会话
  async startGameSession(): Promise<string | null> {
    const userId = await this.getOrCreateUser();
    if (!userId) return null;

    sessionStartTime = Date.now();

    const { data, error } = await supabase
      .from('game_sessions')
      .insert([{ user_id: userId }])
      .select('id')
      .single();

    if (error) {
      console.error('Failed to start game session:', error);
      return null;
    }

    currentSessionId = data.id;

    // 更新用户的最后游玩时间和游戏次数
    await supabase
      .from('users')
      .update({
        last_played_at: new Date().toISOString(),
      })
      .eq('id', userId);

    return currentSessionId;
  },

  // 结束游戏会话
  async endGameSession(sessionData: GameSessionData): Promise<boolean> {
    if (!currentSessionId || !sessionStartTime) {
      console.warn('No active session to end');
      return false;
    }

    const durationSeconds = Math.round((Date.now() - sessionStartTime) / 1000);

    const { error } = await supabase
      .from('game_sessions')
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
        score: sessionData.score,
        targets_cleared: sessionData.targetsCleared,
        highest_combo: sessionData.highestCombo,
        highest_difficulty: sessionData.highestDifficulty,
        end_reason: sessionData.endReason,
      })
      .eq('id', currentSessionId);

    if (error) {
      console.error('Failed to end game session:', error);
      return false;
    }

    // 更新用户的累计数据
    if (currentUserId) {
      const { data: user } = await supabase
        .from('users')
        .select('total_play_count, total_play_time_seconds')
        .eq('id', currentUserId)
        .single();

      if (user) {
        await supabase
          .from('users')
          .update({
            total_play_count: user.total_play_count + 1,
            total_play_time_seconds: user.total_play_time_seconds + durationSeconds,
          })
          .eq('id', currentUserId);
      }
    }

    // 重置会话状态
    currentSessionId = null;
    sessionStartTime = null;

    return true;
  },

  // 获取当前会话ID（用于在游戏过程中追踪）
  getCurrentSessionId(): string | null {
    return currentSessionId;
  },

  // 获取会话开始时间
  getSessionStartTime(): number | null {
    return sessionStartTime;
  },
};
