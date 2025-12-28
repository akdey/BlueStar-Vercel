import React from 'react';
import { FileText, MapPin, Phone, Mail, Globe, Hash, Calendar, Building2 } from 'lucide-react';
import { useGetPartyQuery, useGetItemsQuery } from '../../features/api/apiSlice';

interface PrintableVoucherProps {
    voucher: any;
}

const PrintableVoucher: React.FC<PrintableVoucherProps> = ({ voucher }) => {
    // 1. Fetch Party Details
    const { data: partyData } = useGetPartyQuery(voucher?.party_id, {
        skip: !voucher?.party_id
    });

    // Fetch Items to resolve Item Names if missing
    const { data: itemsData } = useGetItemsQuery({});
    const inventoryItems = itemsData?.data || [];

    // Fallback to voucher's embedded party info if fetch hasn't loaded or failed, 
    // but prefer the detailed partyData if available.
    // Assuming the API returns { data: { ...partyFields } } or similar.
    // Adjusting based on typical API response structure in this project (response.data usually).
    const party = partyData?.data || {
        name: voucher?.party_name,
        // If we can't fetch, we might not have these, so we handle graceful fallbacks in UI
    };

    if (!voucher) return null;

    const isDraft = voucher.status === 'draft';

    // 2. Theme Configuration based on Document Type
    const getTheme = (type: string) => {
        const normalizedType = type?.toLowerCase() || '';
        if (normalizedType.includes('invoice')) {
            return {
                primary: 'bg-slate-900',
                accent: 'text-blue-600',
                border: 'border-blue-600',
                lightBg: 'bg-blue-50/50',
                label: 'Tax Invoice'
            };
        } else if (normalizedType.includes('challan')) {
            return {
                primary: 'bg-amber-600', // Industrial look
                accent: 'text-amber-600',
                border: 'border-amber-600',
                lightBg: 'bg-amber-50/50',
                label: 'Delivery Challan'
            };
        } else if (normalizedType.includes('quote') || normalizedType.includes('trans')) {
            return {
                primary: 'bg-emerald-600',
                accent: 'text-emerald-600',
                border: 'border-emerald-600',
                lightBg: 'bg-emerald-50/50',
                label: 'Quotation / Estimate'
            };
        }
        // Default
        return {
            primary: 'bg-slate-800',
            accent: 'text-slate-600',
            border: 'border-slate-800',
            lightBg: 'bg-slate-50',
            label: voucher.doc_type || 'Voucher'
        };
    };

    const theme = getTheme(voucher.doc_type);

    // Calculate Financials on the fly for display
    const calculateFinancials = () => {
        const items = voucher.items || [];
        const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

        let subTotal = 0;
        let totalTax = 0;

        items.forEach((item: any) => {
            const amount = Number(item.amount) || 0; // This is Qty * Rate (Base)
            const taxRate = Number(item.tax_rate) || 0;
            const taxAmount = round((amount * taxRate) / 100);

            subTotal += amount;
            totalTax += taxAmount;
        });

        return {
            subTotal: round(subTotal),
            totalTax: round(totalTax),
            grandTotal: round(subTotal + totalTax)
        };
    };

    const { subTotal, totalTax, grandTotal } = calculateFinancials();

    return (
        <>
            <div className="printable-content bg-white p-12 text-slate-900 w-full max-w-[210mm] min-h-[297mm] mx-auto shadow-2xl relative font-sans">
                {/* Watermark */}
                {isDraft && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                        <span className="text-[150px] font-black text-slate-100/50 -rotate-45 select-none border-8 border-slate-100/50 px-8 py-2 rounded-3xl">DRAFT</span>
                    </div>
                )}

                {/* Top Bar / Branding */}
                <div className="flex justify-between items-start mb-12 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 ${theme.primary} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                            <FileText size={28} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter text-slate-900 leading-none">BLUE STAR</h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1.5">Trading & Transport</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`inline-block px-4 py-1.5 rounded-lg ${theme.primary} text-white font-bold text-sm uppercase tracking-widest shadow-md mb-2`}>
                            {theme.label}
                        </div>
                        <p className="text-sm font-bold text-slate-400">#{voucher.doc_number || 'TRP-DRAFT'}</p>
                    </div>
                </div>

                {/* Company & Client Info Grid */}
                <div className="grid grid-cols-2 gap-16 mb-12 relative z-10">
                    {/* From (Blue Star) */}
                    <div className="relative">
                        <div className={`absolute -left-4 top-0 bottom-0 w-1 ${theme.primary} rounded-full`}></div>
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Issued By</h3>
                        <div className="space-y-1.5 text-xs">
                            <p className="font-bold text-sm text-slate-900 mb-2">{import.meta.env.VITE_BRAND_NAME || 'BLUE STAR'} TRADING & CO.</p>
                            <p className="flex items-start gap-2 text-slate-600 leading-snug">
                                <MapPin size={12} className={`mt-0.5 ${theme.accent}`} />
                                <span className="max-w-[200px]">{import.meta.env.VITE_COMPANY_ADDRESS || 'Srirampur, Ratulia, Paschim Medinipur, 721139'}</span>
                            </p>
                            <p className="flex items-center gap-2 text-slate-600">
                                <Phone size={12} className={theme.accent} />
                                {import.meta.env.VITE_COMPANY_PHONE || '+91 7001031322'}
                            </p>
                            <p className="flex items-center gap-2 text-slate-600">
                                <Mail size={12} className={theme.accent} />
                                {import.meta.env.VITE_COMPANY_EMAIL || 'bluestartradingandco@gmail.com'}
                            </p>
                            <p className="flex items-center gap-2 text-slate-600">
                                <Hash size={12} className={theme.accent} />
                                GSTIN: {import.meta.env.VITE_COMPANY_GSTIN || '19XXXXX0000X1Z5'}
                            </p>
                        </div>
                    </div>

                    {/* To (Client) */}
                    <div className="relative">
                        <div className={`absolute -left-4 top-0 bottom-0 w-1 bg-slate-200 rounded-full`}></div>
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Billed To</h3>
                        <div className="space-y-1.5 text-xs">
                            <p className="font-bold text-sm text-slate-900 uppercase mb-2">
                                {party?.name || voucher.party_name || 'Unknown Party'}
                            </p>

                            {/* Detailed Party Info or Fallbacks */}
                            {(party?.address || party?.city) && (
                                <p className="flex items-start gap-2 text-slate-600 leading-snug">
                                    <MapPin size={12} className="mt-0.5 text-slate-400" />
                                    <span className="max-w-[200px]">
                                        {[party.address, party.city, party.state, party.pincode].filter(Boolean).join(', ')}
                                    </span>
                                </p>
                            )}

                            {(party?.phone || party?.mobile) && (
                                <p className="flex items-center gap-2 text-slate-600">
                                    <Phone size={12} className="text-slate-400" />
                                    {party.phone || party.mobile}
                                </p>
                            )}

                            {party?.gstin && (
                                <p className="flex items-center gap-2 text-slate-600">
                                    <Hash size={12} className="text-slate-400" />
                                    GSTIN: {party.gstin}
                                </p>
                            )}

                            {/* Show Customer ID if we have minimal info */}
                            <p className="flex items-center gap-2 text-slate-400 text-[10px] pt-1">
                                <Building2 size={10} />
                                Customer ID: {voucher.party_id}
                            </p>

                            {/* Trip specific info */}
                            {voucher.vehicle_number && (
                                <div className="mt-3 inline-block px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-700 border border-slate-200">
                                    Vehicle: {voucher.vehicle_number}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Metadata Strip */}
                <div className={`${theme.lightBg} rounded-xl p-6 grid grid-cols-3 gap-8 mb-12 border ${theme.border} border-opacity-10`}>
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Date Issued</p>
                        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                            <Calendar size={14} className={theme.accent} />
                            {new Date(voucher.voucher_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </div>
                    </div>
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Place of Supply</p>
                        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                            <MapPin size={14} className={theme.accent} />
                            {voucher.place_of_supply || 'West Bengal'}
                        </div>
                    </div>
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Voucher Status</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${isDraft ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {voucher.status}
                        </span>
                    </div>
                </div>

                {/* Line Items */}
                <div className="mb-12">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest ${theme.accent} border-b-2 ${theme.border} w-[35%]`}>Description</th>
                                <th className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest ${theme.accent} border-b-2 ${theme.border} text-center`}>Qty</th>
                                <th className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest ${theme.accent} border-b-2 ${theme.border} text-right`}>Rate</th>
                                <th className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest ${theme.accent} border-b-2 ${theme.border} text-right`}>Tax</th>
                                <th className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest ${theme.accent} border-b-2 ${theme.border} text-right`}>Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium text-slate-700">
                            {voucher.items?.map((item: any, idx: number) => {
                                const taxRate = Number(item.tax_rate) || 0;
                                const amount = Number(item.amount) || 0;
                                const taxAmt = (amount * taxRate) / 100;
                                return (
                                    <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">
                                                    {inventoryItems.find((i: any) => i.id === item.item_id)?.name || item.item_name || 'Item'}
                                                </span>
                                                {item.item_id && <span className="text-[9px] text-slate-400 font-mono">Code: {item.item_id}</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right text-slate-500">₹{Number(item.rate).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right text-slate-500">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs">₹{taxAmt.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                                <span className="text-[9px] text-slate-400">({taxRate}%)</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-900">₹{amount.toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                            {/* Empty rows filler for consistent visual height if needed, usually better to let content flow in react */}
                        </tbody>
                    </table>
                </div>

                {/* Footer Section */}
                <div className="flex justify-between items-end gap-12 pt-8 border-t-2 border-slate-100">
                    <div className="flex-1 space-y-6">
                        <div>
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Terms & Conditions</h4>
                            <ul className="text-[9px] text-slate-500 space-y-1.5 list-disc pl-3">
                                <li>Payment is due within 15 days of invoice date.</li>
                                <li>Subject to West Bengal jurisdiction.</li>
                                <li>Goods once sold will not be taken back.</li>
                            </ul>
                        </div>
                        {voucher.notes && (
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Remarks</h4>
                                <p className="text-[10px] text-slate-600 italic">"{voucher.notes}"</p>
                            </div>
                        )}
                    </div>

                    <div className="w-72">
                        {/* Financials */}
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-xs text-slate-500 font-medium">
                                <span>Subtotal</span>
                                <span>₹{subTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 font-medium">
                                <span>Total Tax</span>
                                <span>₹{totalTax.toLocaleString()}</span>
                            </div>
                            <div className={`flex justify-between items-center py-3 border-t-2 ${theme.border} mt-2`}>
                                <span className={`text-sm font-black uppercase tracking-widest ${theme.accent}`}>Total</span>
                                <span className={`text-2xl font-black ${theme.accent}`}>₹{grandTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Signature Area */}
                        <div className="mt-12 text-center">
                            <p className="text-[9px] font-bold text-slate-900 uppercase tracking-widest mb-16">For Blue Star Trading & Co.</p>
                            <div className="h-px bg-slate-300 w-full mb-2"></div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Authorized Signatory</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Watermark / Decorative */}
                <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                    <p className="text-[8px] font-medium text-slate-300 flex items-center justify-center gap-2">
                        <Globe size={10} /> www.bluestar-logistics.com
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        Generated on {new Date().toLocaleDateString()}
                    </p>
                </div>
            </div>
        </>
    );
};

export default PrintableVoucher;
