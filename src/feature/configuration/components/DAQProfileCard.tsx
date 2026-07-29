import { useMemo } from 'react';
import { Control, Controller, FieldErrors, UseFormRegister, useFieldArray, useWatch } from 'react-hook-form';
import { X, Plus, Trash2 } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { FieldLabel } from '../../../components/ui/FieldLabel';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { tooltips } from "@/config/tooltips.ts";
import { handlerProfileSchema } from '../profileSchemas/daqSchema';
import { ProfileCardLayout } from './ProfileCardLayout';
import { useAvailableAxes } from '@/hooks/useAvailableAxes';

const verboseAxisOptions = [
    { label: "None", value: -1 },
    { label: "Feedback Basics", value: 0 },
    { label: "Commands & Aux", value: 1 },
    { label: "Errors & Telemetry", value: 2 },
];

const verboseTaskOptions = [
    { label: "None", value: -1 },
    { label: "Task State", value: 0 },
    { label: "Errors/Warnings", value: 1 },
    { label: "Execution Pointer", value: 2 },
];

const verboseSystemOptions = [
    { label: "None", value: -1 },
    { label: "Timer", value: 0 },
    { label: "Performance Timers", value: 1 },
];

const verboseIOOptions = [
    { label: "None", value: -1 },
    { label: "Basic Analog Inputs", value: 0 },
    { label: "Digital Registers", value: 1 },
    { label: "Analog Outputs", value: 2 },
];

interface CycleVisualizationProps {
    cycles: Array<{ start: number; stop: number | 'inf'; step: number }>;
}

