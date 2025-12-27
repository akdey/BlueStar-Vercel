import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
    title: string;
    actionLabel?: string;
    onAction?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, actionLabel, onAction }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight transition-colors">
                {title}
            </h1>
            {actionLabel && onAction && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onAction}
                    className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40"
                >
                    <Plus size={16} className="transition-transform group-hover:rotate-90" />
                    <span>{actionLabel}</span>
                </motion.button>
            )}
        </div>
    );
};

export default PageHeader;
