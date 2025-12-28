import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, Select } from '../../components/Shared/Form';
import Button from '../../components/UI/Button';
import {
    Loader2,
    FileText,
    Calendar,
    User,
    Truck,
    Plus,
    Trash2,
    Calculator,
    Package,
    MapPin,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useCreateVoucherMutation,
    useGetPartiesQuery,
    useGetItemsQuery
} from '../../features/api/apiSlice';
import { toast } from 'react-toastify';

interface VoucherFormProps {
    onSuccess: () => void;
}

const itemSchema = yup.object({
    item_id: yup.number().required('Required'),
    quantity: yup.number().min(0.01, '> 0').required('Required'),
    rate: yup.number().min(0, 'Min 0').required('Required'),
    tax_rate: yup.number().default(0),
    amount: yup.number().default(0),
});

const voucherSchema = yup.object({
    voucher_number: yup.string().optional().nullable(),
    voucher_type: yup.string().oneOf(['challan', 'invoice', 'bill', 'quotation']).required('Type is required'),
    voucher_date: yup.string().required('Date is required'),
    party_id: yup.number().required('Party is required'),
    vehicle_number: yup.string().optional().nullable(),
    driver_name: yup.string().optional().nullable(),
    place_of_supply: yup.string().optional().nullable(),
    notes: yup.string().optional().nullable(),
    status: yup.string().oneOf(['draft', 'issued', 'cancelled']).default('draft'),
    items: yup.array().of(itemSchema).min(1, 'At least one item required').required(),
}).required();

type VoucherFormData = yup.InferType<typeof voucherSchema>;

