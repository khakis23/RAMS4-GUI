// @ts-ignore
import React from 'react';


interface InputFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'number';
    disabled?: boolean;
    align?: 'left' | 'center';
    required?: boolean;
}

export const InputField = ({
    label,
    value,
    onChange,
    placeholder='',
    type='text',
    disabled=false,
    align='left',
    required=true,
}: InputFieldProps) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    }

    const labelClass = required
        ? 'text-sm font-semibold text-mauve-800'
        : 'text-sm font-medium text-mauve-500 opacity-80';

    return (
        <div className={`flex flex-col gap-1.5 w-full ${align === 'center' ? 'text-center items-center' : 'text-left items-start'}`}>
            <label className={labelClass}>
                {label}
            </label>

            {/* input */}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 bg-mauve-50 border border-mauve-200 rounded-2xl text-mauve-800 placeholder-mauve-400 font-medium outline-none transition-all duration-200 focus:border-mauve-500 focus:ring-2 focus:ring-mauve-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${
                    align === 'center' ? 'text-center' : 'text-left'
                }`}
                disabled={disabled}>
            </input>
        </div>
    )
}
