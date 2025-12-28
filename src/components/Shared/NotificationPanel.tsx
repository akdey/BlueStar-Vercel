import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Bell,
    CheckCircle2,
    Info,
    AlertTriangle,
    Clock,
    ExternalLink,
} from "lucide-react";
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from "../../features/api/apiSlice";
import { formatDistanceToNow } from "date-fns";

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
    // Fetch unread notifications by default or recent ones
    const { data: notificationsData, isLoading } = useGetNotificationsQuery({ unread_only: false });
    const [markRead] = useMarkNotificationReadMutation();

    const notifications = notificationsData?.data || [];
    const unreadCount = notifications.filter((n: any) => !n.is_read).length;

    const handleMarkAsRead = async (id: number) => {
        try {
            await markRead(id).unwrap();
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "success":
                return <CheckCircle2 size={16} className="text-emerald-500" />;
            case "warning":
                return <AlertTriangle size={16} className="text-amber-500" />;
            case "error":
                return <Info size={16} className="text-red-500" />;
            default:
                return <Info size={16} className="text-blue-500" />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-100 dark:border-slate-800 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Bell className="text-primary" size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-slate-900 animate-pulse" />
                                    )}
                                </div>
                                <h2 className="text-lg font-heading font-black uppercase tracking-wider text-slate-800 dark:text-white">
                                    Notifications
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading...</span>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                        <Bell size={24} className="text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                        No new notifications
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                                        You're all caught up! New updates will appear here.
                                    </p>
                                </div>
                            ) : (
                                notifications.map((notification: any) => (
                                    <motion.div
                                        key={notification.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`relative p-4 rounded-2xl border transition-all group ${notification.is_read
                                                ? "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                : "bg-white dark:bg-slate-800 border-primary/10 shadow-lg shadow-primary/5"
                                            }`}
                                    >
                                        {!notification.is_read && (
                                            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
                                        )}

                                        <div className="flex gap-4">
                                            {/* Icon Container */}
                                            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${notification.is_read
                                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                                    : "bg-primary/10 text-primary"
                                                }`}>
                                                {getTypeIcon(notification.type)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-1">
                                                    <h4 className={`text-sm font-bold truncate pr-4 ${!notification.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                                        {notification.title}
                                                    </h4>
                                                </div>

                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
                                                    {notification.message}
                                                </p>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                                                        <Clock size={10} />
                                                        <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {notification.link && (
                                                            <a href={notification.link} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-primary transition-colors" title="View Details">
                                                                <ExternalLink size={14} />
                                                            </a>
                                                        )}
                                                        {!notification.is_read && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(notification.id)}
                                                                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-primary transition-colors"
                                                                title="Mark as Read"
                                                            >
                                                                <CheckCircle2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 text-center">
                            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
                                View All History
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
