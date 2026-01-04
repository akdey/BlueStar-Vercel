import { useState, useEffect } from 'react';
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
    ChevronRight,
    User as UserIcon,
    Lock,
    Shield,
    ChevronDown,
    Loader2,
    MessageSquare,
    CheckCircle2
} from 'lucide-react';
import { useChangePasswordMutation, useGetNotificationsQuery, useMarkNotificationReadMutation } from '../features/api/apiSlice';
import { toast } from 'react-toastify';
import NotificationPanel from '../components/Shared/NotificationPanel';

const DashboardLayout = () => {
    const user = useAppSelector((state) => state.auth.user);
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    const logout = () => {
        dispatch(logoutAction());
        navigate('/login');
    };

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, category: 'Overview' },
        { name: 'Enterprise Chat', href: '/chat', icon: MessageSquare, category: 'Overview' },

        { name: 'Trade Vouchers', href: '/vouchers', icon: FileText, category: 'Trade & Logistics' },
        { name: 'Trips', href: '/trips', icon: MapPin, category: 'Trade & Logistics' },
        { name: 'Inventory', href: '/inventory', icon: Package, category: 'Trade & Logistics' },
        { name: 'Fleet', href: '/fleet', icon: Truck, category: 'Trade & Logistics' },

        { name: 'Transactions', href: '/transactions', icon: CircleDollarSign, category: 'Finance & CRM' },
        { name: 'Parties', href: '/parties', icon: NotebookTabs, category: 'Finance & CRM' },

        { name: 'Users', href: '/users', icon: Users, adminOnly: true, category: 'Management' },
    ];

    const filteredNavigation = navigation.filter(item =>
        !item.adminOnly || (user?.role === 'admin')
    );

    // Grouping navigation by category
    const groupedNav = filteredNavigation.reduce((acc: any, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-main flex transition-colors duration-500">
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
                    bg-card/95 dark:bg-slate-900/95 
                    backdrop-blur-xl
                    border-r border-theme
                    shadow-xl lg:shadow-none
                    flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-slate-800 justify-between flex-shrink-0">
                    {!isSidebarCollapsed && <Logo variant="compact" />}
                    {isSidebarCollapsed && (
                        <div className="mx-auto">
                            <Logo variant="icon" className="w-8 h-8" />
                        </div>
                    )}

                    {/* Collapse Button - Desktop */}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="hidden lg:block p-1.5 rounded-lg hover:bg-main-hover text-muted transition-colors"
                        title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>

                    {/* Close Button - Mobile */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-1 rounded-md hover:bg-main-hover text-muted"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 scrollbar-hide">
                    {Object.entries(groupedNav).map(([category, items]: [string, any]) => (
                        <div key={category} className="space-y-1">
                            {!isSidebarCollapsed && (
                                <h3 className="px-3 mb-2 text-[10px] font-black text-muted/50 uppercase tracking-[0.2em]">
                                    {category}
                                </h3>
                            )}
                            {items.map((item: any) => {
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
                                                ? 'text-primary dark:text-accent bg-primary/5 dark:bg-accent/10'
                                                : 'text-muted hover:bg-main-hover hover:text-main dark:hover:text-gray-200'
                                            }
                                            ${isSidebarCollapsed ? 'justify-center' : ''}
                                        `}
                                        title={isSidebarCollapsed ? item.name : ''}
                                    >
                                        <item.icon
                                            size={20}
                                            className={`
                                                transition-colors duration-200 flex-shrink-0
                                                ${isActive ? 'text-primary dark:text-accent' : 'text-primary/40 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-gray-300'}
                                            `}
                                        />
                                        {!isSidebarCollapsed && (
                                            <>
                                                <span className="flex-1">{item.name}</span>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeTabMarker"
                                                        className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary dark:bg-accent"
                                                    />
                                                )}
                                            </>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Sidebar Bottom - Logout Only */}
                <div className="p-4 border-t border-theme flex-shrink-0">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={logout}
                        className={`
                            flex items-center gap-3 w-full p-2.5 rounded-xl
                            text-red-600 dark:text-red-400 font-bold 
                            bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 
                            transition-all border border-red-100/50 dark:border-red-900/20
                            ${isSidebarCollapsed ? 'justify-center' : ''}
                        `}
                        title="Logout"
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        {!isSidebarCollapsed && <span className="text-[10px] uppercase tracking-widest font-black">Disconnect</span>}
                    </motion.button>
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
                        h-16 bg-card/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-theme 
                        flex items-center justify-between px-4 lg:px-8 fixed top-0 right-0 z-30 transition-all duration-300
                        ${isSidebarCollapsed ? 'lg:left-20' : 'lg:left-64'}
                        left-0
                    `}
                >
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-md hover:bg-main-hover text-gray-600 dark:text-gray-400"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="lg:hidden flex">
                            <Logo variant="compact" className="origin-left" />
                        </div>
                    </div>

                    <div className="flex bg-main dark:bg-slate-800/50 items-center px-4 py-2 rounded-lg w-full max-w-md ml-4 lg:ml-0 hidden lg:flex border border-theme">
                        <Search size={18} className="text-gray-400 dark:text-gray-500 mr-2" />
                        <input
                            type="text"
                            placeholder="Type to search..."
                            className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400 dark:placeholder-gray-500 text-gray-600 dark:text-gray-300"
                        />
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 relative">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-main-hover text-gray-500 dark:text-gray-400 transition-colors"
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
                        </button>

                        <div className="h-8 w-px bg-theme mx-1 hidden sm:block" />

                        {/* Notification Bell */}
                        <NotificationBell onClick={() => setIsNotificationPanelOpen(true)} />

                        <div className="h-8 w-px bg-theme mx-1 hidden sm:block" />

                        <UserAvatarMenu user={user} logout={logout} />
                    </div>
                </header>

                {/* Page Content - Scrollable */}
                <main className="flex-1 bg-main p-4 lg:p-8 transition-colors duration-500 mt-16 flex flex-col">
                    <div className="max-w-7xl mx-auto flex-1 w-full">
                        <Outlet />
                    </div>

                    {/* Dashboard Footer/Copyright */}
                    <div id="dashboard-footer" className="max-w-7xl mx-auto w-full mt-12 pt-8 border-t border-theme">
                        <Copyright className="flex flex-col md:flex-row md:items-center md:justify-between !text-[10px] !text-gray-400 dark:text-gray-600 font-bold uppercase tracking-[0.2em] gap-4 text-center md:text-left" />
                    </div>
                </main>
            </div>

            {/* Notification Panel */}
            <NotificationPanel isOpen={isNotificationPanelOpen} onClose={() => setIsNotificationPanelOpen(false)} />
        </div>
    );
};

const UserAvatarMenu = ({ user, logout }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    return (
        <>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-main-hover transition-all border border-transparent hover:border-theme"
                >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/20">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-left mr-2 min-w-[80px]">
                        <p className="text-sm font-black text-gray-900 dark:text-gray-100 leading-tight">{user?.full_name || 'System User'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter truncate max-w-[50px]">{user?.username}</p>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-700" />
                            <p className="text-[9px] font-black text-primary dark:text-accent uppercase tracking-tighter capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-64 bg-card rounded-[2rem] shadow-2xl border border-theme z-50 overflow-hidden"
                            >
                                <div className="p-6 border-b border-theme bg-main-hover">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-lg shadow-xl shadow-primary/20">
                                            {user?.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white truncate">{user?.full_name || user?.username}</p>
                                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 truncate tracking-tight">{user?.username}</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 bg-primary/10 rounded-full w-fit">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">{user?.role} ACCOUNT</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setIsPasswordModalOpen(true);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-main-hover text-gray-700 dark:text-gray-300 transition-all group"
                                >
                                    <div className="p-2 rounded-lg bg-main-hover text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">
                                        <Lock size={16} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase tracking-widest">Security & Crypto</p>
                                        <p className="text-[9px] text-gray-400 font-bold">Rotate system keys</p>
                                    </div>
                                </button>
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white dark:hover:from-red-900/40 dark:hover:to-red-800/40 text-red-600 transition-all group mt-2"
                                >
                                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-500 group-hover:bg-white/20 group-hover:text-white transition-colors">
                                        <LogOut size={16} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-[10px]">Disconnect</span>
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </>
    );
};

const ChangePasswordModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changePassword, { isLoading }] = useChangePasswordMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }

        try {
            await changePassword({ old_password: oldPassword, new_password: newPassword }).unwrap();
            toast.success("Security keys updated successfully");
            onClose();
        } catch (error: any) {
            toast.error(error.data?.detail || "System rejected key update");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-card rounded-[2.5rem] shadow-2xl border border-theme overflow-hidden"
                    >
                        <div className="p-8 pb-0">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit mb-4">
                                <Lock size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-main dark:text-white uppercase tracking-tight">Security Protocol</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Rotate your system access keys</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Current Key</label>
                                    <input
                                        type="password"
                                        required
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                                        placeholder="Enter current password"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">New Access Key</label>
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Verify New Key</label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-4 rounded-2xl border border-gray-100 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-primary dark:bg-accent text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
                                >
                                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                                    Apply Changes
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// Extracted Bell Component for Badge Logic
const NotificationBell = ({ onClick }: { onClick: () => void }) => {
    const { data: notificationsData } = useGetNotificationsQuery({ unread_only: false }, {
        pollingInterval: 30000,
        refetchOnFocus: true
    });

    // API returns array directly, not wrapped in data property
    const notifications = Array.isArray(notificationsData) ? notificationsData : (notificationsData?.data || []);
    const unreadCount = notifications.filter((n: any) => !n.is_read).length;

    return (
        <button
            onClick={onClick}
            className="p-2 rounded-full hover:bg-main-hover text-gray-500 dark:text-gray-400 relative transition-colors"
            title="View Notifications"
        >
            <Bell size={18} className="sm:w-5 sm:h-5" />

            {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-900 animate-pulse"></span>
            )}
        </button>
    );
};

export default DashboardLayout;
