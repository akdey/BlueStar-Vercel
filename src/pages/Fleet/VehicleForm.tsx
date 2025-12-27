import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, Select } from '../../components/Shared/Form';
import { Loader2, Truck, User, Calendar, Shield, Activity, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCreateVehicleMutation, useUpdateVehicleMutation } from '../../features/api/apiSlice';
import { toast } from 'react-toastify';

interface VehicleFormProps {
    onSuccess: () => void;
    vehicle?: any;
}

const vehicleSchema = yup.object({
    vehicle_number: yup.string().required('Vehicle Number is required'),
    vehicle_type: yup.string().oneOf(['truck', 'tanker', 'tempo', 'trailer', 'other']).required('Type is required'),
    capacity_ton: yup.number().transform((val) => (isNaN(val) ? 0 : val)).default(0),
    owner_name: yup.string().optional().nullable(),
    is_owned: yup.boolean().default(true),
    rc_expiry: yup.string().optional().nullable(),
    insurance_expiry: yup.string().optional().nullable(),
    fitness_expiry: yup.string().optional().nullable(),
    permit_expiry: yup.string().optional().nullable(),
    current_status: yup.string().oneOf(['available', 'on_trip', 'maintenance', 'inactive']).default('available'),
}).required();

type VehicleFormData = yup.InferType<typeof vehicleSchema>;

const VehicleForm: React.FC<VehicleFormProps> = ({ onSuccess, vehicle }) => {
    const isEdit = !!vehicle;
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<VehicleFormData>({
        resolver: yupResolver(vehicleSchema) as any,
        defaultValues: {
            vehicle_type: 'truck',
            capacity_ton: 0,
            is_owned: true,
            current_status: 'available'
        }
    });

    useEffect(() => {
        if (vehicle) {
            reset(vehicle);
        }
    }, [vehicle, reset]);

    const [createVehicle, { isLoading: isCreating }] = useCreateVehicleMutation();
    const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation();
    const isSubmitting = isCreating || isUpdating;

    const onSubmit = async (data: VehicleFormData) => {
        try {
            if (isEdit) {
                await updateVehicle({ vehicleId: vehicle.id, vehicleData: data }).unwrap();
                toast.success('Vehicle record updated');
            } else {
                await createVehicle(data).unwrap();
                toast.success('Vehicle added to fleet');
            }
            onSuccess();
        } catch (error: any) {
            console.error(error);
            const message = error.data?.detail || error.data?.message || 'Failed to save vehicle';
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
                {sectionHeader(<Truck size={14} className="text-primary" />, "Primary Identity")}
                <div className="space-y-4">
                    <Input
                        label="Vehicle Number (License Plate)"
                        registration={register('vehicle_number')}
                        error={errors.vehicle_number?.message}
                        required
                        placeholder="e.g. MH 12 AB 1234"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                            label="Vehicle Type"
                            registration={register('vehicle_type')}
                            error={errors.vehicle_type?.message}
                            required
                            options={[
                                { value: 'truck', label: 'Truck' },
                                { value: 'tanker', label: 'Tanker' },
                                { value: 'tempo', label: 'Tempo' },
                                { value: 'trailer', label: 'Trailer' },
                                { value: 'other', label: 'Other' },
                            ]}
                        />
                        <Input
                            label="Capacity (Tons)"
                            type="number"
                            step="0.1"
                            registration={register('capacity_ton')}
                            error={errors.capacity_ton?.message}
                            placeholder="0.0"
                        />
                    </div>
                </div>
            </section>

            <section>
                {sectionHeader(<User size={14} className="text-secondary" />, "Ownership Information")}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">BlueStar Owned</p>
                            <p className="text-[10px] text-gray-500 uppercase">Check if this is an internal vehicle</p>
                        </div>
                        <input
                            type="checkbox"
                            {...register('is_owned')}
                            className="h-5 w-5 rounded-lg border-gray-300 dark:border-slate-700 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                        />
                    </div>
                    {!watch('is_owned') && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                        >
                            <Input
                                label="Owner / Vendor Name"
                                registration={register('owner_name')}
                                error={errors.owner_name?.message}
                                placeholder="Name of third-party owner"
                                tooltip="Useful for hired or third-party fleet management."
                            />
                        </motion.div>
                    )}
                </div>
            </section>

            <section>
                {sectionHeader(<Shield size={14} className="text-primary" />, "Compliance & Expiries")}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="RC Expiry"
                        type="date"
                        registration={register('rc_expiry')}
                        error={errors.rc_expiry?.message}
                    />
                    <Input
                        label="Insurance Expiry"
                        type="date"
                        registration={register('insurance_expiry')}
                        error={errors.insurance_expiry?.message}
                    />
                    <Input
                        label="Fitness Expiry"
                        type="date"
                        registration={register('fitness_expiry')}
                        error={errors.fitness_expiry?.message}
                    />
                    <Input
                        label="Permit Expiry"
                        type="date"
                        registration={register('permit_expiry')}
                        error={errors.permit_expiry?.message}
                    />
                </div>
            </section>

            <section>
                {sectionHeader(<Activity size={14} className="text-secondary" />, "Fleet Status")}
                <Select
                    label="Current Status"
                    registration={register('current_status')}
                    error={errors.current_status?.message}
                    options={[
                        { value: 'available', label: 'Available' },
                        { value: 'on_trip', label: 'On Trip' },
                        { value: 'maintenance', label: 'Maintenance' },
                        { value: 'inactive', label: 'Inactive' },
                    ]}
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
                        <span>{isEdit ? 'Update Vehicle Record' : 'Add Vehicle to Fleet'}</span>
                    )}
                </motion.button>
            </div>
        </form>
    );
};

export default VehicleForm;
