import React from 'react';
import { createPortal } from 'react-dom';
import {
    FileText,
    Calendar,
    User,
    Truck,
    MapPin,
    Package,
    Quote,
    ClipboardList,
    Download,
    Printer,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Eye
} from 'lucide-react';
import Badge from '../../components/Shared/Badge';
import Button from '../../components/UI/Button';
import { useUpdateVoucherMutation, useGetVoucherQuery, useGetPartyQuery } from '../../features/api/apiSlice';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import PrintableVoucher from './PrintableVoucher';

import Skeleton from '../../components/Shared/Skeleton';

interface VoucherDetailsProps {
    voucherId: number | string;
    onStatusChange?: () => void;
}

const VoucherDetails: React.FC<VoucherDetailsProps> = ({ voucherId, onStatusChange }) => {
    const { data: response, isLoading: isFetching, refetch } = useGetVoucherQuery(voucherId);
    const [updateVoucher, { isLoading: isStatusUpdating }] = useUpdateVoucherMutation();
    const [showPreview, setShowPreview] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const voucher = response?.data || response; // Handle different response wrappers if necessary

    // Fetch party details to get the party name
    const { data: partyResponse } = useGetPartyQuery(voucher?.party_id, {
        skip: !voucher?.party_id
    });

    const partyName = partyResponse?.data?.name || voucher?.party_name || 'Unknown Party';

    if (isFetching) {
        return (
            <div className="space-y-8 animate-pulse">
                {/* Header Skeleton */}
                <div className="bg-gray-200 dark:bg-slate-800 rounded-[2.5rem] p-8 h-48 overflow-hidden relative">
                    <Skeleton className="w-1/4 h-6 mb-6" variant="rounded" />
                    <Skeleton className="w-1/2 h-10 mb-4" variant="rounded" />
                    <div className="flex gap-4">
                        <Skeleton className="w-24 h-4" variant="rounded" />
                        <Skeleton className="w-24 h-4" variant="rounded" />
                    </div>
                </div>

                {/* Info Card Skeleton */}
                <div className="bg-card dark:bg-slate-900 border border-theme p-6 rounded-3xl h-32 flex gap-8">
                    <div className="flex-1 space-y-4">
                        <Skeleton className="w-20 h-3" variant="text" />
                        <Skeleton className="w-40 h-6" variant="rounded" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <Skeleton className="w-20 h-3" variant="text" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="w-full h-8" variant="rounded" />
                            <Skeleton className="w-full h-8" variant="rounded" />
                        </div>
                    </div>
                </div>

                {/* Table Skeleton */}
                <div className="space-y-4">
                    <Skeleton className="w-1/4 h-4" variant="text" />
                    <div className="border border-theme rounded-3xl p-4 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-theme last:border-0">
                                <Skeleton className="w-1/3 h-8" variant="rounded" />
                                <Skeleton className="w-16 h-8" variant="rounded" />
                                <Skeleton className="w-20 h-8" variant="rounded" />
                                <Skeleton className="w-24 h-8" variant="rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!voucher) return null;

    const handleFinalize = async () => {
        try {
            await updateVoucher({
                docId: voucher.id,
                voucherData: { status: 'issued' }
            }).unwrap();
            toast.success('Voucher finalized and issued successfully');
            refetch();
            if (onStatusChange) onStatusChange();
        } catch (error: any) {
            toast.error(error.data?.detail || 'Failed to finalize voucher');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const sectionHeader = (icon: any, title: string) => (
        <div className="flex items-center gap-2 mb-4 border-b border-theme pb-2">
            {icon}
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">{title}</h3>
        </div>
    );

    const dataRow = (label: string, value: any, Icon?: any) => (
        <div className="flex flex-col space-y-1">
            <span className="text-[9px] font-black text-muted uppercase tracking-widest">{label}</span>
            <div className="flex items-center gap-2">
                {Icon && <Icon size={12} className="text-primary/40" />}
                <span className="text-sm font-bold text-main dark:text-gray-100">{value || '—'}</span>
            </div>
        </div>
    );

    const getDocTypeVariant = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'invoice': return 'primary';
            case 'challan': return 'secondary';
            case 'quotation': return 'info';
            case 'bill': return 'warning';
            default: return 'neutral';
        }
    };

    const isDraft = voucher.status === 'draft';

    return (
        <div className="space-y-8 pb-10">
            {/* Voucher Header Card */}
            <div className="bg-gradient-primary rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -right-8 -top-8 text-white/5">
                    <FileText size={160} />
                </div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex gap-2">
                        <Badge variant={getDocTypeVariant(voucher.voucher_type)}>
                            {voucher.voucher_type?.toUpperCase()}
                        </Badge>
                        <Badge variant={voucher.status === 'issued' ? 'success' : 'neutral'}>
                            {voucher.status?.toUpperCase()}
                        </Badge>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="glass"
                            rounded="xl"
                            onClick={() => setShowPreview(!showPreview)}
                            className={`p-2 shadow-none h-auto border-none ring-1 ring-white/20 text-white ${showPreview ? 'bg-white/20' : ''}`}
                            title="Toggle Print Preview"
                        >
                            <Eye size={16} />
                        </Button>
                        <Button
                            variant="glass"
                            rounded="xl"
                            onClick={handlePrint}
                            className="p-2 shadow-none h-auto border-none ring-1 ring-white/20 text-white"
                        >
                            <Printer size={16} />
                        </Button>
                        <Button
                            variant="glass"
                            rounded="xl"
                            className="p-2 shadow-none h-auto border-none ring-1 ring-white/20 text-white"
                        >
                            <Download size={16} />
                        </Button>
                    </div>
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 italic mb-2">Authenticated Trade Voucher</p>
                    <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">{voucher.voucher_number || 'AUTO-GEN-VCH'}</h2>
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-300 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> {new Date(voucher.voucher_date).toLocaleDateString()}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-secondary" /> {voucher.place_of_supply || 'PAN INDIA'}</span>
                    </div>
                </div>
            </div>

            {/* Finalization Action Banner */}
            {isDraft && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/5 dark:bg-accent/5 border border-primary/20 dark:border-accent/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-accent/10 flex items-center justify-center text-primary dark:text-accent">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-main dark:text-white uppercase tracking-tight">Pending Finalization</h4>
                            <p className="text-xs text-muted mt-0.5">This voucher is currently a draft. Issuing will sync inventory and ledgers.</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleFinalize}
                        disabled={isStatusUpdating}
                        rounded="2xl"
                        className="px-6 py-3 text-[10px]"
                    >
                        {isStatusUpdating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        <span>Confirm & Issue Invoice</span>
                    </Button>
                </motion.div>
            )}

            {/* Stakeholder Info */}
            <section className="bg-card dark:bg-slate-900 border border-theme p-6 rounded-3xl shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-6 border-r border-theme pr-8">
                        {sectionHeader(<User size={14} className="text-primary" />, "Billed Party Account")}
                        <div>
                            <p className="text-lg font-black text-main dark:text-white uppercase tracking-tight">{partyName}</p>
                            <p className="text-xs font-bold text-muted italic">Account ID: {voucher.party_id}</p>
                        </div>
                    </div>
                    <div className="space-y-6 pl-0 sm:pl-4">
                        {sectionHeader(<Truck size={14} className="text-secondary" />, "Logistics Assignment")}
                        <div className="grid grid-cols-2 gap-4">
                            {dataRow("Vehicle No.", voucher.vehicle_number, ClipboardList)}
                            {dataRow("Fleet Driver", voucher.driver_name, User)}
                        </div>
                    </div>
                </div>
            </section>

            {/* Line Items Table */}
            <section>
                {sectionHeader(<Package size={14} className="text-primary" />, "Itemized Transaction Details")}
                <div className="overflow-hidden border border-theme rounded-3xl bg-card">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-main-hover/30 dark:bg-slate-800/30">
                            <tr>
                                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted">Description</th>
                                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted text-center">Qty</th>
                                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted text-right">Rate</th>
                                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted text-right">Tax</th>
                                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y border-theme">
                            {voucher.items?.map((item: any, idx: number) => {
                                const amount = Number(item.amount) || 0;
                                const taxRate = Number(item.tax_rate) || 0;
                                const taxAmount = (amount * taxRate) / 100;

                                return (
                                    <tr key={idx} className="group hover:bg-main-hover/50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-main dark:text-gray-100">{item.item_name || 'System Product'}</span>
                                                <span className="text-[10px] text-muted font-mono tracking-tighter uppercase italic">SKU-ID: {item.item_id}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="text-xs font-bold bg-main-hover px-2 py-1 rounded-lg">{item.quantity}</span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <span className="text-xs font-bold text-muted">₹{Number(item.rate).toLocaleString()}</span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-bold text-primary">₹{taxAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                                <span className="text-[9px] text-muted font-black">({taxRate}%)</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <span className="text-sm font-black text-primary">₹{amount.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Total Summary */}
                <div className="mt-8 flex justify-end">
                    {(() => {
                        const items = voucher.items || [];
                        const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;
                        let subTotal = 0;
                        let totalTax = 0;
                        items.forEach((item: any) => {
                            const amount = Number(item.amount) || 0;
                            const taxRate = Number(item.tax_rate) || 0;
                            const taxAmount = round((amount * taxRate) / 100);
                            subTotal += amount;
                            totalTax += taxAmount;
                        });
                        const grandTotal = round(subTotal + totalTax);

                        return (
                            <div className="w-full sm:w-64 space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted">
                                    <span>Subtotal</span>
                                    <span className="text-main dark:text-white">₹{subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted pb-3 border-b border-theme">
                                    <span>Total Tax</span>
                                    <span className="text-main dark:text-white">₹{totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Grand Total</span>
                                    <span className="text-2xl font-black text-gray-900 dark:text-white">₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </section>

            {/* Notes Section */}
            {voucher.notes && (
                <section>
                    {sectionHeader(<Quote size={14} className="text-secondary" />, "Internal Registry Remarks")}
                    <div className="p-6 rounded-[2rem] bg-main-hover/30 dark:bg-slate-800/20 border border-theme italic text-muted text-sm font-medium leading-relaxed">
                        "{voucher.notes}"
                    </div>
                </section>
            )}

            {/* Print Preview Overlay */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm overflow-auto p-4 sm:p-8 no-print"
                    >
                        <div className="max-w-[21cm] mx-auto relative">
                            <div className="sticky top-0 right-0 flex justify-end gap-3 mb-4 z-10">
                                <Button
                                    onClick={handlePrint}
                                    className="bg-primary text-white px-6 py-2 rounded-xl flex items-center gap-2 shadow-xl"
                                >
                                    <Printer size={16} />
                                    <span>Print Voucher</span>
                                </Button>
                                <Button
                                    variant="glass"
                                    onClick={() => setShowPreview(false)}
                                    className="bg-white/10 text-white border-white/20 px-6 py-2 rounded-xl shadow-xl"
                                >
                                    Close Preview
                                </Button>
                            </div>
                            <div className="shadow-2xl rounded-sm overflow-hidden bg-white">
                                <PrintableVoucher voucher={voucher} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Print Styles - Injected here to ensure availability */}
            <style>
                {`
                    @media print {
                        @page { size: auto; margin: 0mm; }
                        html, body { height: auto !important; width: 100%; background: white; overflow: visible !important; }
                        
                        /* Hide Main App Root */
                        #root { display: none !important; }
                        
                        /* Position Portal to fill page */
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

                        /* Reset content styling for print */
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

            {/* Print Portal - Using standard Tailwind visibility */}
            {mounted && document.body ? createPortal(
                <div id="print-portal" className="hidden print:block">
                    <PrintableVoucher voucher={voucher} />
                </div>,
                document.body
            ) : null}
        </div>
    );
};

export default VoucherDetails;
