import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type Props = {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'glass';
    className?: string;
    onClick?: () => void;
    type?: 'button' | 'submit';
};

export default function Button({
    children,
    variant = 'primary',
    className,
    onClick,
    type = 'button'
}: Props) {
    const variants = {
        primary: 'bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-white',
        secondary: 'bg-secondary text-white hover:bg-secondary/90 dark:bg-secondary dark:text-white',
        accent: 'bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20',
        outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white dark:border-primary dark:text-primary dark:hover:bg-primary dark:hover:text-white',
        glass: 'bg-white/10 dark:bg-slate-900/20 backdrop-blur-md border border-white/20 dark:border-slate-800/20 text-slate-800 dark:text-white hover:bg-white/20 dark:hover:bg-slate-800/20',
    };

    return (
        <motion.button
            type={type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                'px-8 py-3 rounded-full font-heading font-semibold transition-colors duration-300',
                variants[variant],
                className
            )}
            onClick={onClick}
        >
            {children}
        </motion.button>
    );
}
