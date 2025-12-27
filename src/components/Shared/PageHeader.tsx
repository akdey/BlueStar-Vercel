import React from 'react';
import { Plus } from 'lucide-react';
import Button from '../UI/Button';

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
                <Button
                    onClick={onAction}
                    rounded="xl"
                    className="px-6 py-2.5"
                >
                    <Plus size={16} />
                    <span>{actionLabel}</span>
                </Button>
            )}
        </div>
    );
};

export default PageHeader;
