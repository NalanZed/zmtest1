import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StorageItem } from '../types';
import { Translations } from '../i18n';
import { playGachaSound, playSuccessSound } from '../services/soundEffects';

interface GachaModalProps {
    isOpen: boolean;
    isDrawing: boolean;
    drawResult: StorageItem | null;
    isNewDiscovery: boolean;
    onDraw: () => void;
    onClaim: () => void;
    t: Translations;
}

const GachaModal: React.FC<GachaModalProps> = ({ isOpen, isDrawing, drawResult, isNewDiscovery, onDraw, onClaim, t }) => {
    // 打开弹窗时播放音效
    useEffect(() => {
        if (isOpen) {
            playGachaSound();
        }
    }, [isOpen]);

    const handleDraw = () => {
        playSuccessSound();
        onDraw();
    };

    return (
        <AnimatePresence>
            {isOpen && (
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
                                            <p className="text-gray-500 text-xs font-medium leading-relaxed">{t[`item_desc_${drawResult.type}` as keyof Translations] as string}</p>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ) : (
                                <i className="fas fa-gift text-6xl text-gray-200"></i>
                            )}
                        </div>
                        {!drawResult ? (
                            <button onClick={handleDraw} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold active:scale-95 shadow-lg shadow-blue-500/20">{t.gacha_open}</button>
                        ) : (
                            <button onClick={onClaim} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold active:scale-95">{t.gacha_claim}</button>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GachaModal;
