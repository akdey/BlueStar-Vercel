import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout as logoutAction } from '../features/auth/authSlice';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/UI/Logo';
import Copyright from '../components/UI/Copyright';
import {
    LayoutDashboard,
    Users,
    NotebookTabs,
    Package,
    Truck,
    FileText,
    MapPin,
    CircleDollarSign,
    LogOut,
    Menu,
    X,
    Search,
    Bell,
    Sun,
    Moon,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const DashboardLayout = () => {
    const user = useAppSelector((state) => state.auth.user);
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { theme, toggleTheme } = useTheme();

    const logout = () => {
        dispatch(logoutAction());
        navigate('/login');
    };

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Users', href: '/users', icon: Users, adminOnly: true },
        { name: 'Parties', href: '/parties', icon: NotebookTabs },
        { name: 'Inventory', href: '/inventory', icon: Package },
        { name: 'Fleet', href: '/fleet', icon: Truck },
        { name: 'Documents', href: '/documents', icon: FileText },
        { name: 'Trips', href: '/trips', icon: MapPin },
        { name: 'Transactions', href: '/transactions', icon: CircleDollarSign },
    ];

    const filteredNavigation = navigation.filter(item =>
        !item.adminOnly || (user?.role === 'admin')
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#050b18] flex transition-colors duration-500">
            {/* Mobile Sidebar Backdrop */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar - Fixed Position */}
            <motion.aside
                animate={{ width: isSidebarCollapsed ? '80px' : '256px' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`
                    fixed inset-y-0 left-0 z-50
                    bg-white/95 dark:bg-slate-900/95 
                    backdrop-blur-xl
                    border-r border-gray-200 dark:border-slate-800
                    shadow-xl lg:shadow-none
                    flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-slate-800 justify-between flex-shrink-0">
                    {!isSidebarCollapsed && <Logo variant="compact" className="scale-75" />}
                    {isSidebarCollapsed && (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm mx-auto">
                            BS
                        </div>
                    )}

                    {/* Collapse Button - Desktop */}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="hidden lg:block p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors"
                        title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>

                    {/* Close Button - Mobile */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-hide">
                    {filteredNavigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`
                                    relative group flex items-center gap-3 px-3 py-2.5 rounded-lg
                                    text-sm font-medium transition-all duration-200
                                    ${isActive
                                        ? 'text-primary dark:text-accent bg-primary/10 dark:bg-accent/10'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200'
                                    }
                                    ${isSidebarCollapsed ? 'justify-center' : ''}
                                `}
                                title={isSidebarCollapsed ? item.name : ''}
                            >
                                <item.icon
                                    size={20}
                                    className={`
                                        transition-colors duration-200 flex-shrink-0
                                        ${isActive ? 'text-primary dark:text-accent' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}
                                    `}
                                />
                                {!isSidebarCollapsed && (
                                    <>
                                        <span>{item.name}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary dark:bg-accent"
                                            />
                                        )}
                                    </>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-200 dark:border-slate-800 flex-shrink-0">
                    {!isSidebarCollapsed ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {user?.username}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                                        {user?.role}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Link
                                        to="/account/settings"
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 transition-all shadow-sm"
                                    >
                                        <Users size={12} />
                                        <span>Account</span>
                                    </Link>
                                </motion.div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={logout}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30 transition-all shadow-sm"
                                >
                                    <LogOut size={12} />
                                    <span>Logout</span>
                                </motion.button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-medium text-sm">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <Link
                                to="/account/settings"
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors"
                                title="Account Settings"
                            >
                                <Users size={18} />
                            </Link>
                            <button
                                onClick={logout}
                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </motion.aside>

            {/* Main Content */}
            <div
                className={`
                    flex-1 flex flex-col min-h-screen transition-all duration-300
                    ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
                `}
            >
                {/* Topbar */}
                <header
                    className={`
                        h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 
                        flex items-center justify-between px-4 lg:px-8 fixed top-0 right-0 z-30 transition-all duration-300
                        ${isSidebarCollapsed ? 'lg:left-20' : 'lg:left-64'}
                        left-0
                    `}
                >
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="lg:hidden flex">
                            <Logo variant="compact" className="scale-75 origin-left" />
                        </div>
                    </div>

                    <div className="flex bg-gray-50 dark:bg-slate-800/50 items-center px-4 py-2 rounded-lg w-full max-w-md ml-4 lg:ml-0 hidden lg:flex">
                        <Search size={18} className="text-gray-400 dark:text-gray-500 mr-2" />
                        <input
                            type="text"
                            placeholder="Type to search..."
                            className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400 dark:placeholder-gray-500 text-gray-600 dark:text-gray-300"
                        />
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors"
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
                        </button>

                        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 relative">
                            <Bell size={18} className="sm:w-5 sm:h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-900"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content - Scrollable */}
                <main className="flex-1 bg-slate-50 dark:bg-[#050b18] p-4 lg:p-8 transition-colors duration-500 mt-16 flex flex-col">
                    <div className="max-w-7xl mx-auto flex-1 w-full">
                        <Outlet />
                    </div>

                    {/* Dashboard Footer/Copyright */}
                    <div className="max-w-7xl mx-auto w-full mt-12 pt-8 border-t border-gray-200/50 dark:border-slate-800/50">
                        <Copyright className="flex flex-col md:flex-row md:items-center md:justify-between !text-[10px] !text-gray-400 dark:text-gray-600 font-bold uppercase tracking-[0.2em] gap-4 text-center md:text-left" />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
