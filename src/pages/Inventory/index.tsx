import { useState } from 'react';
import { useGetItemsQuery } from '../../features/api/apiSlice';
import PageHeader from '../../components/Shared/PageHeader';
import DataTable from '../../components/Shared/DataTable';
import SlideOver from '../../components/Shared/SlideOver';
import ItemForm from './ItemForm';
import ItemDetails from './ItemDetails';
import StockAdjustmentForm from './StockAdjustmentForm';
import Badge from '../../components/Shared/Badge';
import { motion } from 'framer-motion';
import { Search, Edit2, Eye, PackageCheck, AlertCircle, PlusCircle } from 'lucide-react';

interface InventoryItem {
    id: number;
    name: string;
    code: string;
    item_type: string;
    unit: string;
    base_price: number;
    current_stock: number;
    min_stock_level: number;
}

const Inventory = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [itemType, setItemType] = useState<string>('');

    const { data: items, isLoading, refetch } = useGetItemsQuery({
        search: searchTerm || undefined,
        type: itemType || undefined,
        item_type: itemType || undefined
    });

    const handleCreate = () => {
        setSelectedItem(null);
        setIsFormOpen(true);
    };

    const handleAdjustGeneric = () => {
        setSelectedItem(null);
        setIsAdjustOpen(true);
    };

    const handleAdjustSpecific = (item: InventoryItem) => {
        setSelectedItem(item);
        setIsAdjustOpen(true);
    };

    const handleEdit = (item: InventoryItem) => {
        setSelectedItem(item);
        setIsFormOpen(true);
    };

    const handleView = (item: InventoryItem) => {
        setSelectedItem(item);
        setIsDetailsOpen(true);
    };

    const columns = [
        {
            header: 'Item / Service',
            accessorKey: 'name' as keyof InventoryItem,
            cell: (item: InventoryItem) => (
                <div
                    className="flex flex-col cursor-pointer group"
                    onClick={() => handleView(item)}
                >
                    <span className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{item.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{item.code || 'No SKU'}</span>
                </div>
            )
        },
        {
            header: 'Type',
            accessorKey: 'item_type' as keyof InventoryItem,
            cell: (item: InventoryItem) => (
                <Badge variant={item.item_type === 'goods' ? 'primary' : 'secondary'}>
                    {(item.item_type || '').toUpperCase()}
                </Badge>
            )
        },
        {
            header: 'Stock Status',
            accessorKey: 'current_stock' as keyof InventoryItem,
            cell: (item: InventoryItem) => {
                const isLow = item.current_stock <= item.min_stock_level;
                return (
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isLow ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                            {item.current_stock}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">{item.unit}</span>
                        {isLow && <AlertCircle size={10} className="text-red-500" />}
                    </div>
                );
            }
        },
        {
            header: 'Base Price',
            accessorKey: 'base_price' as keyof InventoryItem,
            cell: (item: InventoryItem) => <span className="text-xs font-black text-gray-900 dark:text-white">₹{item.base_price?.toLocaleString()}</span>
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: (item: InventoryItem) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleView(item)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                        title="View Details"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => handleAdjustSpecific(item)}
                        className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-all"
                        title="Quick Stock Adjust"
                    >
                        <PackageCheck size={16} />
                    </button>
                    <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                        title="Edit Record"
                    >
                        <Edit2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader title="Inventory Registry" />
                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAdjustGeneric}
                        className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-900 border border-theme text-gray-700 dark:text-gray-300 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-all font-display"
                    >
                        <PackageCheck size={16} className="text-secondary" />
                        <span>Adjust Stock</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreate}
                        className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 font-display"
                    >
                        <PlusCircle size={16} className="transition-transform group-hover:rotate-90" />
                        <span>Register New Item</span>
                    </motion.button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search items by name or SKU..."
                        className="block w-full pl-10 pr-3 py-3 border border-theme rounded-2xl bg-white dark:bg-slate-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-theme p-1.5 rounded-2xl shadow-sm">
                    <button
                        onClick={() => setItemType('')}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${itemType === '' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setItemType('goods')}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${itemType === 'goods' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                    >
                        Goods
                    </button>
                    <button
                        onClick={() => setItemType('service')}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${itemType === 'service' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                    >
                        Services
                    </button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={items?.data || []}
                isLoading={isLoading}
                keyField="id"
                emptyMessage="No items found."
            />

            <SlideOver title="Inventory Item Profile" isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)}>
                <ItemDetails item={selectedItem} />
            </SlideOver>

            <SlideOver title="Stock Level Adjustment" isOpen={isAdjustOpen} onClose={() => setIsAdjustOpen(false)}>
                <StockAdjustmentForm initialItem={selectedItem} onSuccess={() => { setIsAdjustOpen(false); refetch(); }} />
            </SlideOver>

            <SlideOver title={selectedItem ? "Modify Inventory Record" : "Add New Item"} isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
                <ItemForm item={selectedItem} onSuccess={() => { setIsFormOpen(false); refetch(); }} />
            </SlideOver>
        </div>
    );
};

export default Inventory;
