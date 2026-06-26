import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    children: React.ReactNode;
}

export const Button = ({
    variant = 'primary',
    children,
    className = '',
    disabled = false,
    type = 'button',
    ...props
}: ButtonProps) => {
    const baseStyles = 'px-4 py-2.5 rounded-2xl font-semibold outline-none transition-all duration-200 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm whitespace-nowrap';
    
    const variantStyles = {
        primary: 'bg-mauve-600 text-white hover:bg-mauve-700 focus:ring-mauve-600/20 border border-transparent cursor-pointer',
        secondary: 'bg-mauve-50 border border-mauve-200 text-mauve-800 hover:bg-mauve-100/50 focus:ring-mauve-500/20 cursor-pointer',
        danger: 'bg-red-500 text-white hover:bg-red-650 focus:ring-red-500/20 border border-transparent cursor-pointer'
    };

    return (
        <button
            type={type}
            disabled={disabled}
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
