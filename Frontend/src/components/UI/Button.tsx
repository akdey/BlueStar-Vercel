import React, { type ReactNode } from 'react';
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
        primary: 'bg-gradient-primary text-white shadow-[0_12px_30px_-10px_rgba(var(--primary),0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] border border-white/10 relative overflow-hidden',
        secondary: 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xl border border-white/10',
        accent: 'bg-gradient-accent text-white shadow-lg shadow-amber-500/25 border border-white/10',
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
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            variants={{
                initial: { scale: 1, y: 0 },
                hover: { scale: 1.02, y: -2, filter: 'brightness(1.1)' },
                tap: { scale: 0.98 }
            }}
            className={cn(
                'px-8 py-3 font-heading font-black uppercase tracking-widest text-[10px] transition-all duration-300 flex items-center justify-center gap-2',
                variants[variant],
                roundedClasses[rounded],
                disabled && 'opacity-50 cursor-not-allowed hover:bg-none hover:brightness-100 hover:scale-100 hover:y-0 shadow-none',
                className
            )}
            onClick={disabled ? undefined : onClick}
        >
            <motion.div
                className="flex items-center justify-center gap-2"
                variants={{
                    hover: { transition: { staggerChildren: 0.1 } }
                }}
            >
                {React.Children.map(children, child => {
                    if (React.isValidElement(child)) {
                        const typeName = (child.type as any)?.displayName || (child.type as any)?.name || '';
                        if (typeName.includes('Plus')) {
                            return (
                                <motion.div variants={{ hover: { rotate: 90 } }}>
                                    {child}
                                </motion.div>
                            );
                        }
                    }
                    return child;
                })}
            </motion.div>
        </motion.button>
    );
}
