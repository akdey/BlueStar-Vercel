import { motion } from 'framer-motion';

export default function Aurora() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <motion.div
                animate={{
                    x: [0, 50, -50, 0],
                    y: [0, -30, 30, 0],
                    scale: [1, 1.2, 0.9, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute -top-[20%] -left-[10%] w-[60%] h-[70%] bg-primary/10 dark:bg-sky-500/5 rounded-full blur-[120px]"
            />
            <motion.div
                animate={{
                    x: [0, -60, 40, 0],
                    y: [0, 40, -40, 0],
                    scale: [1, 0.8, 1.1, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute -bottom-[10%] -right-[5%] w-[50%] h-[60%] bg-secondary/10 dark:bg-blue-600/5 rounded-full blur-[100px]"
            />
            <motion.div
                animate={{
                    x: [0, 30, -30, 0],
                    y: [0, 50, -20, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-accent/5 dark:bg-sky-400/5 rounded-full blur-[150px]"
            />
        </div>
    );
}
