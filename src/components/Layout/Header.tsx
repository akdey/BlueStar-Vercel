import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn, Moon, Sun, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../UI/Button';
import Logo from '../UI/Logo';
import { useTheme } from '../../context/ThemeContext';
import NotificationPanel from '../Shared/NotificationPanel';
import { useGetNotificationsQuery } from '../../features/api/apiSlice';
import { useAppSelector } from '../../store/hooks';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);

    // Only fetch if user is logged in
    const { data: notificationsData } = useGetNotificationsQuery({ unread_only: true }, {
        skip: !user
    });

    const unreadCount = notificationsData?.data?.length || 0;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '#' },
        { name: 'Our Story', href: '#story' },
        { name: 'Services', href: '#services' },
        { name: 'Process', href: '#process' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm py-3 border-b border-slate-200/50 dark:border-slate-800/50' : 'bg-transparent py-5'
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="cursor-pointer"
                    onClick={() => navigate('/')}
                >
                    <Logo variant="header" />
                </motion.div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="font-bold text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-accent transition-colors text-sm uppercase tracking-wider"
                        >
                            {link.name}
                        </a>
                    ))}
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleTheme}
                        className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </motion.button>

                    {user && (
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsNotificationOpen(true)}
                            className="relative p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            aria-label="Notifications"
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-slate-900" />
                            )}
                        </motion.button>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-primary text-primary font-bold hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:text-white transition-all text-sm shadow-lg shadow-primary/10"
                    >
                        <LogIn size={16} />
                        Login
                    </motion.button>
                    <Button variant="primary" className="px-6 py-2 shadow-lg shadow-primary/20">Get Quote</Button>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-primary"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={32} /> : <Menu size={32} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-lg font-bold text-slate-700 dark:text-slate-200"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Appearance</span>
                                <button
                                    onClick={toggleTheme}
                                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                                >
                                    {theme === 'light' ? (
                                        <div className="flex items-center gap-2 font-bold text-sm"><Moon size={18} /> DARK MODE</div>
                                    ) : (
                                        <div className="flex items-center gap-2 font-bold text-sm"><Sun size={18} /> LIGHT MODE</div>
                                    )}
                                </button>
                            </div>
                            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={() => {
                                        navigate('/login');
                                        setIsOpen(false);
                                    }}
                                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-primary text-primary dark:text-primary font-bold hover:bg-primary hover:text-white dark:hover:text-white transition-all transition-all"
                                >
                                    <LogIn size={18} /> Login
                                </button>
                                <Button variant="primary" className="w-full">Get Quote</Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notification Panel */}
            <NotificationPanel isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
        </header>
    );
}
