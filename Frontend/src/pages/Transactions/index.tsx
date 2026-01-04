import { useState } from 'react';
import PageHeader from '../../components/Shared/PageHeader';
import Button from '../../components/UI/Button';
import DataTable from '../../components/Shared/DataTable';
import SlideOver from '../../components/Shared/SlideOver';
import TransactionForm from './TransactionForm';
import Badge from '../../components/Shared/Badge';
import { useGetTransactionsQuery } from '../../features/api/apiSlice';
import {
    CircleDollarSign,
    Calendar,
    User,
    CreditCard,
    Search,
    PlusCircle,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownLeft,
    FileText
} from 'lucide-react';
import { motion } from 'framer-motion';

const Transactions = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: transactions, isLoading, refetch } = useGetTransactionsQuery({
        search: searchTerm || undefined
    });

    const columns = [
        {
            header: 'Transaction Date',
            accessorKey: 'transaction_date',
            cell: (row: any) => (
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <Calendar size={14} className="text-primary/40" />
                    {new Date(row.transaction_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
            )
        },
        {
            header: 'Type / Flow',
            accessorKey: 'transaction_type',
            cell: (row: any) => {
                const isIncoming = row.transaction_type === 'payment_in';
                return (
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${isIncoming ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                            {isIncoming ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">
                            {row.transaction_type?.replace('_', ' ')}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Entity / Description',
            id: 'attribution',
            cell: (row: any) => (
                <div className="flex flex-col">
                    <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        {row.party_name || 'Walk-in / Cash Entry'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium italic truncate max-w-[200px]">
                        {row.description || 'No audit notes provided'}
                    </span>
                </div>
            )
        },
        {
            header: 'Mode',
            accessorKey: 'payment_mode',
            cell: (row: any) => (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                    <CreditCard size={12} className="text-gray-300" />
                    {row.payment_mode}
                </div>
            )
        },
        {
            header: 'Reference',
            accessorKey: 'reference_number',
            cell: (row: any) => (
                <span className="text-[10px] font-mono font-bold text-secondary tracking-widest bg-secondary/5 px-2 py-1 rounded-md border border-secondary/10">
                    {row.reference_number || 'TRX-DEFAULT'}
                </span>
            )
        },
        {
            header: 'Net Amount',
            accessorKey: 'amount',
            cell: (row: any) => {
                const isIncoming = row.transaction_type === 'payment_in';
                return (
                    <span className={`text-sm font-black ${isIncoming ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isIncoming ? '+' : '-'} ₹{(row.amount || 0).toLocaleString()}
                    </span>
                );
            }
        },
        {
            header: 'Links',
            id: 'links',
            cell: (row: any) => row.voucher_id ? (
                <div className="flex items-center gap-1 text-[9px] font-black text-primary uppercase">
                    <FileText size={12} />
                    <span>Linked VCH</span>
                </div>
            ) : <span className="text-gray-200">—</span>
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader title="Financial Ledger" />
                <Button
                    onClick={() => setIsFormOpen(true)}
                    variant="primary"
                    rounded="xl"
                    className="gap-2 px-6 py-2.5 shadow-lg shadow-primary/20"
                >
                    <PlusCircle size={16} />
                    <span>Record Post Entry</span>
                </Button>
            </div>

            {/* Financial Overview - Simplified for now */}

            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-px">
                <div className="flex items-center gap-8">
                    <button className="flex items-center gap-2 pb-4 text-[11px] font-black uppercase tracking-[0.15em] transition-all relative text-primary">
                        <CircleDollarSign size={14} />
                        <span>Transaction Stream</span>
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
                        placeholder="Search ledger entries..."
                        className="block w-64 pl-8 pr-3 py-2 border border-theme rounded-xl bg-white dark:bg-slate-900 text-[10px] font-bold uppercase tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                    />
                </div>
            </div>

            <DataTable
                columns={columns as any}
                data={transactions?.data || []}
                isLoading={isLoading}
                keyField="id"
                emptyMessage="No financial entries found in ledger."
            />

            <SlideOver
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title="Post New Ledger Entry"
            >
                <div className="max-w-2xl mx-auto">
                    <TransactionForm onSuccess={() => { setIsFormOpen(false); refetch(); }} />
                </div>
            </SlideOver>
        </div>
    );
};

export default Transactions;
