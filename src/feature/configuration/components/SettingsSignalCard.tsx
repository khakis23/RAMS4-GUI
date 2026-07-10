import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { FieldLabel } from '../../../components/ui/FieldLabel';
import { tooltips } from "@/config/tooltips.ts";
import { X } from 'lucide-react';

interface SettingsSignalCardProps {
    index: number;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    remove: (index: number) => void;
    showRemove: boolean;
}

export const SettingsSignalCard = ({
    index,
    register,
    errors,
    remove,
    showRemove
}: SettingsSignalCardProps) => {
    const signalErrors = (errors.signalSettings as any)?.[index] as any;

    return (
        <div className="flex items-end gap-4 w-full bg-white p-4 border border-mauve-150 rounded-2xl shadow-sm">
            <div className="flex-1 min-w-[120px]">
                <FieldLabel text="Input Signal Name" tooltip={tooltips.settingsSignalName} required={true} />
                <Input 
                    placeholder="e.g. LoadA"
                    className={`h-9 mt-1.5 ${signalErrors?.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    {...register(`signalSettings.${index}.name`)}
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
