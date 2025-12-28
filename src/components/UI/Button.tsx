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
    rounded?: 'full' | 'xl' | '2xl';
    disabled?: boolean;
};

export default function Button({
    children,
    variant = 'primary',
    className,
    onClick,
    type = 'button',
    rounded = 'full',
    disabled = false
}: Props) {
    const variants = {
        primary: 'bg-gradient-primary text-white shadow-lg shadow-primary/25 border border-white/10 hover:bg-gradient-hover',
        secondary: 'bg-emerald-500 dark:bg-violet-600 text-white shadow-lg shadow-emerald-500/25 border border-white/10 hover:brightness-110',
        accent: 'bg-gradient-accent text-white shadow-lg shadow-amber-500/25 border border-white/10 hover:brightness-110',
        outline: 'border-2 border-primary text-primary hover:bg-gradient-primary hover:text-white transition-all',
        glass: 'bg-white/10 dark:bg-slate-900/20 backdrop-blur-md border border-white/20 dark:border-slate-800/20 text-slate-800 dark:text-white hover:bg-white/20 dark:hover:bg-slate-800/20',
    };

    const roundedClasses = {
        full: 'rounded-full',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl'
    };

    return (
        <motion.button
            type={type}
            disabled={disabled}
            whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
            className={cn(
                'px-8 py-3 font-heading font-black uppercase tracking-widest text-[10px] transition-all duration-300 flex items-center justify-center gap-2',
                variants[variant],
                roundedClasses[rounded],
                disabled && 'opacity-50 cursor-not-allowed hover:bg-none hover:brightness-100 hover:scale-100 hover:y-0 shadow-none',
                className
            )}
            onClick={disabled ? undefined : onClick}
        >
            {children}
        </motion.button>
    );
}
