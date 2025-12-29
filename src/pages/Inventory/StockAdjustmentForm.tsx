import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, Select } from '../../components/Shared/Form';
import { Loader2, Package, ArrowRight, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGetItemsQuery, useUpdateItemMutation } from '../../features/api/apiSlice';
import { toast } from 'react-toastify';
import Button from '../../components/UI/Button';

interface StockAdjustmentFormProps {
    onSuccess: () => void;
    initialItem?: any;
}

const adjustmentSchema = yup.object({
    item_id: yup.number().required('Please select an item'),
    current_stock: yup.number().transform((val) => (isNaN(val) ? 0 : val)).min(0, 'Stock cannot be negative').required('Required'),
}).required();

const StockAdjustmentForm: React.FC<StockAdjustmentFormProps> = ({ onSuccess, initialItem }) => {
    const [selectedItemId, setSelectedItemId] = useState<number | null>(initialItem?.id || null);

    const { data: items } = useGetItemsQuery({}, { skip: !!initialItem });
    const [updateItem, { isLoading: isSubmitting }] = useUpdateItemMutation();

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(adjustmentSchema) as any,
        defaultValues: {
            item_id: initialItem?.id,
            current_stock: initialItem?.current_stock || 0
        }
    });

    // When an item is selected from the dropdown (Generic Mode)
    useEffect(() => {
        if (selectedItemId && !initialItem) {
            const item = items?.data?.find((i: any) => i.id === selectedItemId);
            if (item) {
                setValue('item_id', item.id);
                setValue('current_stock', item.current_stock);
            }
        }
    }, [selectedItemId, items, setValue, initialItem]);

    const onSubmit = async (data: any) => {
        try {
            await updateItem({
                itemId: data.item_id,
                itemData: { current_stock: data.current_stock }
            }).unwrap();
            toast.success('Stock level adjusted successfully');
            onSuccess();
        } catch (error: any) {
            toast.error(error.data?.detail || 'Failed to adjust stock');
        }
    };

    const sectionHeader = (icon: any, title: string) => (
        <div className="flex items-center gap-2 mb-6 border-b border-theme pb-2">
            {icon}
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">{title}</h3>
        </div>
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-6 pt-2">
            <section>
                {sectionHeader(<Package size={14} className="text-secondary" />, "Inventory Identification")}

                {!initialItem ? (
                    <Select
                        label="Select Item to Adjust"
                        registration={register('item_id' as any, {
                            onChange: (e: any) => setSelectedItemId(Number(e.target.value))
                        })}
                        error={errors.item_id?.message as string}
                        options={items?.data?.map((i: any) => ({
                            value: i.id,
                            label: `${i.name} (Current: ${i.current_stock} ${i.unit})`
                        })) || []}
                        placeholder="Search for an item..."
                        required
                    />
                ) : (
                    <div className="bg-main-hover/50 dark:bg-secondary/10 p-5 rounded-3xl border border-theme mb-6 relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 text-secondary/10 italic font-black text-6xl select-none">ID-{initialItem.id}</div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-secondary uppercase mb-2 tracking-widest">Target Item Profile</p>
                            <p className="text-2xl font-black text-main dark:text-white leading-none mb-1 uppercase tracking-tight">{initialItem.name}</p>
                            <p className="text-[10px] text-muted font-mono tracking-tighter uppercase font-bold italic">{initialItem.code || 'NO SKU'}</p>
                        </div>
                    </div>
                )}
            </section>

            {selectedItemId && (
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {sectionHeader(<BarChart2 size={14} className="text-primary" />, "Quick Stock Adjustment")}

                    <div className="bg-main-hover/30 dark:bg-slate-800/40 p-8 rounded-[2.5rem] border border-theme relative overflow-hidden">
                        <div className="relative z-10 flex items-center justify-between gap-8">
                            <div className="flex-1">
                                <label className="text-[10px] font-black text-muted uppercase tracking-widest mb-4 block">New Inventory Level</label>
                                <Input
                                    type="number"
                                    registration={register('current_stock' as any)}
                                    error={errors.current_stock?.message as string}
                                    placeholder="0"
                                    className="text-4xl font-black bg-transparent border-none p-0 focus:ring-0 h-auto text-main"
                                />
                            </div>
                            <div className="hidden md:flex items-center justify-center w-16 h-16 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 shrink-0">
                                <ArrowRight className="text-secondary" size={28} />
                            </div>
                            <div className="flex-1 text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Registry Unit</p>
                                <p className="text-3xl font-black text-primary dark:text-white uppercase tracking-tight">
                                    {(initialItem?.unit || items?.data?.find((i: any) => i.id === selectedItemId)?.unit || 'Units')}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.section>
            )}

            <div className="pt-8 text-center">
                <Button
                    type="submit"
                    disabled={isSubmitting || !selectedItemId}
                    className="w-full py-4 text-xs tracking-[0.25em]"
                    rounded="xl"
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin h-6 w-6" />
                    ) : (
                        <span>Execute Adjustment</span>
                    )}
                </Button>
                <p className="text-[9px] text-muted text-center mt-6 uppercase font-bold tracking-widest italic">This action will override the current stock balance in the master registry.</p>
            </div>
        </form>
    );
};

export default StockAdjustmentForm;
