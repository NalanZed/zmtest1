import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export function useLeaderboard() {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    const fetchLeaderboard = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('high_scores')
                .select('*')
                .order('score', { ascending: false })
                .limit(10);
            if (!error && data) setLeaderboard(data);
        } catch (e) { console.error(e); }
    }, []);

    const submitScore = useCallback(async (username: string, score: number) => {
        if (!username.trim() || score === 0) return;
        localStorage.setItem('last_username', username.trim());
        await supabase.from('high_scores').insert([{ username, score }]);
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    useEffect(() => { fetchLeaderboard(); }, []);

    return { leaderboard, showLeaderboard, setShowLeaderboard, fetchLeaderboard, submitScore };
}