const CycleVisualization = ({ cycles }: CycleVisualizationProps) => {
    const cleanCycles = useMemo(() => {
        if (!Array.isArray(cycles) || cycles.length === 0) return [];
        return cycles.map(c => {
            const rawStart = c.start;
            const start = (typeof rawStart === 'number' && !isNaN(rawStart)) 
                ? Math.max(1, rawStart) 
                : (typeof rawStart === 'string' && rawStart.trim() !== '' && !isNaN(Number(rawStart)) 
                    ? Math.max(1, Number(rawStart)) 
                    : 1);
            
            const rawStop = c.stop;
            const isInf = rawStop === 'inf' || rawStop === 'Inf' || rawStop === 'INF' || (rawStop as any) === '∞';
            
            let stop: number | 'inf';
            if (isInf) {
                stop = 'inf';
            } else if (rawStop !== undefined && rawStop !== null && String(rawStop).trim() !== '' && !isNaN(Number(rawStop))) {
                stop = Math.max(start, Number(rawStop));
            } else {
                stop = 'inf';
            }

            const rawStep = c.step;
            const step = (typeof rawStep === 'number' && !isNaN(rawStep) && rawStep > 0)
                ? rawStep
                : (typeof rawStep === 'string' && rawStep.trim() !== '' && !isNaN(Number(rawStep)) && Number(rawStep) > 0 
                    ? Number(rawStep) 
                    : 1);

            return { start, stop, step, isInf: stop === 'inf' };
        });
    }, [cycles]);

    const { domainMin, domainMax, scaleTicks } = useMemo(() => {
        if (cleanCycles.length === 0) {
            return { domainMin: 1, domainMax: 10, scaleTicks: { ticks: [{ val: 1, pct: 0 }], hasInf: false } };
        }

        let minVal = Math.min(...cleanCycles.map(c => c.start));
        if (minVal < 1 || isNaN(minVal)) minVal = 1;

        let maxFiniteEnd = minVal;
        let infFound = false;

        cleanCycles.forEach(c => {
            if (c.isInf) {
                infFound = true;
                if (c.start > maxFiniteEnd) maxFiniteEnd = c.start;
            } else if (typeof c.stop === 'number') {
                if (c.stop + 1 > maxFiniteEnd) maxFiniteEnd = c.stop + 1;
            }
        });

        let maxVal = maxFiniteEnd;
        if (infFound) {
            maxVal = maxFiniteEnd + Math.max(10, Math.round((maxFiniteEnd - minVal) * 0.25) || 10);
        }
        if (maxVal <= minVal) maxVal = minVal + 10;

        const totalRange = maxVal - minVal || 1;

        const ticks: Array<{ val: number; pct: number }> = [];
        const seen = new Set<number>();

        cleanCycles.forEach(c => {
            if (!seen.has(c.start)) {
                seen.add(c.start);
                const pct = Math.max(0, Math.min(100, ((c.start - minVal) / totalRange) * 100));
                ticks.push({ val: c.start, pct });
            }
        });

        const lastCycle = cleanCycles[cleanCycles.length - 1];
        if (!lastCycle.isInf && typeof lastCycle.stop === 'number') {
            const endStop = lastCycle.stop;
            if (!seen.has(endStop)) {
                seen.add(endStop);
                const pct = Math.max(0, Math.min(100, ((endStop + 1 - minVal) / totalRange) * 100));
                ticks.push({ val: endStop, pct });
            }
        }

        return {
            domainMin: minVal,
            domainMax: maxVal,
            scaleTicks: { ticks, hasInf: lastCycle.isInf }
        };
    }, [cleanCycles]);

    const totalSpan = domainMax - domainMin || 1;

    const blocksToRender = useMemo(() => {
        const blocks: Array<{ key: string; leftPct: number; widthPct: number }> = [];

        cleanCycles.forEach((c, cycleIdx) => {
            if (c.isInf) {
                if (c.step === 1) {
                    const leftPct = Math.max(0, Math.min(100, ((c.start - domainMin) / totalSpan) * 100));
                    blocks.push({ key: `inf-${cycleIdx}`, leftPct, widthPct: 100 - leftPct });
                } else {
                    for (let cy = c.start; cy < domainMax; cy += c.step) {
                        const leftPct = Math.max(0, Math.min(100, ((cy - domainMin) / totalSpan) * 100));
                        const unitWidth = Math.max(0.5, (1 / totalSpan) * 100);
                        blocks.push({ key: `inf-${cycleIdx}-${cy}`, leftPct, widthPct: unitWidth });
                    }
                }
            } else if (typeof c.stop === 'number') {
                if (c.step === 1) {
                    const leftPct = Math.max(0, Math.min(100, ((c.start - domainMin) / totalSpan) * 100));
                    const rightPct = Math.max(0, Math.min(100, ((c.stop + 1 - domainMin) / totalSpan) * 100));
                    blocks.push({ key: `finite-${cycleIdx}`, leftPct, widthPct: Math.max(0.5, rightPct - leftPct) });
                } else {
                    for (let cy = c.start; cy <= c.stop; cy += c.step) {
                        const leftPct = Math.max(0, Math.min(100, ((cy - domainMin) / totalSpan) * 100));
                        const unitWidth = Math.max(0.5, (1 / totalSpan) * 100);
                        blocks.push({ key: `step-${cycleIdx}-${cy}`, leftPct, widthPct: unitWidth });
                    }
                }
            }
        });

        return blocks;
    }, [cleanCycles, domainMin, domainMax, totalSpan]);

    return (
        <div className="bg-mauve-50/50 border border-mauve-200/80 rounded-xl p-4 flex flex-col justify-between gap-3 h-full min-h-[120px]">
            {/* Track Graph Area */}
            <div className="relative w-full h-11 bg-mauve-100/70 dark:bg-mauve-900/40 rounded-lg border border-mauve-200/60 overflow-hidden flex items-center">
                {cleanCycles.length === 0 ? (
                    <div className="w-full h-7 bg-mauve-600/30 rounded flex items-center justify-center text-xs font-semibold text-mauve-800 dark:text-mauve-850">
                        Full Test Range
                    </div>
                ) : (
                    blocksToRender.map((b) => (
                        <div
                            key={b.key}
                            className="absolute h-7 bg-mauve-600 rounded-sm shadow-sm"
                            style={{
                                left: `${b.leftPct}%`,
                                width: `calc(${b.widthPct}% - 1px)`,
                                minWidth: '3px'
                            }}
                        />
                    ))
                )}
            </div>

            {/* X-Axis Scale Labels */}
            <div className="relative w-full h-4 text-mauve-700 dark:text-mauve-800 font-mono text-xs select-none">
                {cleanCycles.length === 0 ? (
                    <div className="flex justify-between px-1">
                        <span>1</span>
                        <span>...</span>
                    </div>
                ) : (
                    <>
                        {scaleTicks.ticks.map((tick) => (
                            <div
                                key={tick.val}
                                className="absolute -translate-x-1/2 top-0 flex flex-col items-center"
                                style={{ left: `${tick.pct}%` }}
                            >
                                <div className="w-[1px] h-1.5 bg-mauve-300 dark:bg-mauve-500 mb-0.5"></div>
                                <span>{tick.val}</span>
                            </div>
                        ))}
                        {scaleTicks.hasInf && (
                            <div className="absolute right-0 top-0 flex flex-col items-end">
                                <div className="w-[1px] h-1.5 bg-mauve-300 dark:bg-mauve-500 mb-0.5"></div>
                                <span className="font-bold">...</span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

interface CyclesFieldArrayProps {
    control: Control<any>;
    register: UseFormRegister<any>;
    profileIndex: number;
}

const CyclesFieldArray = ({ control, register, profileIndex }: CyclesFieldArrayProps) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `handlersProfile.${profileIndex}.cycles`
    });

    const watchedCycles = useWatch({
        control,
        name: `handlersProfile.${profileIndex}.cycles`
    }) || fields;

    const handleAddCycleRange = () => {
        if (fields.length === 0) {
            append({ start: 1, stop: 'inf', step: 1 });
        } else {
            const lastCycle = watchedCycles[watchedCycles.length - 1] || fields[fields.length - 1];
            let nextStart = 1;
            if (lastCycle) {
                const rawStop = lastCycle.stop;
                if (typeof rawStop === 'number' && !isNaN(rawStop)) {
                    nextStart = rawStop + 1;
                } else if (typeof lastCycle.start === 'number' && !isNaN(lastCycle.start)) {
                    nextStart = lastCycle.start + 10;
                }
            }
            append({ start: nextStart, stop: 'inf', step: 1 });
        }
    };

    return (
        <div className="flex flex-col gap-4 text-left border-t border-mauve-250/30 py-4 my-2">
            <FieldLabel text="Cycles" tooltip={tooltips.daqProfileCycles} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-start">
                {/* Left Column: Interactive Form Controls (1/3 width) */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    {fields.length > 0 && (
                        <div className="space-y-3">
                            {fields.map((field, cycleIndex) => (
                                <div key={field.id} className="flex items-end gap-2 w-full bg-white dark:bg-mauve-950/40 p-2.5 rounded-lg border border-mauve-200 shadow-sm">
                                    <div className="flex-1 min-w-0">
                                        <label className="text-[11px] font-medium text-muted-foreground block mb-1">Start</label>
                                        <Input 
                                            type="number" 
                                            placeholder="Start"
                                            className="h-8 text-xs bg-white border-mauve-200"
                                            {...register(`handlersProfile.${profileIndex}.cycles.${cycleIndex}.start`, { valueAsNumber: true })}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <label className="text-[11px] font-medium text-muted-foreground block mb-1">Stop</label>
                                        <Controller
                                            control={control}
                                            name={`handlersProfile.${profileIndex}.cycles.${cycleIndex}.stop`}
                                            render={({ field: stopField }) => (
                                                <Input 
                                                    type="text" 
                                                    placeholder="Stop"
                                                    className="h-8 text-xs bg-white border-mauve-200 font-mono"
                                                    value={stopField.value === 'inf' || stopField.value === 'Inf' || stopField.value === 'INF' || stopField.value === '∞' ? 'inf' : (stopField.value ?? '')}
                                                    onChange={(e) => {
                                                        const val = e.target.value.trim();
                                                        if (val.toLowerCase() === 'inf' || val === '∞') {
                                                            stopField.onChange('inf');
                                                        } else if (val === '') {
                                                            stopField.onChange('');
                                                        } else {
                                                            const num = Number(val);
                                                            stopField.onChange(isNaN(num) ? val : num);
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className="w-16 min-w-0">
                                        <label className="text-[11px] font-medium text-muted-foreground block mb-1">Step</label>
                                        <Input 
                                            type="number" 
                                            placeholder="Step"
                                            className="h-8 text-xs bg-white border-mauve-200"
                                            {...register(`handlersProfile.${profileIndex}.cycles.${cycleIndex}.step`, { valueAsNumber: true })}
                                        />
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon"
                                        className="h-8 w-8 shrink-0 text-mauve-400 dark:text-mauve-500 hover:text-destructive hover:bg-destructive/10 dark:hover:text-red-400 dark:hover:bg-red-500/20 rounded-lg cursor-pointer transition-colors"
                                        onClick={() => remove(cycleIndex)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <Button 
                        type="button" 
                        variant="secondary" 
                        className="w-fit border border-mauve-300 hover:bg-mauve-50 text-mauve-700 h-9 rounded-lg cursor-pointer"
                        onClick={handleAddCycleRange}
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Cycle Range
                    </Button>
                </div>

                {/* Right Column: Visualization Graph (2/3 width) */}
                <div className="lg:col-span-2">
                    <CycleVisualization cycles={watchedCycles} />
                </div>
            </div>
        </div>
    );
};

interface DAQProfileCardProps {
    index: number;
    control: any;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    remove: (index: number) => void;
    currentMode: string;
    requiredAxes: string[];
}

export const DAQProfileCard = ({
    index,
    control,
    register,
    errors,
    remove,
    currentMode,
    requiredAxes
}: DAQProfileCardProps) => {
    const availableAxes = useAvailableAxes();
    const axesOptions = availableAxes;
    const profileErrors = (errors.handlersProfile as any)?.[index] as any;

    const profileValues = useWatch({
        control,
        name: `handlersProfile.${index}`
    });

    const filename = useWatch({
        control,
        name: `handlersProfile.${index}.filename`
    });

    const frequency = useWatch({
        control,
        name: `handlersProfile.${index}.frequency`
    });

    const cycles = useWatch({
        control,
        name: `handlersProfile.${index}.cycles`
    });

    const signalAxis = useWatch({
        control,
        name: `handlersProfile.${index}.signalAxis`
    });

    const rawSignalItem = useWatch({
        control,
        name: `handlersProfile.${index}.signalItem`
    });

    const signalProminence = useWatch({
        control,
        name: `handlersProfile.${index}.signalProminence`
    });

    const psoAxis = useWatch({
        control,
        name: `handlersProfile.${index}.psoAxis`
    });

    // Normalize Feedback Signal item value
    const normalizedSignalItem = useMemo(() => {
        if (!rawSignalItem) return "Position";
        if (rawSignalItem === "PositionFeedback" || rawSignalItem === "Position") return "Position";
        if (rawSignalItem === "VelocityFeedback" || rawSignalItem === "Velocity") return "Velocity";
        if (rawSignalItem === "AccelerationFeedback" || rawSignalItem === "Acceleration") return "Acceleration";
        return rawSignalItem;
    }, [rawSignalItem]);

    // Compute dynamic Prominence field label text
    const prominenceLabel = useMemo(() => {
        if (normalizedSignalItem === "Velocity") return "Prominence (mm/s)";
        if (normalizedSignalItem === "Acceleration") return "Prominence (mm/s²)";
        return "Prominence (mm)";
    }, [normalizedSignalItem]);

    // Compute card title summary string
    const cardTitleSummary = useMemo(() => {
        let summary = "";
        if (currentMode === "time-series") {
            const freqText = frequency ? `${frequency} Hz` : "1000 Hz";
            const cyclesCount = Array.isArray(cycles) ? cycles.length : 0;
            const cycleText = cyclesCount > 0 ? `${cyclesCount} ${cyclesCount === 1 ? 'Cycle' : 'Cycles'}` : "Full Range";
            summary = `${freqText}, ${cycleText}`;
        } else if (currentMode === "pso") {
            summary = `Axis ${psoAxis || 'RT'}`;
        } else if (currentMode === "peak-valley") {
            const axisText = signalAxis ? `Axis ${signalAxis}` : "Unconfigured";
            let unit = "mm";
            let itemLabel = "Position";
            if (normalizedSignalItem === "Velocity") {
                unit = "mm/s";
                itemLabel = "Velocity";
            } else if (normalizedSignalItem === "Acceleration") {
                unit = "mm/s²";
                itemLabel = "Accel";
            }
            const prominenceText = (signalProminence !== undefined && signalProminence !== null && !isNaN(Number(signalProminence))) 
                ? `${signalProminence} ${unit}` 
                : `? ${unit}`;
            summary = `${axisText}, ${itemLabel}, ${prominenceText}`;
        }

        if (filename && filename.trim() !== "") {
            return `${filename.trim()} (${summary})`;
        }
        return summary;
    }, [currentMode, frequency, cycles, psoAxis, signalAxis, normalizedSignalItem, signalProminence, filename]);

    const isComplete = useMemo(() => {
        if (!profileValues) return false;
        return handlerProfileSchema.safeParse(profileValues).success;
    }, [profileValues]);

    return (
        <ProfileCardLayout
            index={index}
            name={cardTitleSummary}
            isComplete={isComplete}
            onRemove={() => remove(index)}
            modeSelector={
                <Controller
                    control={control}
                    name={`handlersProfile.${index}.mode`}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-7 text-xs font-semibold rounded-lg border-mauve-200 focus:ring-mauve-300 bg-white shadow-sm">
                                <SelectValue placeholder="Select scan mode" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="time-series" className="text-xs cursor-pointer">Time Series</SelectItem>
                                <SelectItem value="peak-valley" className="text-xs cursor-pointer">Peak Valley</SelectItem>
                                <SelectItem value="pso" className="text-xs cursor-pointer">Position Synchronized Output</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
            }
        >
            {/* Time Series Mode */}
            {currentMode === "time-series" && (
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-5">
                        <div className="flex flex-col gap-2 md:col-span-3">
                            <FieldLabel text="File Name" tooltip={tooltips.daqProfileFilename} required={false} />
                            <Input 
                                placeholder="Optional"
                                className="h-8 text-xs bg-input/50 border-transparent focus-visible:ring-mauve-300"
                                {...register(`handlersProfile.${index}.filename`)}
                            />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-1">
                            <FieldLabel text="Frequency (Hz)" tooltip={tooltips.daqProfileFrequency} required={true} />
                            <Input 
                                type="number" 
                                className={`h-8 text-xs bg-input/50 border-transparent ${profileErrors?.frequency ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                {...register(`handlersProfile.${index}.frequency`, { valueAsNumber: true })} 
                            />
                            {profileErrors?.frequency && (
                                <p className="text-xs text-destructive">{profileErrors.frequency.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="px-5 flex flex-col gap-3">
                        <CyclesFieldArray 
                            control={control} 
                            register={register} 
                            profileIndex={index} 
                        />
                    </div>
                </div>
            )}

            {/* Peak Valley Mode */}
            {currentMode === "peak-valley" && (
                <div className="px-5 flex flex-col gap-2 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <FieldLabel text="File Name" tooltip={tooltips.daqProfileFilename} required={false} />
                            <Input 
                                placeholder="Optional"
                                className="h-8 text-xs bg-input/50 border-transparent focus-visible:ring-mauve-300"
                                {...register(`handlersProfile.${index}.filename`)}
                            />
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-1">
                            <FieldLabel text="Signal Axis" tooltip={tooltips.daqProfileSignalAxis} required={true} />
                            <Controller
                                control={control}
                                name={`handlersProfile.${index}.signalAxis`}
                                render={({ field }) => {
                                    const selectValue = (field.value && axesOptions.includes(field.value)) ? field.value : undefined;
                                    return (
                                        <Select onValueChange={field.onChange} value={selectValue}>
                                            <SelectTrigger className="h-8 text-xs bg-input/50 border-transparent focus-visible:ring-mauve-300 w-full">
                                                <SelectValue placeholder="Select axis" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                {axesOptions.map((axis: string) => (
                                                    <SelectItem key={axis} value={axis} className="text-xs cursor-pointer">{axis}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    );
                                }}
                            />
                            {profileErrors?.signalAxis && (
                                <p className="text-xs text-destructive">{profileErrors.signalAxis.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-1">
                            <FieldLabel text="Feedback Signal" tooltip={tooltips.daqProfileSignalItem} required={true} />
                            <Controller
                                control={control}
                                name={`handlersProfile.${index}.signalItem`}
                                render={({ field }) => (
                                    <Select 
                                        onValueChange={field.onChange} 
                                        value={normalizedSignalItem}
                                    >
                                        <SelectTrigger className="h-8 text-xs bg-input/50 border-transparent focus-visible:ring-mauve-300 w-full">
                                            <SelectValue placeholder="Select signal" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectItem value="Position" className="text-xs cursor-pointer">Position</SelectItem>
                                            <SelectItem value="Velocity" className="text-xs cursor-pointer">Velocity</SelectItem>
                                            <SelectItem value="Acceleration" className="text-xs cursor-pointer">Acceleration</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {profileErrors?.signalItem && (
                                <p className="text-xs text-destructive">{profileErrors.signalItem.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-1">
                            <FieldLabel text={prominenceLabel} tooltip={tooltips.daqProfileProminence} required={true} />
                            <Input 
                                type="number" 
                                step="any"
                                className={`h-8 text-xs bg-input/50 border-transparent ${profileErrors?.signalProminence ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                {...register(`handlersProfile.${index}.signalProminence`, { valueAsNumber: true })} 
                            />
                            {profileErrors?.signalProminence && (
                                <p className="text-xs text-destructive">{profileErrors.signalProminence.message}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* PSO Mode */}
            {currentMode === "pso" && (
                <div className="px-5 flex flex-col gap-2 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-2 md:col-span-3">
                            <FieldLabel text="File Name" tooltip={tooltips.daqProfileFilename} required={false} />
                            <Input 
                                placeholder="Optional"
                                className="h-8 text-xs bg-input/50 border-transparent focus-visible:ring-mauve-300"
                                {...register(`handlersProfile.${index}.filename`)}
                            />
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-1">
                            <FieldLabel text="PSO Axis" tooltip={tooltips.daqProfilePsoAxis} required={true} />
                            <Controller
                                control={control}
                                name={`handlersProfile.${index}.psoAxis`}
                                render={({ field }) => {
                                    const selectValue = (field.value && axesOptions.includes(field.value)) ? field.value : undefined;
                                    return (
                                        <Select onValueChange={field.onChange} value={selectValue}>
                                            <SelectTrigger className="h-8 text-xs bg-input/50 border-transparent focus-visible:ring-mauve-300 w-full">
                                                <SelectValue placeholder="Select axis" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                {axesOptions.map((axis: string) => (
                                                    <SelectItem key={axis} value={axis} className="text-xs cursor-pointer">{axis}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    );
                                }}
                            />
                            {profileErrors?.psoAxis && (
                                <p className="text-xs text-destructive">{profileErrors.psoAxis.message}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Advanced Logging Details Collapsible Accordion */}
            <div className="px-5 pt-3 pb-5">
                <Accordion type="single" collapsible className="border border-mauve-200 rounded-xl overflow-hidden bg-mauve-50/50 shadow-sm w-full">
                    <AccordionItem value="advanced-logging" className="border-b-0">
                        <AccordionTrigger className="px-4 py-3 bg-mauve-50/50 hover:bg-mauve-100/50 transition-colors text-xs font-bold text-mauve-850 hover:no-underline [&>svg]:text-mauve-500 select-none">
                            Advanced Logging Details
                        </AccordionTrigger>
                        <AccordionContent className="p-4 flex flex-col gap-5 border-t border-mauve-200 bg-mauve-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                {/* Axis Logging Level */}
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Axis Logging Level" tooltip={tooltips.daqProfileAxisLevel} />
                                    <Controller
                                        control={control}
                                        name={`handlersProfile.${index}.verboseAxis`}
                                        render={({ field: axisField }) => (
                                            <Select onValueChange={axisField.onChange} value={axisField.value}>
                                                <SelectTrigger className="h-8 text-xs bg-input/50 border-transparent focus-visible:ring-mauve-300 w-full">
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white">
                                                    {verboseAxisOptions.map(opt => (
                                                        <SelectItem key={opt.value} value={String(opt.value)} className="text-xs cursor-pointer">{opt.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                {/* Task Logging Level */}
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Task Logging Level" tooltip={tooltips.daqProfileTaskLevel} />
                                    <Controller
                                        control={control}
                                        name={`handlersProfile.${index}.verboseTask`}
                                        render={({ field: taskField }) => (
                                            <Select onValueChange={taskField.onChange} value={taskField.value}>
                                                <SelectTrigger className="h-8 text-xs bg-input/50 border-transparent focus-visible:ring-mauve-300 w-full">
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white">
                                                    {verboseTaskOptions.map(opt => (
                                                        <SelectItem key={opt.value} value={String(opt.value)} className="text-xs cursor-pointer">{opt.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                {/* System Logging Level */}
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="System Logging Level" tooltip={tooltips.daqProfileSystemLevel} />
                                    <Controller
                                        control={control}
                                        name={`handlersProfile.${index}.verboseSystem`}
                                        render={({ field: systemField }) => (
                                            <Select 
                                                onValueChange={(val) => systemField.onChange(Number(val))} 
                                                value={systemField.value !== undefined ? String(systemField.value) : undefined}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-input/50 border-transparent focus-visible:ring-mauve-300 w-full">
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white">
                                                    {verboseSystemOptions.map(opt => (
                                                        <SelectItem key={opt.value} value={String(opt.value)} className="text-xs cursor-pointer">{opt.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                {/* I/O Logging Level */}
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="I/O Logging Level" tooltip={tooltips.daqProfileIOLevel} />
                                    <Controller
                                        control={control}
                                        name={`handlersProfile.${index}.verboseIO`}
                                        render={({ field: ioField }) => (
                                            <Select 
                                                onValueChange={(val) => ioField.onChange(Number(val))} 
                                                value={ioField.value !== undefined ? String(ioField.value) : undefined}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-input/50 border-transparent focus-visible:ring-mauve-300 w-full">
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white">
                                                    {verboseIOOptions.map(opt => (
                                                        <SelectItem key={opt.value} value={String(opt.value)} className="text-xs cursor-pointer">{opt.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Analog Inputs Checkboxes */}
                            <div className="border-t border-mauve-250/30 pt-4 mt-2">
                                <FieldLabel text="Analog Inputs" tooltip={tooltips.daqProfileAnalogInputs} />
                                
                                <div className="flex items-center gap-6 mt-3">
                                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-mauve-300 text-mauve-600 focus:ring-mauve-500 h-4 w-4"
                                            {...register(`handlersProfile.${index}.loadA`)}
                                        />
                                        Primary Load Cell
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-mauve-300 text-mauve-600 focus:ring-mauve-500 h-4 w-4"
                                            {...register(`handlersProfile.${index}.strain`)}
                                        />
                                        Strain
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-mauve-300 text-mauve-600 focus:ring-mauve-500 h-4 w-4"
                                            {...register(`handlersProfile.${index}.specLoadFrameComm`)}
                                        />
                                        Spec Communication
                                    </label>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </ProfileCardLayout>
    );
};

