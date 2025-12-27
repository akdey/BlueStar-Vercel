import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Send, Phone, Mail, MapPin } from 'lucide-react';
import SectionWrapper from '../UI/SectionWrapper';
import SpotlightCard from '../UI/SpotlightCard';

const schema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    company: yup.string().required('Company name is required'),
    message: yup.string().min(10, 'Message too short').required('Message is required'),
    channel: yup.string().oneOf(['email', 'phone'], 'Select a preferred channel').required()
});

type FormData = yup.InferType<typeof schema>;

export default function ContactForm() {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: { channel: 'email' }
    });

    const onSubmit = async (data: FormData) => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success('Your quote request has been sent successfully!');
        reset();
    };

    return (
        <SectionWrapper id="contact" className="py-32 bg-card transition-colors">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    {/* Contact Info */}
                    <div className="flex flex-col justify-center">
                        <h2 className="text-4xl md:text-6xl font-heading font-black text-primary dark:text-white mb-8 tracking-tight">Let's Build Your <span className="text-secondary dark:text-accent">Success</span></h2>
                        <p className="text-slate-600 dark:text-slate-400 text-xl mb-12 leading-relaxed">
                            Ready to streamline your transport needs? Our team is standing by to provide a localized, efficient solution.
                        </p>

                        <div className="space-y-10">
                            <ContactInfoItem
                                icon={<Mail className="text-primary dark:text-sky-400" />}
                                title="Email Official"
                                detail="bluestartradingandco@gmail.com"
                            />
                            <ContactInfoItem
                                icon={<Phone className="text-secondary dark:text-sky-400" />}
                                title="Direct Support"
                                detail="+91 7001031322"
                            />
                            <ContactInfoItem
                                icon={<MapPin className="text-primary dark:text-sky-400" />}
                                title="Regional HQ"
                                detail="Srirampur, Ratulia, Paschim Medinipur, 721139"
                            />
                        </div>
                    </div>

                    {/* Form */}
                    <SpotlightCard className="p-8 md:p-16">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                                    <input
                                        {...register('name')}
                                        placeholder="Enter your name"
                                        className={`w-full px-6 py-4 rounded-2xl border-2 ${errors.name ? 'border-red-500' : 'border-slate-100 dark:border-slate-800'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary dark:focus:border-sky-400 outline-none transition-all shadow-sm`}
                                    />
                                    {errors.name && <p className="text-xs text-red-500 font-bold">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Company</label>
                                    <input
                                        {...register('company')}
                                        placeholder="Your organization"
                                        className={`w-full px-6 py-4 rounded-2xl border-2 ${errors.company ? 'border-red-500' : 'border-slate-100 dark:border-slate-800'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary dark:focus:border-sky-400 outline-none transition-all shadow-sm`}
                                    />
                                    {errors.company && <p className="text-xs text-red-500 font-bold">{errors.company.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                                <input
                                    {...register('email')}
                                    placeholder="your-email@example.com"
                                    className={`w-full px-6 py-4 rounded-2xl border-2 ${errors.email ? 'border-red-500' : 'border-slate-100 dark:border-slate-800'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary dark:focus:border-sky-400 outline-none transition-all shadow-sm`}
                                />
                                {errors.email && <p className="text-xs text-red-500 font-bold">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Message</label>
                                <textarea
                                    {...register('message')}
                                    rows={5}
                                    placeholder="Tell us about your requirements..."
                                    className={`w-full px-6 py-4 rounded-2xl border-2 ${errors.message ? 'border-red-500' : 'border-slate-100 dark:border-slate-800'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary dark:focus:border-sky-400 outline-none transition-all shadow-sm resize-none`}
                                />
                                {errors.message && <p className="text-xs text-red-500 font-bold">{errors.message.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-5 bg-primary dark:bg-sky-500 text-white rounded-[1.5rem] font-heading font-black text-lg shadow-2xl shadow-primary/20 dark:shadow-sky-500/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
                            >
                                {isSubmitting ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                                    />
                                ) : (
                                    <>
                                        Get Your Quote <Send size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    </SpotlightCard>
                </div>
            </div>
        </SectionWrapper>
    );
}

function ContactInfoItem({ icon, title, detail }: { icon: any, title: string, detail: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-12 h-12 glass rounded-xl shadow-md flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <h4 className="font-heading font-bold text-primary dark:text-white">{title}</h4>
                <p className="text-slate-600 dark:text-slate-400 font-medium">{detail}</p>
            </div>
        </div>
    );
}
