import React from 'react';
import { useGetTransactionsByPartyQuery } from '../../features/api/apiSlice';
import DataTable from '../../components/Shared/DataTable';
import {
    Calendar,
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    FileText,
    Loader2,
    CircleDollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PartyTransactionsProps {
    partyId: number | string;
}

const PartyTransactions: React.FC<PartyTransactionsProps> = ({ partyId }) => {
    const { data: transactions, isLoading } = useGetTransactionsByPartyQuery(partyId);

    const columns = [
        {
            header: 'Date',
            accessorKey: 'transaction_date',
            cell: (row: any) => (
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-tight">
                    <Calendar size={12} className="text-primary/40" />
                    {new Date(row.transaction_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                </div>
            )
        },
        {
            header: 'Flow',
            accessorKey: 'transaction_type',
            cell: (row: any) => {
                const isIncoming = row.transaction_type === 'payment_in';
                return (
                    <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-md ${isIncoming ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10' : 'bg-red-50 text-red-500 dark:bg-red-500/10'}`}>
                            {isIncoming ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-main truncate max-w-[80px]">
                            {row.transaction_type?.replace('_', ' ')}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Reference',
            accessorKey: 'reference_number',
            cell: (row: any) => (
                <div className="flex flex-col">
                    <span className="text-[10px] font-mono font-bold text-secondary tracking-widest">
                        {row.reference_number || 'TRX-DEFAULT'}
                    </span>
                    <span className="text-[9px] text-muted italic truncate max-w-[120px]">
                        {row.description || 'No notes'}
                    </span>
                </div>
            )
        },
        {
            header: 'Mode',
            accessorKey: 'payment_mode',
            cell: (row: any) => (
                <div className="flex items-center gap-1 text-[9px] font-black text-muted uppercase">
                    <CreditCard size={10} className="text-primary/30" />
                    {row.payment_mode}
                </div>
            )
        },
        {
            header: 'Amount',
            accessorKey: 'amount',
            cell: (row: any) => {
                const isIncoming = row.transaction_type === 'payment_in';
                return (
                    <span className={`text-xs font-black ${isIncoming ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isIncoming ? '+' : '-'} ₹{(row.amount || 0).toLocaleString()}
                    </span>
                );
            }
        }
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted">Auditing Ledger Stream...</p>
            </div>
        );
    }

    const data = transactions?.data || transactions || [];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
        >
            <div className="flex items-center gap-2 px-2 pb-2">
                <CircleDollarSign size={16} className="text-primary" />
                <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-main">Filtered Ledger Stream</h4>
            </div>

            <div className="overflow-hidden border border-theme rounded-2xl bg-card">
                <DataTable
                    columns={columns as any}
                    data={data}
                    isLoading={false}
                    keyField="id"
                    emptyMessage="No transaction data available for this party."
                />
            </div>
        </motion.div>
    );
};

export default PartyTransactions;
