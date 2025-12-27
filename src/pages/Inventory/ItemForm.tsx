import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, Select } from '../../components/Shared/Form';
import { Loader2, Package, Tag, IndianRupee, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCreateItemMutation, useUpdateItemMutation } from '../../features/api/apiSlice';
import { toast } from 'react-toastify';

interface ItemFormProps {
    onSuccess: () => void;
    item?: any;
}

const itemSchema = yup.object({
    name: yup.string().required('Product Name is required'),
    code: yup.string().optional().nullable(),
    item_type: yup.string().oneOf(['goods', 'service']).required('Item Type is required'),
    unit: yup.string().required('Unit of Measurement is required'),
    base_price: yup.number().transform((val) => (isNaN(val) ? 0 : val)).min(0, 'Min 0').required('Base price required'),
    tax_rate: yup.number().transform((val) => (isNaN(val) ? 0 : val)).default(0),
    min_stock_level: yup.number().transform((val) => (isNaN(val) ? 0 : val)).default(0),
    current_stock: yup.number().transform((val) => (isNaN(val) ? 0 : val)).default(0),
}).required();

type ItemFormData = yup.InferType<typeof itemSchema>;

const ItemForm: React.FC<ItemFormProps> = ({ onSuccess, item }) => {
    const isEdit = !!item;
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ItemFormData>({
        resolver: yupResolver(itemSchema) as any,
        defaultValues: {
            item_type: 'goods',
            tax_rate: 0,
            current_stock: 0,
            min_stock_level: 0
        }
    });

    useEffect(() => {
        if (item) {
            reset(item);
        }
    }, [item, reset]);

    const [createItem, { isLoading: isCreating }] = useCreateItemMutation();
    const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();
    const isSubmitting = isCreating || isUpdating;

    const onSubmit = async (data: ItemFormData) => {
        try {
            if (isEdit) {
                await updateItem({ itemId: item.id, itemData: data }).unwrap();
                toast.success('Inventory item updated');
            } else {
                await createItem(data).unwrap();
                toast.success('New product registered');
            }
            onSuccess();
        } catch (error: any) {
            console.error(error);
            const message = error.data?.detail || error.data?.message || 'Failed to save item';
            toast.error(message);
        }
    };

    const sectionHeader = (icon: any, title: string) => (
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2 mt-2">
            {icon}
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{title}</h3>
        </div>
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-6 pt-2">
            <section>
                {sectionHeader(<Package size={14} className="text-primary" />, "Identity & Classification")}
                <div className="space-y-4">
                    <Input
                        label="Product Name"
                        registration={register('name')}
                        error={errors.name?.message}
                        required
                        placeholder="e.g. High Speed Diesel"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                            label="Item Type"
                            registration={register('item_type')}
                            error={errors.item_type?.message}
                            required
                            options={[
                                { value: 'goods', label: 'Physical Goods' },
                                { value: 'service', label: 'Service' },
                            ]}
                            tooltip="Goods: Physical items with stock (Cement, Fuel). Service: Intangible charges (Transport Fee, Labour)."
                        />
                        <Input
                            label="Unique SKU (Code)"
                            registration={register('code')}
                            error={errors.code?.message}
                            placeholder="e.g. I-001"
                            tooltip="Unique identification code. System generates I-XXX if empty."
                        />
                    </div>
                </div>
            </section>

            <section>
                {sectionHeader(<IndianRupee size={14} className="text-secondary" />, "Pricing & Compliance")}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                        label="Base Price"
                        type="number"
                        registration={register('base_price')}
                        error={errors.base_price?.message}
                        required
                        placeholder="0.00"
                        tooltip="Standard selling price per unit. Can be overridden for specific customers."
                    />
                    <Input
                        label="Tax Rate (%)"
                        type="number"
                        registration={register('tax_rate')}
                        error={errors.tax_rate?.message}
                        placeholder="18"
                        tooltip="Applicable GST Percentage (0, 5, 12, 18, 28)."
                    />
                    <Input
                        label="Unit"
                        registration={register('unit')}
                        error={errors.unit?.message}
                        required
                        placeholder="e.g. LTR"
                        tooltip="Unit of Measurement (LTR, KG, nos, TRIP)."
                    />
                </div>
            </section>

            <section>
                {sectionHeader(<BarChart size={14} className="text-primary" />, "Inventory Status")}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Current Stock"
                            type="number"
                            registration={register('current_stock')}
                            error={errors.current_stock?.message}
                            placeholder="0"
                            readOnly
                            disabled
                            tooltip="Current quantity in hand. Updates automatically via transactions."
                        />
                        <Input
                            label="Min Stock Level"
                            type="number"
                            registration={register('min_stock_level')}
                            error={errors.min_stock_level?.message}
                            placeholder="10"
                            tooltip="System will alert if stock falls below this number."
                        />
                    </div>
                </div>
            </section>

            <div className="pt-4">
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center py-4 px-4 bg-gradient-to-r from-primary to-secondary rounded-2xl shadow-xl shadow-primary/20 text-xs font-black text-white uppercase tracking-[0.25em] focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                        <span>{isEdit ? 'Update Registry' : 'Complete Registration'}</span>
                    )}
                </motion.button>
            </div>
        </form>
    );
};

export default ItemForm;
