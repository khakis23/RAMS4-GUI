import { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { tooltips } from '@/config/tooltips';
import { useAvailableAxes } from '@/hooks/useAvailableAxes';

interface RampFormProps {
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

export const RampForm = ({ namePrefix, register, errors, control, watch, setValue }: RampFormProps) => {
    const availableAxes = useAvailableAxes();
    // Watch the values needed for conditional rendering
    const controlMode = watch(`${namePrefix}.data.control`) || 'displacement';
    const dispToggle = watch(`${namePrefix}.data.dispToggle`) || 'time';

    // Set default keys if they are not defined
    useEffect(() => {
        const currentControl = watch(`${namePrefix}.data.control`);
        const currentAxis = watch(`${namePrefix}.data.axis`);
        const currentMode = watch(`${namePrefix}.data.mode`);
        const currentDispToggle = watch(`${namePrefix}.data.dispToggle`);
        const currentMaxDisp = watch(`${namePrefix}.data.max_displacement`);
        const currentEnableDic = watch(`${namePrefix}.data.enable_dic`);
        const currentSkipDic = watch(`${namePrefix}.data.skipDICpos`);
        const currentIncSeg = watch(`${namePrefix}.data.incrementSeg`);
        const currentWait = watch(`${namePrefix}.data.wait`);

        if (currentControl === undefined || currentControl === null) {
            setValue(`${namePrefix}.data.control`, 'displacement');
        }
        if (currentDispToggle === undefined || currentDispToggle === null) {
            setValue(`${namePrefix}.data.dispToggle`, 'time');
        }
        if (currentAxis === undefined || currentAxis === null || !availableAxes.includes(currentAxis)) {
            setValue(`${namePrefix}.data.axis`, availableAxes[0] || 'A');
        }
        if (currentMode === undefined || currentMode === null) {
            setValue(`${namePrefix}.data.mode`, 'absolute');
        }
        if (currentMaxDisp === undefined || currentMaxDisp === null) {
            setValue(`${namePrefix}.data.max_displacement`, 1.0);
        }
        if (currentEnableDic === undefined || currentEnableDic === null) {
            setValue(`${namePrefix}.data.enable_dic`, false);
        }
        if (currentSkipDic === undefined || currentSkipDic === null) {
            setValue(`${namePrefix}.data.skipDICpos`, false);
        }
        if (currentIncSeg === undefined || currentIncSeg === null) {
            setValue(`${namePrefix}.data.incrementSeg`, false);
        }
        if (currentWait === undefined || currentWait === null) {
            setValue(`${namePrefix}.data.wait`, true);
        }
    }, [namePrefix, setValue, watch, availableAxes]);

    const rampErrors = getNestedError(errors, namePrefix)?.data;

    return (
        <div className="flex flex-col gap-6 pt-4 border-t border-mauve-150">
            {/* Main Parameters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                {/* Mode Selector */}
                <div className="flex flex-col gap-2">
                    <FieldLabel text="Mode" tooltip={tooltips.mechTestMode} required={true} />
                    <Controller
                        control={control}
                        name={`${namePrefix}.data.mode`}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || 'absolute'}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="relative" className="cursor-pointer">Relative</SelectItem>
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
                        name={`${namePrefix}.data.control`}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || 'displacement'}>
                                <SelectTrigger className="w-full">
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
                                {...register(`${namePrefix}.data.target`, { valueAsNumber: true })}
                            />
                            {rampErrors?.target && <p className="text-xs text-destructive">{rampErrors.target.message}</p>}
                        </div>

                        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 items-center">

                            {/* Row 1: Label (Placed in column 2 above the input) */}
                            <div className="col-start-2">
                                <FieldLabel
                                    text={dispToggle === 'time' ? "Time (s)" : "Velocity (mm/s)"}
                                    tooltip={dispToggle === 'time' ? tooltips.mechTestTime : tooltips.mechTestVelocityDisplacement}
                                    required={true}
                                />
                            </div>

                            {/* Row 2, Col 1: Inline Time/Velocity selector */}
                            <div className="col-start-1 flex items-center gap-1.5 border border-mauve-200 bg-mauve-100/50 p-1 rounded-xl text-xs font-semibold shrink-0 h-9">
                                <button
                                    type="button"
                                    onClick={() => setValue(`${namePrefix}.data.dispToggle`, 'time')}
                                    className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${dispToggle === 'time' ? 'bg-white text-mauve-850 shadow-sm font-bold' : 'text-mauve-600 hover:text-mauve-850'}`}
                                >
                                    Time
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setValue(`${namePrefix}.data.dispToggle`, 'velocity')}
                                    className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${dispToggle === 'velocity' ? 'bg-white text-mauve-850 shadow-sm font-bold' : 'text-mauve-600 hover:text-mauve-850'}`}
                                >
                                    Velocity
                                </button>
                            </div>

                            {/* Row 2, Col 2: Input Field */}
                            <div className="col-start-2">
                                {dispToggle === 'time' ? (
                                    <Input
                                        type="number"
                                        step="any"
                                        className={rampErrors?.time ? "border-destructive focus-visible:ring-destructive" : ""}
                                        {...register(`${namePrefix}.data.time`, { valueAsNumber: true })}
                                    />
                                ) : (
                                    <Input
                                        type="number"
                                        step="any"
                                        className={rampErrors?.velocity ? "border-destructive focus-visible:ring-destructive" : ""}
                                        {...register(`${namePrefix}.data.velocity`, { valueAsNumber: true })}
                                    />
                                )}
                            </div>

                            {/* Row 3: Error Messages (Placed in column 2 below the input) */}
                            <div className="col-start-2">
                                {dispToggle === 'time' && rampErrors?.time && (
                                    <p className="text-xs text-destructive">{rampErrors.time.message}</p>
                                )}
                                {dispToggle === 'velocity' && rampErrors?.velocity && (
                                    <p className="text-xs text-destructive">{rampErrors.velocity.message}</p>
                                )}
                            </div>

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
                                {...register(`${namePrefix}.data.target`, { valueAsNumber: true })}
                            />
                            {rampErrors?.target && <p className="text-xs text-destructive">{rampErrors.target.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <FieldLabel text="Velocity (N/s)" tooltip={tooltips.mechTestVelocityLoad} required={true} />
                            <Input
                                type="number"
                                step="any"
                                className={rampErrors?.velocity ? "border-destructive focus-visible:ring-destructive" : ""}
                                {...register(`${namePrefix}.data.velocity`, { valueAsNumber: true })}
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
                                {...register(`${namePrefix}.data.target`, { valueAsNumber: true })}
                            />
                            {rampErrors?.target && <p className="text-xs text-destructive">{rampErrors.target.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <FieldLabel text="Velocity (s^-1)" tooltip={tooltips.mechTestVelocityStrain} required={true} />
                            <Input
                                type="number"
                                step="any"
                                className={rampErrors?.velocity ? "border-destructive focus-visible:ring-destructive" : ""}
                                {...register(`${namePrefix}.data.velocity`, { valueAsNumber: true })}
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
                                {...register(`${namePrefix}.data.max_displacement`, { valueAsNumber: true })}
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
                                    name={`${namePrefix}.data.enable_dic`}
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
                                    name={`${namePrefix}.data.skipDICpos`}
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

