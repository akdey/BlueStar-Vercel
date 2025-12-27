import { useState } from 'react';
import {
    useGetVehiclesQuery,
    useGetDriversQuery
} from '../../features/api/apiSlice';
import PageHeader from '../../components/Shared/PageHeader';
import DataTable from '../../components/Shared/DataTable';
import SlideOver from '../../components/Shared/SlideOver';
import VehicleForm from './VehicleForm';
import DriverForm from './DriverForm';
import VehicleDetails from './VehicleDetails';
import DriverDetails from './DriverDetails';
import Badge from '../../components/Shared/Badge';
import { motion } from 'framer-motion';
import {
    Truck,
    Users,
    Search,
    PlusCircle,
    Eye,
    Edit2,
    Calendar,
    ShieldCheck,
    AlertTriangle,
    Phone,
    MapPin
} from 'lucide-react';

const Fleet = () => {
    const [activeTab, setActiveTab] = useState<'vehicles' | 'drivers'>('vehicles');
    const [searchTerm, setSearchTerm] = useState('');

    // UI States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Queries
    const {
        data: vehicles,
        isLoading: isVehiclesLoading,
        refetch: refetchVehicles
    } = useGetVehiclesQuery({ search: activeTab === 'vehicles' ? searchTerm : undefined });

    const {
        data: drivers,
        isLoading: isDriversLoading,
        refetch: refetchDrivers
    } = useGetDriversQuery({ search: activeTab === 'drivers' ? searchTerm : undefined });

    const handleCreate = () => {
        setSelectedItem(null);
        setIsFormOpen(true);
    };

    const handleEdit = (item: any) => {
        setSelectedItem(item);
        setIsFormOpen(true);
    };

    const handleView = (item: any) => {
        setSelectedItem(item);
        setIsDetailsOpen(true);
    };

    const vehicleColumns = [
        {
            header: 'Vehicle Number',
            accessorKey: 'vehicle_number',
            cell: (v: any) => (
                <div onClick={() => handleView(v)} className="flex flex-col cursor-pointer group">
                    <span className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{v.vehicle_number}</span>
                    <span className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">{v.vehicle_type}</span>
                </div>
            )
        },
        {
            header: 'Ownership',
            accessorKey: 'is_owned',
            cell: (v: any) => (
                <Badge variant={v.is_owned ? 'primary' : 'neutral'}>
                    {v.is_owned ? 'INTERNAL' : 'VENDOR'}
                </Badge>
            )
        },
        {
            header: 'Status',
            accessorKey: 'current_status',
            cell: (v: any) => {
                const colors: Record<string, any> = {
                    available: 'success',
                    on_trip: 'primary',
                    maintenance: 'warning',
                    inactive: 'error'
                };
                return <Badge variant={colors[v.current_status] || 'neutral'}>{v.current_status?.toUpperCase()}</Badge>
            }
        },
        {
            header: 'Docs Health',
            id: 'docs',
            cell: (v: any) => {
                const today = new Date();
                const insurance = v.insurance_expiry ? new Date(v.insurance_expiry) : null;
                const fitness = v.fitness_expiry ? new Date(v.fitness_expiry) : null;

                const isCritical = (date: Date | null) => date && date < today;

                return (
                    <div className="flex items-center gap-1.5">
                        {isCritical(insurance) || isCritical(fitness) ? (
                            <AlertTriangle size={14} className="text-red-500 animate-pulse" />
                        ) : (
                            <ShieldCheck size={14} className="text-green-500" />
                        )}
                        <span className="text-[9px] font-black uppercase text-gray-400">Compliance</span>
                    </div>
                );
            }
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: (v: any) => (
                <div className="flex items-center gap-1">
                    <button onClick={() => handleView(v)} className="p-2 text-gray-400 hover:text-primary transition-colors" title="View Profile"><Eye size={16} /></button>
                    <button onClick={() => handleEdit(v)} className="p-2 text-gray-400 hover:text-secondary transition-colors" title="Edit Vehicle"><Edit2 size={16} /></button>
                </div>
            )
        }
    ];

    const driverColumns = [
        {
            header: 'Driver Name',
            accessorKey: 'name',
            cell: (d: any) => (
                <div onClick={() => handleView(d)} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-[10px] group-hover:scale-110 transition-transform">
                        {d.name?.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{d.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{d.phone}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (d: any) => {
                const colors: Record<string, any> = {
                    active: 'success',
                    on_trip: 'primary',
                    on_leave: 'warning',
                    resigned: 'error'
                };
                return <Badge variant={colors[d.status] || 'neutral'}>{d.status?.toUpperCase()}</Badge>
            }
        },
        {
            header: 'License Expiry',
            accessorKey: 'license_expiry',
            cell: (d: any) => (
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                    <Calendar size={12} className="text-gray-300" />
                    {d.license_expiry ? new Date(d.license_expiry).toLocaleDateString() : 'N/A'}
                </div>
            )
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: (d: any) => (
                <div className="flex items-center gap-1">
                    <button onClick={() => handleView(d)} className="p-2 text-gray-400 hover:text-primary transition-colors" title="View Profile"><Eye size={16} /></button>
                    <button onClick={() => handleEdit(d)} className="p-2 text-gray-400 hover:text-secondary transition-colors" title="Edit Driver"><Edit2 size={16} /></button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader title="Fleet Management" />
                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreate}
                        className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 font-display"
                    >
                        <PlusCircle size={16} className="transition-transform group-hover:rotate-90" />
                        <span>Register {activeTab === 'vehicles' ? 'New Vehicle' : 'New Driver'}</span>
                    </motion.button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-px">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => { setActiveTab('vehicles'); setSearchTerm(''); }}
                        className={`flex items-center gap-2 pb-4 text-[11px] font-black uppercase tracking-[0.15em] transition-all relative ${activeTab === 'vehicles' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Truck size={14} />
                        <span>Vehicles Registry</span>
                        {activeTab === 'vehicles' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                    </button>
                    <button
                        onClick={() => { setActiveTab('drivers'); setSearchTerm(''); }}
                        className={`flex items-center gap-2 pb-4 text-[11px] font-black uppercase tracking-[0.15em] transition-all relative ${activeTab === 'drivers' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Users size={14} />
                        <span>Drivers Management</span>
                        {activeTab === 'drivers' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                    </button>
                </div>

                {/* Sub-Search */}
                <div className="relative mb-3 hidden sm:block">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={14} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={`Search ${activeTab}...`}
                        className="block w-64 pl-8 pr-3 py-2 border border-theme rounded-xl bg-white dark:bg-slate-900 text-[10px] font-bold uppercase tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                    />
                </div>
            </div>

            <DataTable
                columns={activeTab === 'vehicles' ? vehicleColumns : driverColumns}
                data={(activeTab === 'vehicles' ? vehicles?.data : drivers?.data) || []}
                isLoading={activeTab === 'vehicles' ? isVehiclesLoading : isDriversLoading}
                keyField="id"
                emptyMessage={`No ${activeTab} found in registry.`}
            />

            {/* Forms SlideOver */}
            <SlideOver
                title={selectedItem ? `Modify ${activeTab === 'vehicles' ? 'Vehicle' : 'Driver'}` : `Register ${activeTab === 'vehicles' ? 'Vehicle' : 'Driver'}`}
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
            >
                {activeTab === 'vehicles' ? (
                    <VehicleForm vehicle={selectedItem} onSuccess={() => { setIsFormOpen(false); refetchVehicles(); }} />
                ) : (
                    <DriverForm driver={selectedItem} onSuccess={() => { setIsFormOpen(false); refetchDrivers(); }} />
                )}
            </SlideOver>

            {/* Details SlideOver */}
            <SlideOver
                title={`${activeTab === 'vehicles' ? 'Vehicle' : 'Driver'} Profile Breakdown`}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
            >
                {activeTab === 'vehicles' ? (
                    <VehicleDetails vehicle={selectedItem} />
                ) : (
                    <DriverDetails driver={selectedItem} />
                )}
            </SlideOver>
        </div>
    );
};

export default Fleet;
