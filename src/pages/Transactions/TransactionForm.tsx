import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, Select } from '../../components/Shared/Form';
import {
    Loader2,
    CreditCard,
    User,
    Calendar,
    FileText,
    Hash,
    ArrowRight,
    CircleDollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/UI/Button';
import {
    useCreateTransactionMutation,
    useGetPartiesQuery,
    useGetDocumentsByPartyQuery
} from '../../features/api/apiSlice';
import { toast } from 'react-toastify';

interface TransactionFormProps {
    onSuccess: () => void;
}

const transactionSchema = yup.object({
    party_id: yup.number().transform((val) => (isNaN(val) ? undefined : val)).optional().nullable(),
    transaction_type: yup.string().oneOf(['payment_in', 'payment_out', 'expense', 'transfer']).required('Type is required'),
    amount: yup.number().min(0.01, 'Amount must be > 0').required('Amount is required'),
    payment_mode: yup.string().oneOf(['cash', 'upi', 'bank_transfer', 'cheque']).required('Mode is required'),
    document_id: yup.number().transform((val) => (isNaN(val) ? null : val)).nullable().optional(),
    reference_number: yup.string().optional().nullable(),
    transaction_date: yup.string().required('Date is required'),
    description: yup.string().optional().nullable(),
}).required();

type TransactionFormData = yup.InferType<typeof transactionSchema>;

const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess }) => {
    const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<TransactionFormData>({
        resolver: yupResolver(transactionSchema) as any,
        defaultValues: {
            transaction_type: 'payment_in',
            payment_mode: 'upi',
            transaction_date: new Date().toISOString().split('T')[0]
        }
    });

    const selectedPartyId = useWatch({ control, name: 'party_id' });
    const { data: parties } = useGetPartiesQuery({});
    const { data: documents } = useGetDocumentsByPartyQuery(selectedPartyId!, {
        skip: !selectedPartyId
    });

    const [createTransaction, { isLoading: isSubmitting }] = useCreateTransactionMutation();

    useEffect(() => {
        if (!selectedPartyId) setValue('document_id', null);
    }, [selectedPartyId, setValue]);

    const onSubmit = async (data: TransactionFormData) => {
        try {
            await createTransaction(data).unwrap();
            toast.success('Financial entry recorded in ledger');
            onSuccess();
        } catch (error: any) {
            toast.error(error.data?.detail || 'Failed to record entry');
        }
    };

    const sectionHeader = (icon: any, title: string) => (
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2 mt-2">
            {icon}
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{title}</h3>
        </div>
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-10 pt-2">
            {/* Core Attribution */}
            <section>
                {sectionHeader(<User size={14} className="text-primary" />, "Entity Attribution")}
                <div className="space-y-4">
                    <Select
                        label="Party Account"
                        registration={register('party_id' as any)}
                        error={errors.party_id?.message}
                        options={parties?.data?.map((p: any) => ({ value: p.id, label: p.name })) || []}
                        placeholder="Select Account / Party"
                        tooltip="The entity responsible for this ledger entry."
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                            label="Entry Type"
                            registration={register('transaction_type')}
                            error={errors.transaction_type?.message}
                            required
                            options={[
                                { value: 'payment_in', label: 'Payment Received (+)' },
                                { value: 'payment_out', label: 'Payment Paid (-)' },
                                { value: 'expense', label: 'Operational Expense' },
                                { value: 'transfer', label: 'Internal Transfer' },
                            ]}
                            tooltip="Select direction of cash flow. Payment In increases balance, Payment Out decreases it."
                        />
                        <Input
                            label="Transaction Date"
                            type="date"
                            registration={register('transaction_date')}
                            error={errors.transaction_date?.message}
                            required
                        />
                    </div>
                </div>
            </section>

            {/* Financial Details */}
            <section>
                {sectionHeader(<CircleDollarSign size={14} className="text-secondary" />, "Financial Composition")}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Amount (Net)"
                            type="number"
                            registration={register('amount')}
                            error={errors.amount?.message}
                            required
                            placeholder="₹ 0.00"
                        />
                        <Select
                            label="Payment Channel"
                            registration={register('payment_mode')}
                            error={errors.payment_mode?.message}
                            options={[
                                { value: 'upi', label: 'UPI / Digital' },
                                { value: 'bank_transfer', label: 'Bank (NEFT/IMPS)' },
                                { value: 'cash', label: 'Physical Cash' },
                                { value: 'cheque', label: 'Bank Cheque' },
                            ]}
                            tooltip="The method used to process the payment."
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Ref / UTR / Cheque No."
                            registration={register('reference_number')}
                            error={errors.reference_number?.message}
                            placeholder="TXN123456..."
                        />
                        <Select
                            label="Link to Document"
                            registration={register('document_id' as any)}
                            error={errors.document_id?.message}
                            options={documents?.data?.map((d: any) => ({
                                value: d.id,
                                label: `${d.doc_type?.toUpperCase()}: ${d.doc_number || d.id}`
                            })) || []}
                            placeholder={selectedPartyId ? "Optional: Search Bills/Challans" : "Select Party First"}
                            disabled={!selectedPartyId}
                            tooltip="Associate this payment with a specific invoice or challan for reconciliation."
                        />
                    </div>
                </div>
            </section>

            {/* Description Section */}
            <section>
                <div className="flex flex-col space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Audit Description / Remarks</label>
                    <textarea
                        {...register('description')}
                        className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] dark:text-gray-100"
                        placeholder="Internal notes for audit trails..."
                    />
                </div>
            </section>

            <div className="pt-4">
                <Button
                    type="submit"
                    variant="primary"
                    rounded="xl"
                    className="w-full py-5 text-xs tracking-[0.3em] shadow-xl shadow-primary/20"
                // disabled={isSubmitting} // Button component might need disabled prop update if not present.
                // The Button component provided earlier doesn't explicitly list 'disabled' in Props, but spreads ...inputs or uses it?
                // Let's check Button.tsx again.
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin h-6 w-6" />
                    ) : (
                        <div className="flex items-center gap-3">
                            <span>Post Financial Entry</span>
                            <ArrowRight size={18} />
                        </div>
                    )}
                </Button>
            </div>
        </form>
    );
};

export default TransactionForm;
