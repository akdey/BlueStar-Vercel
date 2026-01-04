import Marquee from 'react-fast-marquee';
import { Star } from 'lucide-react';

export default function Partners() {
    // Demo partners
    const partners = [
        "LOGI-CORP", "TRANS-ROUTE", "PORT-SYNC", "OCEAN-DRIVE", "SHIP-WISE", "FAST-FIX", "BLUE-LINE", "NET-CARGO"
    ];

    return (
        <section className="py-24 bg-main transition-colors relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

            <div className="container mx-auto px-6 mb-16 text-center">
                <h3 className="text-sm font-bold uppercase tracking-[0.5em] text-muted mb-2">Our Network</h3>
                <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
            </div>

            <Marquee gradient={true} gradientColor={undefined} speed={50} pauseOnHover={true} className="py-4">
                {partners.map((partner, index) => (
                    <div key={index} className="mx-16 flex items-center gap-6 group cursor-default">
                        <div className="w-12 h-12 glass bg-card rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 border-theme">
                            <Star className="text-primary group-hover:fill-primary transition-all" size={24} />
                        </div>
                        <span className="text-5xl font-heading font-black text-main opacity-5 group-hover:opacity-20 transition-all duration-500 tracking-tighter">
                            {partner}
                        </span>
                    </div>
                ))}
            </Marquee>

            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
        </section>
    );
}
