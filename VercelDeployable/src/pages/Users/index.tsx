import { useState } from 'react';
import {
    useGetUsersQuery,
    useActivateUserMutation,
    useDeactivateUserMutation
} from '../../features/api/apiSlice';
import PageHeader from '../../components/Shared/PageHeader';
import DataTable from '../../components/Shared/DataTable';
import SlideOver from '../../components/Shared/SlideOver';
import UserForm from './UserForm';
import UserDetails from './UserDetails';
import Badge from '../../components/Shared/Badge';
import { Eye, UserCheck, UserX, ShieldAlert, Monitor } from 'lucide-react';
import { toast } from 'react-toastify';

interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
    active: boolean;
    last_login?: string;
    created_at: string;
}

const Users = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const { data: users, isLoading, refetch } = useGetUsersQuery(undefined);
    const [activateUser] = useActivateUserMutation();
    const [deactivateUser] = useDeactivateUserMutation();

    const handleView = (user: User) => {
        setSelectedUser(user);
        setIsDetailsOpen(true);
    };

    const handleToggleStatus = async (user: User) => {
        try {
            if (user.active) {
                await deactivateUser(user.id).unwrap();
                toast.warn(`User @${user.username} deactivated`);
            } else {
                await activateUser(user.id).unwrap();
                toast.success(`User @${user.username} activated`);
            }
            refetch();
        } catch (error: any) {
            toast.error(error.data?.detail || 'Failed to update user status');
        }
    };

    const columns = [
        {
            header: 'Identity',
            accessorKey: 'full_name' as keyof User,
            cell: (user: User) => (
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => handleView(user)}
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-black shadow-sm group-hover:scale-110 transition-transform">
                        {user.full_name?.charAt(0) || user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{user.full_name || 'No Name'}</span>
                        <span className="text-[10px] text-gray-400 font-mono tracking-tighter italic">@{user.username}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Access Level',
            accessorKey: 'role' as keyof User,
            cell: (user: User) => (
                <Badge variant={user.role === 'admin' ? 'default' : user.role === 'manager' ? 'success' : 'neutral'}>
                    {user.role.toUpperCase()}
                </Badge>
            )
        },
        {
            header: 'Security',
            accessorKey: 'active' as keyof User,
            cell: (user: User) => (
                <div className="flex items-center gap-2">
                    <Badge variant={user.active ? 'success' : 'error'}>
                        {user.active ? 'ACTIVE' : 'DEACTIVATED'}
                    </Badge>
                </div>
            )
        },
        {
            header: 'Activity',
            accessorKey: 'last_login' as keyof User,
            cell: (user: User) => (
                <div className="flex flex-col text-[10px]">
                    <span className="text-gray-500 uppercase font-black tracking-tighter flex items-center gap-1">
                        <Monitor size={10} /> Last Login
                    </span>
                    <span className="text-gray-400">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </span>
                </div>
            )
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: (user: User) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleView(user)}
                        className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-lg transition-all"
                        title="View Profile"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => handleToggleStatus(user)}
                        className={`p-2 rounded-lg transition-all ${user.active
                                ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                            }`}
                        title={user.active ? "Deactivate User" : "Activate User"}
                    >
                        {user.active ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                    {user.role !== 'admin' && (
                        <button
                            className="p-2 text-gray-300 hover:text-amber-500 transition-colors"
                            title="Reset Security (MFA/Password)"
                        >
                            <ShieldAlert size={16} />
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Staff Management"
                actionLabel="Register New Staff"
                onAction={() => setIsCreateOpen(true)}
            />

            <DataTable
                columns={columns}
                data={users?.data || []}
                isLoading={isLoading}
                keyField="id"
                emptyMessage="No staff accounts found. Register a user to provide access."
            />

            {/* Registration SlideOver */}
            <SlideOver
                title="Register New Staff Account"
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            >
                <UserForm onSuccess={() => {
                    setIsCreateOpen(false);
                    refetch();
                }} />
            </SlideOver>

            {/* Profile Details SlideOver */}
            <SlideOver
                title="User Profile Breakdown"
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
            >
                <UserDetails user={selectedUser} />
            </SlideOver>
        </div>
    );
};

export default Users;
