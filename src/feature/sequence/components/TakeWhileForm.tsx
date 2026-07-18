import { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { TriangleRight, ScanEye, AudioWaveform, Gauge } from 'lucide-react';
import { TakeForm } from './TakeForm';
import { RampForm } from './RampForm';
import { DwellForm } from './DwellForm';
import { CycleForm } from './CycleForm';
import { useConfigurationStore } from '@/store/useConfigurationStore';

interface TakeWhileFormProps {
    namePrefix: string;
    register: any;
    errors: any;
    control: any;
    watch: any;
    setValue: any;
}

export const TakeWhileForm = ({ namePrefix, register, errors, control, watch, setValue }: TakeWhileFormProps) => {
    const { draft } = useConfigurationStore();

    const stepType = watch(`${namePrefix}.data.step.type`) || 'ramp';

    // Default initialization for nested take and step configuration objects.
    // TakeForm expects its namePrefix to point at the parent, and accesses .data.profileID etc internally.
    // So we initialize data.take as the object TakeForm will receive as its namePrefix.
    useEffect(() => {
        const currentTake = watch(`${namePrefix}.data.take`);
        if (!currentTake) {
            setValue(`${namePrefix}.data.take`, { data: { profileID: '', imgMode: 'ff', pauseTsDaq: false } });
        }
        const currentStep = watch(`${namePrefix}.data.step`);
        if (!currentStep) {
            setValue(`${namePrefix}.data.step`, { type: 'ramp', data: {} });
        }
    }, [namePrefix, setValue, watch]);

    // Subtitle for Take Card.
    // TakeForm receives namePrefix={`${namePrefix}.data.take`} and internally reads .data.profileID,
    // so the actual RHF path is: namePrefix.data.take.data.profileID
    const getTakeSummary = () => {
        const profileID = watch(`${namePrefix}.data.take.data.profileID`);
        const imgMode = watch(`${namePrefix}.data.take.data.imgMode`);
        
        const xrayProfiles = draft?.xrayProfiles || [];
        const profile = xrayProfiles.find((p: any) => p.id === profileID);
        if (!profile) return 'Unconfigured';

        const getProfileModeName = (m: string) => {
            switch (m) {
                case 'rotation-series': return 'Rotation Series';
                case 'stills': return 'Stills';
                case 'tseries': return 'Mapscan: Time Series';
                case 'dscan': return 'Mapscan: Line Scan';
                case 'mesh': return 'Mapscan: Grid Scan';
                default: return m || '';
            }
        };

        const getImgModeLabel = (im: string) => {
            switch (im) {
                case 'ff': return 'Far-Field';
                case 'nf': return 'Near-Field';
                case 'tomo': return 'Tomography';
                case 'single-layer': return 'Single Layer';
                case 'dic': return 'DIC';
                default: return im || '';
            }
        };

        const profileName = profile.name || 'Unnamed Profile';
        const profileModeName = getProfileModeName(profile.mode);
        const showImageMode = profile.mode === 'rotation-series' || profile.mode === 'stills';
        const imgModeLabel = (showImageMode && imgMode) ? `, ${getImgModeLabel(imgMode)}` : '';

        return `${profileName} (${profileModeName})${imgModeLabel}`;
    };

    // Subtitle for Mechanical Step Card
    const getStepSummary = () => {
        const axis = watch(`${namePrefix}.data.step.data.axis`);
        const controlMode = watch(`${namePrefix}.data.step.data.control`);
        const mode = watch(`${namePrefix}.data.step.data.mode`);
        const target = watch(`${namePrefix}.data.step.data.target`);
        const time = watch(`${namePrefix}.data.step.data.time`);
        const velocity = watch(`${namePrefix}.data.step.data.velocity`);
        const dispToggle = watch(`${namePrefix}.data.step.data.dispToggle`);
        const upper = watch(`${namePrefix}.data.step.data.upper`);
        const lower = watch(`${namePrefix}.data.step.data.lower`);
        const frequency = watch(`${namePrefix}.data.step.data.frequency`);

        if (stepType === 'ramp') {
            if (!axis || !controlMode) return 'Unconfigured Step';
            
            let targetUnit = 'units';
            if (controlMode === 'displacement') targetUnit = 'mm';
            if (controlMode === 'load') targetUnit = 'N';
            if (controlMode === 'strain') targetUnit = 'strain';

            let rateText = '';
            if (controlMode === 'displacement') {
                rateText = dispToggle === 'time' 
                    ? `${time ?? '?'} s` 
                    : `${velocity ?? '?'} mm/s`;
            } else if (controlMode === 'load') {
                rateText = `${velocity ?? '?'} N/s`;
            } else if (controlMode === 'strain') {
                rateText = `${velocity ?? '?'} s⁻¹`;
            }

            return `Axis ${axis}, ${mode} ${controlMode} ${target ?? '?'} ${targetUnit}, ${rateText}`;
        } else if (stepType === 'dwell') {
            if (!axis || !controlMode) return 'Unconfigured Step';
            const targetUnit = controlMode === 'load' ? 'N' : 'strain';
            const velocityUnit = controlMode === 'load' ? 'N/s' : 's⁻¹';
            return `Axis ${axis}, hold ${controlMode} ${target ?? '?'} ${targetUnit} for ${time ?? '?'} s, rate ${velocity ?? '?'} ${velocityUnit}`;
        } else if (stepType === 'cycle') {
            if (!axis || !controlMode || !mode) return 'Unconfigured Step';
            let limitUnit = 'units';
            if (controlMode === 'displacement') limitUnit = 'mm';
            if (controlMode === 'load') limitUnit = 'N';
            if (controlMode === 'strain') limitUnit = 'strain';
            return `Axis ${axis}, ${mode} ${controlMode} (${lower ?? '?'}, ${upper ?? '?'}) ${limitUnit}, ${frequency ?? '?'} Hz`;
        }
        return 'Unconfigured Step';
    };

    const StepIcon = stepType === 'ramp' ? TriangleRight : stepType === 'dwell' ? Gauge : AudioWaveform;

    return (
        // defaultValue={[]} means both sub-sections start collapsed on each mount.
        // This prevents the bug where Radix unmounts/remounts TakeWhileForm on outer accordion
        // toggle, which would force defaultValue to re-apply and expand them every time.
        <Accordion type="multiple" defaultValue={[]} className="w-full flex flex-col gap-4">
            {/* Top Take Card */}
            <div className="flex flex-col bg-white border border-slate-200 dark:border-zinc-800 rounded-md shadow-sm">
                <AccordionItem value="take-section" className="border-b-0">
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-zinc-900/40 gap-3">
                        <div className="flex items-center gap-2 shrink-0">
                            {/* ScanEye icon to the left of the static Take badge */}
                            <ScanEye className="h-4 w-4 text-mauve-500 dark:text-mauve-600 shrink-0" />
                            {/* Static "Take" Badge — looks like a select but is not interactive */}
                            <div className="h-7 text-xs font-bold px-3.5 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-lg border border-slate-200 dark:border-zinc-700 select-none flex items-center shadow-sm">
                                Take
                            </div>
                        </div>
                        <AccordionTrigger className="flex-grow py-1.5 px-4 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:no-underline [&>svg]:text-slate-400">
                            <span className="truncate pr-4 select-none">{getTakeSummary()}</span>
                        </AccordionTrigger>
                    </div>
                    <AccordionContent className="p-5 bg-white border-t border-slate-150 dark:border-zinc-800 pb-5">
                        <TakeForm
                            namePrefix={`${namePrefix}.data.take`}
                            register={register}
                            errors={errors}
                            control={control}
                            watch={watch}
                            setValue={setValue}
                        />
                    </AccordionContent>
                </AccordionItem>
            </div>

            {/* Bottom Mechanical Test Step Card */}
            <div className="flex flex-col bg-white border border-slate-200 dark:border-zinc-800 rounded-md shadow-sm">
                <AccordionItem value="step-section" className="border-b-0">
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-zinc-900/40 gap-3">
                        <div className="flex items-center gap-1.5 shrink-0">
                            {/* Icon matching the currently selected step type */}
                            <StepIcon className="h-4 w-4 text-mauve-500 dark:text-mauve-600 shrink-0" />
                            {/* Selector to change mechanical step type */}
                            <div className="w-28 shrink-0">
                                <Select
                                    value={stepType}
                                    onValueChange={(val: 'ramp' | 'dwell' | 'cycle') => {
                                        setValue(`${namePrefix}.data.step.type`, val);
                                        setValue(`${namePrefix}.data.step.data`, {});
                                    }}
                                >
                                    <SelectTrigger className="h-7 text-xs font-semibold rounded-lg border-slate-200 dark:border-zinc-700 focus:ring-slate-300 bg-white shadow-sm">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="ramp" className="text-xs cursor-pointer">Ramp</SelectItem>
                                        <SelectItem value="dwell" className="text-xs cursor-pointer">Dwell</SelectItem>
                                        <SelectItem value="cycle" className="text-xs cursor-pointer">Cycle</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <AccordionTrigger className="flex-grow py-1.5 px-4 text-xs font-bold text-slate-700 hover:no-underline dark:text-zinc-300 [&>svg]:text-slate-400">
                            <span className="truncate pr-4 select-none">{getStepSummary()}</span>
                        </AccordionTrigger>
                    </div>
                    <AccordionContent className="p-5 bg-white border-t border-slate-150 dark:border-zinc-800 pb-5">
                        {stepType === 'ramp' && (
                            <RampForm
                                namePrefix={`${namePrefix}.data.step`}
                                register={register}
                                errors={errors}
                                control={control}
                                watch={watch}
                                setValue={setValue}
                            />
                        )}
                        {stepType === 'dwell' && (
                            <DwellForm
                                namePrefix={`${namePrefix}.data.step`}
                                register={register}
                                errors={errors}
                                control={control}
                                watch={watch}
                                setValue={setValue}
                            />
                        )}
                        {stepType === 'cycle' && (
                            <CycleForm
                                namePrefix={`${namePrefix}.data.step`}
                                register={register}
                                errors={errors}
                                control={control}
                                watch={watch}
                                setValue={setValue}
                            />
                        )}
                    </AccordionContent>
                </AccordionItem>
            </div>
        </Accordion>
    );
};
