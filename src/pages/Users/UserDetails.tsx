import React from 'react';
import {
    User as UserIcon,
    Shield,
    Mail,
    Phone,
    Key,
    Activity,
    LogIn
} from 'lucide-react';
import Badge from '../../components/Shared/Badge';

interface UserDetailsProps {
    user: any;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user }) => {
    if (!user) return null;

    const sectionHeader = (icon: any, title: string) => (
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
            {icon}
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{title}</h3>
        </div>
    );

    const dataRow = (label: string, value: any, Icon?: any) => (
        <div className="flex flex-col space-y-1">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{label}</span>
            <div className="flex items-center gap-2">
                {Icon && <Icon size={12} className="text-gray-300" />}
                <span className={`text-sm font-semibold text-gray-900 dark:text-gray-100 ${typeof value === 'boolean' ? 'flex' : ''}`}>
                    {typeof value === 'boolean' ? (
                        <Badge variant={value ? 'success' : 'neutral'}>
                            {value ? 'ENABLED' : 'DISABLED'}
                        </Badge>
                    ) : value || '—'}
                </span>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Top Summary Card */}
            <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-3xl p-6 shadow-sm overflow-hidden relative">
                <div className="absolute -right-8 -top-8 text-indigo-500/5">
                    <UserIcon size={120} />
                </div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <Badge variant={user.role === 'admin' ? 'default' : user.role === 'manager' ? 'success' : 'neutral'}>
                            {user.role.toUpperCase()}
                        </Badge>
                        <Badge variant={user.active ? 'success' : 'error'}>
                            {user.active ? 'ACTIVE' : 'DEACTIVATED'}
                        </Badge>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-1">{user.full_name || user.username}</h2>
                    <p className="text-xs font-mono text-indigo-500 font-bold tracking-widest uppercase italic">@{user.username}</p>
                </div>
            </div>

            {/* Account Information */}
            <section>
                {sectionHeader(<Shield size={14} className="text-indigo-500" />, "Account & Security")}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {dataRow("Full Legal Name", user.full_name, UserIcon)}
                    {dataRow("Email Identity", user.email, Mail)}
                    {dataRow("Contact Number", user.phone_number, Phone)}
                    {dataRow("Access Level / Role", user.role?.toUpperCase(), Key)}
                </div>
            </section>


            {/* System Log Insight */}
            <section className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                {sectionHeader(<Activity size={12} className="text-slate-400" />, "Access Logs")}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                            <LogIn size={14} className="text-green-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Last Login Detected</span>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never logged in'}
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-gray-400 uppercase">Registered On</span>
                            <span className="text-[10px] font-medium text-gray-500">{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-[8px] font-bold text-gray-400 uppercase">System ID</span>
                            <span className="text-[10px] font-mono text-gray-500 font-bold uppercase">USR-{user.id.toString().padStart(4, '0')}</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default UserDetails;
