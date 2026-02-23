import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DIFFICULTY_BANNER_CONFIG } from '../gameConfig';

interface ToastProps {
    message: string | null;
    onDismiss: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onDismiss, duration }) => (
    <AnimatePresence>
        {message && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed inset-x-0 top-1/2 -translate-y-1/2 mx-auto z-[4000] w-fit max-w-[80vw] bg-gray-900/95 text-white text-center font-bold px-10 py-6 rounded-3xl ios-shadow ios-blur"
                onAnimationComplete={() => setTimeout(onDismiss, duration ?? DIFFICULTY_BANNER_CONFIG.DISPLAY_SECONDS * 1000)}
            >
                <div className="text-4xl mb-3">✨</div><div className="text-lg">{message}</div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default Toast;
