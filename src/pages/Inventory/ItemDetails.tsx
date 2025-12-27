import React from 'react';
import {
    Box,
    Tag,
    Truck,
    BarChart2,
    FileText,
    AlertTriangle,
    DollarSign,
    Package,
    Layers,
    Activity
} from 'lucide-react';
import Badge from '../../components/Shared/Badge';

interface ItemDetailsProps {
    item: any;
}

const ItemDetails: React.FC<ItemDetailsProps> = ({ item }) => {
    if (!item) return null;

    const sectionHeader = (icon: any, title: string) => (
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
            {icon}
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{title}</h3>
        </div>
    );

    const dataRow = (label: string, value: any, Icon?: any) => (
        <div className="flex flex-col space-y-1">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{label}</span>
            <div className="flex items-center gap-2">
                {Icon && <Icon size={12} className="text-gray-300" />}
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value !== undefined && value !== null ? value : '—'}</span>
            </div>
        </div>
    );

    const isLowStock = item.current_stock <= item.min_stock_level;

    return (
        <div className="space-y-8 pb-10">
            {/* Top Summary Card */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-3xl p-6 shadow-sm overflow-hidden relative">
                <div className="absolute -right-8 -top-8 text-primary/5">
                    <Box size={120} />
                </div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <Badge variant={item.item_type === 'GOODS' ? 'primary' : 'secondary'}>
                            {item.item_type}
                        </Badge>
                        {isLowStock && (
                            <Badge variant="error" className="animate-pulse">
                                LOW STOCK
                            </Badge>
                        )}
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-1">{item.name}</h2>
                    <p className="text-xs font-mono text-secondary font-bold tracking-widest uppercase">{item.code || 'NO SKU'}</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/5 dark:bg-secondary/10 p-4 rounded-2xl border border-secondary/10 dark:border-secondary/20">
                    <Package size={16} className="text-secondary mb-2" />
                    <p className="text-[10px] font-bold text-secondary uppercase">Available Stock</p>
                    <p className="text-lg font-black text-primary dark:text-secondary">{item.current_stock} {item.unit}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                    <DollarSign size={16} className="text-amber-600 mb-2" />
                    <p className="text-[10px] font-bold text-amber-500 uppercase">Base Price</p>
                    <p className="text-lg font-black text-amber-700 dark:text-amber-400">₹{item.base_price?.toLocaleString()}</p>
                </div>
            </div>

            {/* Basic Specifications */}
            <section>
                {sectionHeader(<Layers size={14} className="text-secondary" />, "Specifications & Category")}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {dataRow("Category / Group", item.category, Tag)}
                    {dataRow("Measurement Unit", item.unit, Package)}
                    {dataRow("HSN / SAC Code", item.hsn_code, FileText)}
                    {dataRow("Tax Rate (GST)", `${item.tax_rate}%`, Activity)}
                </div>
            </section>

            {/* Inventory Controls */}
            <section>
                {sectionHeader(<BarChart2 size={14} className="text-blue-500" />, "Stock Control")}
                <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {dataRow("Minimum Stock Level", item.min_stock_level, AlertTriangle)}
                        {dataRow("Current Stock", `${item.current_stock} ${item.unit}`, BarChart2)}
                    </div>
                    {isLowStock && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-3">
                            <AlertTriangle className="text-red-500" size={18} />
                            <p className="text-xs font-bold text-red-700 dark:text-red-400">
                                This item is below the minimum stock level. Reorder recommended.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* System Info */}
            <section className="bg-gray-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-gray-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-gray-400 uppercase">System ID</span>
                        <span className="text-xs font-mono font-black text-secondary">ID-{item.id}</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-[8px] font-bold text-gray-400 uppercase">Last Registry Update</span>
                        <span className="text-[10px] font-medium text-gray-500">{new Date(item.updated_at || Date.now()).toLocaleDateString()}</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ItemDetails;
