import React from 'react';
import { Plus } from 'lucide-react';

interface AddButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
}

export const AddButton = ({ label = 'Add Item', className = '', ...props }: AddButtonProps) => {
    return (
        <button
            type="button"
            className={`w-full py-4 border-2 border-dashed border-mauve-300 rounded-3xl flex items-center justify-center gap-2 text-mauve-600 font-semibold cursor-pointer hover:border-mauve-500 hover:text-mauve-850 hover:bg-mauve-200/20 transition-all duration-300 active:scale-[0.99] outline-none ${className}`}
            {...props}
        >
            <Plus className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );
};
