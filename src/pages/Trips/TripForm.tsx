import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, Select } from '../../components/Shared/Form';
import Button from '../../components/UI/Button';
import {
    Loader2,
    Navigation,
    Truck,
    User,
    Calendar,
    Activity,
    MapPin,
    DollarSign,
    ArrowRight,
    Save
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    useCreateTripMutation,
    useUpdateTripMutation,
    useGetVehiclesQuery,
    useGetDriversQuery,
    useGetPartiesQuery
} from '../../features/api/apiSlice';
import { toast } from 'react-toastify';

interface TripFormProps {
    onSuccess: () => void;
    trip?: any;
}

const tripSchema = yup.object({
    trip_number: yup.string().optional().nullable(),
    vehicle_id: yup.number().required('Vehicle is required'),
    driver_id: yup.number().required('Driver is required'),
    source_location: yup.string().required('Source is required'),
    destination_location: yup.string().required('Destination is required'),
    start_date: yup.string().optional().default(() => new Date().toISOString().slice(0, 16)),
    status: yup.string().oneOf(['planned', 'in_transit', 'completed', 'cancelled']).default('planned'),
    supplier_party_id: yup.number().transform((val) => (isNaN(val) ? null : val)).nullable().optional(),
    customer_party_id: yup.number().transform((val) => (isNaN(val) ? null : val)).nullable().optional(),
    start_km: yup.number().transform((val) => (isNaN(val) ? 0 : val)).optional(),
    freight_income: yup.number().transform((val) => (isNaN(val) ? 0 : val)).default(0),
    market_truck_cost: yup.number().transform((val) => (isNaN(val) ? 0 : val)).default(0),
    driver_allowance: yup.number().transform((val) => (isNaN(val) ? 0 : val)).default(0),
    notes: yup.string().optional().nullable(),
}).required();

type TripFormData = yup.InferType<typeof tripSchema>;

