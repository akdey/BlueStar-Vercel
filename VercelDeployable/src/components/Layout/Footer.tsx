import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import Logo from '../UI/Logo';
import Copyright from '../UI/Copyright';

export default function Footer() {
    return (
        <footer className="bg-slate-900 dark:bg-black text-white pt-20 pb-10 border-t border-theme transition-colors">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {/* Brand */}
                <div className="space-y-6">
                    <Logo variant="footer" />
                    <p className="text-slate-300 leading-relaxed">
                        We move your goods, we drive your growth. Your reliable partner in transport and trading.
                    </p>
                    {/* <div className="flex gap-4">
                        <SocialIcon icon={<Facebook size={18} />} href="#" />
                        <SocialIcon icon={<Twitter size={18} />} href="#" />
                        <SocialIcon icon={<Linkedin size={18} />} href="#" />
                        <SocialIcon icon={<Instagram size={18} />} href="#" />
                    </div> */}
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-lg font-heading font-bold mb-6">Quick Links</h4>
                    <ul className="space-y-4 text-slate-300">
                        <li><FooterLink href="#">About Us</FooterLink></li>
                        <li><FooterLink href="#">Our Services</FooterLink></li>
                        <li><FooterLink href="#">Work Process</FooterLink></li>
                        <li><FooterLink href="#">Contact</FooterLink></li>
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h4 className="text-lg font-heading font-bold mb-6">Support</h4>
                    <ul className="space-y-4 text-slate-300">
                        <li><FooterLink href="#">Latest News</FooterLink></li>
                        <li><FooterLink href="#">FAQ</FooterLink></li>
                        <li><FooterLink href="#">Privacy Policy</FooterLink></li>
                        <li><FooterLink href="#">Terms of Service</FooterLink></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-lg font-heading font-bold mb-6">Contact Us</h4>
                    <ul className="space-y-4 text-slate-300">
                        <li className="flex items-start gap-3">
                            <MapPin className="text-accent shrink-0" size={20} />
                            <span>{import.meta.env.VITE_COMPANY_ADDRESS}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone className="text-accent shrink-0" size={20} />
                            <span>{import.meta.env.VITE_COMPANY_PHONE}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail className="text-accent shrink-0" size={20} />
                            <span className="break-all">{import.meta.env.VITE_COMPANY_EMAIL}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto px-6 mt-20 pt-8 border-t border-white/10 text-center text-slate-400">
                <Copyright />
            </div>
        </footer>
    );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode, href: string }) {
    return (
        <a
            href={href}
            className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-accent hover:border-accent transition-all duration-300"
        >
            {icon}
        </a>
    );
}

function FooterLink({ children, href }: { children: React.ReactNode, href: string }) {
    return (
        <a
            href={href}
            className="hover:text-accent transition-colors duration-300"
        >
            {children}
        </a>
    );
}
