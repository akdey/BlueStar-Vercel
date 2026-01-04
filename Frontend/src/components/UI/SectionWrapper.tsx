import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

type Props = {
    children: ReactNode;
    className?: string;
    id?: string;
};

export default function SectionWrapper({ children, className, id }: Props) {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.15
    });

    return (
        <motion.section
            id={id}
            ref={ref}
            className={className}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.section>
    );
}
