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

    return (
        <div className="flex flex-col gap-4 text-left border-t border-mauve-250/30 pt-4 mt-2">
            <FieldLabel text="Cycles Configuration" tooltip={tooltips.daqProfileCycles} />
            
            {fields.length === 0 ? (
                <div className="bg-mauve-50/50 border border-mauve-200 text-mauve-700 rounded-lg p-5 text-sm mb-3">
                    No cycles defined yet. This profile will log data continuously for the entire test.
                </div>
            ) : (
                <div className="space-y-4">
                    {fields.map((field, cycleIndex) => (
                        <div key={field.id} className="flex items-end gap-4 w-full">
                            <div className="w-24">
                                <label className="text-xs font-medium text-muted-foreground">Start</label>
                                <Input 
                                    type="number" 
                                    placeholder="Start"
                                    className="h-8 bg-white border-mauve-200"
                                    {...register(`handlersProfile.${profileIndex}.cycles.${cycleIndex}.start`, { valueAsNumber: true })}
                                />
                            </div>
                            <div className="w-24">
                                <label className="text-xs font-medium text-muted-foreground">Stop</label>
                                <Input 
                                    type="number" 
                                    placeholder="Stop"
                                    className="h-8 bg-white border-mauve-200"
                                    {...register(`handlersProfile.${profileIndex}.cycles.${cycleIndex}.stop`, { valueAsNumber: true })}
                                />
                            </div>
                            <div className="w-20">
                                <label className="text-xs font-medium text-muted-foreground">Step</label>
                                <Input 
                                    type="number" 
                                    placeholder="Step"
                                    className="h-8 bg-white border-mauve-200"
                                    {...register(`handlersProfile.${profileIndex}.cycles.${cycleIndex}.step`, { valueAsNumber: true })}
                                />
                            </div>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-mauve-400 dark:text-mauve-500 hover:text-destructive hover:bg-destructive/10 dark:hover:text-red-400 dark:hover:bg-red-500/20 rounded-lg cursor-pointer transition-colors"
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
                className="w-fit border border-mauve-300 hover:bg-mauve-50 text-mauve-700 h-9 rounded-lg"
                onClick={() => append({ start: 1, stop: 10, step: 1 })}
            >
                <Plus className="h-4 w-4 mr-2" /> Add Cycle Range
            </Button>
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

    const isComplete = useMemo(() => {
        if (!profileValues) return false;
        return handlerProfileSchema.safeParse(profileValues).success;
    }, [profileValues]);

    return (
        <ProfileCardLayout
            index={index}
            name={filename}
            isComplete={isComplete}
            onRemove={() => remove(index)}
            modeSelector={
                <Controller
                    control={control}
                    name={`handlersProfile.${index}.mode`}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-7 text-xs font-semibold rounded-lg border-mauve-200 focus:ring-mauve-300 bg-white shadow-sm w-full">
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
                <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-5 mb-5">
                        <div className="flex flex-col gap-2 md:col-span-3">
                            <FieldLabel text="File Name" tooltip={tooltips.daqProfileFilename} required={true} />
                            <Input 
                                placeholder="Enter file name"
                                className="h-8 bg-white border-mauve-250 focus-visible:ring-mauve-300"
                                {...register(`handlersProfile.${index}.filename`)}
                            />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-1">
                            <FieldLabel text="Frequency (Hz)" tooltip={tooltips.daqProfileFrequency} required={true} />
                            <Input 
                                type="number" 
                                className={`h-8 bg-white border-mauve-250 ${profileErrors?.frequency ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                {...register(`handlersProfile.${index}.frequency`, { valueAsNumber: true })} 
                            />
                            {profileErrors?.frequency && (
                                <p className="text-xs text-destructive">{profileErrors.frequency.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-xray-shading py-5 px-5 flex flex-col gap-5">
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
                <div className="px-5 flex flex-col gap-2 mb-5">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <FieldLabel text="File Name" tooltip={tooltips.daqProfileFilename} required={true} />
                            <Input 
                                placeholder="Enter file name"
                                className="h-8 bg-white border-mauve-250 focus-visible:ring-mauve-300"
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
                                            <SelectTrigger className="w-full h-8 bg-white border-mauve-200">
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
                            <FieldLabel text="Signal Item" tooltip={tooltips.daqProfileSignalItem} required={true} />
                            <Controller
                                control={control}
                                name={`handlersProfile.${index}.signalItem`}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                                        <SelectTrigger className="w-full h-8 bg-white border-mauve-200">
                                            <SelectValue placeholder="Select item" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectItem value="PositionFeedback" className="text-xs cursor-pointer">PositionFeedback</SelectItem>
                                            <SelectItem value="VelocityFeedback" className="text-xs cursor-pointer">VelocityFeedback</SelectItem>
                                            <SelectItem value="AccelerationFeedback" className="text-xs cursor-pointer">AccelerationFeedback</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {profileErrors?.signalItem && (
                                <p className="text-xs text-destructive">{profileErrors.signalItem.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-1">
                            <FieldLabel text="Prominence" tooltip={tooltips.daqProfileProminence} required={true} />
                            <Input 
                                type="number" 
                                step="any"
                                className={`h-8 bg-white border-mauve-250 ${profileErrors?.signalProminence ? "border-destructive focus-visible:ring-destructive" : ""}`}
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
                <div className="px-5 flex flex-col gap-2 mb-5">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-2 md:col-span-3">
                            <FieldLabel text="File Name" tooltip={tooltips.daqProfileFilename} required={true} />
                            <Input 
                                placeholder="Enter file name"
                                className="h-8 bg-white border-mauve-250 focus-visible:ring-mauve-300"
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
                                            <SelectTrigger className="w-full h-8 bg-white border-mauve-200">
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
            <Accordion type="single" collapsible className="w-full border-t border-mauve-150">
                <AccordionItem value="advanced-logging" className="border-b-0 border-transparent">
                    <AccordionTrigger className="py-3 px-5 text-xs font-bold text-mauve-800 hover:no-underline [&>svg]:text-mauve-500 select-none">
                        Advanced Logging Details
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 px-5 bg-mauve-50/30 border-t border-mauve-150/30 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            {/* Axis Logging Level */}
                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Axis Logging Level" tooltip={tooltips.daqProfileAxisLevel} />
                                <Controller
                                    control={control}
                                    name={`handlersProfile.${index}.verboseAxis`}
                                    render={({ field: axisField }) => (
                                        <Select onValueChange={axisField.onChange} value={axisField.value}>
                                            <SelectTrigger className="w-full h-8 bg-white border-mauve-200">
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
                                            <SelectTrigger className="w-full h-8 bg-white border-mauve-200">
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
                                            <SelectTrigger className="w-full h-8 bg-white border-mauve-200">
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
                                            <SelectTrigger className="w-full h-8 bg-white border-mauve-200">
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
        </ProfileCardLayout>
    );
};
