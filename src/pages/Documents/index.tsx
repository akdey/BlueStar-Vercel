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
                    <span className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors underline decoration-primary/20 decoration-2 underline-offset-4">
                        {row.doc_number || `DOC-${row.id}`}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{row.doc_type}</span>
                </div>
            )
        },
        {
            header: 'Stakeholder',
            accessorKey: 'party_name',
            cell: (row: any) => (
                <div className="flex flex-col">
                    <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-tight">{row.party_name || 'Generic Party'}</span>
                    <span className="text-[10px] text-gray-400 font-bold italic">ID: {row.party_id}</span>
                </div>
            )
        },
        {
            header: 'Date',
            accessorKey: 'doc_date',
            cell: (row: any) => (
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Calendar size={14} className="text-secondary/50" />
                    {new Date(row.doc_date).toLocaleDateString()}
                </div>
            )
        },
        {
            header: 'Vehicle',
            accessorKey: 'vehicle_number',
            cell: (row: any) => (row.vehicle_number ? (
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-lg w-fit">
                    <Truck size={12} className="text-primary/60" />
                    {row.vehicle_number}
                </div>
            ) : <span className="text-gray-300">—</span>)
        },
        {
            header: 'Net Worth',
            accessorKey: 'total_amount',
            cell: (row: any) => (
                <span className="text-xs font-black text-gray-900 dark:text-white">
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
            <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 border border-theme p-1.5 rounded-2xl shadow-sm w-fit">
                <Button
                    onClick={() => setDocTypeFilter('')}
                    variant={docTypeFilter === '' ? 'primary' : 'glass'}
                    rounded="xl"
                    className={`px-4 py-2 text-[10px] shadow-none h-auto border-none ${docTypeFilter !== '' ? 'dark:text-gray-400 text-gray-500' : ''}`}
                >
                    All Streams
                </Button>
                {types.map(t => (
                    <Button
                        key={t}
                        onClick={() => setDocTypeFilter(t)}
                        variant={docTypeFilter === t ? 'primary' : 'glass'}
                        rounded="xl"
                        className={`px-4 py-2 text-[10px] shadow-none h-auto border-none ${docTypeFilter !== t ? 'dark:text-gray-400 text-gray-500' : ''}`}
                    >
                        {t}
                    </Button>
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
