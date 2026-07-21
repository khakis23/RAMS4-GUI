import { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { tooltips } from '@/config/tooltips';

interface CycleFormProps {
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

export const CycleForm = ({ namePrefix, register, errors, control, watch, setValue }: CycleFormProps) => {
    const controlMode = watch(`${namePrefix}.data.control`) || 'displacement';
    const countMode = watch(`${namePrefix}.data.countMode`) || 'relative';

    // Set default values if not defined
    useEffect(() => {
        const currentControl = watch(`${namePrefix}.data.control`);
        const currentAxis = watch(`${namePrefix}.data.axis`);
        const currentMode = watch(`${namePrefix}.data.mode`);
        const currentCountMode = watch(`${namePrefix}.data.countMode`);
        const currentAmpScale = watch(`${namePrefix}.data.ampScale`);
        const currentDiscoverEndpoints = watch(`${namePrefix}.data.discoverEndpoints`);
        const currentRecallEndpoints = watch(`${namePrefix}.data.recallEndpoints`);
        const currentEnableDIC = watch(`${namePrefix}.data['enable DIC']`);
        const currentWait = watch(`${namePrefix}.data.wait`);

        if (currentControl === undefined || currentControl === null) {
            setValue(`${namePrefix}.data.control`, 'displacement');
        }
        if (currentAxis === undefined || currentAxis === null) {
            setValue(`${namePrefix}.data.axis`, 'A');
        }
        if (currentMode === undefined || currentMode === null) {
            setValue(`${namePrefix}.data.mode`, 'relative');
        }
        if (currentCountMode === undefined || currentCountMode === null) {
            setValue(`${namePrefix}.data.countMode`, 'relative');
        }
        if (currentAmpScale === undefined || currentAmpScale === null) {
            setValue(`${namePrefix}.data.ampScale`, 0.95);
        }
        if (currentDiscoverEndpoints === undefined || currentDiscoverEndpoints === null) {
            setValue(`${namePrefix}.data.discoverEndpoints`, false);
        }
        if (currentRecallEndpoints === undefined || currentRecallEndpoints === null) {
            setValue(`${namePrefix}.data.recallEndpoints`, false);
        }
        if (currentEnableDIC === undefined || currentEnableDIC === null) {
            setValue(`${namePrefix}.data['enable DIC']`, false);
        }
        if (currentWait === undefined || currentWait === null) {
            setValue(`${namePrefix}.data.wait`, true);
        }
    }, [namePrefix, setValue, watch]);

    const cycleErrors = getNestedError(errors, namePrefix)?.data;

    // Resolve Dynamic Labels and Tooltips
    let limitUnit = 'units';
    if (controlMode === 'displacement') limitUnit = 'mm';
    if (controlMode === 'load') limitUnit = 'N';
    if (controlMode === 'strain') limitUnit = 'strain';

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

                {/* Mode Selector */}
                <div className="flex flex-col gap-2">
                    <FieldLabel text="Mode" tooltip={tooltips.mechTestCycleMode} required={true} />
                    <Controller
                        control={control}
                        name={`${namePrefix}.data.mode`}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || 'relative'}>
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
                    <FieldLabel text="Control" tooltip={tooltips.mechTestCycleControl} required={true} />
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

            {/* Sub-parameters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-mauve-50/20 p-4 rounded-xl border border-mauve-150">
                {/* Upper Limit */}
                <div className="flex flex-col gap-2">
                    <FieldLabel 
                        text={`Upper (${limitUnit})`} 
                        tooltip={tooltips.mechTestCycleUpper} 
                        required={true} 
                    />
                    <Input
                        type="number"
                        step="any"
                        className={cycleErrors?.upper ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`${namePrefix}.data.upper`, { valueAsNumber: true })}
                    />
                    {cycleErrors?.upper && <p className="text-xs text-destructive">{cycleErrors.upper.message}</p>}
                </div>

                {/* Lower Limit */}
                <div className="flex flex-col gap-2">
                    <FieldLabel 
                        text={`Lower (${limitUnit})`} 
                        tooltip={tooltips.mechTestCycleLower} 
                        required={true} 
                    />
                    <Input
                        type="number"
                        step="any"
                        className={cycleErrors?.lower ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`${namePrefix}.data.lower`, { valueAsNumber: true })}
                    />
                    {cycleErrors?.lower && <p className="text-xs text-destructive">{cycleErrors.lower.message}</p>}
                </div>

                {/* Frequency */}
                <div className="flex flex-col gap-2">
                    <FieldLabel text="Frequency (Hz)" tooltip={tooltips.mechTestCycleFrequency} required={true} />
                    <Input
                        type="number"
                        step="any"
                        className={cycleErrors?.frequency ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`${namePrefix}.data.frequency`, { valueAsNumber: true })}
                    />
                    {cycleErrors?.frequency && <p className="text-xs text-destructive">{cycleErrors.frequency.message}</p>}
                </div>

                {/* Count Mode Selector & Target Cycles Input */}
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 items-center">
                    {/* Row 1: Label */}
                    <div className="col-start-2">
                        <FieldLabel
                            text={countMode === 'relative' ? "Local Count (cycles)" : "Global Count (cycles)"}
                            tooltip={countMode === 'relative' ? tooltips.mechTestCycleLocalCount : tooltips.mechTestCycleGlobalCount}
                            required={true}
                        />
                    </div>

                    {/* Row 2, Col 1: Toggle button between Local/Global count */}
                    <div className="col-start-1 flex items-center gap-1.5 border border-mauve-200 bg-mauve-100/50 p-1 rounded-xl text-xs font-semibold shrink-0 h-9">
                        <button
                            type="button"
                            onClick={() => setValue(`${namePrefix}.data.countMode`, 'relative')}
                            className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${countMode === 'relative' ? 'bg-white text-mauve-850 shadow-sm font-bold' : 'text-mauve-600 hover:text-mauve-850'}`}
                        >
                            Local
                        </button>
                        <button
                            type="button"
                            onClick={() => setValue(`${namePrefix}.data.countMode`, 'absolute')}
                            className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${countMode === 'absolute' ? 'bg-white text-mauve-850 shadow-sm font-bold' : 'text-mauve-600 hover:text-mauve-850'}`}
                        >
                            Global
                        </button>
                    </div>

                    {/* Row 2, Col 2: Input Field */}
                    <div className="col-start-2">
                        <Input
                            type="number"
                            step="any"
                            className={cycleErrors?.cycleEnd ? "border-destructive focus-visible:ring-destructive" : ""}
                            {...register(`${namePrefix}.data.cycleEnd`, { valueAsNumber: true })}
                        />
                    </div>

                    {/* Row 3: Errors */}
                    <div className="col-start-2">
                        {cycleErrors?.cycleEnd && (
                            <p className="text-xs text-destructive">{cycleErrors.cycleEnd.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Advanced Settings Accordion */}
            <Accordion type="single" collapsible className="border border-mauve-200 rounded-xl overflow-hidden bg-white shadow-sm w-full">
                <AccordionItem value="advanced-parameters" className="border-b-0">
                    <AccordionTrigger className="px-4 py-3 bg-mauve-50/50 hover:bg-mauve-50 transition-colors text-xs font-bold text-mauve-850 hover:no-underline [&>svg]:text-mauve-500">
                        Advanced Parameters
                    </AccordionTrigger>
                    <AccordionContent className="p-4 flex flex-col gap-5 border-t border-mauve-200 pb-4">
                        {/* Upper/Lower manual displacement limit parameters */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Amp Scale */}
                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Amp Scale" tooltip={tooltips.mechTestCycleAmpScale} />
                                <Input
                                    type="number"
                                    step="any"
                                    className={cycleErrors?.ampScale ? "border-destructive focus-visible:ring-destructive" : ""}
                                    {...register(`${namePrefix}.data.ampScale`, { valueAsNumber: true })}
                                />
                                {cycleErrors?.ampScale && <p className="text-xs text-destructive">{cycleErrors.ampScale.message}</p>}
                            </div>

                            {/* Manual Displacement Upper */}
                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Manual Disp Upper (mm)" tooltip={tooltips.mechTestCycleManualDispUpper} />
                                <Input
                                    type="number"
                                    step="any"
                                    placeholder="Optional"
                                    className={cycleErrors?.manualDispUpper ? "border-destructive focus-visible:ring-destructive" : ""}
                                    {...register(`${namePrefix}.data.manualDispUpper`, { valueAsNumber: true })}
                                />
                                {cycleErrors?.manualDispUpper && <p className="text-xs text-destructive">{cycleErrors.manualDispUpper.message}</p>}
                            </div>

                            {/* Manual Displacement Lower */}
                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Manual Disp Lower (mm)" tooltip={tooltips.mechTestCycleManualDispLower} />
                                <Input
                                    type="number"
                                    step="any"
                                    placeholder="Optional"
                                    className={cycleErrors?.manualDispLower ? "border-destructive focus-visible:ring-destructive" : ""}
                                    {...register(`${namePrefix}.data.manualDispLower`, { valueAsNumber: true })}
                                />
                                {cycleErrors?.manualDispLower && <p className="text-xs text-destructive">{cycleErrors.manualDispLower.message}</p>}
                            </div>
                        </div>

                        {/* Switch parameters grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                            {/* Discover Endpoints */}
                            <div className="flex items-center justify-between p-3 rounded-xl border border-mauve-150 bg-mauve-50/10">
                                <FieldLabel text="Discover Endpoints" tooltip={tooltips.mechTestCycleDiscoverEndpoints} />
                                <Controller
                                    control={control}
                                    name={`${namePrefix}.data.discoverEndpoints`}
                                    render={({ field }) => (
                                        <Switch
                                            checked={!!field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>

                            {/* Recall Endpoints */}
                            <div className="flex items-center justify-between p-3 rounded-xl border border-mauve-150 bg-mauve-50/10">
                                <FieldLabel text="Recall Endpoints" tooltip={tooltips.mechTestCycleRecallEndpoints} />
                                <Controller
                                    control={control}
                                    name={`${namePrefix}.data.recallEndpoints`}
                                    render={({ field }) => (
                                        <Switch
                                            checked={!!field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>

                            {/* Enable DIC */}
                            <div className="flex items-center justify-between p-3 rounded-xl border border-mauve-150 bg-mauve-50/10">
                                <FieldLabel text="Enable DIC" tooltip={tooltips.mechTestCycleEnableDic} />
                                <Controller
                                    control={control}
                                    name={`${namePrefix}.data.enable DIC`}
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
                                <FieldLabel text="Wait" tooltip={tooltips.mechTestCycleWait} />
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
