import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Translations } from '../i18n';

interface PauseModalProps {
    isOpen: boolean;
    onContinue: () => void;
    onBackToHome: () => void;
    t: Translations;
}

const PauseModal: React.FC<PauseModalProps> = ({ isOpen, onContinue, onBackToHome, t }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[4500] bg-black/40 ios-blur flex items-center justify-center p-6">
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[32px] p-8 w-full max-w-xs ios-shadow text-center">
                    <h2 className="text-2xl font-black mb-8 tracking-tight">{t.pause_title}</h2>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={onContinue}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold active:scale-95 shadow-lg shadow-blue-500/20"
                        >
                            {t.continue_game}
                        </button>
                        <button
                            onClick={onBackToHome}
                            className="w-full py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold active:scale-95"
                        >
                            {t.back_to_home}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default PauseModal;
