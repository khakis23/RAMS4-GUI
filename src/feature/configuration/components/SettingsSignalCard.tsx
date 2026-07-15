import { Control, Controller, UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { FieldLabel } from '../../../components/ui/FieldLabel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { tooltips } from "@/config/tooltips.ts";
import { X } from 'lucide-react';

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
            <div className="w-36">
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

            <div className="w-28">
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

            <div className="w-28">
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

            <div className="w-28">
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

            {showRemove && (
                <Button 
                    type="button" 
                    variant="secondary" 
                    className="h-9 w-9 text-red-600 hover:bg-red-50 hover:text-red-800 p-0 rounded-xl shrink-0"
                    onClick={() => remove(index)}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
};
