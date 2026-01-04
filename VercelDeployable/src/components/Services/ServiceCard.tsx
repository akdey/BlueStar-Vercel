import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import SpotlightCard from '../UI/SpotlightCard';

type Props = {
    title: string;
    description: string;
    icon: ReactNode;
};

export default function ServiceCard({ title, description, icon }: Props) {
    return (
        <SpotlightCard className="group p-8 transition-all duration-300 h-full border-theme">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500 mb-8 font-bold">
                {icon}
            </div>
            <h3 className="text-2xl font-heading font-bold text-main mb-4">{title}</h3>
            <p className="text-muted mb-10 leading-relaxed text-sm">{description}</p>

            <button className="flex items-center gap-2 font-bold text-primary group-hover:gap-3 transition-all">
                Learn More
                <ArrowRight size={18} />
            </button>
        </SpotlightCard>
    );
}
