import React from 'react';


export interface CheckBoxesOption {
    id: string;
    label: string;
}

interface CheckBoxesProps {
    label?: string;
    options: CheckBoxesOption[];
    selectedIds: string[];
    onChange: (selectedIds: string[]) => void;
    direction?: 'horizontal' | 'vertical';
    align?: 'left' | 'center';
    required?: boolean;
}

export const CheckBoxes = ({
                               label,
                               options,
                               onChange,
                               selectedIds,
                               direction = 'horizontal',
                               align = 'left',
                               required = true
                           }: CheckBoxesProps) => {
    const handleCheck = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((selectedId) => selectedId !== id))
        }
        else {
            onChange([...selectedIds, id])
        }
    }

    const labelClass = required
        ? 'text-sm font-semibold text-mauve-800'
        : 'text-sm font-medium text-mauve-500 opacity-80';

    return (
        <div className={`flex flex-col gap-2 w-full ${align === 'center' ? 'text-center items-center' : 'text-left items-start'}`}>
            {label && <span className={labelClass}>{label}</span>}
            <div className={`flex ${direction === 'horizontal' ? 'flex-row gap-8' : 'flex-col gap-2'} ${align === 'center' ? 'justify-center' : ''}`}>
                {options.map((option) => (
                    <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selectedIds.includes(option.id)}
                            onChange={() => handleCheck(option.id)}
                        />
                        <span>{option.label}</span>
                    </label>
                ))}
            </div>
        </div>
    )
}
