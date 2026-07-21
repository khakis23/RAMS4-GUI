import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GripVertical, Trash2, Copy, TriangleRight, ScanEye, AudioWaveform, Gauge } from 'lucide-react';
import { RampForm } from './RampForm';
import { TakeForm } from './TakeForm';
import { DwellForm } from './DwellForm';
import { CycleForm } from './CycleForm';
import { TakeWhileForm } from './TakeWhileForm';
import { useConfigurationStore } from '@/store/useConfigurationStore';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { rampSchema, takeSchema, dwellSchema, cycleSchema, takeWhileSchema } from '../profileSchemas/mechTestSchema';

interface MechTestCardItemProps {
    index: number;
    namePrefix: string;
    register: any;
    errors: any;
    control: any;
    watch: any;
    setValue: any;
    removeCard: (index: number) => void;
    duplicateCard?: (index: number) => void;
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragEnd: () => void;
    isDragging: boolean;
}

export const MechTestCardItem = ({
    index,
    namePrefix,
    register,
    errors,
    control,
    watch,
    setValue,
    removeCard,
    duplicateCard,
    onDragStart,
    onDragOver,
    onDragEnd,
    isDragging
}: MechTestCardItemProps) => {
    const { draft } = useConfigurationStore();

    // Watch values to render a dynamic header summary
    const type = watch(`${namePrefix}.type`) || 'ramp';
    const axis = watch(`${namePrefix}.data.axis`);
    const mode = watch(`${namePrefix}.data.mode`);
    const controlMode = watch(`${namePrefix}.data.control`);
    const target = watch(`${namePrefix}.data.target`);
    const time = watch(`${namePrefix}.data.time`);
    const velocity = watch(`${namePrefix}.data.velocity`);
    const dispToggle = watch(`${namePrefix}.data.dispToggle`);
    const upper = watch(`${namePrefix}.data.upper`);
    const lower = watch(`${namePrefix}.data.lower`);
    const frequency = watch(`${namePrefix}.data.frequency`);

    const profileID = watch(`${namePrefix}.data.profileID`);
    const imgMode = watch(`${namePrefix}.data.imgMode`);

    const cardData = watch(`${namePrefix}.data`) || {};
    const isComplete = type === 'ramp' 
        ? rampSchema.safeParse(cardData).success 
        : type === 'take'
        ? takeSchema.safeParse(cardData).success
        : type === 'dwell'
        ? dwellSchema.safeParse(cardData).success
        : type === 'cycle'
        ? cycleSchema.safeParse(cardData).success
        : takeWhileSchema.safeParse(cardData).success;

    const renderCardHeaderSummary = (): React.ReactNode => {
        if (type === 'ramp') {
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
        } else if (type === 'dwell') {
            if (!axis || !controlMode) return 'Unconfigured Step';
            const targetUnit = controlMode === 'load' ? 'N' : 'strain';
            const velocityUnit = controlMode === 'load' ? 'N/s' : 's⁻¹';
            return `Axis ${axis}, hold ${controlMode} ${target ?? '?'} ${targetUnit} for ${time ?? '?'} s, rate ${velocity ?? '?'} ${velocityUnit}`;
        } else if (type === 'cycle') {
            if (!axis || !controlMode || !mode) return 'Unconfigured Step';
            let limitUnit = 'units';
            if (controlMode === 'displacement') limitUnit = 'mm';
            if (controlMode === 'load') limitUnit = 'N';
            if (controlMode === 'strain') limitUnit = 'strain';
            return `Axis ${axis}, ${mode} ${controlMode} (${lower ?? '?'}, ${upper ?? '?'}) ${limitUnit}, ${frequency ?? '?'} Hz`;
        } else if (type === 'takeWhile') {
            const takeProfileID = watch(`${namePrefix}.data.take.data.profileID`);
            const stepType = watch(`${namePrefix}.data.step.type`) || 'ramp';
            const stepAxis = watch(`${namePrefix}.data.step.data.axis`);
            const stepControl = watch(`${namePrefix}.data.step.data.control`);

            // Take Part
            const xrayProfiles = draft?.xrayProfiles || [];
            const profile = xrayProfiles.find((p: any) => p.id === takeProfileID);
            const takeContent = profile ? (profile.name || 'Unnamed') : 'Unconfigured';

            // Step Part
            const stepContent = (stepAxis && stepControl) ? `${stepAxis}, ${stepControl}` : 'Unconfigured';

            const StepIcon = stepType === 'ramp' ? TriangleRight : stepType === 'dwell' ? Gauge : AudioWaveform;

            return (
                <span className="inline-flex items-center gap-1">
                    <ScanEye className="h-3.5 w-3.5 text-mauve-500 dark:text-mauve-600 shrink-0 inline align-middle" />
                    <span className="align-middle">[{takeContent}]</span>
                    <span className="text-mauve-400 dark:text-mauve-600 mx-0.5 align-middle">+</span>
                    <StepIcon className="h-3.5 w-3.5 text-mauve-500 dark:text-mauve-600 shrink-0 inline align-middle" />
                    <span className="align-middle">[{stepContent}]</span>
                </span>
            );
        } else {
            const xrayProfiles = draft?.xrayProfiles || [];
            const profile = xrayProfiles.find((p: any) => p.id === profileID);
            if (!profile) return 'Unconfigured Step';

            const getProfileModeName = (m: string) => {
                switch (m) {
                    case 'rotation-series': return 'Rotation Series';
                    case 'stills': return 'Stills';
                    case 'mapscan': return 'Mapscan';
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
        }
    };

    const cardId = watch(`${namePrefix}.id` as any) as string || `card-${index}`;

    return (
        <div 
            draggable={true}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            className={`flex flex-col border rounded-md transition-all duration-100 ${
                type === 'takeWhile' 
                    ? 'bg-slate-50 dark:bg-zinc-900 dark:border-zinc-700 border-slate-200 shadow-sm' 
                    : 'bg-white border-mauve-200 hover:shadow-sm'
            } ${isDragging ? 'opacity-50 border-dashed border-mauve-400 shadow-lg' : ''}`}
        >
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={cardId} className="border-b-0">
                    {/* Header section (Non-scrolling details) */}
                    <div className={`flex items-center justify-between p-4 gap-3 ${
                        type === 'takeWhile' ? 'bg-slate-100/50 dark:bg-zinc-800/30' : 'bg-mauve-50/20'
                    }`}>
                        {/* Left Drag & Type Selectors */}
                        <div className="flex items-center gap-3 shrink-0">
                            {/* Grip Dots */}
                            <div className="text-mauve-300 cursor-grab active:cursor-grabbing hover:text-mauve-500 transition-colors p-1">
                                <GripVertical className="h-4 w-4 shrink-0" />
                            </div>

                            {/* Step Index Label */}
                            <span className="text-xs font-bold text-mauve-500 w-16 shrink-0">
                                Step #{index + 1}
                            </span>

                            {/* Card Type Selector Selector */}
                            <div className="flex items-center gap-1.5">
                                {type !== 'takeWhile' && type !== 'group' && (() => {
                                    const TYPE_ICONS = {
                                        ramp: TriangleRight,
                                        take: ScanEye,
                                        dwell: Gauge,
                                        cycle: AudioWaveform
                                    };
                                    const IconComp = TYPE_ICONS[type as keyof typeof TYPE_ICONS];
                                    return IconComp ? (
                                        <IconComp className="h-4 w-4 text-mauve-500 dark:text-mauve-600 shrink-0" />
                                    ) : null;
                                })()}
                                <div className="w-28 shrink-0">
                                    <Select
                                        value={type}
                                        onValueChange={(val: 'ramp' | 'take' | 'dwell' | 'cycle' | 'takeWhile') => {
                                            setValue(`${namePrefix}.type`, val);
                                            setValue(`${namePrefix}.data`, {});
                                        }}
                                    >
                                        <SelectTrigger className="h-7 text-xs font-semibold rounded-lg border-mauve-200 focus:ring-mauve-300 bg-white shadow-sm">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectItem value="ramp" className="text-xs cursor-pointer">Ramp</SelectItem>
                                            <SelectItem value="take" className="text-xs cursor-pointer">Take</SelectItem>
                                            <SelectItem value="dwell" className="text-xs cursor-pointer">Dwell</SelectItem>
                                            <SelectItem value="cycle" className="text-xs cursor-pointer">Cycle</SelectItem>
                                            <SelectItem value="takeWhile" className="text-xs cursor-pointer">Take While</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Center Clickable Accordion Header */}
                        <AccordionTrigger className="flex-grow py-1.5 px-4 text-xs font-bold text-mauve-850 hover:no-underline [&>svg]:text-mauve-500 shrink min-w-0">
                            <span className="flex items-center gap-2 select-none truncate pr-4">
                                <span className="truncate">{renderCardHeaderSummary()}</span>
                                {!isComplete && (
                                    <span className="text-[11px] font-semibold text-destructive dark:text-red-400 bg-red-500/10 dark:bg-red-500/20 px-1.5 py-0.5 rounded-sm shrink-0 select-none">
                                        (incomplete)
                                    </span>
                                )}
                            </span>
                        </AccordionTrigger>

                        {/* Right Actions */}
                        <div className="shrink-0 flex items-center gap-1.5">
                            <TooltipProvider>
                                <Tooltip delayDuration={200}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => duplicateCard?.(index)}
                                            className="h-8 w-8 text-mauve-400 dark:text-mauve-500 hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs text-xs p-2 bg-popover text-popover-foreground rounded shadow-md border border-mauve-150">
                                        Duplicate
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeCard(index)}
                                className="h-8 w-8 text-mauve-400 dark:text-mauve-500 hover:text-destructive hover:bg-destructive/10 dark:hover:text-red-400 dark:hover:bg-red-500/20 rounded-lg cursor-pointer transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Accordion Expandable Content */}
                    <AccordionContent className="p-5 bg-white border-t border-mauve-150 pb-5">
                        {type === 'ramp' && (
                            <RampForm
                                namePrefix={namePrefix}
                                register={register}
                                errors={errors}
                                control={control}
                                watch={watch}
                                setValue={setValue}
                            />
                        )}
                        {type === 'take' && (
                            <TakeForm
                                namePrefix={namePrefix}
                                register={register}
                                errors={errors}
                                control={control}
                                watch={watch}
                                setValue={setValue}
                            />
                        )}
                        {type === 'dwell' && (
                            <DwellForm
                                namePrefix={namePrefix}
                                register={register}
                                errors={errors}
                                control={control}
                                watch={watch}
                                setValue={setValue}
                            />
                        )}
                        {type === 'cycle' && (
                            <CycleForm
                                namePrefix={namePrefix}
                                register={register}
                                errors={errors}
                                control={control}
                                watch={watch}
                                setValue={setValue}
                            />
                        )}
                        {type === 'takeWhile' && (
                            <TakeWhileForm
                                namePrefix={namePrefix}
                                register={register}
                                errors={errors}
                                control={control}
                                watch={watch}
                                setValue={setValue}
                            />
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};
