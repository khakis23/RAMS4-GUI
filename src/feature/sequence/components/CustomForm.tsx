import { Control, Controller, UseFormRegister, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { tooltips } from '@/config/tooltips';

interface CustomFormProps {
    namePrefix: string;
    register: UseFormRegister<any>;
    control: Control<any>;
}

export const CustomForm = ({
    namePrefix,
    register,
    control
}: CustomFormProps) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `${namePrefix}.data.parameters`
    });

    const handleAddParameter = () => {
        append({
            key: '',
            type: 'String',
            value: ''
        });
    };

    return (
        <div className="flex flex-col gap-6 pt-4 border-t border-mauve-150 text-left">
            {/* Top Permanent Field: Command Name (50% width) */}
            <div className="w-1/2 flex flex-col gap-2">
                <FieldLabel text="Command Name" tooltip={tooltips.mechTestCustomCommandName} required={false} />
                <Input 
                    placeholder="e.g. Trigger Laser Pulse"
                    className="w-full"
                    {...register(`${namePrefix}.data.commandName`)}
                />
            </div>

            {/* Bottom Parameters Section */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <FieldLabel text="Parameters" tooltip={tooltips.mechTestCustomParameters} required={false} />
                    <Button 
                        type="button" 
                        variant="secondary"
                        size="sm"
                        className="h-8 px-3 text-xs font-semibold rounded-lg bg-white border border-mauve-300 hover:bg-mauve-50 text-mauve-850 cursor-pointer shadow-sm"
                        onClick={handleAddParameter}
                    >
                        <Plus className="h-3.5 w-3.5 mr-1" /> New Parameter
                    </Button>
                </div>

                {fields.length === 0 ? (
                    <div className="text-xs text-mauve-500 italic py-3 text-center border border-dashed border-mauve-200 dark:border-zinc-800 rounded-lg">
                        No custom parameters added yet. Click &quot;New Parameter&quot; to add key-value options.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {fields.map((field, paramIndex) => (
                            <div 
                                key={field.id} 
                                className="flex items-end gap-3 w-full bg-white dark:bg-zinc-900/60 p-3 rounded-lg border border-mauve-200 dark:border-zinc-800 shadow-sm"
                            >
                                {/* Key Input */}
                                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                    <FieldLabel text="Key" tooltip={tooltips.mechTestCustomParamKey} required={false} />
                                    <Input 
                                        placeholder="e.g. power"
                                        className="w-full"
                                        {...register(`${namePrefix}.data.parameters.${paramIndex}.key`)}
                                    />
                                </div>

                                {/* Value Type Dropdown */}
                                <div className="w-36 shrink-0 flex flex-col gap-1.5">
                                    <FieldLabel text="Value Type" tooltip={tooltips.mechTestCustomParamType} required={false} />
                                    <Controller
                                        control={control}
                                        name={`${namePrefix}.data.parameters.${paramIndex}.type`}
                                        render={({ field: typeField }) => (
                                            <Select 
                                                value={typeField.value || 'String'} 
                                                onValueChange={(val) => {
                                                    typeField.onChange(val);
                                                    if (val === 'Bool') {
                                                        control._formValues[namePrefix]?.data?.parameters?.[paramIndex] && (control._formValues[namePrefix].data.parameters[paramIndex].value = false);
                                                    } else if (val === 'Number') {
                                                        control._formValues[namePrefix]?.data?.parameters?.[paramIndex] && (control._formValues[namePrefix].data.parameters[paramIndex].value = 0);
                                                    } else {
                                                        control._formValues[namePrefix]?.data?.parameters?.[paramIndex] && (control._formValues[namePrefix].data.parameters[paramIndex].value = '');
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white">
                                                    <SelectItem value="Bool" className="cursor-pointer">Bool</SelectItem>
                                                    <SelectItem value="Number" className="cursor-pointer">Number</SelectItem>
                                                    <SelectItem value="String" className="cursor-pointer">String</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                {/* Value Field */}
                                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                    <FieldLabel text="Value" tooltip={tooltips.mechTestCustomParamValue} required={false} />
                                    <Controller
                                        control={control}
                                        name={`${namePrefix}.data.parameters.${paramIndex}`}
                                        render={({ field: paramItem }) => {
                                            const paramType = paramItem.value?.type || 'String';
                                            
                                            if (paramType === 'Bool') {
                                                return (
                                                    <Controller
                                                        control={control}
                                                        name={`${namePrefix}.data.parameters.${paramIndex}.value`}
                                                        render={({ field: boolField }) => (
                                                            <Select 
                                                                value={boolField.value === true || String(boolField.value) === 'true' ? 'true' : 'false'}
                                                                onValueChange={(val) => boolField.onChange(val === 'true')}
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select bool" />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-white">
                                                                    <SelectItem value="true" className="cursor-pointer">True</SelectItem>
                                                                    <SelectItem value="false" className="cursor-pointer">False</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                );
                                            }

                                            if (paramType === 'Number') {
                                                return (
                                                    <Input 
                                                        type="number"
                                                        step="any"
                                                        placeholder="Value"
                                                        className="w-full"
                                                        {...register(`${namePrefix}.data.parameters.${paramIndex}.value`, { valueAsNumber: true })}
                                                    />
                                                );
                                            }

                                            return (
                                                <Input 
                                                    type="text"
                                                    placeholder="Value"
                                                    className="w-full"
                                                    {...register(`${namePrefix}.data.parameters.${paramIndex}.value`)}
                                                />
                                            );
                                        }}
                                    />
                                </div>

                                {/* Trash2 Button */}
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-9 w-9 shrink-0 text-mauve-400 dark:text-mauve-500 hover:text-destructive hover:bg-destructive/10 dark:hover:text-red-400 dark:hover:bg-red-500/20 rounded-lg cursor-pointer transition-colors"
                                    onClick={() => remove(paramIndex)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
