import React from 'react';
import { Loader2 } from 'lucide-react';

interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    width?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    keyField: keyof T;
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
}

function DataTable<T>({
    columns,
    data,
    isLoading,
    keyField,
    onRowClick,
    emptyMessage = "No data available"
}: DataTableProps<T>) {

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-card/80 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl border border-theme shadow-sm min-h-[300px]">
                <Loader2 className="w-8 h-8 text-primary dark:text-accent animate-spin mb-4" />
                <p className="text-muted text-sm font-medium">Loading data...</p>
            </div>
        );
    }

    if (!data || !data.length) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-card/80 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl border border-theme shadow-sm min-h-[300px]">
                <div className="w-16 h-16 bg-main dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl text-muted text-opacity-50">?</span>
                </div>
                <p className="text-muted text-sm font-medium">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="bg-card/80 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl border border-theme shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y border-theme">
                    <thead className="bg-main-hover dark:bg-slate-800/50">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    scope="col"
                                    className={`
                                        px-4 py-3 sm:px-6 sm:py-4 text-left text-xs font-black text-muted uppercase tracking-wider
                                        ${column.width ? column.width : ''}
                                    `}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {data.map((row) => (
                            <tr
                                key={String(row[keyField])}
                                onClick={() => onRowClick && onRowClick(row)}
                                className={`
                                    transition-colors duration-200
                                    ${onRowClick
                                        ? 'cursor-pointer hover:bg-primary/5 dark:hover:bg-accent/5'
                                        : 'hover:bg-main-hover/30'
                                    }
                                `}
                            >
                                {columns.map((column, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-main dark:text-gray-300 font-medium"
                                    >
                                        {column.cell
                                            ? column.cell(row)
                                            : column.accessorKey
                                                ? (row[column.accessorKey] as any)
                                                : null
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DataTable;
