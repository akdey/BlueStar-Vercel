import { useState } from 'react';
import PageHeader from '../../components/Shared/PageHeader';
import DataTable from '../../components/Shared/DataTable';
import SlideOver from '../../components/Shared/SlideOver';
import DocumentForm from './DocumentForm';
import DocumentDetails from './DocumentDetails';
import Badge from '../../components/Shared/Badge';
import { useGetDocumentsQuery } from '../../features/api/apiSlice';
import Button from '../../components/UI/Button';
import {
    FileText,
    Calendar,
    User,
    Truck,
    Search,
    PlusCircle,
    Eye,
    Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

const Documents = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [docTypeFilter, setDocTypeFilter] = useState<string>('');

    const { data: documents, isLoading, refetch } = useGetDocumentsQuery({
        type: docTypeFilter || undefined
    });

    const handleCreate = () => {
        setSelectedDoc(null);
        setIsFormOpen(true);
    };

    const handleView = (doc: any) => {
        setSelectedDoc(doc);
        setIsDetailsOpen(true);
    };

    const columns = [
        {
            header: 'Document ID',
            accessorKey: 'doc_number',
            cell: (row: any) => (
                <div
                    onClick={() => handleView(row)}
                    className="flex flex-col cursor-pointer group"
                >
                    <span className="font-bold text-main dark:text-white group-hover:text-primary transition-colors underline decoration-primary/20 decoration-2 underline-offset-4">
                        {row.doc_number || `DOC-${row.id}`}
                    </span>
                    <span className="text-[10px] text-muted font-mono tracking-tighter uppercase">{row.doc_type}</span>
                </div>
            )
        },
        {
            header: 'Stakeholder',
            accessorKey: 'party_name',
            cell: (row: any) => (
                <div className="flex flex-col">
                    <span className="text-xs font-black text-main/80 dark:text-gray-300 uppercase tracking-tight">{row.party_name || 'Generic Party'}</span>
                    <span className="text-[10px] text-muted font-bold italic">ID: {row.party_id}</span>
                </div>
            )
        },
        {
            header: 'Date',
            accessorKey: 'doc_date',
            cell: (row: any) => (
                <div className="flex items-center gap-2 text-xs font-medium text-muted">
                    <Calendar size={14} className="text-secondary/50" />
                    {new Date(row.doc_date).toLocaleDateString()}
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
                <button
                    onClick={() => handleView(row)}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                >
                    <Eye size={18} />
                </button>
            )
        }
    ];

    const types = ['challan', 'invoice', 'bill', 'quotation'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader title="Document Registry" />
                <Button
                    onClick={handleCreate}
                    rounded="xl"
                    className="px-6 py-2.5"
                >
                    <PlusCircle size={16} />
                    <span>Create Document</span>
                </Button>
            </div>

            {/* Premium Document Type Filter */}
            <div className="flex items-center gap-1 bg-main-hover/30 dark:bg-slate-800/40 backdrop-blur-md rounded-[1rem] p-1 border border-theme relative w-fit">
                {['', ...types].map((t) => (
                    <button
                        key={t}
                        onClick={() => setDocTypeFilter(t)}
                        className={`
                            relative px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 z-10 min-w-[100px]
                            ${docTypeFilter === t
                                ? 'text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                            }
                        `}
                    >
                        <span className="relative z-10">{t || 'All Streams'}</span>
                        {docTypeFilter === t && (
                            <motion.div
                                layoutId="activeDocFilter"
                                className="absolute inset-0 bg-gradient-primary rounded-xl shadow-[0_10px_20px_-5px_rgba(var(--primary),0.3)]"
                                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            <DataTable
                columns={columns as any}
                data={documents?.data || []}
                isLoading={isLoading}
                keyField="id"
                emptyMessage="No documents found in registry."
            />

            <SlideOver
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                title="Document Profile breakdown"
            >
                <DocumentDetails
                    docId={selectedDoc?.id}
                    onStatusChange={() => refetch()}
                />
            </SlideOver>

            <SlideOver
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title="Generate New Document Entry"
            >
                <div className="max-w-2xl mx-auto">
                    <DocumentForm onSuccess={() => { setIsFormOpen(false); refetch(); }} />
                </div>
            </SlideOver>
        </div>
    );
};

export default Documents;
