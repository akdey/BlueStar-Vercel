import React from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
    content: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content }) => {
    return (
        <div className="group relative inline-flex ml-1.5 cursor-help">
            <HelpCircle size={14} className="text-gray-400 hover:text-blue-500 transition-colors" />
            <div className="
                pointer-events-none opacity-0 group-hover:opacity-100 
                absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg 
                transition-all duration-200 z-50 text-center
            ">
                {content}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
            </div>
        </div>
    );
};

export default Tooltip;
