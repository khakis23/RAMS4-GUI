import { Control, Controller, UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { FieldLabel } from '../../../components/ui/FieldLabel';
import { tooltips } from "@/config/tooltips.ts";
import { Trash2 } from 'lucide-react';

interface SettingsAxisCardProps {
    index: number;
    control: Control<any>;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    remove: (index: number) => void;
    showRemove: boolean;
    takenNames: string[];
}

export const SettingsAxisCard = ({
    index,
    control,
    register,
    errors,
    remove,
    showRemove,
    takenNames
}: SettingsAxisCardProps) => {
    const axisErrors = (errors.axesSettings as any)?.[index] as any;

    return (
        <div className="flex items-end gap-4 w-full bg-white p-4 border border-mauve-150 rounded-2xl shadow-sm">
            <div className="flex-1 grid grid-cols-3 gap-4">
                <div>
                    <FieldLabel text="Axis Name" tooltip={tooltips.settingsAxisName} required={true} />
                    <Input
                        type="text"
                        placeholder="e.g. A, SAM_X"
                        className={`h-9 mt-1.5 ${axisErrors?.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        {...register(`axesSettings.${index}.name`)}
                    />
                    {axisErrors?.name && (
                        <p className="text-[10px] text-destructive mt-1">{axisErrors.name.message}</p>
                    )}
                </div>

                <div>
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

                <div>
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
