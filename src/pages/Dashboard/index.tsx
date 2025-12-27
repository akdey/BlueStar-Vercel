import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Truck,
    Calendar,
    IndianRupee
} from 'lucide-react';
import { useGetDashboardOverviewQuery, useGetDashboardChartsQuery } from '../../features/api/apiSlice';
import { GenericChart } from './DashboardCharts';

const StatCard = ({ title, value, icon: Icon, trend, color, accentColor }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="relative overflow-hidden group p-6 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-all duration-300"
    >
        {/* Glow Effect */}
        <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-3xl ${accentColor}`} />

        <div className="flex items-start justify-between relative z-10">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20 text-opacity-100 shadow-inner`}>
                <Icon size={24} className={accentColor.replace('bg-', 'text-')} />
            </div>
            {trend && (
                <div className={`flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${trend >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {trend >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>

        <div className="mt-6 relative z-10">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight">
                {value}
            </h3>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [period, setPeriod] = useState('month');
    const { data: stats, isLoading: isStatsLoading } = useGetDashboardOverviewQuery(period);
    const { data: charts, isLoading: isChartsLoading } = useGetDashboardChartsQuery(period);

    const isLoading = isStatsLoading || isChartsLoading;

    return (
        <div className="space-y-8 pb-8">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display tracking-tight leading-none">
                        Dashboard <span className="text-primary/50 text-xl font-normal">Overview</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm font-medium">
                        Welcome back! Here's the latest update on your transport operations.
                    </p>
                </div>

                <div className="flex bg-gray-100/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-1 border border-gray-200/50 dark:border-slate-700/50">
                    {['today', 'week', 'month'].map((p) => (
                        <motion.button
                            key={p}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setPeriod(p)}
                            className={`
                                px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all
                                ${period === p
                                    ? 'bg-white dark:bg-slate-700 text-primary dark:text-accent shadow-sm ring-1 ring-black/5'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-slate-700/50'
                                }
                            `}
                        >
                            {p}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="h-40 bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-slate-800 animate-pulse" />
                    ))
                ) : (
                    <>
                        <StatCard
                            title="Total Sales"
                            value={`₹${(stats?.financial_summary?.sales_revenue || 0).toLocaleString()}`}
                            icon={IndianRupee}
                            trend={12.5}
                            color="bg-primary"
                            accentColor="bg-primary"
                        />
                        <StatCard
                            title="Active Logistics"
                            value={stats?.logistics_performance?.total_trips || 0}
                            icon={Truck}
                            color="bg-amber-500"
                            accentColor="bg-amber-500"
                        />
                        <StatCard
                            title="Net Income"
                            value={`₹${(stats?.financial_summary?.business_net_income || 0).toLocaleString()}`}
                            icon={TrendingUp}
                            trend={8.2}
                            color="bg-green-500"
                            accentColor="bg-green-500"
                        />
                        <StatCard
                            title="Total Receivables"
                            value={`₹${(stats?.financial_summary?.total_receivable || 0).toLocaleString()}`}
                            icon={Calendar}
                            color="bg-purple-500"
                            accentColor="bg-purple-500"
                        />
                    </>
                )}
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Trend - Large */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-2 p-8 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm min-h-[400px] flex flex-col"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Revenue Stream</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Daily Sales Momentum</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="flex-1 min-h-[250px]">
                        {charts?.revenue_trend && (
                            <GenericChart
                                type={charts.revenue_trend.chart_type}
                                title={charts.revenue_trend.title}
                                data={charts.revenue_trend.data}
                            />
                        )}
                    </div>
                </motion.div>

                {/* Trip Status - Small */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col"
                >
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Deployment</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Trip Status Breakdown</p>
                    </div>
                    <div className="flex-1 min-h-[200px]">
                        {charts?.trip_status && (
                            <GenericChart
                                type={charts.trip_status.chart_type}
                                title={charts.trip_status.title}
                                data={charts.trip_status.data}
                            />
                        )}
                    </div>
                </motion.div>

                {/* Expense Breakdown */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col"
                >
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Operational Burn</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Logistics Expenses</p>
                    </div>
                    <div className="flex-1 min-h-[200px]">
                        {charts?.expense_breakdown && (
                            <GenericChart
                                type={charts.expense_breakdown.chart_type}
                                title={charts.expense_breakdown.title}
                                data={charts.expense_breakdown.data}
                            />
                        )}
                    </div>
                </motion.div>

                {/* Top Customers - Bar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col"
                >
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Top Partners</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Outstanding Balance</p>
                    </div>
                    <div className="flex-1 min-h-[200px]">
                        {charts?.top_customers && (
                            <GenericChart
                                type={charts.top_customers.chart_type}
                                title={charts.top_customers.title}
                                data={charts.top_customers.data}
                            />
                        )}
                    </div>
                </motion.div>

                {/* Fleet Availability */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col"
                >
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Fleet Health</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Asset Allocation</p>
                    </div>
                    <div className="flex-1 min-h-[200px]">
                        {charts?.fleet_availability && (
                            <GenericChart
                                type={charts.fleet_availability.chart_type}
                                title={charts.fleet_availability.title}
                                data={charts.fleet_availability.data}
                            />
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
