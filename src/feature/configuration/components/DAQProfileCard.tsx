import { Control, Controller, FieldErrors, UseFormRegister, useFieldArray } from 'react-hook-form';
import { X, Plus } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { FieldLabel } from '../../../components/ui/FieldLabel';
import { tooltips } from "@/config/tooltips.ts";

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
        <div className="flex flex-col gap-4 text-left border-t border-mauve-150 pt-4 mt-2">
            <FieldLabel text="Cycles Configuration" tooltip={tooltips.daqProfileCycles} />
            
            <div className="space-y-4">
                {fields.map((field, cycleIndex) => (
                    <div key={field.id} className="flex items-end gap-4 w-full">
                        <div className="w-24">
                            <label className="text-xs font-medium text-muted-foreground">Start</label>
                            <Input 
                                type="number" 
                                placeholder="Start"
                                {...register(`handlersProfile.${profileIndex}.cycles.${cycleIndex}.start`, { valueAsNumber: true })}
                            />
                        </div>
                        <div className="w-24">
                            <label className="text-xs font-medium text-muted-foreground">Stop</label>
                            <Input 
                                type="number" 
                                placeholder="Stop"
                                {...register(`handlersProfile.${profileIndex}.cycles.${cycleIndex}.stop`, { valueAsNumber: true })}
                            />
                        </div>
                        <div className="w-20">
                            <label className="text-xs font-medium text-muted-foreground">Step</label>
                            <Input 
                                type="number" 
                                placeholder="Step"
                                {...register(`handlersProfile.${profileIndex}.cycles.${cycleIndex}.step`, { valueAsNumber: true })}
                            />
                        </div>
                        {fields.length > 1 && (
                            <Button 
                                type="button" 
                                variant="secondary" 
                                className="h-9 w-9 text-red-600 hover:bg-red-50 hover:text-red-800 p-0 rounded-xl"
                                onClick={() => remove(cycleIndex)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            <Button 
                type="button" 
                variant="secondary" 
                className="w-fit border-mauve-300 hover:bg-mauve-50 text-mauve-700 h-9"
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
}

export const DAQProfileCard = ({
    index,
    control,
    register,
    errors,
    remove,
    currentMode
}: DAQProfileCardProps) => {
    const profileErrors = (errors.handlersProfile as any)?.[index] as any;

    return (
        <div className="border rounded-xl p-6 bg-mauve-50/50 flex flex-col gap-4 text-left">
            
            {/* Card Header */}
            <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-sm text-mauve-850">Profile #{index + 1}</span>
                <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => remove(index)}
                >
                    Remove Profile
                </Button>
            </div>

            {/* Common Inputs: Mode Selector and Name */}
            <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <FieldLabel text="Mode" tooltip={tooltips.daqProfileMode} required={true} />
                    <Controller
                        control={control}
                        name={`handlersProfile.${index}.mode`}
                        render={({ field: modeField }) => (
                            <Select onValueChange={modeField.onChange} value={modeField.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="time-series">Time Series</SelectItem>
                                    <SelectItem value="peak-valley">Peak Valley</SelectItem>
                                    <SelectItem value="pso">PSO</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <FieldLabel text="Name" tooltip={tooltips.daqProfileFilename} required={true} />
                    <Input 
                        placeholder="Enter handler name"
                        className={profileErrors?.filename ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`handlersProfile.${index}.filename`)}
                    />
                    {profileErrors?.filename && (
                        <p className="text-xs text-destructive">{profileErrors.filename.message}</p>
                    )}
                </div>
            </div>

            {/* Conditionally show Time Series fields */}
            {currentMode === "time-series" && (
                <div className="flex flex-col gap-4 p-4 bg-white border rounded-xl shadow-inner">
                    <div className="flex flex-col gap-2 max-w-xs">
                        <FieldLabel text="Frequency (Hz)" tooltip={tooltips.daqProfileFrequency} required={true} />
                        <Input 
                            type="number" 
                            className={profileErrors?.frequency ? "border-destructive focus-visible:ring-destructive" : ""}
                            {...register(`handlersProfile.${index}.frequency`, { valueAsNumber: true })} 
                        />
                        {profileErrors?.frequency && (
                            <p className="text-xs text-destructive">{profileErrors.frequency.message}</p>
                        )}
                    </div>
                    <CyclesFieldArray 
                        control={control} 
                        register={register} 
                        profileIndex={index} 
                    />
                </div>
            )}

            {/* Conditionally show Peak Valley fields */}
            {currentMode === "peak-valley" && (
                <div className="grid grid-cols-3 gap-6 bg-white p-4 border rounded-xl shadow-inner">
                    <div className="flex flex-col gap-2">
                        <FieldLabel text="Signal Axis" tooltip={tooltips.daqProfileSignalAxis} required={true} />
                        <Input 
                            className={profileErrors?.signalAxis ? "border-destructive focus-visible:ring-destructive" : ""}
                            {...register(`handlersProfile.${index}.signalAxis`)} 
                        />
                        {profileErrors?.signalAxis && (
                            <p className="text-xs text-destructive">{profileErrors.signalAxis.message}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <FieldLabel text="Signal Item" tooltip={tooltips.daqProfileSignalItem} required={true} />
                        <Controller
                            control={control}
                            name={`handlersProfile.${index}.signalItem`}
                            render={({ field: signalField }) => (
                                <Select onValueChange={signalField.onChange} value={signalField.value}>
                                    <SelectTrigger className={profileErrors?.signalItem ? "border-destructive focus-visible:ring-destructive" : ""}>
                                        <SelectValue placeholder="Select signal item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PositionFeedback">PositionFeedback</SelectItem>
                                        <SelectItem value="VelocityFeedback">VelocityFeedback</SelectItem>
                                        <SelectItem value="AccelerationFeedback">AccelerationFeedback</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {profileErrors?.signalItem && (
                            <p className="text-xs text-destructive">{profileErrors.signalItem.message}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <FieldLabel text="Prominence" tooltip={tooltips.daqProfileProminence} required={true} />
                        <Input 
                            type="number" 
                            className={profileErrors?.signalProminence ? "border-destructive focus-visible:ring-destructive" : ""}
                            {...register(`handlersProfile.${index}.signalProminence`, { valueAsNumber: true })} 
                        />
                        {profileErrors?.signalProminence && (
                            <p className="text-xs text-destructive">{profileErrors.signalProminence.message}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Conditionally show PSO fields */}
            {currentMode === "pso" && (
                <div className="flex flex-col gap-2 bg-white p-4 border rounded-xl shadow-inner">
                    <FieldLabel text="PSO Axis" tooltip={tooltips.daqProfilePsoAxis} required={true} />
                    <Input 
                        className={profileErrors?.psoAxis ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`handlersProfile.${index}.psoAxis`)} 
                    />
                    {profileErrors?.psoAxis && (
                        <p className="text-xs text-destructive">{profileErrors.psoAxis.message}</p>
                    )}
                </div>
            )}

            {/* Advanced Logging Details Collapsible Details Section */}
            <details className="mt-4 border-t border-mauve-150 pt-4">
                <summary className="text-sm font-bold text-mauve-800 cursor-pointer hover:text-mauve-900 select-none">
                    Advanced Logging Details
                </summary>
                
                <div className="grid grid-cols-2 gap-6 mt-4 pl-2">
                    {/* Axis Logging */}
                    <div className="flex flex-col gap-2">
                        <FieldLabel text="Axis Logging Level" tooltip={tooltips.daqProfileAxisLevel} />
                        <Controller
                            control={control}
                            name={`handlersProfile.${index}.verboseAxis`}
                            render={({ field: axisField }) => (
                                <Select onValueChange={axisField.onChange} value={axisField.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {verboseAxisOptions.map(opt => (
                                            <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    {/* Task Logging */}
                    <div className="flex flex-col gap-2">
                        <FieldLabel text="Task Logging Level" tooltip={tooltips.daqProfileTaskLevel} />
                        <Controller
                            control={control}
                            name={`handlersProfile.${index}.verboseTask`}
                            render={({ field: taskField }) => (
                                <Select onValueChange={taskField.onChange} value={taskField.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {verboseTaskOptions.map(opt => (
                                            <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    {/* System Logging */}
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
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {verboseSystemOptions.map(opt => (
                                            <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    {/* I/O Logging */}
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
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {verboseIOOptions.map(opt => (
                                            <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    {/* Analog Inputs Checkboxes & Custom Input */}
                    <div className="col-span-2 border-t pt-4 mt-2">
                        <FieldLabel text="Analog Inputs" tooltip={tooltips.daqProfileAnalogInputs} />
                        
                        <div className="flex items-center gap-6 mt-3">
                           <label className="flex items-center gap-2 text-sm font-medium">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 text-mauve-600 focus:ring-mauve-500 h-4 w-4"
                                    {...register(`handlersProfile.${index}.aiLoadA`)}
                                />
                                LoadA Sensor
                            </label>
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 text-mauve-600 focus:ring-mauve-500 h-4 w-4"
                                    {...register(`handlersProfile.${index}.aiStrain`)}
                                />
                                Strain Sensor
                            </label>
                        </div>

                        <div className="flex flex-col gap-2 mt-4 max-w-md">
                            <label className="text-xs font-medium text-muted-foreground">Custom Channels / Coordinates (e.g. [1,0], [3,1])</label>
                            <Input 
                                placeholder="Enter custom indexes"
                                {...register(`handlersProfile.${index}.aiCustom`)}
                            />
                        </div>
                    </div>
                </div>
            </details>
        </div>
    );
};
