import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Translations } from '../i18n';
import { feedbackService } from '../services/feedbackService';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    t: Translations;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, t }) => {
    const [message, setMessage] = useState('');
    const [contact, setContact] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleSubmit = async () => {
        if (!message.trim()) return;

        setIsSubmitting(true);
        const result = await feedbackService.submitFeedback({ message, contact });

        if (result.success) {
            setSubmitResult({ success: true, message: t.feedback_success });
            setTimeout(() => {
                setMessage('');
                setContact('');
                setSubmitResult(null);
                onClose();
            }, 1500);
        } else {
            setSubmitResult({ success: false, message: t.feedback_error });
        }
        setIsSubmitting(false);
    };

    const handleClose = () => {
        setMessage('');
        setContact('');
        setSubmitResult(null);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[4500] bg-black/40 ios-blur flex items-center justify-center p-6"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-white rounded-[32px] p-6 w-full max-w-xs ios-shadow"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-black mb-6 text-center tracking-tight">{t.feedback_title}</h2>

                        {submitResult ? (
                            <div className={`text-center py-8 ${submitResult.success ? 'text-green-600' : 'text-red-500'}`}>
                                {submitResult.message}
                            </div>
                        ) : (
                            <>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder={t.feedback_placeholder}
                                    className="w-full h-32 p-4 bg-gray-50 rounded-2xl text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    maxLength={500}
                                />

                                <input
                                    type="text"
                                    value={contact}
                                    onChange={e => setContact(e.target.value)}
                                    placeholder={t.feedback_contact_placeholder}
                                    className="w-full mt-3 p-3 bg-gray-50 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    maxLength={100}
                                />

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={handleClose}
                                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold active:scale-95"
                                    >
                                        {t.feedback_cancel}
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!message.trim() || isSubmitting}
                                        className="flex-1 py-3 bg-emerald-500 text-white rounded-2xl font-bold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? '...' : t.feedback_submit}
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FeedbackModal;
