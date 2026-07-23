import { Control, Controller, UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { FieldLabel } from '../../../components/ui/FieldLabel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { tooltips } from "@/config/tooltips.ts";
import { Trash2 } from 'lucide-react';

const SIGNAL_OPTIONS = ['Load A', 'Load B', 'Torque'] as const;

interface SettingsSignalCardProps {
    index: number;
    control: Control<any>;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    remove: (index: number) => void;
    showRemove: boolean;
    takenNames: string[];
}

export const SettingsSignalCard = ({
    index,
    control,
    register,
    errors,
    remove,
    showRemove,
    takenNames
}: SettingsSignalCardProps) => {
    const signalErrors = (errors.signalSettings as any)?.[index] as any;

    return (
        <div className="flex items-end gap-4 w-full bg-white p-4 border border-mauve-150 rounded-2xl shadow-sm">
            <div className="flex-1 grid grid-cols-4 gap-4">
                <div>
                    <FieldLabel text="Input Signal Name" tooltip={tooltips.settingsSignalName} required={true} />
                    <Controller
                        control={control}
                        name={`signalSettings.${index}.name`}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                <SelectTrigger className={`h-9 mt-1.5 ${signalErrors?.name ? "border-destructive focus-visible:ring-destructive" : ""}`}>
                                    <SelectValue placeholder="Select signal" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {SIGNAL_OPTIONS.map(sig => (
                                        <SelectItem
                                            key={sig}
                                            value={sig}
                                            disabled={takenNames.includes(sig)}
                                            className="cursor-pointer"
                                        >
                                            {sig}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {signalErrors?.name && (
                        <p className="text-[10px] text-destructive mt-1">{signalErrors.name.message}</p>
                    )}
                </div>

                <div>
                    <FieldLabel text="Scale (Slope)" tooltip={tooltips.settingsSignalScale} required={true} />
                    <Input 
                        type="number" 
                        step="any"
                        placeholder="1.0"
                        className={`h-9 mt-1.5 ${signalErrors?.slope ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        {...register(`signalSettings.${index}.slope`, { valueAsNumber: true })}
                    />
                    {signalErrors?.slope && (
                        <p className="text-[10px] text-destructive mt-1">{signalErrors.slope.message}</p>
                    )}
                </div>

                <div>
                    <FieldLabel text="Offset (Intercept)" tooltip={tooltips.settingsSignalOffset} required={true} />
                    <Input 
                        type="number" 
                        step="any"
                        placeholder="0.0"
                        className={`h-9 mt-1.5 ${signalErrors?.intercept ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        {...register(`signalSettings.${index}.intercept`, { valueAsNumber: true })}
                    />
                    {signalErrors?.intercept && (
                        <p className="text-[10px] text-destructive mt-1">{signalErrors.intercept.message}</p>
                    )}
                </div>

                <div>
                    <FieldLabel text="Channel" tooltip={tooltips.settingsSignalChannel} required={true} />
                    <Input 
                        type="number" 
                        placeholder="0"
                        className={`h-9 mt-1.5 ${signalErrors?.channel ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        {...register(`signalSettings.${index}.channel`, { valueAsNumber: true })}
                    />
                    {signalErrors?.channel && (
                        <p className="text-[10px] text-destructive mt-1">{signalErrors.channel.message}</p>
                    )}
                </div>
            </div>

            {showRemove && (
                <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-mauve-400 dark:text-mauve-500 hover:text-destructive hover:bg-destructive/10 dark:hover:text-red-400 dark:hover:bg-red-500/20 rounded-lg cursor-pointer transition-colors shrink-0 mb-0.5"
                    onClick={() => remove(index)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
};
