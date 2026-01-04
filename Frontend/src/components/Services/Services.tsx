import { Truck, ShieldCheck, Warehouse, Box } from 'lucide-react';
import SectionWrapper from '../UI/SectionWrapper';
import ServiceCard from './ServiceCard';

export default function Services() {
    const services = [
        {
            title: "Road Transport",
            description: "Reliable and timely truck transport solutions for all types of industrial and commercial goods.",
            icon: <Truck size={32} />
        },
        {
            title: "Trading & Sourcing",
            description: "Expert sourcing of essential goods and materials, ensuring quality and competitive pricing.",
            icon: <Box size={32} />
        },
        {
            title: "Warehousing",
            description: "Secure storage facilities with efficient inventory handling for your regional operations.",
            icon: <Warehouse size={32} />
        },
        {
            title: "Logistics Support",
            description: "Comprehensive support for your supply chain, from documentation to final delivery.",
            icon: <ShieldCheck size={32} />
        }
    ];

    return (
        <SectionWrapper id="services" className="py-24 bg-card transition-colors">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary dark:text-white mb-6">Expert Solutions</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            We provide dependable transport and trading services tailored to the unique needs of your business growth.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <button className="px-8 py-4 glass dark:bg-slate-800 text-primary dark:text-white font-bold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-primary dark:hover:bg-accent hover:text-white transition-all shadow-xl">
                            Our Full Services
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <ServiceCard key={index} {...service} />
                    ))}
                </div>
            </div>
        </SectionWrapper>
    );
}
