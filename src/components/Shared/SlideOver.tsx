import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SlideOverProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    isLoading?: boolean;
}

const SlideOver: React.FC<SlideOverProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    isLoading
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
                        className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl
                                   bg-card dark:bg-slate-900/95 
                                   backdrop-blur-xl
                                   shadow-2xl
                                   border-l border-theme
                                   flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 
                                       border-b border-theme
                                       bg-card dark:bg-slate-900/50">
                            <div>
                                <h2 className="text-xl font-black text-main dark:text-gray-100 tracking-tight uppercase">{title}</h2>
                                <div className="h-1 w-12 bg-primary mt-1 rounded-full"></div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-muted 
                                         hover:text-red-500 dark:hover:text-red-400
                                         hover:bg-red-50 dark:hover:bg-red-900/20
                                         rounded-xl transition-all duration-200"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide relative pb-24 sm:pb-6">
                            {isLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center 
                                              bg-white/80 dark:bg-slate-900/80 
                                              backdrop-blur-sm z-10">
                                    <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                                </div>
                            ) : null}
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="px-6 py-4 
                                          bg-gray-50/80 dark:bg-slate-800/50 
                                          backdrop-blur-sm
                                          border-t border-gray-200 dark:border-slate-700 
                                          flex justify-end gap-3">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SlideOver;
