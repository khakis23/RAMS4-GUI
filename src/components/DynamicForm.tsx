import React from 'react';
import { Dropdown } from './DropDown';
import { InputField } from './InputField';
import { CheckBoxes } from "./CheckBoxes.tsx";
import { FieldSchema, FieldWidth } from '../types/schema';


interface DynamicFormProps<T> {
    schema: FieldSchema[];
    data: T;
    onChange: (newData: T) => void;
    layout?: 'vertical' | 'horizontal';
}

export const DynamicForm = <T extends Record<string, any>>({
    schema,
    data,
    onChange,
    layout = 'horizontal'
}: DynamicFormProps<T>) => {

    const handleUpdate = (fieldId: string, value: any) => {
        const updated = { ...data, [fieldId]: value };

        // Reset fields that are no longer visible under the new state
        schema.forEach((field) => {
            if (field.showIf && !field.showIf(updated)) {
                const fallback = field.defaultValue !== undefined
                    ? field.defaultValue
                    : (field.type === 'checkboxes' ? [] : '');
                updated[field.id as keyof T] = fallback as any;
            }
        });

        onChange(updated as T);
    };

    const getWidthClass = (width?: FieldWidth) => {
        if (layout === 'vertical') {
            return 'w-full';
        }

        switch (width) {
            case 'small':
                return 'flex-1 min-w-[120px] max-w-[180px]';
            case 'medium':
                return 'flex-1 min-w-[200px] max-w-[300px]';
            case 'large':
                return 'flex-1 min-w-[320px] max-w-[480px]';
            case 'full':
                return 'w-full';
            default:
                return 'flex-1 min-w-[200px]';
        }
    };

    const wrapperClass = layout === 'horizontal'
        ? 'flex flex-row flex-wrap gap-4 items-end w-full'
        : 'flex flex-col gap-4 w-full';

    return (
        <div className={wrapperClass}>
            {schema.map((field) => {
                // Graph Check: Should we render this node?
                if (field.showIf && !field.showIf(data))
                    return null;

                const fieldContent = (() => {
                    const isRequired = field.required !== false;
                    switch (field.type) {
                        case 'dropdown':
                            return (
                                <Dropdown
                                    label={field.label + (isRequired ? ' *' : '')}
                                    options={field.options || []}
                                    selectedId={data[field.id] || ''}
                                    onChange={(val) => handleUpdate(field.id, val)}
                                    placeholder={field.placeholder}
                                    required={isRequired}
                                />
                            );
                        case 'number':
                        case 'text':
                            return (
                                <InputField
                                    label={field.label +  (isRequired ? ' *' : '')}
                                    type={field.type}
                                    value={data[field.id] || ''}
                                    onChange={(val) => handleUpdate(field.id, val)}
                                    placeholder={field.placeholder}
                                    required={isRequired}
                                />
                            );
                        case 'checkboxes':
                            return (
                                <CheckBoxes
                                    label={field.label + (isRequired ? ' *' : '')}
                                    options={field.options || []}
                                    selectedIds={data[field.id] || []}
                                    onChange={(val) => handleUpdate(field.id, val)}
                                    direction="horizontal"
                                    required={isRequired}
                                />
                            );
                        default:
                            return null;
                    }
                })();

                if (!fieldContent) return null;

                return (
                    <div key={field.id} className={getWidthClass(field.width)}>
                        {fieldContent}
                    </div>
                );
            })}
        </div>
    );
};