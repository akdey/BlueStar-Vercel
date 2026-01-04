import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import Hero from '../../components/Hero/Hero';
import StoryScroll from '../../components/StoryScroll/StoryScroll';
import Services from '../../components/Services/Services';
import ProcessStepper from '../../components/Process/ProcessStepper';
import Partners from '../../components/Partners/Partners';
import ContactForm from '../../components/Contact/ContactForm';
import SectionWrapper from '../../components/UI/SectionWrapper';
import { ShieldCheck, Zap, HeartHandshake } from 'lucide-react';
import SpotlightCard from '../../components/UI/SpotlightCard';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-main transition-colors duration-700">
            <Header />

            <main>
                <Hero />

                <Partners />

                {/* Why Us Section */}
                <SectionWrapper className="py-24 bg-card">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary dark:text-white mb-4">Why Choose {import.meta.env.VITE_BRAND_NAME || 'BLUE STAR'}</h2>
                            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">More than just logistics, we are your strategic partner in transport and trading.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <WhyUsCard
                                icon={<ShieldCheck size={48} />}
                                title="Reliable Security"
                                description="We treat every shipment with the highest level of care and security, ensuring your goods arrive exactly as they left."
                            />
                            <WhyUsCard
                                icon={<Zap size={48} />}
                                title="Strategic Speed"
                                description="Our optimized routes and real-time coordination minimize delays and maximize your supply chain efficiency."
                            />
                            <WhyUsCard
                                icon={<HeartHandshake size={48} />}
                                title="Personalized Touch"
                                description="We believe in human-to-human business. Our team is available 24/7 to support your unique business needs."
                            />
                        </div>
                    </div>
                </SectionWrapper>

                <StoryScroll />

                <Services />

                <ProcessStepper />

                <ContactForm />
            </main>

            <Footer />
        </div>
    );
}

function WhyUsCard({ icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <SpotlightCard className="p-10 text-center flex flex-col items-center group overflow-hidden relative border-theme">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
            <div className="text-primary mb-8 group-hover:scale-110 transition-transform duration-500">
                {icon}
            </div>
            <h3 className="text-2xl font-heading font-bold text-main mb-4">{title}</h3>
            <p className="text-muted leading-relaxed font-sans">{description}</p>
        </SpotlightCard>
    );
}