const TripForm: React.FC<TripFormProps> = ({ onSuccess, trip }) => {
    const defaultValues = trip ? {
        top_number: trip.trip_number,
        vehicle_id: trip.vehicle_id,
        driver_id: trip.driver_id,
        source_location: trip.source_location,
        destination_location: trip.destination_location,
        start_date: trip.start_date ? new Date(trip.start_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        status: trip.status,
        supplier_party_id: trip.supplier_party_id,
        customer_party_id: trip.customer_party_id,
        start_km: trip.start_km,
        freight_income: trip.freight_income,
        market_truck_cost: trip.market_truck_cost,
        driver_allowance: trip.driver_allowance,
        notes: trip.notes || ''
    } : {
        status: 'planned',
        start_date: new Date().toISOString().slice(0, 16),
        freight_income: 0,
        market_truck_cost: 0,
        driver_allowance: 0
    };

    const { register, handleSubmit, formState: { errors }, reset } = useForm<TripFormData>({
        resolver: yupResolver(tripSchema) as any,
        defaultValues: defaultValues as any
    });

    // Reset form when trip prop changes (e.g., opening edit mode for different trip)
    useEffect(() => {
        if (trip) {
            reset({
                ...trip,
                start_date: trip.start_date ? new Date(trip.start_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                supplier_party_id: trip.supplier_party_id || null, // handle nulls for selects
                customer_party_id: trip.customer_party_id || null
            });
        }
    }, [trip, reset]);

    const [createTrip, { isLoading: isCreating }] = useCreateTripMutation();
    const [updateTrip, { isLoading: isUpdating }] = useUpdateTripMutation();

    // Fetch dependencies
    const { data: vehicles } = useGetVehiclesQuery({ status: 'available' });
    const { data: drivers } = useGetDriversQuery({ status: 'active' });
    const { data: suppliers } = useGetPartiesQuery({ type: 'supplier' });
    const { data: customers } = useGetPartiesQuery({ type: 'customer' });

    // For update mode, we might want to include the current vehicle/driver in the options even if not 'available'/'active' 
    // to avoid validation errors if they are already assigned to this trip.
    // However, the simplistic approach is to just use the lists. 
    // If the current vehicle is not in the list (because it's busy with THIS trip), the Select might show empty or ID.
    // Ideally we merge the current trip's vehicle/driver into the options.

    const vehicleOptions = vehicles?.data?.map((v: any) => ({ value: v.id, label: v.vehicle_number })) || [];
    if (trip && trip.vehicle && !vehicleOptions.find((v: any) => v.value === trip.vehicle_id)) {
        vehicleOptions.push({ value: trip.vehicle_id, label: trip.vehicle?.vehicle_number || `Unit ${trip.vehicle_id}` });
    }

    const driverOptions = drivers?.data?.map((d: any) => ({ value: d.id, label: d.name })) || [];
    if (trip && trip.driver && !driverOptions.find((d: any) => d.value === trip.driver_id)) {
        driverOptions.push({ value: trip.driver_id, label: trip.driver?.name || `Driver ${trip.driver_id}` });
    }

    const isSubmitting = isCreating || isUpdating;

    const onSubmit = async (data: TripFormData) => {
        try {
            if (trip) {
                await updateTrip({ tripId: trip.id, tripData: data }).unwrap();
                toast.success('Logistics mission updated successfully');
            } else {
                await createTrip(data).unwrap();
                toast.success('New trip initialized in registry');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.data?.detail || `Failed to ${trip ? 'update' : 'initialize'} trip`);
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
            {/* Deployment Section */}
            <section>
                {sectionHeader(<Truck size={14} className="text-primary" />, "Deployment Logistics")}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Trip ID / Number"
                            registration={register('trip_number')}
                            error={errors.trip_number?.message}
                            placeholder="Auto-generated if blank"
                            tooltip="Optional: Manual Trip number / Ref. Backend will auto-generate if left blank."
                        />
                        <Input
                            label={trip ? "Update Launch Time" : "Initial Launch (Date/Time)"}
                            type="datetime-local"
                            registration={register('start_date')}
                            error={errors.start_date?.message}
                            required
                            tooltip="Scheduled date and time for the trip to begin."
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                            label="Vehicle Unit"
                            registration={register('vehicle_id' as any)}
                            error={errors.vehicle_id?.message}
                            required
                            options={vehicleOptions}
                            tooltip="Select an available vehicle from the fleet for this trip."
                        />
                        <Select
                            label="Assigned Pilot (Driver)"
                            registration={register('driver_id' as any)}
                            error={errors.driver_id?.message}
                            required
                            options={driverOptions}
                            tooltip="Assign an active driver to this trip."
                        />
                    </div>
                </div>
            </section>

            {/* Path Section */}
            <section>
                {sectionHeader(<Navigation size={14} className="text-secondary" />, "Route Orientation")}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Source Orientation"
                            registration={register('source_location')}
                            error={errors.source_location?.message}
                            required
                            placeholder="Loading Point City"
                            tooltip="Location where the shipment will be loaded."
                        />
                        <Input
                            label="Destination Orientation"
                            registration={register('destination_location')}
                            error={errors.destination_location?.message}
                            required
                            placeholder="Unloading Point City"
                            tooltip="Final destination for the shipment."
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                            label="Pickup Supplier"
                            registration={register('supplier_party_id' as any)}
                            error={errors.supplier_party_id?.message}
                            options={suppliers?.data?.map((p: any) => ({ value: p.id, label: p.name })) || []}
                            placeholder="Optional: Direct Pickup"
                            tooltip="If picking up directly from a supplier (Direct Delivery)."
                        />
                        <Select
                            label="Dropoff Client"
                            registration={register('customer_party_id' as any)}
                            error={errors.customer_party_id?.message}
                            options={customers?.data?.map((p: any) => ({ value: p.id, label: p.name })) || []}
                            placeholder="Optional: Direct Delivery"
                            tooltip="If delivering directly to a customer."
                        />
                    </div>
                </div>
            </section>

            {/* Financials Section */}
            <section>
                {sectionHeader(<DollarSign size={14} className="text-primary" />, "Financial Projections")}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input
                            label="Freight Income"
                            type="number"
                            registration={register('freight_income')}
                            error={errors.freight_income?.message}
                            placeholder="0.00"
                            tooltip="Total expected revenue for this trip."
                        />
                        <Input
                            label="Market Truck Cost"
                            type="number"
                            registration={register('market_truck_cost')}
                            error={errors.market_truck_cost?.message}
                            placeholder="0.00"
                        />
                        <Input
                            label="Driver Allowance"
                            type="number"
                            registration={register('driver_allowance')}
                            error={errors.driver_allowance?.message}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                        <Input
                            label="Opening KM Meter Reading"
                            type="number"
                            registration={register('start_km')}
                            error={errors.start_km?.message}
                            placeholder="Current odometer reading"
                        />
                    </div>
                </div>
            </section>

            <section>
                {sectionHeader(<Activity size={14} className="text-secondary" />, "Mission Status")}
                <div className="space-y-4">
                    <Select
                        label="Current Trip Status"
                        registration={register('status')}
                        error={errors.status?.message}
                        options={[
                            { value: 'planned', label: 'Mission Planned' },
                            { value: 'in_transit', label: 'Active / In-Transit' },
                            { value: 'completed', label: 'Successfully Terminated' },
                            { value: 'cancelled', label: 'Aborted / Cancelled' },
                        ]}
                        tooltip="Update the current phase of the logistics mission."
                    />
                    <div className="flex flex-col space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Trip Notes / Instructions</label>
                        <textarea
                            {...register('notes')}
                            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] dark:text-gray-100"
                            placeholder="Any routing instructions or cargo notes..."
                        />
                    </div>
                </div>
            </section>

            <div className="pt-4">
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
                            {trip ? <Save size={18} /> : <span>Initialize Logistics Mission</span>}
                            {trip ? <span>Update Mission Data</span> : <ArrowRight size={18} />}
                        </div>
                    )}
                </Button>
            </div>
        </form>
    );
};


export default TripForm;
