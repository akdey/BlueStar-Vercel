import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, Select } from '../../components/Shared/Form';
import Button from '../../components/UI/Button';
import { Loader2, User, Phone, Mail, MapPin, CreditCard, FileText, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCreatePartyMutation, useUpdatePartyMutation } from '../../features/api/apiSlice';
import { toast } from 'react-toastify';

interface PartyFormProps {
    onSuccess: () => void;
    party?: any; // If provided, the form acts in 'edit' mode
}

const partySchema = yup.object({
    name: yup.string().min(2, 'Name too short').max(150, 'Name too long').required('Party Name is required'),
    party_type: yup.string().oneOf(['customer', 'supplier', 'carrier', 'both']).required('Party Type is required'),

    contact_person: yup.string().optional().nullable(),
    email: yup.string().email('Invalid email').optional().nullable(),
    phone: yup.string().matches(/^\d{10}$/, 'Phone must be exactly 10 digits').optional().nullable(),
    mobile: yup.string().matches(/^\d{10}$/, 'Mobile must be exactly 10 digits').optional().nullable(),
    whatsapp: yup.string().optional().nullable(),

    address_line_1: yup.string().optional().nullable(),
    address_line_2: yup.string().optional().nullable(),
    city: yup.string().optional().nullable(),
    state: yup.string().optional().nullable(),
    country: yup.string().default('India').optional().nullable(),
    pincode: yup.string().optional().nullable(),

    gstin: yup.string().matches(/^[0-9A-Z]{15}$/, 'Invalid GSTIN format (15 characters, alphanumeric)').optional().nullable(),
    pan_no: yup.string().max(10, 'PAN must be 10 characters').optional().nullable(),

    credit_limit: yup.number().transform((value) => (isNaN(value) ? 0 : value)).default(0).optional(),
    payment_terms_days: yup.number().transform((value) => (isNaN(value) ? 0 : value)).default(0).optional(),

    status: yup.string().oneOf(['active', 'inactive', 'blacklisted']).default('active'),
    notes: yup.string().optional().nullable(),
    website: yup.string().url('Invalid URL format').optional().nullable(),
}).required();

type PartyFormData = yup.InferType<typeof partySchema>;

