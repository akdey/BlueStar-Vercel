import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Ship, Package, Truck, Home } from 'lucide-react';
import SplitText from '../UI/SplitText';

export default function StoryScroll() {
    const containerRef = useRef<HTMLDivElement>(null);

    const steps = [
        {
            title: "From Local Ports...",
            description: "Our journey begins at the regional maritime hubs, where we facilitate the flow of essential goods.",
            icon: <Ship size={40} />,
            color: "text-blue-500"
        },
        {
            title: "...To Distribution",
            description: "Efficient transfer and strategic sorting ensure your goods are handled with regional expertise.",
            icon: <Package size={40} />,
            color: "text-teal-500"
        },
        {
            title: "Reliable Transport",
            description: "Our dedicated local network delivers with precision and speed to your specific destination.",
            icon: <Truck size={40} />,
            color: "text-orange-500"
        },
        {
            title: "Business Growth",
            description: "Supporting your business objectives with dependable and localized transport solutions.",
            icon: <Home size={40} />,
            color: "text-primary dark:text-accent"
        }
    ];

    return (
        <section id="story" ref={containerRef} className="py-32 bg-main transition-colors overflow-hidden relative">
            {/* Background ambiance */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/20 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-24">
                    <SplitText
                        text="Our Commitment in Motion"
                        className="text-4xl md:text-6xl font-heading font-bold text-primary dark:text-white mb-6 justify-center"
                    />
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                        Reliable transport and trading for the heart of the regional supply chain
                    </p>
                </div>

                <div className="relative">
                    {/* Vertical line connecting steps */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-100 dark:bg-slate-800 -translate-x-1/2 hidden md:block rounded-full overflow-hidden">
                        <motion.div
                            initial={{ height: 0 }}
                            whileInView={{ height: '100%' }}
                            transition={{ duration: 2 }}
                            className="w-full bg-gradient-to-b from-primary via-secondary to-accent"
                        />
                    </div>

                    <div className="space-y-40">
                        {steps.map((step, index) => (
                            <StoryStep
                                key={index}
                                step={step}
                                index={index}
                                isLast={index === steps.length - 1}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function StoryStep({ step, index, isLast }: { step: any, index: number, isLast: boolean }) {
    const isEven = index % 2 === 0;

    return (
        <div className={`flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
            <motion.div
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="flex-1"
            >
                <div className={`${isEven ? 'md:text-right' : 'md:text-left'} space-y-4`}>
                    <h3 className="text-3xl md:text-4xl font-heading font-black text-primary dark:text-accent tracking-tight">{step.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl leading-relaxed font-medium">{step.description}</p>
                </div>
            </motion.div>

            <div className="relative z-10">
                <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    className={`w-28 h-28 rounded-[2rem] glass dark:bg-slate-800/80 flex items-center justify-center shadow-2xl relative group`}
                >
                    <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <div className={`${step.color} transition-transform duration-500 group-hover:scale-110`}>
                        {step.icon}
                    </div>
                </motion.div>

                {/* Mobile line */}
                {!isLast && (
                    <div className="absolute top-full left-1/2 w-0.5 h-40 bg-slate-100 dark:bg-slate-800 -translate-x-1/2 md:hidden" />
                )}
            </div>

            <div className="flex-1 hidden md:block" />
        </div>
    );
}
