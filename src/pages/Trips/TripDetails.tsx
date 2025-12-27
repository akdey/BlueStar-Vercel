import React, { useState } from 'react';
import {
    Truck,
    User,
    Navigation,
    Calendar,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Activity,
    Info,
    ArrowRight,
    MapPin,
    Fuel,
    Receipt,
    PlusCircle,
    Loader2
} from 'lucide-react';
import Badge from '../../components/Shared/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useAddTripExpenseMutation } from '../../features/api/apiSlice';
import { toast } from 'react-toastify';

interface TripDetailsProps {
    trip: any;
    refetch?: () => void;
}

const TripDetails: React.FC<TripDetailsProps> = ({ trip, refetch }) => {
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [expenseForm, setExpenseForm] = useState({
        expense_type: 'fuel',
        amount: '',
        description: '',
        date: new Date().toISOString().slice(0, 16)
    });
    const [addExpense, { isLoading: isSubmitting }] = useAddTripExpenseMutation();

    if (!trip) return null;

    const stats = [
        {
            label: 'Projected Revenue',
            value: `₹${(trip.freight_income || 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'text-blue-500',
            bg: 'bg-blue-50/50'
        },
        {
            label: 'Real-time Burn',
            value: `₹${(trip.total_expense || 0).toLocaleString()}`,
            icon: TrendingDown,
            color: 'text-red-500',
            bg: 'bg-red-50/50'
        },
        {
            label: 'Current Margin',
            value: `₹${((trip.freight_income || 0) - (trip.total_expense || 0)).toLocaleString()}`,
            icon: TrendingUp,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50/50'
        },
    ];

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addExpense({
                tripId: trip.id,
                expenseData: { ...expenseForm, amount: Number(expenseForm.amount) }
            }).unwrap();
            toast.success('Operational expense recorded');
            setIsAddingExpense(false);
            setExpenseForm({
                expense_type: 'fuel',
                amount: '',
                description: '',
                date: new Date().toISOString().slice(0, 16)
            });
            if (refetch) refetch();
        } catch (error: any) {
            toast.error(error.data?.detail || 'Failed to record expense');
        }
    };

    const sectionHeader = (icon: any, title: string) => (
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
            {icon}
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{title}</h3>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Mission Identity Header */}
            <div className="bg-gradient-to-br from-primary to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -right-12 -top-12 text-white/5 rotate-12">
                    <Navigation size={220} />
                </div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <Badge variant={trip.status === 'completed' ? 'success' : 'primary'}>
                            {trip.status?.toUpperCase()?.replace('_', ' ')}
                        </Badge>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Logistics Mission ID: {trip.trip_number || `TRP-${trip.id}`}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-8">
                        <div className="flex-1 text-center sm:text-left">
                            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">Source Node</p>
                            <h2 className="text-2xl font-black">{trip.source_location}</h2>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
                            <div className="p-2 bg-white/10 rounded-full">
                                <Truck size={20} />
                            </div>
                            <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
                        </div>
                        <div className="flex-1 text-center sm:text-right">
                            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">Destination Node</p>
                            <h2 className="text-2xl font-black">{trip.destination_location}</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-xl"><User size={16} /></div>
                            <div>
                                <p className="text-[9px] font-bold text-blue-200 uppercase tracking-tighter">Assigned Pilot</p>
                                <p className="text-sm font-black">{trip.driver_name || 'Pilot Unassigned'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 justify-end">
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-blue-200 uppercase tracking-tighter">Assigned Fleet Unit</p>
                                <p className="text-sm font-black font-mono">{trip.vehicle_number || 'Unit Unknown'}</p>
                            </div>
                            <div className="p-2 bg-white/10 rounded-xl"><Truck size={16} /></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className={`${stat.bg} dark:bg-slate-800/20 p-5 rounded-3xl border border-white dark:border-slate-800 shadow-sm`}
                    >
                        <div className={`${stat.color} mb-3`}><stat.icon size={20} /></div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
                        <p className={`text-2xl font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Expenses Stream */}
            <section>
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                        <Receipt size={14} className="text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Operational Burn (Expenses)</h3>
                    </div>
                    <button
                        onClick={() => setIsAddingExpense(true)}
                        className="flex items-center gap-1.5 text-[10px] font-black text-primary hover:text-secondary transition-all uppercase tracking-widest"
                    >
                        <PlusCircle size={14} /> Log Burn
                    </button>
                </div>

                <AnimatePresence>
                    {isAddingExpense && (
                        <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleAddExpense}
                            className="mb-6 p-6 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4 overflow-hidden"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Burn Type</label>
                                    <select
                                        value={expenseForm.expense_type}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, expense_type: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="fuel">Fuel / Diesel</option>
                                        <option value="toll">Road Tolls</option>
                                        <option value="food">Driver Food</option>
                                        <option value="repair">Maintenance / Repair</option>
                                        <option value="other">Misc. Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Amount (INR)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">₹</div>
                                        <input
                                            type="number"
                                            value={expenseForm.amount}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                            className="w-full pl-8 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Expense Date/Time</label>
                                    <input
                                        type="datetime-local"
                                        value={expenseForm.date}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-gray-400">Context / Description</label>
                                <input
                                    type="text"
                                    value={expenseForm.description}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Brief context for this expense..."
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : 'Commit Expense'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAddingExpense(false)}
                                    className="px-6 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all"
                                >
                                    Abandond
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="space-y-3">
                    {/* Placeholder for real expense history if available from backend */}
                    <div className="flex flex-col gap-3">
                        {trip.expenses?.length > 0 ? (
                            trip.expenses.map((exp: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl group hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-gray-400 group-hover:text-primary transition-colors">
                                            {exp.expense_type === 'fuel' ? <Fuel size={16} /> : <Receipt size={16} />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{exp.expense_type}</p>
                                            <p className="text-[10px] text-gray-400 italic">{exp.description || 'No description provided'}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-black text-red-500">₹{exp.amount.toLocaleString()}</span>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-[2.5rem]">
                                <Receipt size={24} className="mx-auto text-gray-200 mb-2" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No burn recorded yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Telemetry Summary */}
            <section className="bg-slate-50 dark:bg-slate-800/10 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Mission Clock</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">{new Date(trip.start_date).toLocaleString()}</p>
                        </div>
                        <div className="h-8 w-px bg-gray-200 dark:bg-slate-700" />
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Telemetry Start</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-white font-mono">{trip.start_km} KM</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">System Audit</p>
                        <p className="text-xs font-bold text-secondary uppercase tracking-widest">Verified Mission</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TripDetails;
