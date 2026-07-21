import { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { Switch } from '@/components/ui/switch';
import { tooltips } from '@/config/tooltips';

interface DwellFormProps {
    namePrefix: string;
    register: any;
    errors: any;
    control: any;
    watch: any;
    setValue: any;
}

const getNestedError = (errors: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], errors);
};

export const DwellForm = ({ namePrefix, register, errors, control, watch, setValue }: DwellFormProps) => {
    const controlMode = watch(`${namePrefix}.data.control`) || 'load';

    // Set default values if not defined
    useEffect(() => {
        const currentControl = watch(`${namePrefix}.data.control`);
        const currentAxis = watch(`${namePrefix}.data.axis`);
        const currentWait = watch(`${namePrefix}.data.wait`);

        if (currentControl === undefined || currentControl === null) {
            setValue(`${namePrefix}.data.control`, 'load');
        }
        if (currentAxis === undefined || currentAxis === null) {
            setValue(`${namePrefix}.data.axis`, 'A');
        }
        if (currentWait === undefined || currentWait === null) {
            setValue(`${namePrefix}.data.wait`, true);
        }
    }, [namePrefix, setValue, watch]);

    const dwellErrors = getNestedError(errors, namePrefix)?.data;

    return (
        <div className="flex flex-col gap-6 pt-4 border-t border-mauve-150">
            {/* Main Parameters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Axis Selector */}
                <div className="flex flex-col gap-2">
                    <FieldLabel text="Axis" tooltip={tooltips.mechTestAxis} required={true} />
                    <Controller
                        control={control}
                        name={`${namePrefix}.data.axis`}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || 'A'}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select axis" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="A" className="cursor-pointer">A</SelectItem>
                                    <SelectItem value="B" className="cursor-pointer">B</SelectItem>
                                    <SelectItem value="RA" className="cursor-pointer">RA</SelectItem>
                                    <SelectItem value="RB" className="cursor-pointer">RB</SelectItem>
                                    <SelectItem value="TENS" className="cursor-pointer">TENS</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                {/* Control Mode Selector */}
                <div className="flex flex-col gap-2">
                    <FieldLabel text="Control" tooltip={tooltips.mechTestDwellControl} required={true} />
                    <Controller
                        control={control}
                        name={`${namePrefix}.data.control`}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || 'load'}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select control" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="load" className="cursor-pointer">Load</SelectItem>
                                    <SelectItem value="strain" className="cursor-pointer">Strain</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>

            {/* Sub-parameters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-mauve-50/20 p-4 rounded-xl border border-mauve-150">
                {/* Target */}
                <div className="flex flex-col gap-2">
                    <FieldLabel 
                        text={controlMode === 'load' ? "Target (N)" : "Target"} 
                        tooltip={controlMode === 'load' ? tooltips.mechTestTargetLoad : tooltips.mechTestTargetStrain} 
                        required={true} 
                    />
                    <Input
                        type="number"
                        step="any"
                        className={dwellErrors?.target ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`${namePrefix}.data.target`, { valueAsNumber: true })}
                    />
                    {dwellErrors?.target && <p className="text-xs text-destructive">{dwellErrors.target.message}</p>}
                </div>

                {/* Velocity */}
                <div className="flex flex-col gap-2">
                    <FieldLabel 
                        text={controlMode === 'load' ? "Velocity (N/s)" : "Velocity (s^-1)"} 
                        tooltip={tooltips.mechTestDwellVelocity} 
                        required={true} 
                    />
                    <Input
                        type="number"
                        step="any"
                        className={dwellErrors?.velocity ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`${namePrefix}.data.velocity`, { valueAsNumber: true })}
                    />
                    {dwellErrors?.velocity && <p className="text-xs text-destructive">{dwellErrors.velocity.message}</p>}
                </div>

                {/* Time */}
                <div className="flex flex-col gap-2">
                    <FieldLabel text="Time (s)" tooltip={tooltips.mechTestDwellTime} required={true} />
                    <Input
                        type="number"
                        step="any"
                        className={dwellErrors?.time ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`${namePrefix}.data.time`, { valueAsNumber: true })}
                    />
                    {dwellErrors?.time && <p className="text-xs text-destructive">{dwellErrors.time.message}</p>}
                </div>
            </div>

            {/* Wait Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-mauve-150 bg-mauve-50/10 max-w-xs shrink-0">
                <FieldLabel text="Wait" tooltip={tooltips.mechTestDwellWait} />
                <Controller
                    control={control}
                    name={`${namePrefix}.data.wait`}
                    render={({ field }) => (
                        <Switch
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                        />
                    )}
                />
            </div>
        </div>
    );
};
