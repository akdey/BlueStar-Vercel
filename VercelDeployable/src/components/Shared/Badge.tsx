import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'neutral' | 'primary' | 'secondary' | 'info';
    className?: string;
}

const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-primary/5 text-primary border-primary/10',
    secondary: 'bg-secondary/5 text-secondary border-secondary/10',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    error: 'bg-red-50 text-red-700 border-red-100',
    neutral: 'bg-slate-50 text-slate-500 border-slate-200',
};

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
    return (
        <span className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border
            ${variantStyles[variant]}
            ${className}
        `}>
            {children}
        </span>
    );
};

export default Badge;
