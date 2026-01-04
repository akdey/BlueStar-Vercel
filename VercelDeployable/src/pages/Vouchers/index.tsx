import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PageHeader from '../../components/Shared/PageHeader';
import DataTable from '../../components/Shared/DataTable';
import SlideOver from '../../components/Shared/SlideOver';
import VoucherForm from './VoucherForm';
import VoucherDetails from './VoucherDetails';
import PrintableVoucher from './PrintableVoucher';
import Badge from '../../components/Shared/Badge';
import { useGetVouchersQuery, useGetPartiesQuery } from '../../features/api/apiSlice';
import Button from '../../components/UI/Button';
import Skeleton from '../../components/Shared/Skeleton';
import {
    FileText,
    Calendar,
    User,
    Truck,
    Search,
    PlusCircle,
    Eye,
    Filter,
    Printer
} from 'lucide-react';
import { motion } from 'framer-motion';

const Vouchers = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
    const [voucherToPrint, setVoucherToPrint] = useState<any>(null);
    const [voucherTypeFilter, setVoucherTypeFilter] = useState<string>('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data: vouchers, isLoading, refetch } = useGetVouchersQuery({
        type: voucherTypeFilter || undefined
    });
    const { data: partiesData } = useGetPartiesQuery({});

    // Create a map of party_id to party_name for quick lookup
    const partyMap = new Map(
        partiesData?.data?.map((party: any) => [party.id, party.name]) || []
    );

    const handleCreate = () => {
        setSelectedVoucher(null);
        setIsFormOpen(true);
    };

    const handleView = (voucher: any) => {
        setSelectedVoucher(voucher);
        setIsDetailsOpen(true);
    };

    const handlePrint = (voucher: any) => {
        setVoucherToPrint(voucher);
        // Small delay to ensure the portal is rendered before printing
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const columns = [
        {
            header: 'Voucher ID',
            accessorKey: 'voucher_number',
            cell: (row: any) => (
                <div
                    onClick={() => handleView(row)}
                    className="flex flex-col cursor-pointer group"
                >
                    <span className="font-bold text-main dark:text-white group-hover:text-primary transition-colors underline decoration-primary/20 decoration-2 underline-offset-4">
                        {row.voucher_number || `VCH-${row.id}`}
                    </span>
                    <span className="text-[10px] text-muted font-mono tracking-tighter uppercase">{row.voucher_type}</span>
                </div>
            )
        },
        {
            header: 'Stakeholder',
            accessorKey: 'party_name',
            cell: (row: any) => {
                const partyName = partyMap.get(row.party_id) || row.party_name || 'Unknown Party';
                return (
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-main/80 dark:text-gray-300 uppercase tracking-tight">{partyName}</span>
                        <span className="text-[10px] text-muted font-bold italic">ID: {row.party_id}</span>
                    </div>
                );
            }
        },
        {
            header: 'Date',
            accessorKey: 'voucher_date',
            cell: (row: any) => (
                <div className="flex items-center gap-2 text-xs font-medium text-muted">
                    <Calendar size={14} className="text-secondary/50" />
                    {new Date(row.voucher_date).toLocaleDateString()}
                </div>
            )
        },
        {
            header: 'Vehicle',
            accessorKey: 'vehicle_number',
            cell: (row: any) => (row.vehicle_number ? (
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-main/60 dark:text-gray-400 bg-main-hover/30 dark:bg-slate-800 px-2 py-1 rounded-lg w-fit">
                    <Truck size={12} className="text-primary/60" />
                    {row.vehicle_number}
                </div>
            ) : <span className="text-gray-300">—</span>)
        },
        {
            header: 'Net Worth',
            accessorKey: 'total_amount',
            cell: (row: any) => (
                <span className="text-xs font-black text-main dark:text-white">
                    ₹{(row.total_amount || 0).toLocaleString()}
                </span>
            )
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (row: any) => (
                <Badge variant={row.status === 'issued' ? 'success' : 'neutral'}>
                    {row.status?.toUpperCase() || 'DRAFT'}
                </Badge>
            )
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: (row: any) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleView(row)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                        title="View Details"
                    >
                        <Eye size={18} />
                    </button>
                    <button
                        onClick={() => handlePrint(row)}
                        className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/5 rounded-xl transition-all"
                        title="Print Voucher"
                    >
                        <Printer size={18} />
                    </button>
                </div>
            )
        }
    ];

    const types = ['challan', 'invoice', 'bill', 'quotation'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader title="Voucher Management Center" />
                <Button
                    onClick={handleCreate}
                    rounded="xl"
                    className="px-6 py-2.5"
                >
                    <PlusCircle size={16} />
                    <span>Generate Voucher</span>
                </Button>
            </div>

            {/* Premium Voucher Type Filter */}
            <div className="flex items-center gap-1 bg-main-hover/30 dark:bg-slate-800/40 backdrop-blur-md rounded-[1rem] p-1 border border-theme relative w-fit">
                {['', ...types].map((t) => (
                    <button
                        key={t}
                        onClick={() => setVoucherTypeFilter(t)}
                        className={`
                            relative px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 z-10 min-w-[100px]
                            ${voucherTypeFilter === t
                                ? 'text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                            }
                        `}
                    >
                        <span className="relative z-10">{t || 'All Streams'}</span>
                        {voucherTypeFilter === t && (
                            <motion.div
                                layoutId="activeVoucherFilter"
                                className="absolute inset-0 bg-gradient-primary rounded-xl shadow-[0_10px_20px_-5px_rgba(var(--primary),0.3)]"
                                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            <DataTable
                columns={columns as any}
                data={isLoading ? [] : (vouchers?.data || [])}
                isLoading={isLoading}
                skeletonRows={5}
                keyField="id"
                emptyMessage="No vouchers found in registry."
            />

            <SlideOver
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                title="Voucher Profile breakdown"
            >
                <VoucherDetails
                    voucherId={selectedVoucher?.id}
                    onStatusChange={() => refetch()}
                />
            </SlideOver>

            <SlideOver
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title="Generate New Voucher Entry"
            >
                <div className="max-w-2xl mx-auto">
                    <VoucherForm onSuccess={() => { setIsFormOpen(false); refetch(); }} />
                </div>
            </SlideOver>

            {/* Global Print Styles - Injected for direct printing */}
            <style>
                {`
                    @media print {
                        @page { size: auto; margin: 0mm; }
                        html, body { height: auto !important; width: 100%; background: white; overflow: visible !important; }
                        #root { display: none !important; }
                        #print-portal {
                            position: absolute !important;
                            top: 0 !important;
                            left: 0 !important;
                            width: 100% !important;
                            height: auto !important;
                            z-index: 99999 !important;
                            overflow: visible !important;
                            background: white;
                        }
                        .printable-content {
                            box-shadow: none !important;
                            max-width: none !important;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 10mm !important;
                        }
                    }
                `}
            </style>

            {/* Print Portal */}
            {mounted && voucherToPrint && createPortal(
                <div id="print-portal" className="hidden print:block">
                    <PrintableVoucher voucher={voucherToPrint} />
                </div>,
                document.body
            )}
        </div>
    );
};

export default Vouchers;
