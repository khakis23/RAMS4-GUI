import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { FieldLabel } from '../../../components/ui/FieldLabel';
import { tooltips } from "@/config/tooltips.ts";
import { X } from 'lucide-react';

interface SettingsAxisCardProps {
    index: number;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    remove: (index: number) => void;
    showRemove: boolean;
}

export const SettingsAxisCard = ({
    index,
    register,
    errors,
    remove,
    showRemove
}: SettingsAxisCardProps) => {
    const axisErrors = (errors.axesSettings as any)?.[index] as any;

    return (
        <div className="flex items-end gap-4 w-full bg-white p-4 border border-mauve-150 rounded-2xl shadow-sm">
            <div className="flex-1 min-w-[120px]">
                <FieldLabel text="Axis Name" tooltip={tooltips.settingsAxisName} required={true} />
                <Input 
                    placeholder="e.g. A"
                    className={`h-9 mt-1.5 ${axisErrors?.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    {...register(`axesSettings.${index}.name`)}
                />
                {axisErrors?.name && (
                    <p className="text-[10px] text-destructive mt-1">{axisErrors.name.message}</p>
                )}
            </div>

            <div className="w-36">
                <FieldLabel text="Max Velocity" tooltip={tooltips.settingsAxisMaxVelocity} required={true} />
                <Input 
                    type="number" 
                    placeholder="Velocity"
                    className={`h-9 mt-1.5 ${axisErrors?.max_velocity ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    {...register(`axesSettings.${index}.max_velocity`, { valueAsNumber: true })}
                />
                {axisErrors?.max_velocity && (
                    <p className="text-[10px] text-destructive mt-1">{axisErrors.max_velocity.message}</p>
                )}
            </div>

            <div className="w-36">
                <FieldLabel text="Max Acceleration" tooltip={tooltips.settingsAxisMaxAcceleration} required={true} />
                <Input 
                    type="number" 
                    placeholder="Accel."
                    className={`h-9 mt-1.5 ${axisErrors?.max_acceleration ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    {...register(`axesSettings.${index}.max_acceleration`, { valueAsNumber: true })}
                />
                {axisErrors?.max_acceleration && (
                    <p className="text-[10px] text-destructive mt-1">{axisErrors.max_acceleration.message}</p>
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
