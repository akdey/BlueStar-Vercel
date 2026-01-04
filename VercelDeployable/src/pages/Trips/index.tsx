import { useState } from 'react';
import Button from '../../components/UI/Button';
import PageHeader from '../../components/Shared/PageHeader';
import DataTable from '../../components/Shared/DataTable';
import SlideOver from '../../components/Shared/SlideOver';
import TripForm from './TripForm';
import TripDetails from './TripDetails';
import Badge from '../../components/Shared/Badge';
import { useGetTripsQuery } from '../../features/api/apiSlice';
import {
    MapPin,
    Navigation,
    Truck,
    User,
    Calendar,
    Activity,
    PlusCircle,
    Eye,
    Edit,
    ChevronRight,
    Search
} from 'lucide-react';
import { motion } from 'framer-motion';

const Trips = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: trips, isLoading, refetch } = useGetTripsQuery({
        search: searchTerm || undefined
    });

    const handleCreate = () => {
        setSelectedTrip(null);
        setIsFormOpen(true);
    };

    const handleView = (trip: any) => {
        setSelectedTrip(trip);
        setIsDetailsOpen(true);
    };

    const handleEdit = (trip: any) => {
        setSelectedTrip(trip);
        setIsFormOpen(true);
    };

    const columns = [
        // ... previous columns
        {
            header: 'Mission Path',
            id: 'path',
            cell: (row: any) => (
                <div
                    onClick={() => handleView(row)}
                    className="flex items-center gap-3 cursor-pointer group"
                >
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors">{row.source_location}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Source</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 opacity-40">
                        <div className="h-px w-8 bg-gray-400" />
                        <ChevronRight size={10} className="text-gray-400" />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors">{row.destination_location}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Target</span>
                    </div>
                </div>
            )
        },
        {
            header: 'ID / Unit',
            accessorKey: 'trip_number',
            cell: (row: any) => (
                <div className="flex flex-col">
                    <span className="text-[10px] font-mono font-black text-secondary tracking-widest">{row.trip_number || `TRP-${row.id}`}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase italic">{row.vehicle_number || 'Unit ID: ' + row.vehicle_id}</span>
                </div>
            )
        },
        {
            header: 'Personnel',
            accessorKey: 'driver_name',
            cell: (row: any) => (
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-gray-500">
                        {row.driver_name?.charAt(0) || 'P'}
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{row.driver_name || 'Pilot ID: ' + row.driver_id}</span>
                </div>
            )
        },
        {
            header: 'Launch Date',
            accessorKey: 'start_date',
            cell: (row: any) => (
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Calendar size={14} className="text-primary/40" />
                    {new Date(row.start_date).toLocaleDateString()}
                </div>
            )
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (row: any) => {
                const variants: Record<string, any> = {
                    planned: 'neutral',
                    in_transit: 'primary',
                    completed: 'success',
                    cancelled: 'error'
                };
                return <Badge variant={variants[row.status] || 'default'}>{row.status?.toUpperCase()?.replace('_', ' ')}</Badge>
            }
        },
        {
            header: 'Net Financials',
            id: 'financials',
            cell: (row: any) => (
                <div className="flex flex-col items-end">
                    <span className="text-xs font-black text-emerald-500">₹{(row.freight_income || 0).toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-red-400">₹{(row.total_expense || 0).toLocaleString()} burn</span>
                </div>
            )
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: (row: any) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
                        className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/5 rounded-xl transition-all"
                        title="Edit Mission Details"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleView(row); }}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                        title="View Telemetry"
                    >
                        <Eye size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader title="Logistics Operations" />
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleCreate}
                        rounded="xl"
                        className="px-6 py-2.5"
                    >
                        <PlusCircle size={16} />
                        <span>Initialize Mission</span>
                    </Button>
                </div>
            </div>

            {/* Dashboard Sub-controls */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-px">
                <div className="flex items-center gap-8">
                    <button className="flex items-center gap-2 pb-4 text-[11px] font-black uppercase tracking-[0.15em] transition-all relative text-primary">
                        <Navigation size={14} />
                        <span>Mission Stream</span>
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    </button>
                </div>

                <div className="relative mb-3 hidden sm:block">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={14} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search mission paths..."
                        className="block w-64 pl-8 pr-3 py-2 border border-theme rounded-xl bg-white dark:bg-slate-900 text-[10px] font-bold uppercase tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                    />
                </div>
            </div>

            <DataTable
                columns={columns as any}
                data={trips?.data || []}
                isLoading={isLoading}
                keyField="id"
                emptyMessage="No active missions found in current registry."
            />

            <SlideOver
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                title="Mission Breakdown & Telemetry"
            >
                <TripDetails
                    trip={selectedTrip}
                    refetch={refetch}
                    onEdit={() => {
                        setIsDetailsOpen(false);
                        setIsFormOpen(true);
                        // selectedTrip is already set
                    }}
                />
            </SlideOver>

            <SlideOver
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title="Mission Initiation Entry"
            >
                <div className="max-w-2xl mx-auto">
                    <TripForm
                        onSuccess={() => { setIsFormOpen(false); refetch(); }}
                        trip={selectedTrip}
                    />
                </div>
            </SlideOver>
        </div>
    );
};

export default Trips;
