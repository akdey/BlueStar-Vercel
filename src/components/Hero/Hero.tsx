import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Truck, ArrowRight } from 'lucide-react';
import Logo from '../UI/Logo';
import Aurora from '../UI/Aurora';
import Magnet from '../UI/Magnet';

import Button from '../UI/Button';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
    const truckRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!truckRef.current || !containerRef.current) return;

        gsap.to(truckRef.current, {
            x: '100vw',
            ease: 'none',
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: 1,
            }
        });
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-main pt-16 pb-20 md:pb-0 transition-colors duration-700"
        >
            <Aurora />

            <div className="container mx-auto px-6 z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="flex flex-col items-center"
                >
                    <Logo variant="hero" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-6 mt-16"
                >
                    <a href="#contact" className="inline-block group focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl">
                        <Magnet padding={0}>
                            <Button
                                rounded="2xl"
                                className="px-10 py-5 text-lg"
                            >
                                Get a Quote
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Magnet>
                    </a>

                    <a href="#story" className="inline-block group focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl">
                        <Magnet padding={0}>
                            <div className="text-primary dark:text-slate-300 font-bold hover:text-accent dark:hover:text-white flex items-center gap-2 transition-all text-lg px-8 py-5 cursor-pointer">
                                Our Business Commitment
                                <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                                    →
                                </motion.span>
                            </div>
                        </Magnet>
                    </a>
                </motion.div>
            </div>

            {/* Animated Truck */}
            <div
                ref={truckRef}
                className="absolute bottom-8 -left-64 z-20 flex items-center gap-4 text-primary dark:text-sky-400 opacity-90 drop-shadow-[0_0_20px_rgba(56,189,248,0.3)]"
            >
                <div className="relative">
                    <Truck size={68} className="fill-primary/20 dark:fill-sky-400/10" />
                    <div className="absolute -bottom-1 left-2 w-3 h-3 bg-slate-900 rounded-full animate-spin" />
                    <div className="absolute -bottom-1 right-3 w-3 h-3 bg-slate-900 rounded-full animate-spin" />
                </div>
                <div className="h-1 w-screen opacity-0" />
            </div>

            {/* Scroll indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-slate-400"
            >
                <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center p-1">
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                    />
                </div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Explore</span>
            </motion.div>
        </section >
    );
}
