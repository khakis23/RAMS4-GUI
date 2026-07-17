import { Control, Controller, UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { FieldLabel } from '../../../components/ui/FieldLabel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { tooltips } from "@/config/tooltips.ts";
import { X } from 'lucide-react';

const AXIS_OPTIONS = ['A', 'B', 'RA', 'RB', 'TENS'] as const;

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
            <div className="w-36">
                <FieldLabel text="Axis Name" tooltip={tooltips.settingsAxisName} required={true} />
                <Controller
                    control={control}
                    name={`axesSettings.${index}.name`}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                            <SelectTrigger className={`h-9 mt-1.5 ${axisErrors?.name ? "border-destructive focus-visible:ring-destructive" : ""}`}>
                                <SelectValue placeholder="Select axis" />
                            </SelectTrigger>
                            <SelectContent>
                                {AXIS_OPTIONS.map(axis => (
                                    <SelectItem
                                        key={axis}
                                        value={axis}
                                        disabled={takenNames.includes(axis)}
                                    >
                                        {axis}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
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
                    className="h-9 w-9 text-red-600 hover:bg-red-50 hover:text-red-800 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300 p-0 rounded-xl shrink-0"
                    onClick={() => remove(index)}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
};
