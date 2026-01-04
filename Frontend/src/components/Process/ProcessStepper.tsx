import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Calendar, Truck, Clock, Handshake } from 'lucide-react';
import SectionWrapper from '../UI/SectionWrapper';
import SpotlightCard from '../UI/SpotlightCard';
import SplitText from '../UI/SplitText';

const steps = [
    {
        id: 1,
        title: 'Quote',
        icon: <FileText size={28} />,
        description: 'Tell us your requirements and get a detailed, transparent quote from our team.'
    },
    {
        id: 2,
        title: 'Planning',
        icon: <Calendar size={28} />,
        description: 'Our experts design the most efficient route and schedule for your shipment.'
    },
    {
        id: 3,
        title: 'Execution',
        icon: <Truck size={28} />,
        description: 'We handle the transport with care, ensuring your goods are moved safely.'
    },
    {
        id: 4,
        title: 'Status Updates',
        icon: <Clock size={28} />,
        description: 'Get regular status updates on your shipment. Live tracking coming soon!'
    },
    {
        id: 5,
        title: 'Delivery',
        icon: <Handshake size={28} />,
        description: 'Safe and timely arrival at your destination, followed by successful completion.'
    },
];

export default function ProcessStepper() {
    const [active, setActive] = useState(1);

    return (
        <SectionWrapper id="process" className="py-32 bg-main transition-colors relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center mb-24">
                    <SplitText
                        text="How We Operate"
                        className="text-4xl md:text-6xl font-heading font-black text-main mb-6 justify-center"
                    />
                    <p className="text-muted max-w-2xl mx-auto text-lg">A seamless 5-step process designed for speed and reliability</p>
                </div>

                {/* Desktop Stepper */}
                <div className="hidden lg:block relative max-w-5xl mx-auto mb-20">
                    <div className="absolute top-7 left-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full" />
                    <motion.div
                        className="absolute top-7 left-0 h-1.5 bg-gradient-to-r from-primary to-secondary"
                        initial={{ width: '0%' }}
                        animate={{ width: `${((active - 1) / (steps.length - 1)) * 100}%` }}
                        transition={{ duration: 0.6, ease: "circOut" }}
                    />

                    <div className="relative flex justify-between items-center">
                        {steps.map((step) => (
                            <button
                                key={step.id}
                                onClick={() => setActive(step.id)}
                                className={`group relative flex flex-col items-center gap-6 focus:outline-none w-32`}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 shadow-xl z-10 ${active >= step.id
                                        ? 'bg-primary border-primary text-white'
                                        : 'glass bg-card border-theme text-slate-400'
                                        }`}
                                >
                                    {step.icon}
                                </motion.div>
                                <span className={`font-heading font-bold text-sm uppercase tracking-widest ${active === step.id ? 'text-primary' : 'text-slate-400'}`}>
                                    {step.title}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Active Content */}
                <SpotlightCard className="max-w-4xl mx-auto p-10 md:p-16 h-80 flex items-center border-theme">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, y: -10 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="flex flex-col md:flex-row items-center gap-12 w-full"
                        >
                            <div className="w-28 h-28 bg-gradient-to-br from-primary to-secondary text-white rounded-3xl flex items-center justify-center shrink-0 shadow-[0_20px_40px_rgba(10,61,98,0.3)]">
                                {steps[active - 1].icon}
                            </div>
                            <div>
                                <h4 className="text-3xl font-heading font-black text-primary mb-4 tracking-tight">
                                    {active}. {steps[active - 1].title}
                                </h4>
                                <p className="text-muted text-xl leading-relaxed font-medium">
                                    {steps[active - 1].description}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </SpotlightCard>

                {/* Mobile Stepper (Interactive Grid) */}
                <div className="flex lg:hidden flex-wrap justify-center gap-4 mt-12">
                    {steps.map((step) => (
                        <button
                            key={step.id}
                            onClick={() => setActive(step.id)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all border-2 ${active === step.id
                                ? 'bg-primary border-primary text-white shadow-lg'
                                : 'glass bg-card border-theme text-slate-500'}`}
                        >
                            {step.title}
                        </button>
                    ))}
                </div>
            </div>
        </SectionWrapper>
    );
}