const VoucherForm: React.FC<VoucherFormProps> = ({ onSuccess }) => {
    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<VoucherFormData>({
        resolver: yupResolver(voucherSchema) as any,
        defaultValues: {
            voucher_type: 'challan',
            voucher_date: new Date().toISOString().split('T')[0],
            status: 'draft',
            items: [{ item_id: 0, quantity: 1, rate: 0, tax_rate: 0, amount: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const [createVoucher, { isLoading: isSubmitting }] = useCreateVoucherMutation();
    const { data: parties } = useGetPartiesQuery({});
    const { data: inventoryItems } = useGetItemsQuery({});

    const items = watch('items');

    // Helper for rounding to 2 decimal places
    const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

    // Calculate line total and grand total
    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            if (name?.startsWith('items')) {
                const indexMatch = name.match(/items\.(\d+)/);
                if (indexMatch) {
                    const index = parseInt(indexMatch[1]);
                    const item = value.items?.[index];
                    if (item) {
                        const qty = Number(item.quantity) || 0;
                        const rate = Number(item.rate) || 0;
                        const amount = round(qty * rate);

                        // Only update if value is different to avoid infinite loops (though setValue check handles it usually)
                        // But we must check if current amount is different.
                        const currentAmount = item.amount;
                        if (currentAmount !== amount) {
                            setValue(`items.${index}.amount` as any, amount);
                        }
                    }
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setValue]);

    const calculateTotals = () => {
        const currentItems = items || [];
        const subTotal = currentItems.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
        const totalTax = currentItems.reduce((sum, item) => {
            const amt = Number(item?.amount) || 0;
            const taxRate = Number(item?.tax_rate) || 0;
            return sum + round((amt * taxRate) / 100);
        }, 0);

        return {
            subTotal: round(subTotal),
            totalTax: round(totalTax),
            grandTotal: round(subTotal + totalTax)
        };
    };

    const { subTotal, totalTax, grandTotal } = calculateTotals();

    const onSubmit = async (data: VoucherFormData) => {
        try {
            await createVoucher(data).unwrap();
            toast.success('Voucher generated successfully');
            onSuccess();
        } catch (error: any) {
            toast.error(error.data?.detail || 'Failed to generate voucher');
        }
    };

    const sectionHeader = (icon: any, title: string) => (
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2 mt-2">
            {icon}
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{title}</h3>
        </div>
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-10">
            {/* Header Section */}
            <section>
                {sectionHeader(<FileText size={14} className="text-primary" />, "Voucher Identification")}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                        label="Voucher Type"
                        registration={register('voucher_type')}
                        error={errors.voucher_type?.message}
                        required
                        options={[
                            { value: 'challan', label: 'Delivery Challan' },
                            { value: 'invoice', label: 'Tax Invoice' },
                            { value: 'bill', label: 'Purchase Bill' },
                            { value: 'quotation', label: 'Quotation' },
                        ]}
                        tooltip="Classification of the voucher for accounting and logistics."
                    />
                    <Input
                        label="Voucher Number"
                        registration={register('voucher_number')}
                        error={errors.voucher_number?.message}
                        placeholder="Leave blank for Auto-gen"
                        tooltip="Unique identifier. If empty, the system generates a standard code."
                    />
                    <Input
                        label="Voucher Date"
                        type="date"
                        registration={register('voucher_date')}
                        error={errors.voucher_date?.message}
                        required
                    />
                    <Select
                        label="Party / Customer"
                        registration={register('party_id' as any)}
                        error={errors.party_id?.message}
                        required
                        options={parties?.data?.map((p: any) => ({ value: p.id, label: `${p.name} (${p.code})` })) || []}
                        tooltip="The business partner associated with this transaction."
                    />
                </div>
            </section>

            {/* Logistics Section */}
            <section>
                {sectionHeader(<Truck size={14} className="text-secondary" />, "Logistics & Supply Link")}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="Vehicle Number"
                        registration={register('vehicle_number')}
                        error={errors.vehicle_number?.message}
                        placeholder="e.g. MH 12 AB 1234"
                        tooltip="Registration number of the truck carrying the load."
                    />
                    <Input
                        label="Driver Name"
                        registration={register('driver_name')}
                        error={errors.driver_name?.message}
                        placeholder="John Doe"
                    />
                    <Input
                        label="Place of Supply"
                        registration={register('place_of_supply')}
                        error={errors.place_of_supply?.message}
                        placeholder="City / State"
                    />
                </div>
            </section>

            {/* Line Items Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                        <Package size={14} className="text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Line Items</h3>
                    </div>
                    <Button
                        type="button"
                        variant="glass"
                        onClick={() => append({ item_id: 0, quantity: 1, rate: 0, tax_rate: 0, amount: 0 })}
                        rounded="xl"
                        className="flex items-center gap-1.5 text-[10px] shadow-none h-auto border-none text-primary hover:text-secondary py-1.5 px-3"
                    >
                        <Plus size={14} /> Add Row
                    </Button>
                </div>

                <div className="space-y-3">
                    <AnimatePresence initial={false}>
                        {fields.map((field, index) => (
                            <motion.div
                                key={field.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="grid grid-cols-12 gap-3 items-end bg-gray-50/50 dark:bg-slate-800/20 p-4 rounded-2xl border border-gray-100 dark:border-slate-800/50 group"
                            >
                                <div className="col-span-12 sm:col-span-4">
                                    <Select
                                        label={index === 0 ? "Select Product" : ""}
                                        registration={register(`items.${index}.item_id` as any, {
                                            onChange: (e) => {
                                                const itemId = Number(e.target.value);
                                                const selected = inventoryItems?.data?.find((i: any) => i.id === itemId);
                                                if (selected) {
                                                    setValue(`items.${index}.rate` as any, selected.base_price);
                                                    setValue(`items.${index}.tax_rate` as any, selected.tax_rate);
                                                }
                                            }
                                        })}
                                        options={inventoryItems?.data?.map((i: any) => ({ value: i.id, label: i.name })) || []}
                                        error={errors.items?.[index]?.item_id?.message}
                                    />
                                </div>
                                <div className="col-span-4 sm:col-span-2">
                                    <Input
                                        label={index === 0 ? "Qty" : ""}
                                        type="number"
                                        step="0.01"
                                        registration={register(`items.${index}.quantity` as any)}
                                        error={errors.items?.[index]?.quantity?.message}
                                    />
                                </div>
                                <div className="col-span-4 sm:col-span-2">
                                    <Input
                                        label={index === 0 ? "Rate" : ""}
                                        type="number"
                                        registration={register(`items.${index}.rate` as any)}
                                        error={errors.items?.[index]?.rate?.message}
                                    />
                                </div>
                                <div className="col-span-3 sm:col-span-3">
                                    <div className="flex flex-col space-y-1.5">
                                        {index === 0 && <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Amount</label>}
                                        <div className="h-10 flex items-center px-3 rounded-2xl bg-gray-100 dark:bg-slate-800 text-xs font-black text-primary dark:text-white">
                                            ₹{(items[index]?.amount || 0).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-1 flex justify-center pb-2">
                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </section>

            {/* Total & Summary Section */}
            <section className="bg-slate-900 dark:bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                    <Calculator size={200} />
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-8">
                    <div className="flex-1 w-full space-y-4">
                        <div className="flex flex-col space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Notes / Special Instructions</label>
                            <textarea
                                {...register('notes')}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                                placeholder="Any additional details..."
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                        {/* Summary Breakdown */}
                        <div className="space-y-1 mb-4 text-right">
                            <div className="text-xs font-medium text-gray-400">
                                <span>Subtotal: </span>
                                <span className="text-white ml-2">₹{subTotal.toLocaleString()}</span>
                            </div>
                            <div className="text-xs font-medium text-gray-400">
                                <span>Total Tax: </span>
                                <span className="text-emerald-400 ml-2">+ ₹{totalTax.toLocaleString()}</span>
                            </div>
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Grand Total Amount</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-primary">₹</span>
                            <span className="text-5xl font-black tracking-tighter tabular-nums">
                                {grandTotal.toLocaleString()}
                            </span>
                        </div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 mt-4 italic">Inclusive of all applied taxes and levies</p>
                    </div>
                </div>
            </section>

            <div className="pt-6">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    rounded="xl"
                    className="w-full py-5 text-xs tracking-[0.3em]"
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin h-6 w-6" />
                    ) : (
                        <div className="flex items-center gap-3">
                            <span>Save as Draft / Prepare</span>
                            <ArrowRight size={18} />
                        </div>
                    )}
                </Button>
            </div>
        </form>
    );
};

export default VoucherForm;
