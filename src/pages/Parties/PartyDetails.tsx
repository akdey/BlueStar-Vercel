import React from 'react';
import {
    User,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    FileText,
    Globe,
    Activity,
    Clock,
    DollarSign,
    Target
} from 'lucide-react';
import Badge from '../../components/Shared/Badge';

interface PartyDetailsProps {
    party: any;
}

const PartyDetails: React.FC<PartyDetailsProps> = ({ party }) => {
    if (!party) return null;

    const sectionHeader = (icon: any, title: string) => (
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
            {icon}
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{title}</h3>
        </div>
    );

    const dataRow = (label: string, value: any, icon?: any) => (
        <div className="flex flex-col space-y-1">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{label}</span>
            <div className="flex items-center gap-2">
                {icon && <icon size={12} className="text-gray-300" />}
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value || '—'}</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Top Summary Card */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-3xl p-6 shadow-sm overflow-hidden relative">
                <div className="absolute -right-8 -top-8 text-primary/5">
                    <User size={120} />
                </div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <Badge variant={party.party_type === 'customer' ? 'primary' : party.party_type === 'supplier' ? 'secondary' : 'neutral'}>
                            {party.party_type.toUpperCase()}
                        </Badge>
                        <Badge variant={party.status === 'active' ? 'success' : 'error'}>
                            {party.status.toUpperCase()}
                        </Badge>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-1">{party.name}</h2>
                    <p className="text-xs font-mono text-primary font-bold tracking-widest uppercase">{party.code}</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                    <DollarSign size={16} className="text-blue-600 mb-2" />
                    <p className="text-[10px] font-bold text-blue-500 uppercase">Current Balance</p>
                    <p className="text-lg font-black text-blue-700 dark:text-blue-400">₹{party.current_balance?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/20">
                    <Target size={16} className="text-purple-600 mb-2" />
                    <p className="text-[10px] font-bold text-purple-500 uppercase">Credit Limit</p>
                    <p className="text-lg font-black text-purple-700 dark:text-purple-400">₹{party.credit_limit?.toLocaleString() || 0}</p>
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
                {sectionHeader(<FileText size={14} className="text-orange-500" />, "Registration & Financials")}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {dataRow("GSTIN Number", party.gstin, FileText)}
                    {dataRow("PAN Number", party.pan_no)}
                    {dataRow("Payment Terms", `${party.payment_terms_days} Days`, Clock)}
                </div>
            </section>

            {/* Timestamps & Notes */}
            <section className="bg-gray-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-gray-100 dark:border-slate-800">
                <div className="space-y-4">
                    {party.notes && (
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Internal Notes</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{party.notes}"</p>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-slate-800">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-gray-400 uppercase">Created On</span>
                            <span className="text-[10px] font-medium text-gray-500">{new Date(party.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-[8px] font-bold text-gray-400 uppercase">Last Updated</span>
                            <span className="text-[10px] font-medium text-gray-500">{new Date(party.updated_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PartyDetails;
