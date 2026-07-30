import { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { tooltips } from '@/config/tooltips';
import { useAvailableAxes } from '@/hooks/useAvailableAxes';

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
    const availableAxes = useAvailableAxes();
    const controlMode = watch(`${namePrefix}.data.control`) || 'load';

    // Set default values if not defined
    useEffect(() => {
        const currentControl = watch(`${namePrefix}.data.control`);
        const currentAxis = watch(`${namePrefix}.data.axis`);
        const currentIncSeg = watch(`${namePrefix}.data.incrementSeg`);
        const currentWait = watch(`${namePrefix}.data.wait`);

        if (currentControl === undefined || currentControl === null) {
            setValue(`${namePrefix}.data.control`, 'load');
        }
        if (currentAxis === undefined || currentAxis === null || !availableAxes.includes(currentAxis)) {
            setValue(`${namePrefix}.data.axis`, availableAxes[0] || 'A');
        }
        if (currentIncSeg === undefined || currentIncSeg === null) {
            setValue(`${namePrefix}.data.incrementSeg`, false);
        }
        if (currentWait === undefined || currentWait === null) {
            setValue(`${namePrefix}.data.wait`, true);
        }
    }, [namePrefix, setValue, watch, availableAxes]);

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
                        render={({ field }) => {
                            const axisOptions = availableAxes;
                            const selectValue = availableAxes.includes(field.value) ? field.value : (availableAxes[0] || 'A');
                            return (
                                <Select onValueChange={field.onChange} value={selectValue}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select axis" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {axisOptions.map((axis) => (
                                            <SelectItem key={axis} value={axis} className="cursor-pointer">
                                                {axis}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            );
                        }}
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

            {/* Advanced Settings Collapsible Section using Shadcn Accordion */}
            <Accordion type="single" collapsible className="border border-mauve-200 rounded-xl overflow-hidden bg-white shadow-sm w-full">
                <AccordionItem value="advanced-parameters" className="border-b-0">
                    <AccordionTrigger className="px-4 py-3 bg-mauve-50/50 hover:bg-mauve-50 transition-colors text-xs font-bold text-mauve-850 hover:no-underline [&>svg]:text-mauve-500">
                        Advanced Parameters
                    </AccordionTrigger>
                    <AccordionContent className="p-4 flex flex-col gap-5 border-t border-mauve-200 pb-4">
                        {/* Switch parameters grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                            {/* Increment Segment */}
                            <div className="flex items-center justify-between p-3 rounded-xl border border-mauve-150 bg-mauve-50/10">
                                <FieldLabel text="Increment Segment" tooltip={tooltips.mechTestIncrementSeg} />
                                <Controller
                                    control={control}
                                    name={`${namePrefix}.data.incrementSeg`}
                                    render={({ field }) => (
                                        <Switch
                                            checked={!!field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>

                            {/* Wait */}
                            <div className="flex items-center justify-between p-3 rounded-xl border border-mauve-150 bg-mauve-50/10">
                                <FieldLabel text="Wait" tooltip={tooltips.mechTestWait} />
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
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};
