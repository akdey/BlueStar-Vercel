import React, { useState } from 'react';
import { useGetPartiesQuery } from '../../features/api/apiSlice';
import PageHeader from '../../components/Shared/PageHeader';
import DataTable from '../../components/Shared/DataTable';
import SlideOver from '../../components/Shared/SlideOver';
import PartyForm from './PartyForm';
import PartyDetails from './PartyDetails';
import Badge from '../../components/Shared/Badge';
import { Edit2, Search, Eye } from 'lucide-react';

interface Party {
    id: number;
    name: string;
    code: string;
    party_type: string;
    phone?: string;
    mobile?: string;
    gstin?: string;
    status: string;
    city?: string;
    contact_person?: string;
    current_balance?: number;
}

const Parties = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedParty, setSelectedParty] = useState<Party | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: parties, isLoading, refetch } = useGetPartiesQuery({
        search: searchTerm || undefined
    });

    const handleCreate = () => {
        setSelectedParty(null);
        setIsFormOpen(true);
    };

    const handleEdit = (party: Party) => {
        setSelectedParty(party);
        setIsFormOpen(true);
    };

    const handleView = (party: Party) => {
        setSelectedParty(party);
        setIsDetailsOpen(true);
    };

    const columns = [
        {
            header: 'Party Name',
            accessorKey: 'name' as keyof Party,
            cell: (party: Party) => (
                <div
                    className="flex flex-col cursor-pointer group"
                    onClick={() => handleView(party)}
                >
                    <span className="font-bold text-main transition-colors group-hover:text-primary">{party.name}</span>
                    <span className="text-[10px] text-muted font-mono uppercase tracking-widest">{party.code}</span>
                </div>
            )
        },
        {
            header: 'Type',
            accessorKey: 'party_type' as keyof Party,
            cell: (party: Party) => (
                <Badge variant={party.party_type === 'customer' ? 'primary' : party.party_type === 'supplier' ? 'secondary' : 'neutral'}>
                    {party.party_type.toUpperCase()}
                </Badge>
            )
        },
        {
            header: 'Contact Info',
            accessorKey: 'phone' as keyof Party,
            cell: (party: Party) => (
                <div className="flex flex-col text-[11px] font-bold">
                    <span className="text-main">{party.mobile || party.phone || 'N/A'}</span>
                    <span className="text-muted italic">{party.contact_person || 'No Contact'}</span>
                </div>
            )
        },
        {
            header: 'Balance',
            accessorKey: 'current_balance' as keyof Party,
            cell: (party: Party) => (
                <span className={`text-xs font-bold ${party.current_balance && party.current_balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    ₹{party.current_balance?.toLocaleString() || 0}
                </span>
            )
        },
        {
            header: 'Status',
            accessorKey: 'status' as keyof Party,
            cell: (party: Party) => (
                <Badge variant={party.status === 'active' ? 'success' : party.status === 'blacklisted' ? 'error' : 'neutral'}>
                    {party.status.toUpperCase()}
                </Badge>
            )
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: (party: Party) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleView(party)}
                        className="p-2 text-muted hover:text-primary hover:bg-main-hover rounded-lg transition-all"
                        title="View Ledger & Profile"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => handleEdit(party)}
                        className="p-2 text-muted hover:text-secondary hover:bg-main-hover rounded-lg transition-all"
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
            <PageHeader
                title="Parties Management"
                actionLabel="Add New Party"
                onAction={handleCreate}
            />

            {/* Search Bar */}
            <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={16} className="text-muted" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, code or phone..."
                    className="block w-full pl-11 pr-4 py-3 border border-theme rounded-2xl bg-card text-[10px] font-bold uppercase tracking-widest placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-sm text-main"
                />
            </div>

            <DataTable
                columns={columns}
                data={parties?.data || []}
                isLoading={isLoading}
                keyField="id"
                emptyMessage="No parties found. Add customers, suppliers or carriers to get started."
            />

            {/* View Details SlideOver */}
            <SlideOver
                title="Party Profile Details"
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
            >
                <PartyDetails party={selectedParty} />
            </SlideOver>

            {/* Create/Edit SlideOver */}
            <SlideOver
                title={selectedParty ? "Edit Party Record" : "Create New Party"}
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
            >
                <PartyForm
                    party={selectedParty}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        refetch();
                    }}
                />
            </SlideOver>
        </div>
    );
};

export default Parties;
