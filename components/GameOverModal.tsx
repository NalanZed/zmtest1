import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Translations } from '../i18n';

interface GameOverModalProps {
    isOpen: boolean;
    score: number;
    username: string;
    onUsernameChange: (value: string) => void;
    onSaveAndHome: () => void;
    onPlayAgain: () => void;
    t: Translations;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ isOpen, score, username, onUsernameChange, onSaveAndHome, onPlayAgain, t }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[3000] bg-black/40 ios-blur flex items-center justify-center p-6 text-center">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[32px] p-8 w-full max-sm ios-shadow">
                    <h2 className="text-3xl font-black mb-4">{t.game_over_title}</h2>
                    <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{t.final_score}</div>
                        <div className="text-4xl font-black text-blue-600">{score}</div>
                    </div>
                    <input type="text" placeholder={t.nickname_placeholder} value={username} onChange={e => onUsernameChange(e.target.value)} className="w-full bg-gray-50 border-gray-100 border rounded-xl px-4 py-4 mb-4 text-center font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                    <button
                        onClick={onSaveAndHome}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold mb-2 shadow-xl shadow-blue-500/20 active:scale-95"
                    >
                        {t.save_and_home}
                    </button>
                    <button onClick={onPlayAgain} className="w-full py-3 text-gray-400 font-bold active:scale-95">{t.play_again}</button>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default GameOverModal;
