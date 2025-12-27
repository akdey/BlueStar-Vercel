import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'neutral' | 'primary' | 'secondary' | 'info';
    className?: string;
}

const variantStyles = {
    default: 'bg-blue-50 text-blue-700 border-blue-200',
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border-secondary/20',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    neutral: 'bg-gray-50 text-gray-600 border-gray-200',
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
