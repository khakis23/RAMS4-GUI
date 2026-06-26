import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';


export interface DropdownOption {
    id: string;
    label: string;
}

interface DropdownProps {
    label?: string;
    options: DropdownOption[];
    selectedId?: string;
    onChange: (id: string) => void;
    placeholder?: string;
    disabled?: boolean;
    align?: 'left' | 'center';
    required?: boolean;
}

export const Dropdown = ({
                             label,
                             options,
                             selectedId,
                             onChange,
                             placeholder = 'Select an option',
                             disabled = false,
                             align = 'left',
                             required = true
                         }: DropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(option => option.id === selectedId);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (id: string) => {
        onChange(id);
        setIsOpen(false);
    };

    const labelClass = required
        ? 'text-sm font-semibold text-mauve-800'
        : 'text-sm font-medium text-mauve-500 opacity-80';

    return (
        <div
            ref={dropdownRef}
            className={`relative flex flex-col gap-1.5 w-full ${
                align === 'center' ? 'text-center items-center' : 'text-left items-start'
            }`}
        >
            {label && (
                <label className={labelClass}>
                    {label}
                </label>
            )}

            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-2.5 bg-mauve-50 border border-mauve-200 rounded-2xl text-mauve-800 font-medium flex items-center justify-between outline-none transition-all duration-200 focus:border-mauve-500 focus:ring-2 focus:ring-mauve-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isOpen ? 'border-mauve-500 ring-2 ring-mauve-500/20' : ''
                } ${align === 'center' ? 'justify-center gap-2' : ''}`}
            >
                <span className={!selectedOption ? 'text-mauve-400' : ''}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-mauve-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {isOpen && !disabled && (
                <ul className="absolute top-full left-0 mt-1.5 w-full bg-mauve-50 border border-mauve-200 rounded-2xl shadow-lg z-50 overflow-hidden py-1 max-h-48 overflow-y-auto">
                    {options.map((option) => (
                        <li key={option.id}>
                            <button
                                type="button"
                                onClick={() => handleSelect(option.id)}
                                className={`w-full px-4 py-2 text-sm text-mauve-800 hover:bg-mauve-200/50 transition-colors duration-150 cursor-pointer ${
                                    align === 'center' ? 'text-center' : 'text-left'
                                } ${selectedId === option.id ? 'bg-mauve-200/30 font-semibold text-mauve-900' : 'font-medium'}`}
                            >
                                {option.label}
                            </button>
                        </li>
                    ))}
                    {options.length === 0 && (
                        <li className="px-4 py-2 text-sm text-mauve-400 italic">
                            No options available
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};
