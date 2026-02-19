import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Translations } from '../i18n';

interface TutorialOverlayProps {
    tutorialStep: number;
    hintText: string;
    onNextStep: () => void;
    t: Translations;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ tutorialStep, hintText, onNextStep, t }) => (
    <AnimatePresence>
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-[1100] flex items-center justify-center p-4 pointer-events-none"
        >
            <div className="bg-white rounded-[28px] p-6 ios-shadow border border-gray-100 text-center w-full h-full flex flex-col justify-center pointer-events-auto max-h-[160px]">
                <h3 className="text-lg font-black text-gray-900 mb-1">{tutorialStep < 4 ? t.tutorial_title : t.tutorial_follow}</h3>
                <p className="text-gray-600 leading-snug text-xs font-medium mb-4">{hintText}</p>
                {tutorialStep < 4 ? (
                    <button onClick={onNextStep} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm active:scale-95 transition-all shadow-lg shadow-blue-500/20">{t.tutorial_next}</button>
                ) : (
                    <div className="flex items-center justify-center gap-2 text-blue-600 font-bold animate-bounce text-xs"><i className="fas fa-hand-pointer"></i><span>{t.tutorial_click_hint}</span></div>
                )}
            </div>
        </motion.div>
    </AnimatePresence>
);

export default TutorialOverlay;
