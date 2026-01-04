import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, Eye, EyeOff, X } from 'lucide-react';
import { useChangePasswordMutation } from '../features/api/apiSlice';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { toast } from 'react-toastify';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
    isRequired?: boolean; // If true, modal cannot be closed
}

const changePasswordSchema = yup.object({
    old_password: yup.string().required('Current password is required'),
    new_password: yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .required('New password is required'),
    confirm_password: yup.string()
        .oneOf([yup.ref('new_password')], 'Passwords must match')
        .required('Please confirm your password'),
}).required();

type ChangePasswordFormData = yup.InferType<typeof changePasswordSchema>;

export default function ChangePasswordModal({ isOpen, onClose, username, isRequired = false }: ChangePasswordModalProps) {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [changePassword, { isLoading }] = useChangePasswordMutation();
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangePasswordFormData>({
        resolver: yupResolver(changePasswordSchema)
    });

    const handleClose = () => {
        if (!isRequired) {
            reset();
            onClose();
        }
    };

    const onSubmit = async (data: ChangePasswordFormData) => {
        try {
            const response = await changePassword({
                username: username,
                old_password: data.old_password,
                new_password: data.new_password
            }).unwrap();

            toast.success('Password changed successfully');

            // If there's a token in the response, update credentials
            if (response.access_token || response.token) {
                const token = response.access_token || response.token;
                const user = response.user || { username };

                dispatch(setCredentials({ user, token }));

                // Clear temporary session data
                sessionStorage.removeItem('temp_user_id');
                sessionStorage.removeItem('temp_username');

                reset();
                onClose();

                if (isRequired) {
                    navigate('/dashboard');
                }
            } else {
                reset();
                onClose();
            }
        } catch (error: any) {
            console.error('Failed to change password:', error);
            const message = error.data?.detail || 'Failed to change password';
            toast.error(message);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="relative px-6 py-4 border-b border-gray-200 dark:border-slate-800 bg-gradient-to-r from-primary/10 to-transparent dark:from-accent/10">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {isRequired ? 'Password Change Required' : 'Change Password'}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {isRequired
                                        ? 'Please create a strong new password to continue'
                                        : 'Update your account password'}
                                </p>
                                {!isRequired && (
                                    <button
                                        onClick={handleClose}
                                        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                                        Current Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type={showOldPassword ? 'text' : 'password'}
                                            {...register('old_password')}
                                            placeholder="Enter current password"
                                            className={`w-full bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border ${errors.old_password
                                                ? 'border-red-300 dark:border-red-500/50'
                                                : 'border-gray-200 dark:border-slate-700'
                                                } rounded-xl py-2.5 pl-10 pr-10 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/30 transition-all`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.old_password && (
                                        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.old_password.message}</p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                                        New Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            {...register('new_password')}
                                            placeholder="Enter new password"
                                            className={`w-full bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border ${errors.new_password
                                                ? 'border-red-300 dark:border-red-500/50'
                                                : 'border-gray-200 dark:border-slate-700'
                                                } rounded-xl py-2.5 pl-10 pr-10 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/30 transition-all`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.new_password && (
                                        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.new_password.message}</p>
                                    )}
                                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                        Must be 8+ characters with uppercase, lowercase, and number
                                    </p>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                                        Confirm New Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            {...register('confirm_password')}
                                            placeholder="Confirm new password"
                                            className={`w-full bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border ${errors.confirm_password
                                                ? 'border-red-300 dark:border-red-500/50'
                                                : 'border-gray-200 dark:border-slate-700'
                                                } rounded-xl py-2.5 pl-10 pr-10 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/30 transition-all`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.confirm_password && (
                                        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.confirm_password.message}</p>
                                    )}
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4">
                                    {!isRequired && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="button"
                                            onClick={handleClose}
                                            className="flex-1 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 bg-gray-100/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 transition-all"
                                        >
                                            Cancel
                                        </motion.button>
                                    )}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className={`${!isRequired ? 'flex-[1.5]' : 'w-full'} flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isLoading ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                        ) : (
                                            <>
                                                <span>Update Password</span>
                                                <ArrowRight size={14} />
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
