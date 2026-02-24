import { supabase } from './supabaseClient';

export interface FeedbackData {
  message: string;
  contact?: string; // 可选的联系方式
}

export const feedbackService = {
  async submitFeedback(data: FeedbackData): Promise<{ success: boolean; error?: string }> {
    const { message, contact } = data;

    if (!message.trim()) {
      return { success: false, error: 'Message cannot be empty' };
    }

    const { error } = await supabase
      .from('feedback')
      .insert([{ message: message.trim(), contact: contact?.trim() || null }]);

    if (error) {
      console.error('Failed to submit feedback:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  },
};
