import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useChangePasswordMutation } from '../features/api/apiSlice';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import Logo from '../components/UI/Logo';

const changePasswordSchema = yup.object({
    current_password: yup.string().required('Current password is required'),
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

export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [changePassword, { isLoading }] = useChangePasswordMutation();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ChangePasswordFormData>({
        resolver: yupResolver(changePasswordSchema)
    });

    const onSubmit = async (data: ChangePasswordFormData) => {
        try {
            const response = await changePassword({
                current_password: data.current_password,
                new_password: data.new_password
            }).unwrap();

            toast.success('Password changed successfully');

            // If there's a token in the response, update credentials
            if (response.access_token || response.token) {
                const token = response.access_token || response.token;
                const user = response.user || { username: sessionStorage.getItem('temp_username') };

                dispatch(setCredentials({ user, token }));

                // Clear temporary session data
                sessionStorage.removeItem('temp_user_id');
                sessionStorage.removeItem('temp_username');

                navigate('/dashboard');
            } else {
                // If no token, redirect to login
                navigate('/login');
            }
        } catch (error: any) {
            console.error('Failed to change password:', error);
            const message = error.data?.detail || 'Failed to change password';
            toast.error(message);
        }
    };

    return (
        <div className="h-screen w-full flex flex-col bg-white dark:bg-[#050b18] transition-colors duration-500 overflow-hidden select-none font-sans">
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <div className="backdrop-blur-3xl bg-white/80 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl">
                        {/* Logo */}
                        <div className="flex justify-center mb-8">
                            <Logo variant="compact" className="scale-90" />
                        </div>

                        {/* Header */}
                        <header className="mb-8 text-center">
                            <h2 className="text-2xl font-heading font-black text-primary dark:text-white mb-2 uppercase tracking-tight">
                                Change Password
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Please create a strong new password
                            </p>
                        </header>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Current Password */}
                            <div className="relative group/input">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within/input:text-primary transition-colors" />
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    {...register('current_password')}
                                    placeholder="Current Password"
                                    className={`w-full bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border ${errors.current_password
                                            ? 'border-red-300 dark:border-red-500/50'
                                            : 'border-gray-200 dark:border-slate-700'
                                        } rounded-xl py-3.5 pl-11 pr-11 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/30 transition-all font-sans`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                {errors.current_password && (
                                    <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.current_password.message}</p>
                                )}
                            </div>

                            {/* New Password */}
                            <div className="relative group/input">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within/input:text-primary transition-colors" />
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    {...register('new_password')}
                                    placeholder="New Password"
                                    className={`w-full bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border ${errors.new_password
                                            ? 'border-red-300 dark:border-red-500/50'
                                            : 'border-gray-200 dark:border-slate-700'
                                        } rounded-xl py-3.5 pl-11 pr-11 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/30 transition-all font-sans`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                {errors.new_password && (
                                    <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.new_password.message}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="relative group/input">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within/input:text-primary transition-colors" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    {...register('confirm_password')}
                                    placeholder="Confirm New Password"
                                    className={`w-full bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border ${errors.confirm_password
                                            ? 'border-red-300 dark:border-red-500/50'
                                            : 'border-gray-200 dark:border-slate-700'
                                        } rounded-xl py-3.5 pl-11 pr-11 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/30 transition-all font-sans`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                {errors.confirm_password && (
                                    <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.confirm_password.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isLoading}
                                type="submit"
                                className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-secondary p-4 transition-all shadow-lg shadow-primary/10 mt-6"
                            >
                                <div className="relative flex items-center justify-center gap-2 text-white font-heading font-bold text-sm tracking-wider uppercase">
                                    {isLoading ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                    ) : (
                                        <>
                                            <span>Change Password</span>
                                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </div>
                            </motion.button>
                        </form>

                        {/* Footer */}
                        <footer className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-800 text-center">
                            <button
                                onClick={() => navigate('/login')}
                                className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
                            >
                                ← Back to Login
                            </button>
                        </footer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
