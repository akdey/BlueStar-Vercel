import React, { type InputHTMLAttributes, type SelectHTMLAttributes } from 'react';
import Tooltip from './Tooltip';
import { type UseFormRegisterReturn } from 'react-hook-form';

interface FormFieldProps {
    label: string;
    error?: string;
    tooltip?: string;
    required?: boolean;
    children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    error,
    tooltip,
    required,
    children
}) => {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
                {tooltip && <Tooltip content={tooltip} />}
            </label>
            {children}
            {error && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>}
        </div>
    );
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    tooltip?: string;
    registration?: UseFormRegisterReturn;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    tooltip,
    registration,
    className = "",
    ...props
}) => {
    return (
        <FormField label={label} error={error} tooltip={tooltip} required={props.required}>
            <input
                {...registration}
                {...props}
                className={`
                    w-full px-4 py-2.5 
                    bg-white/80 dark:bg-slate-800/50 
                    backdrop-blur-sm
                    border border-gray-200 dark:border-slate-700
                    rounded-xl shadow-sm 
                    text-gray-900 dark:text-gray-100
                    placeholder-gray-400 dark:placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 
                    focus:border-blue-500 dark:focus:border-blue-400
                    text-sm transition-all duration-200
                    disabled:bg-gray-50 dark:disabled:bg-slate-900/50 
                    disabled:text-gray-500 dark:disabled:text-gray-600
                    disabled:cursor-not-allowed
                    ${error ? 'border-red-300 dark:border-red-500/50 focus:ring-red-200 dark:focus:ring-red-400/50 focus:border-red-500 dark:focus:border-red-400' : ''}
                    ${className}
                `}
            />
        </FormField>
    );
};

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string | number; label: string }[];
    error?: string;
    tooltip?: string;
    registration?: UseFormRegisterReturn;
    placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
    label,
    options,
    error,
    tooltip,
    registration,
    placeholder = "Select an option",
    className = "",
    ...props
}) => {
    return (
        <FormField label={label} error={error} tooltip={tooltip} required={props.required}>
            <select
                {...registration}
                {...props}
                defaultValue=""
                className={`
                    w-full px-4 py-2.5 
                    bg-white/80 dark:bg-slate-800/50 
                    backdrop-blur-sm
                    border border-gray-200 dark:border-slate-700
                    rounded-xl shadow-sm 
                    text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50
                    focus:border-blue-500 dark:focus:border-blue-400
                    text-sm transition-all duration-200 
                    appearance-none
                    cursor-pointer
                    disabled:bg-gray-50 dark:disabled:bg-slate-900/50 
                    disabled:text-gray-500 dark:disabled:text-gray-600
                    disabled:cursor-not-allowed
                    ${error ? 'border-red-300 dark:border-red-500/50 focus:ring-red-200 dark:focus:ring-red-400/50 focus:border-red-500 dark:focus:border-red-400' : ''}
                    ${className}
                `}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                }}
            >
                <option value="" disabled>{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </FormField>
    );
};
