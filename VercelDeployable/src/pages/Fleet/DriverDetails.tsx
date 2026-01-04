import React from 'react';
import {
    User,
    Phone,
    MapPin,
    FileText,
    Calendar,
    Activity,
    MessageSquare,
    ClipboardList
} from 'lucide-react';
import Badge from '../../components/Shared/Badge';

interface DriverDetailsProps {
    driver: any;
}

const DriverDetails: React.FC<DriverDetailsProps> = ({ driver }) => {
    if (!driver) return null;

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
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value || '—'}</span>
            </div>
        </div>
    );

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'on_trip': return 'primary';
            case 'on_leave': return 'warning';
            case 'resigned': return 'error';
            default: return 'neutral';
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header Identity Card */}
            <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-3xl p-6 shadow-sm overflow-hidden relative">
                <div className="absolute -right-8 -top-8 text-indigo-500/5">
                    <User size={120} />
                </div>
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-black shadow-lg">
                        {driver.name?.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getStatusVariant(driver.status)}>
                                {driver.status?.toUpperCase()}
                            </Badge>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-1">{driver.name}</h2>
                        <p className="text-xs font-mono text-primary font-bold tracking-widest uppercase">{driver.phone}</p>
                    </div>
                </div>
            </div>

            {/* License Info */}
            <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute right-4 top-4 text-slate-200 dark:text-slate-700">
                    <FileText size={40} />
                </div>
                <div className="relative z-10 grid grid-cols-2 gap-4">
                    {dataRow("License Number", driver.license_number, ClipboardList)}
                    {dataRow("License Expiry", driver.license_expiry, Calendar)}
                </div>
            </div>

            {/* Address & Contact */}
            <section>
                {sectionHeader(<MapPin size={14} className="text-primary" />, "Permanent Address & Background")}
                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium italic">
                        {driver.address || "No address provided in system registry."}
                    </p>
                </div>
            </section>

            {/* Notes Section */}
            <section>
                {sectionHeader(<MessageSquare size={14} className="text-secondary" />, "Administrative Notes")}
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/20">
                    <p className="text-xs text-indigo-700 dark:text-indigo-400 font-bold uppercase tracking-tight mb-1">Remarks</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        {driver.notes || "No internal administrative remarks noted."}
                    </p>
                </div>
            </section>

            {/* System Info */}
            <section className="bg-gray-50 dark:bg-slate-800/30 p-5 rounded-3xl border border-gray-100 dark:border-slate-800">
                <div className="flex justify-between items-center text-[10px]">
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-400 uppercase">Registry Entry</span>
                        <span className="font-mono font-black text-secondary uppercase">FLE-D-{driver.id}</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="font-bold text-gray-400 uppercase">Operational Since</span>
                        <span className="text-gray-900 dark:text-white font-bold">JAN 2024</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DriverDetails;
