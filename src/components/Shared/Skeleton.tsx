import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
    width,
    height
}) => {
    const baseStyles = "bg-gray-200 dark:bg-slate-800/60 overflow-hidden relative";

    const variantStyles = {
        text: "h-3 w-full rounded-md",
        circular: "rounded-full",
        rectangular: "rounded-none",
        rounded: "rounded-2xl"
    };

    const style: React.CSSProperties = {
        width: width,
        height: height,
    };

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            style={style}
        >
            <motion.div
                initial={{ x: '-150%' }}
                animate={{ x: '150%' }}
                transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent skew-x-12 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
            />
        </div>
    );
};

export default Skeleton;
