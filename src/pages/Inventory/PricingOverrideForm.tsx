import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, Select } from '../../components/Shared/Form';
import Button from '../../components/UI/Button';
import { Loader2, DollarSign, MapPin, Users, Package } from 'lucide-react';
import { useSetPriceOverrideMutation, useGetPartiesQuery, useGetItemsQuery } from '../../features/api/apiSlice';
import { toast } from 'react-toastify';

interface PricingOverrideFormProps {
    onSuccess: () => void;
    initialItem?: any;
}

const overrideSchema = yup.object({
    item_id: yup.number().required('Item is required'),
    party_id: yup.number().required('Customer is required'),
    rate: yup.number().min(0, 'Rate must be positive').required('Rate is required'),
    location: yup.string().default('default'),
}).required();

type OverrideFormData = yup.InferType<typeof overrideSchema>;

const PricingOverrideForm: React.FC<PricingOverrideFormProps> = ({ onSuccess, initialItem }) => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm<OverrideFormData>({
        resolver: yupResolver(overrideSchema) as any,
        defaultValues: {
            item_id: initialItem?.id,
            location: 'default'
        }
    });

    const [setOverride, { isLoading: isSubmitting }] = useSetPriceOverrideMutation();
    const { data: parties } = useGetPartiesQuery({ type: 'customer' });
    const { data: items } = useGetItemsQuery({});

    const onSubmit = async (data: OverrideFormData) => {
        try {
            await setOverride(data).unwrap();
            toast.success('Special pricing rule applied successfully');
            onSuccess();
        } catch (error: any) {
            toast.error(error.data?.detail || 'Failed to set pricing rule');
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
                {sectionHeader(<DollarSign size={14} className="text-emerald-500" />, "Price Configuration")}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <Select
                            label="Target Inventory Item"
                            registration={register('item_id')}
                            error={errors.item_id?.message}
                            required
                            options={items?.data?.map((i: any) => ({ value: i.id, label: `${i.name} (${i.code})` })) || []}
                            disabled={!!initialItem}
                        />
                        <Select
                            label="Customer / Client"
                            registration={register('party_id')}
                            error={errors.party_id?.message}
                            required
                            options={parties?.data?.map((p: any) => ({ value: p.id, label: p.name })) || []}
                            placeholder="Select Customer..."
                        />
                    </div>
                </div>
            </section>

            <section>
                {sectionHeader(<MapPin size={14} className="text-secondary" />, "Rule Specifics")}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                    <Input
                        label="Special Rate (₹)"
                        type="number"
                        registration={register('rate')}
                        error={errors.rate?.message}
                        required
                        placeholder="0.00"
                        tooltip="This price will override the base price for this customer."
                    />
                    <Input
                        label="Location Scope (Optional)"
                        registration={register('location')}
                        error={errors.location?.message}
                        placeholder="e.g. Mumbai, 'default'"
                        tooltip="Enter a specific location/route name or keep 'default' for all locations."
                    />
                </div>
            </section>

            <div className="pt-4">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    rounded="xl"
                    className="w-full py-4 text-xs tracking-widest"
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                        <span>Apply Pricing Rule</span>
                    )}
                </Button>
            </div>
        </form>
    );
};

export default PricingOverrideForm;
