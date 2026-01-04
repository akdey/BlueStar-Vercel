import React from 'react';
import {
    User,
    Phone,
    Mail,
    MapPin,
    FileText,
    Globe,
    Activity,
    Clock,
    DollarSign,
    Target,
    History
} from 'lucide-react';
import Badge from '../../components/Shared/Badge';
import PartyTransactions from './PartyTransactions';
import { motion, AnimatePresence } from 'framer-motion';

interface PartyDetailsProps {
    party: any;
}

const PartyDetails: React.FC<PartyDetailsProps> = ({ party }) => {
    const [activeTab, setActiveTab] = React.useState<'profile' | 'transactions'>('profile');

    if (!party) return null;

    const sectionHeader = (icon: any, title: string) => (
        <div className="flex items-center gap-2 mb-4 border-b border-theme pb-2">
            {icon}
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">{title}</h3>
        </div>
    );

    const dataRow = (label: string, value: any, Icon?: any) => (
        <div className="flex flex-col space-y-1">
            <span className="text-[9px] font-black text-muted uppercase tracking-widest">{label}</span>
            <div className="flex items-center gap-2">
                {Icon && <Icon size={12} className="text-primary/40" />}
                <span className="text-sm font-bold text-main dark:text-gray-100">{value || '—'}</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Top Summary Card */}
            <div className="bg-gradient-primary rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -right-8 -top-8 text-white/5">
                    <User size={160} />
                </div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-2">
                            <Badge variant={party.party_type === 'customer' ? 'primary' : party.party_type === 'supplier' ? 'secondary' : 'neutral'}>
                                {party.party_type.toUpperCase()}
                            </Badge>
                            <Badge variant={party.status === 'active' ? 'success' : 'error'}>
                                {party.status.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-white leading-tight mb-2 uppercase tracking-tight">{party.name}</h2>
                    <p className="text-xs font-black text-white/60 tracking-[0.2em] uppercase">{party.code}</p>
                </div>
            </div>

            {/* Tab System */}
            <div className="flex items-center p-1 bg-main-hover/50 dark:bg-slate-800/50 rounded-2xl border border-theme w-fit">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all relative
                        ${activeTab === 'profile' ? 'text-white' : 'text-muted hover:text-main'}
                    `}
                >
                    {activeTab === 'profile' && (
                        <motion.div layoutId="partyTab" className="absolute inset-0 bg-primary rounded-xl -z-0" />
                    )}
                    <User size={14} className="relative z-10" />
                    <span className="relative z-10">Master Profile</span>
                </button>
                <button
                    onClick={() => setActiveTab('transactions')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all relative
                        ${activeTab === 'transactions' ? 'text-white' : 'text-muted hover:text-main'}
                    `}
                >
                    {activeTab === 'transactions' && (
                        <motion.div layoutId="partyTab" className="absolute inset-0 bg-primary rounded-xl -z-0" />
                    )}
                    <History size={14} className="relative z-10" />
                    <span className="relative z-10">Ledger History</span>
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'profile' ? (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-primary/5 dark:bg-blue-900/10 p-4 rounded-2xl border border-primary/10">
                                <DollarSign size={16} className="text-primary mb-2" />
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Current Balance</p>
                                <p className="text-lg font-black text-main dark:text-blue-400">₹{party.current_balance?.toLocaleString() || 0}</p>
                            </div>
                            <div className="bg-secondary/5 dark:bg-purple-900/10 p-4 rounded-2xl border border-secondary/10">
                                <Target size={16} className="text-secondary mb-2" />
                                <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Credit Limit</p>
                                <p className="text-lg font-black text-main dark:text-purple-400">₹{party.credit_limit?.toLocaleString() || 0}</p>
                            </div>
                        </div>

                        {/* Contact Details */}
                        <section>
                            {sectionHeader(<Phone size={14} className="text-primary" />, "Contact Information")}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {dataRow("Contact Person", party.contact_person, User)}
                                {dataRow("Mobile", party.mobile, Phone)}
                                {dataRow("Office Phone", party.phone, Activity)}
                                {dataRow("WhatsApp", party.whatsapp)}
                                {dataRow("Email Address", party.email, Mail)}
                                {dataRow("Website", party.website, Globe)}
                            </div>
                        </section>

                        {/* Address */}
                        <section>
                            {sectionHeader(<MapPin size={14} className="text-secondary" />, "Address & Location")}
                            <div className="space-y-4">
                                {dataRow("Main Address", party.address_line_1)}
                                {dataRow("Secondary Address", party.address_line_2)}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {dataRow("City", party.city)}
                                    {dataRow("State", party.state)}
                                    {dataRow("Pincode", party.pincode)}
                                    {dataRow("Country", party.country)}
                                </div>
                            </div>
                        </section>

                        {/* Business & Identifiers */}
                        <section>
                            {sectionHeader(<FileText size={14} className="text-secondary" />, "Registration & Financials")}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {dataRow("GSTIN Number", party.gstin, FileText)}
                                {dataRow("PAN Number", party.pan_no)}
                                {dataRow("Payment Terms", `${party.payment_terms_days} Days`, Clock)}
                            </div>
                        </section>

                        {/* Timestamps & Notes */}
                        <section className="bg-main-hover/30 dark:bg-slate-800/30 p-5 rounded-2xl border border-theme">
                            <div className="space-y-4">
                                {party.notes && (
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-muted uppercase tracking-widest">Internal Notes</span>
                                        <p className="text-sm text-main dark:text-gray-400 italic">"{party.notes}"</p>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t border-theme">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-muted uppercase tracking-widest">Created On</span>
                                        <span className="text-[10px] font-bold text-main">{new Date(party.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[8px] font-black text-muted uppercase tracking-widest">Last Updated</span>
                                        <span className="text-[10px] font-bold text-main">{new Date(party.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </motion.div>
                ) : (
                    <motion.div
                        key="transactions"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <PartyTransactions partyId={party.id} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PartyDetails;
