import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, Select } from '../../components/Shared/Form';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAddTripExpenseMutation } from '../../features/api/apiSlice';
import { toast } from 'react-toastify';

interface TripExpenseFormProps {
    tripId: number;
    onSuccess: () => void;
}

const expenseSchema = yup.object({
    expense_type: yup.string().oneOf(['fuel', 'toll', 'food', 'repair', 'other']).required('Expense type is required'),
    amount: yup.number().transform((val) => (isNaN(val) ? undefined : val)).min(0.01, 'Amount must be greater than 0').required('Amount is required'),
    description: yup.string().optional().nullable().default(''),
}).required();

interface ExpenseFormData {
    expense_type: string;
    amount: number;
    description?: string | null;
}

const TripExpenseForm: React.FC<TripExpenseFormProps> = ({ tripId, onSuccess }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<ExpenseFormData>({
        resolver: yupResolver(expenseSchema) as any,
        defaultValues: {
            amount: 0,
            description: ''
        }
    });

    const [addExpense, { isLoading: isSubmitting }] = useAddTripExpenseMutation();

    const onSubmit = async (data: ExpenseFormData) => {
        try {
            await addExpense({ tripId, expenseData: data }).unwrap();
            toast.success('Expense added successfully');
            onSuccess();
        } catch (error: any) {
            console.error(error);
            const message = error.data?.detail || 'Failed to add expense';
            toast.error(message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Select
                label="Expense Type"
                registration={register('expense_type')}
                error={errors.expense_type?.message}
                required
                options={[
                    { value: 'fuel', label: 'Fuel' },
                    { value: 'toll', label: 'Toll' },
                    { value: 'food', label: 'Food' },
                    { value: 'repair', label: 'Repairing' },
                    { value: 'other', label: 'Other' },
                ]}
                placeholder="Select expense type"
            />

            <Input
                label="Amount"
                type="number"
                registration={register('amount')}
                error={errors.amount?.message}
                required
                placeholder="0.00"
            />

            <Input
                label="Description (Optional)"
                registration={register('description')}
                error={errors.description?.message}
                placeholder="e.g. Pump Name, Toll Plaza Name..."
            />

            <div className="pt-6">
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center py-3.5 px-4 bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg shadow-primary/20 text-[11px] font-bold text-white uppercase tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                        <span>Add Expense</span>
                    )}
                </motion.button>
            </div>
        </form>
    );
};

export default TripExpenseForm;
