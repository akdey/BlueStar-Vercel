import React from 'react';
import {
    Box,
    Truck,
    User,
    Calendar,
    Shield,
    Activity,
    FileText,
    AlertCircle
} from 'lucide-react';
import Badge from '../../components/Shared/Badge';

interface VehicleDetailsProps {
    vehicle: any;
}

const VehicleDetails: React.FC<VehicleDetailsProps> = ({ vehicle }) => {
    if (!vehicle) return null;

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
            case 'available': return 'success';
            case 'on_trip': return 'primary';
            case 'maintenance': return 'warning';
            default: return 'neutral';
        }
    };

    const isExpiringSoon = (date: string) => {
        if (!date) return false;
        const expiry = new Date(date);
        const today = new Date();
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays < 30 && diffDays > 0;
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header Card */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-3xl p-6 shadow-sm overflow-hidden relative">
                <div className="absolute -right-8 -top-8 text-primary/5">
                    <Truck size={120} />
                </div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <Badge variant={getStatusVariant(vehicle.current_status)}>
                            {vehicle.current_status?.toUpperCase()}
                        </Badge>
                        <Badge variant={vehicle.is_owned ? 'primary' : 'neutral'}>
                            {vehicle.is_owned ? 'BLUESTAR OWNED' : 'HIRED / VENDOR'}
                        </Badge>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-1">{vehicle.vehicle_number}</h2>
                    <p className="text-xs font-mono text-secondary font-bold tracking-widest uppercase">{vehicle.vehicle_type}</p>
                </div>
            </div>

            {/* Capacity & Ownership */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-2xl border border-primary/10 dark:border-primary/20">
                    <Box size={16} className="text-primary mb-2" />
                    <p className="text-[10px] font-bold text-primary uppercase">Load Capacity</p>
                    <p className="text-lg font-black text-primary dark:text-white">{vehicle.capacity_ton} Tons</p>
                </div>
                <div className="bg-secondary/5 dark:bg-secondary/10 p-4 rounded-2xl border border-secondary/10 dark:border-secondary/20">
                    <User size={16} className="text-secondary mb-2" />
                    <p className="text-[10px] font-bold text-secondary uppercase">Owner Name</p>
                    <p className="text-lg font-black text-primary dark:text-white truncate">{vehicle.is_owned ? 'BlueStar Trading' : (vehicle.owner_name || 'Generic Vendor')}</p>
                </div>
            </div>

            {/* Compliance Section */}
            <section>
                {sectionHeader(<Shield size={14} className="text-primary" />, "Compliance & Document Expiry")}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        {dataRow("RC Expiry", vehicle.rc_expiry, Calendar)}
                        {dataRow("Fitness Expiry", vehicle.fitness_expiry, Activity)}
                    </div>
                    <div className="space-y-6">
                        {dataRow("Insurance Expiry", vehicle.insurance_expiry, Shield)}
                        {dataRow("Permit Expiry", vehicle.permit_expiry, FileText)}
                    </div>
                </div>

                {/* Expiry Warning */}
                {(isExpiringSoon(vehicle.insurance_expiry) || isExpiringSoon(vehicle.fitness_expiry)) && (
                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl flex items-center gap-3">
                        <AlertCircle className="text-amber-600" size={20} />
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-tight">
                            Critical compliance documents are expiring within 30 days. Please renew to avoid operation halts.
                        </p>
                    </div>
                )}
            </section>

            {/* Registry Info */}
            <section className="bg-gray-50 dark:bg-slate-800/30 p-5 rounded-3xl border border-gray-100 dark:border-slate-800">
                <div className="flex justify-between items-center text-[10px]">
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-400 uppercase">Registered ID</span>
                        <span className="font-mono font-black text-secondary uppercase">FLE-V-{vehicle.id}</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="font-bold text-gray-400 uppercase">System Last Update</span>
                        <span className="text-gray-900 dark:text-white font-bold">{new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default VehicleDetails;
