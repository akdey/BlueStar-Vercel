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
import { useUpdateDocumentMutation, useGetDocumentQuery } from '../../features/api/apiSlice';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import PrintableDocument from './PrintableDocument';

interface DocumentDetailsProps {
    docId: number | string;
    onStatusChange?: () => void;
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({ docId, onStatusChange }) => {
    const { data: response, isLoading: isFetching, refetch } = useGetDocumentQuery(docId);
    const [updateDocument, { isLoading: isStatusUpdating }] = useUpdateDocumentMutation();
    const [showPreview, setShowPreview] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const document = response?.data || response; // Handle different response wrappers if necessary

    if (isFetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fetching Registry Details...</p>
            </div>
        );
    }

    if (!document) return null;

    const handleFinalize = async () => {
        try {
            await updateDocument({
                docId: document.id,
                documentData: { status: 'issued' }
            }).unwrap();
            toast.success('Document finalized and issued successfully');
            refetch();
            if (onStatusChange) onStatusChange();
        } catch (error: any) {
            toast.error(error.data?.detail || 'Failed to finalize document');
        }
    };

    const handlePrint = () => {
        window.print();
    };

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

    const getDocTypeVariant = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'invoice': return 'primary';
            case 'challan': return 'secondary';
            case 'quotation': return 'info';
            case 'bill': return 'warning';
            default: return 'neutral';
        }
    };

    const isDraft = document.status === 'draft';

    return (
        <div className="space-y-8 pb-10">
            {/* Document Header Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -right-8 -top-8 text-white/5">
                    <FileText size={160} />
                </div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex gap-2">
                        <Badge variant={getDocTypeVariant(document.doc_type)}>
                            {document.doc_type?.toUpperCase()}
                        </Badge>
                        <Badge variant={document.status === 'issued' ? 'success' : 'neutral'}>
                            {document.status?.toUpperCase()}
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
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic mb-2">Original Document Entry</p>
                    <h2 className="text-3xl font-black tracking-tight mb-2">{document.doc_number || 'AUTO-GEN-DOC'}</h2>
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-300 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> {new Date(document.doc_date).toLocaleDateString()}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-secondary" /> {document.place_of_supply || 'PAN INDIA'}</span>
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
                            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Pending Finalization</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">This document is currently a draft. Issuing will sync inventory and ledgers.</p>
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
            <section className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-6 border-r border-gray-100 dark:border-slate-800 pr-8">
                        {sectionHeader(<User size={14} className="text-primary" />, "Billed Party Account")}
                        <div>
                            <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{document.party_name}</p>
                            <p className="text-xs font-bold text-gray-400 italic">Account ID: {document.party_id}</p>
                        </div>
                    </div>
                    <div className="space-y-6 pl-0 sm:pl-4">
                        {sectionHeader(<Truck size={14} className="text-secondary" />, "Logistics Assignment")}
                        <div className="grid grid-cols-2 gap-4">
                            {dataRow("Vehicle No.", document.vehicle_number, ClipboardList)}
                            {dataRow("Fleet Driver", document.driver_name, User)}
                        </div>
                    </div>
                </div>
            </section>

            {/* Line Items Table */}
            <section>
                {sectionHeader(<Package size={14} className="text-primary" />, "Itemized Transaction Details")}
                <div className="overflow-hidden border border-gray-100 dark:border-slate-800 rounded-3xl">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 dark:bg-slate-800/30">
                            <tr>
                                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Description</th>
                                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Qty</th>
                                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Rate</th>
                                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                            {document.items?.map((item: any, idx: number) => (
                                <tr key={idx} className="group hover:bg-gray-50/30 dark:hover:bg-slate-800/10 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-gray-900 dark:text-gray-100">{item.item_name || 'System Product'}</span>
                                            <span className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase italic">SKU-ID: {item.item_id}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{item.quantity}</span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">₹{item.rate.toLocaleString()}</span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className="text-sm font-black text-primary">₹{item.amount.toLocaleString()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Total Summary */}
                <div className="mt-8 flex justify-end">
                    <div className="w-full sm:w-64 space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <span>Subtotal</span>
                            <span className="text-gray-900 dark:text-white">₹{document.total_amount?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400 pb-3 border-b border-gray-100 dark:border-slate-800">
                            <span>Tax (Calculated)</span>
                            <span className="text-gray-900 dark:text-white">₹0.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Grand Total</span>
                            <span className="text-2xl font-black text-gray-900 dark:text-white">₹{document.total_amount?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Notes Section */}
            {document.notes && (
                <section>
                    {sectionHeader(<Quote size={14} className="text-secondary" />, "Internal Registry Remarks")}
                    <div className="p-6 rounded-[2rem] bg-gray-50 dark:bg-slate-800/20 border border-gray-100 dark:border-slate-800 italic text-gray-600 dark:text-gray-400 text-sm font-medium leading-relaxed">
                        "{document.notes}"
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
                                    <span>Print Document</span>
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
                                <PrintableDocument document={document} />
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
                    <PrintableDocument document={document} />
                </div>,
                document.body
            ) : null}
        </div>
    );
};

export default DocumentDetails;