const PartyForm: React.FC<PartyFormProps> = ({ onSuccess, party }) => {
    const isEdit = !!party;
    const { register, handleSubmit, reset, formState: { errors } } = useForm<PartyFormData>({
        resolver: yupResolver(partySchema) as any,
        defaultValues: {
            credit_limit: 0,
            payment_terms_days: 0,
            status: 'active',
            country: 'India'
        }
    });

    useEffect(() => {
        if (party) {
            reset(party);
        }
    }, [party, reset]);

    const [createParty, { isLoading: isCreating }] = useCreatePartyMutation();
    const [updateParty, { isLoading: isUpdating }] = useUpdatePartyMutation();
    const isSubmitting = isCreating || isUpdating;

    const onSubmit = async (data: PartyFormData) => {
        try {
            if (isEdit) {
                await updateParty({ partyId: party.id, partyData: data }).unwrap();
                toast.success('Party updated successfully');
            } else {
                await createParty(data).unwrap();
                toast.success('Party created successfully');
            }
            onSuccess();
        } catch (error: any) {
            console.error(error);
            const message = error.data?.detail || error.data?.message || 'Failed to save party';
            toast.error(message);
        }
    };

    const sectionHeader = (icon: any, title: string) => (
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
            {icon}
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{title}</h3>
        </div>
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-6">
            {/* Basic Info */}
            <section>
                {sectionHeader(<User size={14} className="text-primary" />, "Identity & Type")}
                <div className="space-y-4">
                    <Input
                        label="Business / Party Name"
                        registration={register('name')}
                        error={errors.name?.message}
                        required
                        placeholder="e.g. Acme Logistics"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                            label="Party Type"
                            registration={register('party_type')}
                            error={errors.party_type?.message}
                            required
                            options={[
                                { value: 'customer', label: 'Customer' },
                                { value: 'supplier', label: 'Supplier' },
                                { value: 'carrier', label: 'Carrier' },
                                { value: 'both', label: 'Both' },
                            ]}
                            placeholder="Select Type"
                        />
                        <Select
                            label="Status"
                            registration={register('status')}
                            error={errors.status?.message}
                            options={[
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                                { value: 'blacklisted', label: 'Blacklisted' },
                            ]}
                        />
                    </div>
                </div>
            </section>

            {/* Contact Details */}
            <section>
                {sectionHeader(<Phone size={14} className="text-secondary" />, "Contact Information")}
                <div className="space-y-4">
                    <Input
                        label="Contact Person"
                        registration={register('contact_person')}
                        error={errors.contact_person?.message}
                        placeholder="Point of contact name"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Mobile Number"
                            registration={register('mobile')}
                            error={errors.mobile?.message}
                            placeholder="10 digit mobile"
                        />
                        <Input
                            label="Phone / Office"
                            registration={register('phone')}
                            error={errors.phone?.message}
                            placeholder="10 digit phone"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="WhatsApp"
                            registration={register('whatsapp')}
                            error={errors.whatsapp?.message}
                            placeholder="WhatsApp number"
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            registration={register('email')}
                            error={errors.email?.message}
                            placeholder="email@example.com"
                        />
                    </div>
                </div>
            </section>

            {/* Address Information */}
            <section>
                {sectionHeader(<MapPin size={14} className="text-blue-500" />, "Address Details")}
                <div className="space-y-4">
                    <Input
                        label="Address Line 1"
                        registration={register('address_line_1')}
                        error={errors.address_line_1?.message}
                        placeholder="Street, Area, Building"
                    />
                    <Input
                        label="Address Line 2"
                        registration={register('address_line_2')}
                        error={errors.address_line_2?.message}
                        placeholder="Landmark, Local Area"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="City"
                            registration={register('city')}
                            error={errors.city?.message}
                            placeholder="City"
                        />
                        <Input
                            label="State"
                            registration={register('state')}
                            error={errors.state?.message}
                            placeholder="State"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Pincode"
                            registration={register('pincode')}
                            error={errors.pincode?.message}
                            placeholder="Pincode"
                        />
                        <Input
                            label="Country"
                            registration={register('country')}
                            error={errors.country?.message}
                            placeholder="India"
                        />
                    </div>
                </div>
            </section>

            {/* Financial & Identifiers */}
            <section>
                {sectionHeader(<CreditCard size={14} className="text-orange-500" />, "Financials & Tax")}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="GSTIN"
                            registration={register('gstin')}
                            error={errors.gstin?.message}
                            placeholder="15 char GST number"
                        />
                        <Input
                            label="PAN Number"
                            registration={register('pan_no')}
                            error={errors.pan_no?.message}
                            placeholder="10 char PAN"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Credit Limit (₹)"
                            type="number"
                            registration={register('credit_limit')}
                            error={errors.credit_limit?.message}
                            placeholder="0.00"
                        />
                        <Input
                            label="Payment Terms (Days)"
                            type="number"
                            registration={register('payment_terms_days')}
                            error={errors.payment_terms_days?.message}
                            placeholder="30"
                        />
                    </div>
                </div>
            </section>

            {/* Miscellaneous */}
            <section>
                {sectionHeader(<Globe size={14} className="text-emerald-500" />, "Additional Info")}
                <div className="space-y-4">
                    <Input
                        label="Website"
                        registration={register('website')}
                        error={errors.website?.message}
                        placeholder="https://example.com"
                    />
                    <Input
                        label="Notes"
                        registration={register('notes')}
                        error={errors.notes?.message}
                        placeholder="Any internal notes about this party..."
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
                        <span>{isEdit ? 'Update Party Record' : 'Create New Party'}</span>
                    )}
                </Button>
            </div>
        </form>
    );
};

export default PartyForm;
