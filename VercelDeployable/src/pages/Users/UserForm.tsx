import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, Select } from '../../components/Shared/Form';
import Button from '../../components/UI/Button';
import { Loader2, Key, User as UserIcon, Shield, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCreateUserMutation } from '../../features/api/apiSlice';
import { toast } from 'react-toastify';

interface UserFormProps {
    onSuccess: () => void;
}

const userSchema = yup.object({
    username: yup.string().min(3, 'Username too short').required('Username is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    full_name: yup.string().required('Full name is required'),
    phone_number: yup.string().optional().nullable(),
    role: yup.string().oneOf(['admin', 'manager', 'user']).required('Role is required'),
    active: yup.boolean().default(true),
    two_factor_enabled: yup.boolean().default(false),
    two_factor_required: yup.boolean().default(false),
    // password: yup.string().min(8, 'Password must be at least 8 characters').required('Initial password is required'),
}).required();

type UserFormData = yup.InferType<typeof userSchema>;

const UserForm: React.FC<UserFormProps> = ({ onSuccess }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<UserFormData>({
        resolver: yupResolver(userSchema) as any,
        defaultValues: {
            active: true,
            role: 'user',
            two_factor_enabled: false,
            two_factor_required: false
        }
    });

    const [createUser, { isLoading: isSubmitting }] = useCreateUserMutation();

    const onSubmit = async (data: UserFormData) => {
        try {
            await createUser(data).unwrap();
            toast.success('User account created successfully');
            onSuccess();
        } catch (error: any) {
            console.error(error);
            const message = error.data?.detail || error.data?.message || 'Failed to create user profile';
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
            {/* Identity Section */}
            <section>
                {sectionHeader(<UserIcon size={14} className="text-primary" />, "Identity & Access")}
                <div className="space-y-4">
                    <Input
                        label="Account Username"
                        registration={register('username')}
                        error={errors.username?.message}
                        required
                        placeholder="e.g. jsmith"
                        tooltip="Unique Login ID. Cannot be changed later."
                    />
                    <Input
                        label="Full Display Name"
                        registration={register('full_name')}
                        error={errors.full_name?.message}
                        required
                        placeholder="John Smith"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Email Address"
                            type="email"
                            registration={register('email')}
                            error={errors.email?.message}
                            required
                            placeholder="john@bluestar.com"
                        />
                        <Input
                            label="Phone Number"
                            registration={register('phone_number')}
                            error={errors.phone_number?.message}
                            placeholder="Optional contact"
                        />
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section>
                {sectionHeader(<Lock size={14} className="text-secondary" />, "Security Configuration")}
                <div className="space-y-4">
                    {/* 
                    <Input
                        label="Initial Password"
                        type="password"
                        registration={register('password' as any)}
                        error={(errors as any).password?.message}
                        required
                        placeholder="••••••••"
                        tooltip="Temporary password. User will be asked to change it upon login."
                    /> 
                    */}
                    <Select
                        label="User Role / Permissions"
                        registration={register('role')}
                        error={errors.role?.message}
                        required
                        options={[
                            { value: 'admin', label: 'Administrator' },
                            { value: 'manager', label: 'Operations Manager' },
                            { value: 'user', label: 'Standard User (View Only)' },
                        ]}
                        tooltip="Admin: Full System access. Manager: Functional access. User: View permissions."
                    />
                </div>
            </section>

            {/* Policy Section */}
            <section>
                {sectionHeader(<Shield size={14} className="text-indigo-500" />, "Account Policies")}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Active Account</p>
                            <p className="text-[10px] text-gray-500 uppercase">Allow user to log in immediately</p>
                        </div>
                        <input
                            type="checkbox"
                            {...register('active')}
                            className="h-5 w-5 rounded-lg border-gray-300 dark:border-slate-700 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-4">
                        <div>
                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">MFA Required</p>
                            <p className="text-[10px] text-gray-500 uppercase">Enforce 2FA for this user</p>
                        </div>
                        <input
                            type="checkbox"
                            {...register('two_factor_required')}
                            className="h-5 w-5 rounded-lg border-gray-300 dark:border-slate-700 text-indigo-500 focus:ring-indigo-500/20 transition-all cursor-pointer"
                        />
                    </div>
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
                        <span>Register Staff Account</span>
                    )}
                </Button>
            </div>
        </form>
    );
};

export default UserForm;
