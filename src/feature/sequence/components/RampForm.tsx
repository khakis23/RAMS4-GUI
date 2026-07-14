import { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { tooltips } from '@/config/tooltips';

interface RampFormProps {
    index: number;
    register: any;
    errors: any;
    control: any;
    watch: any;
    setValue: any;
}

export const RampForm = ({ index, register, errors, control, watch, setValue }: RampFormProps) => {
    // Watch the values needed for conditional rendering
    const controlMode = watch(`cards.${index}.data.control`) || 'displacement';
    const dispToggle = watch(`cards.${index}.data.dispToggle`) || 'time';

    // Set default keys if they are not defined
    useEffect(() => {
        const currentControl = watch(`cards.${index}.data.control`);
        if (!currentControl) {
            setValue(`cards.${index}.data.control`, 'displacement');
            setValue(`cards.${index}.data.dispToggle`, 'time');
            setValue(`cards.${index}.data.axis`, 'A');
            setValue(`cards.${index}.data.mode`, 'absolute');
            setValue(`cards.${index}.data.max_displacement`, 1.0);
            setValue(`cards.${index}.data.enable_dic`, false);
            setValue(`cards.${index}.data.skipDICpos`, false);
            setValue(`cards.${index}.data.incrementSeg`, false);
            setValue(`cards.${index}.data.wait`, true);
        }
    }, [index, setValue, watch]);

    const rampErrors = errors?.cards?.[index]?.data;

    return (
        <div className="flex flex-col gap-6 pt-4 border-t border-mauve-150">
            {/* Main Parameters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Axis Selector */}
                <div className="flex flex-col gap-2">
                    <FieldLabel text="Axis" tooltip={tooltips.mechTestAxis} required={true} />
                    <Controller
                        control={control}
                        name={`cards.${index}.data.axis`}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || 'A'}>
                                <SelectTrigger className="h-9 border-mauve-200 focus:ring-mauve-300">
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

                {/* Mode Selector */}
                <div className="flex flex-col gap-2">
                    <FieldLabel text="Mode" tooltip={tooltips.mechTestMode} required={true} />
                    <Controller
                        control={control}
                        name={`cards.${index}.data.mode`}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || 'absolute'}>
                                <SelectTrigger className="h-9 border-mauve-200 focus:ring-mauve-300">
                                    <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="incremental" className="cursor-pointer">Incremental</SelectItem>
                                    <SelectItem value="absolute" className="cursor-pointer">Absolute</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                {/* Control Feedback Mode Selector */}
                <div className="flex flex-col gap-2">
                    <FieldLabel text="Control" tooltip={tooltips.mechTestControl} required={true} />
                    <Controller
                        control={control}
                        name={`cards.${index}.data.control`}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || 'displacement'}>
                                <SelectTrigger className="h-9 border-mauve-200 focus:ring-mauve-300">
                                    <SelectValue placeholder="Select control" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="displacement" className="cursor-pointer">Displacement</SelectItem>
                                    <SelectItem value="load" className="cursor-pointer">Load</SelectItem>
                                    <SelectItem value="strain" className="cursor-pointer">Strain</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>

            {/* Conditional Sub-parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-mauve-50/20 p-4 rounded-xl border border-mauve-150">
                {/* 1. DISPLACEMENT CONTROL */}
                {controlMode === 'displacement' && (
                    <>
                        <div className="flex flex-col gap-2">
                            <FieldLabel text="Target (mm)" tooltip={tooltips.mechTestTargetDisplacement} required={true} />
                            <Input
                                type="number"
                                step="any"
                                className={rampErrors?.target ? "border-destructive focus-visible:ring-destructive" : ""}
                                {...register(`cards.${index}.data.target`, { valueAsNumber: true })}
                            />
                            {rampErrors?.target && <p className="text-xs text-destructive">{rampErrors.target.message}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <FieldLabel
                                text={dispToggle === 'time' ? "Time (s)" : "Velocity (mm/s)"}
                                tooltip={dispToggle === 'time' ? tooltips.mechTestTime : tooltips.mechTestVelocityDisplacement}
                                required={true}
                            />
                            <div className="flex items-center gap-3">
                                <div className="flex-grow">
                                    {dispToggle === 'time' ? (
                                        <Input
                                            type="number"
                                            step="any"
                                            className={rampErrors?.time ? "border-destructive focus-visible:ring-destructive" : ""}
                                            {...register(`cards.${index}.data.time`, { valueAsNumber: true })}
                                        />
                                    ) : (
                                        <Input
                                            type="number"
                                            step="any"
                                            className={rampErrors?.velocity ? "border-destructive focus-visible:ring-destructive" : ""}
                                            {...register(`cards.${index}.data.velocity`, { valueAsNumber: true })}
                                        />
                                    )}
                                </div>

                                {/* Horizontally aligned Time/Velocity selector inline with input field */}
                                <div className="flex items-center gap-1.5 border border-mauve-200 bg-mauve-100/50 p-1 rounded-xl text-xs font-semibold shrink-0 h-9">
                                    <button
                                        type="button"
                                        onClick={() => setValue(`cards.${index}.data.dispToggle`, 'time')}
                                        className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${dispToggle === 'time' ? 'bg-white text-mauve-850 shadow-sm font-bold' : 'text-mauve-600 hover:text-mauve-850'}`}
                                    >
                                        Time
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setValue(`cards.${index}.data.dispToggle`, 'velocity')}
                                        className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${dispToggle === 'velocity' ? 'bg-white text-mauve-850 shadow-sm font-bold' : 'text-mauve-600 hover:text-mauve-850'}`}
                                    >
                                        Velocity
                                    </button>
                                </div>
                            </div>
                            {dispToggle === 'time' && rampErrors?.time && <p className="text-xs text-destructive">{rampErrors.time.message}</p>}
                            {dispToggle === 'velocity' && rampErrors?.velocity && <p className="text-xs text-destructive">{rampErrors.velocity.message}</p>}
                        </div>
                    </>
                )}

                {/* 2. LOAD CONTROL */}
                {controlMode === 'load' && (
                    <>
                        <div className="flex flex-col gap-2">
                            <FieldLabel text="Target (N)" tooltip={tooltips.mechTestTargetLoad} required={true} />
                            <Input
                                type="number"
                                step="any"
                                className={rampErrors?.target ? "border-destructive focus-visible:ring-destructive" : ""}
                                {...register(`cards.${index}.data.target`, { valueAsNumber: true })}
                            />
                            {rampErrors?.target && <p className="text-xs text-destructive">{rampErrors.target.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <FieldLabel text="Velocity (N/s)" tooltip={tooltips.mechTestVelocityLoad} required={true} />
                            <Input
                                type="number"
                                step="any"
                                className={rampErrors?.velocity ? "border-destructive focus-visible:ring-destructive" : ""}
                                {...register(`cards.${index}.data.velocity`, { valueAsNumber: true })}
                            />
                            {rampErrors?.velocity && <p className="text-xs text-destructive">{rampErrors.velocity.message}</p>}
                        </div>
                    </>
                )}

                {/* 3. STRAIN CONTROL */}
                {controlMode === 'strain' && (
                    <>
                        <div className="flex flex-col gap-2">
                            <FieldLabel text="Target" tooltip={tooltips.mechTestTargetStrain} required={true} />
                            <Input
                                type="number"
                                step="any"
                                className={rampErrors?.target ? "border-destructive focus-visible:ring-destructive" : ""}
                                {...register(`cards.${index}.data.target`, { valueAsNumber: true })}
                            />
                            {rampErrors?.target && <p className="text-xs text-destructive">{rampErrors.target.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <FieldLabel text="Velocity (s^-1)" tooltip={tooltips.mechTestVelocityStrain} required={true} />
                            <Input
                                type="number"
                                step="any"
                                className={rampErrors?.velocity ? "border-destructive focus-visible:ring-destructive" : ""}
                                {...register(`cards.${index}.data.velocity`, { valueAsNumber: true })}
                            />
                            {rampErrors?.velocity && <p className="text-xs text-destructive">{rampErrors.velocity.message}</p>}
                        </div>
                    </>
                )}
            </div>

            {/* Advanced Settings Collapsible Section using Shadcn Accordion */}
            <Accordion type="single" collapsible className="border border-mauve-200 rounded-xl overflow-hidden bg-white shadow-sm w-full">
                <AccordionItem value="advanced-parameters" className="border-b-0">
                    <AccordionTrigger className="px-4 py-3 bg-mauve-50/50 hover:bg-mauve-50 transition-colors text-xs font-bold text-mauve-850 hover:no-underline [&>svg]:text-mauve-500">
                        Advanced Parameters
                    </AccordionTrigger>
                    <AccordionContent className="p-4 flex flex-col gap-5 border-t border-mauve-200 pb-4">
                        {/* Max Displacement Parameter */}
                        <div className="flex flex-col gap-2 max-w-sm">
                            <FieldLabel text="Max Displacement (mm)" tooltip={tooltips.mechTestMaxDisplacement} />
                            <Input
                                type="number"
                                step="any"
                                className={rampErrors?.max_displacement ? "border-destructive focus-visible:ring-destructive" : ""}
                                {...register(`cards.${index}.data.max_displacement`, { valueAsNumber: true })}
                            />
                            {rampErrors?.max_displacement && <p className="text-xs text-destructive">{rampErrors.max_displacement.message}</p>}
                        </div>

                        {/* Switch parameters grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                            {/* Enable DIC */}
                            <div className="flex items-center justify-between p-3 rounded-xl border border-mauve-150 bg-mauve-50/10">
                                <FieldLabel text="Enable DIC" tooltip={tooltips.mechTestEnableDic} />
                                <Controller
                                    control={control}
                                    name={`cards.${index}.data.enable_dic`}
                                    render={({ field }) => (
                                        <Switch
                                            checked={!!field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>

                            {/* Skip DIC Position */}
                            <div className="flex items-center justify-between p-3 rounded-xl border border-mauve-150 bg-mauve-50/10">
                                <FieldLabel text="Skip DIC Position" tooltip={tooltips.mechTestSkipDicPosition} />
                                <Controller
                                    control={control}
                                    name={`cards.${index}.data.skipDICpos`}
                                    render={({ field }) => (
                                        <Switch
                                            checked={!!field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>

                            {/* Increment Segment */}
                            <div className="flex items-center justify-between p-3 rounded-xl border border-mauve-150 bg-mauve-50/10">
                                <FieldLabel text="Increment Segment" tooltip={tooltips.mechTestIncrementSeg} />
                                <Controller
                                    control={control}
                                    name={`cards.${index}.data.incrementSeg`}
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
                                    name={`cards.${index}.data.wait`}
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

