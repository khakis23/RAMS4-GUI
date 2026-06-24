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
}

export const CheckBoxes = ({
                               label,
                               options,
                               onChange,
                               selectedIds,
                               direction = 'horizontal',
                               align = 'left'
                           }: CheckBoxesProps) => {
    const handleCheck = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((selectedId) => selectedId !== id))
        }
        else {
            onChange([...selectedIds, id])
        }
    }

    return (
        <div className={`flex flex-col gap-2 w-full ${align === 'center' ? 'text-center items-center' : 'text-left items-start'}`}>
            {label && <span className="text-sm font-semibold text-mauve-800">{label}</span>}
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
