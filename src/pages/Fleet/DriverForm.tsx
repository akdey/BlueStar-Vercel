import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, Select } from '../../components/Shared/Form';
import { Loader2, User, Phone, FileText, Calendar, Activity, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCreateDriverMutation, useUpdateDriverMutation } from '../../features/api/apiSlice';
import { toast } from 'react-toastify';

interface DriverFormProps {
    onSuccess: () => void;
    driver?: any;
}

const driverSchema = yup.object({
    name: yup.string().required('Driver Name is required'),
    phone: yup.string().matches(/^\d{10}$/, 'Phone must be exactly 10 digits').required('Phone is required'),
    license_number: yup.string().optional().nullable(),
    license_expiry: yup.string().optional().nullable(),
    address: yup.string().optional().nullable(),
    status: yup.string().oneOf(['active', 'on_trip', 'on_leave', 'resigned']).default('active'),
    notes: yup.string().optional().nullable(),
}).required();

type DriverFormData = yup.InferType<typeof driverSchema>;

const DriverForm: React.FC<DriverFormProps> = ({ onSuccess, driver }) => {
    const isEdit = !!driver;
    const { register, handleSubmit, reset, formState: { errors } } = useForm<DriverFormData>({
        resolver: yupResolver(driverSchema) as any,
        defaultValues: {
            status: 'active'
        }
    });

    useEffect(() => {
        if (driver) {
            reset(driver);
        }
    }, [driver, reset]);

    const [createDriver, { isLoading: isCreating }] = useCreateDriverMutation();
    const [updateDriver, { isLoading: isUpdating }] = useUpdateDriverMutation();
    const isSubmitting = isCreating || isUpdating;

    const onSubmit = async (data: DriverFormData) => {
        try {
            if (isEdit) {
                await updateDriver({ driverId: driver.id, driverData: data }).unwrap();
                toast.success('Driver profile updated');
            } else {
                await createDriver(data).unwrap();
                toast.success('Driver registered successfully');
            }
            onSuccess();
        } catch (error: any) {
            console.error(error);
            const message = error.data?.detail || error.data?.message || 'Failed to save driver';
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
                {sectionHeader(<User size={14} className="text-primary" />, "Personal Identity")}
                <div className="space-y-4">
                    <Input
                        label="Driver Full Name"
                        registration={register('name')}
                        error={errors.name?.message}
                        required
                        placeholder="e.g. Rahul Sharma"
                    />
                    <Input
                        label="Contact Number"
                        registration={register('phone')}
                        error={errors.phone?.message}
                        required
                        placeholder="10 digit mobile number"
                    />
                </div>
            </section>

            <section>
                {sectionHeader(<FileText size={14} className="text-secondary" />, "Licensing & Compliance")}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="Driving License No."
                        registration={register('license_number')}
                        error={errors.license_number?.message}
                        placeholder="DL-XXXXXXXXXXXX"
                    />
                    <Input
                        label="License Expiry"
                        type="date"
                        registration={register('license_expiry')}
                        error={errors.license_expiry?.message}
                    />
                </div>
            </section>

            <section>
                {sectionHeader(<MapPin size={14} className="text-primary" />, "Location & Additional Info")}
                <div className="space-y-4">
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Permanent Address</label>
                        <textarea
                            {...register('address')}
                            className="flex min-h-[80px] w-full rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-gray-100"
                            placeholder="Full residential address..."
                        />
                        {errors.address?.message && <span className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{errors.address.message}</span>}
                    </div>
                    <Select
                        label="Current Driver Status"
                        registration={register('status')}
                        error={errors.status?.message}
                        options={[
                            { value: 'active', label: 'Active - Ready' },
                            { value: 'on_trip', label: 'On Trip' },
                            { value: 'on_leave', label: 'On Leave' },
                            { value: 'resigned', label: 'Resigned' },
                        ]}
                    />
                </div>
            </section>

            <section>
                {sectionHeader(<Activity size={14} className="text-secondary" />, "Internal Notes")}
                <Input
                    label="Notes / Remarks"
                    registration={register('notes')}
                    error={errors.notes?.message}
                    placeholder="Medical history, performance notes, etc."
                />
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
                        <span>{isEdit ? 'Update Driver Profile' : 'Register New Driver'}</span>
                    )}
                </motion.button>
            </div>
        </form>
    );
};

export default DriverForm;
