import { useEffect, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { z } from 'zod';

import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useConfigurationStore, useValidationStore } from "@/store/useConfigurationStore.ts";
import { ConfigTabSection } from './components/ConfigTabSection.tsx';
import { FieldLabel } from '../../components/ui/FieldLabel.tsx';
import { compileZodErrors } from "./utils/validationUtils.ts";
import { daqSchema } from "./profileSchemas/daqSchema.ts";
import { DAQProfileCard } from "./components/DAQProfileCard.tsx";
import { useFormAutoSave } from "./hooks/useFormAutoSave.ts";
import { tooltips } from "@/config/tooltips.ts";
import { Plus } from 'lucide-react';
import { useAvailableAxes } from '@/hooks/useAvailableAxes';

export const TabDAQ = () => {
    const { draft, updateDraft, lastLoadedPath } = useConfigurationStore();
    const availableAxes = useAvailableAxes();
    const loadedPathRef = useRef<string>("");

    const {
        register,
        control,
        watch,
        reset,
        formState: { errors },
    } = useForm<z.infer<typeof daqSchema>>({
        mode: "onChange",
        defaultValues: {
            requiredAxes: availableAxes,
            daqFrequency: draft.daqFrequency,
            samplePoints: draft.samplePoints,
        },
    });

    // Re-initialize form defaultValues when a new file is loaded from the gateway
    useEffect(() => {
        if (lastLoadedPath && lastLoadedPath !== loadedPathRef.current) {
            loadedPathRef.current = lastLoadedPath;
            reset({
                requiredAxes: availableAxes,
                daqFrequency: draft.daqFrequency,
                samplePoints: draft.samplePoints,
            });
        }
    }, [lastLoadedPath, reset, draft]);

    const {
        fields,
        append,
        remove
    } = useFieldArray({
        control,
        name: "handlersProfile",
    });

    const watchedValues = watch();
    const profilesEndRef = useRef<HTMLDivElement>(null);

    const handleAddProfile = () => {
        append({ 
            mode: "time-series", 
            filename: "",
            verboseAxis: "-1",
            verboseSystem: -1,
            verboseTask: "-1",
            verboseIO: -1,
            verboseAi: [],
            loadA: false,
            strain: false,
            specLoadFrameComm: false,
            frequency: 1000,
            cycles: [],
            signalAxis: "A",
            signalItem: "PositionFeedback",
            signalProminence: null,
            psoAxis: "A"
        });
        setTimeout(() => {
            profilesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
    };


    // Map errors to the global validation errors list dynamically by validating watchedValues against Zod schema
    const { setErrors } = useValidationStore();
    useEffect(() => {
        const mappedProfiles = (watchedValues.handlersProfile || []).map((profile: any) => {
            const aiArray: string[] = [];
            if (profile.loadA) aiArray.push("LoadA");
            if (profile.strain) aiArray.push("Strain");
            if (profile.specLoadFrameComm) aiArray.push("SpecComm");
            
            return {
                mode: profile.mode,
                filename: profile.filename,
                verboseAxis: profile.verboseAxis,
                verboseTask: profile.verboseTask,
                verboseSystem: profile.verboseSystem,
                verboseIO: profile.verboseIO,
                verboseAi: aiArray,
                frequency: profile.frequency,
                cycles: profile.cycles,
                signalAxis: profile.signalAxis,
                signalItem: profile.signalItem,
                signalProminence: profile.signalProminence,
                psoAxis: profile.psoAxis,
                signalLoad: profile.signalLoad,
                signalStrain: profile.signalStrain,
            };
        });

        const validationPayload = {
            requiredAxes: watchedValues.requiredAxes,
            daqFrequency: watchedValues.daqFrequency,
            samplePoints: watchedValues.samplePoints,
            handlersProfile: mappedProfiles
        };

        const result = daqSchema.safeParse(validationPayload);
        if (!result.success) {
            const errorMessages = compileZodErrors(result.error);
            
            const existingErrors = useValidationStore.getState().errors['daq'] || [];
            const hasChanged = 
                existingErrors.length !== errorMessages.length ||
                errorMessages.some((msg, idx) => msg !== existingErrors[idx]);
            
            if (hasChanged) {
                setErrors('daq', errorMessages);
            }
        } else {
            const existingErrors = useValidationStore.getState().errors['daq'] || [];
            if (existingErrors.length > 0) {
                setErrors('daq', []);
            }
        }
    }, [watchedValues, setErrors]);

    // Sync form values to the store draft on every change — including partial/invalid state
    useFormAutoSave({
        watchedValues,
        storeDraft: draft,
        updateDraft,
        mapValues: (watched) => {
            const mappedProfiles = (watched.handlersProfile || []).map((profile: any) => {
                const aiArray: string[] = [];
                if (profile.loadA) aiArray.push("LoadA");
                if (profile.strain) aiArray.push("Strain");
                if (profile.specLoadFrameComm) aiArray.push("SpecComm");
                
                return {
                    mode: profile.mode,
                    filename: profile.filename,
                    verboseAxis: profile.verboseAxis,
                    verboseTask: profile.verboseTask,
                    verboseSystem: profile.verboseSystem,
                    verboseIO: profile.verboseIO,
                    verboseAi: aiArray,
                    frequency: profile.frequency,
                    cycles: profile.cycles,
                    signalAxis: profile.signalAxis,
                    signalItem: profile.signalItem,
                    signalProminence: profile.signalProminence,
                    psoAxis: profile.psoAxis,
                    signalLoad: profile.signalLoad,
                    signalStrain: profile.signalStrain,
                };
            });

            return {
                requiredAxes: watched.requiredAxes,
                daqFrequency: watched.daqFrequency,
                samplePoints: watched.samplePoints,
                handlerProfiles: mappedProfiles
            };
        }
    });

    return (
        <ConfigTabSection
            topContent={
                /* Advanced DAQ Config Accordion */
                <Accordion type="single" collapsible className="border border-mauve-200 rounded-xl overflow-hidden bg-white shadow-sm w-full my-3">
                    <AccordionItem value="advanced-daq-config" className="border-b-0">
                        <AccordionTrigger className="px-4 py-3 bg-mauve-50/50 hover:bg-mauve-50 transition-colors text-xs font-bold text-mauve-850 hover:no-underline [&>svg]:text-mauve-500">
                            <span className="flex items-center gap-6">
                                <span>Advanced DAQ Config</span>
                                <span className="text-mauve-600 font-normal">
                                    Hardware Sampling Frequency: {watchedValues.daqFrequency ?? 1} kHz &nbsp;&nbsp;&nbsp;&nbsp; Buffer Sample Size: {watchedValues.samplePoints ?? 1000}
                                </span>
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="p-5 flex flex-col gap-6 border-t border-mauve-200 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-left">
                                {/* Sampling Frequency Field */}
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Hardware Sampling Frequency" tooltip={tooltips.daqFrequency} required={true} />
                                    <Controller
                                        control={control}
                                        name="daqFrequency"
                                        render={({ field }) => (
                                            <Select 
                                                onValueChange={(val) => field.onChange(Number(val))} 
                                                value={field.value ? String(field.value) : undefined}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-input/50 border-transparent focus-visible:ring-mauve-300 w-full">
                                                    <SelectValue placeholder="Select frequency" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white">
                                                    <SelectItem value="1" className="text-xs cursor-pointer">1 kHz</SelectItem>
                                                    <SelectItem value="5" className="text-xs cursor-pointer">5 kHz</SelectItem>
                                                    <SelectItem value="10" className="text-xs cursor-pointer">10 kHz</SelectItem>
                                                    <SelectItem value="20" className="text-xs cursor-pointer">20 kHz</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.daqFrequency && (
                                        <p className="text-xs text-destructive">{errors.daqFrequency.message}</p>
                                    )}
                                </div>

                                {/* Buffer Sample Size Field */}
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Buffer Sample Size" tooltip={tooltips.samplePoints} required={true} />
                                    <Input 
                                        type="number" 
                                        placeholder="Enter points (min 100)" 
                                        className="h-8 text-xs bg-input/50 border-transparent focus-visible:ring-mauve-300"
                                        {...register('samplePoints', { valueAsNumber: true })}
                                    />
                                    {errors.samplePoints && (
                                        <p className="text-xs text-destructive">{errors.samplePoints.message}</p>
                                    )}
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            }
            profilesTitle="DAQ Handler Profiles"
            profilesDescription="Configure parameters for Data Acquisition handler profiles and logging."
            profilesAction={
                <Button 
                    type="button" 
                    onClick={handleAddProfile}
                    className="h-8 px-4 text-xs font-semibold rounded-lg bg-mauve-600 hover:bg-mauve-700 text-white flex items-center gap-1.5 cursor-pointer shadow-sm animate-fade-in"
                >
                    <Plus className="h-3.5 w-3.5" /> Add Handler Profile
                </Button>
            }
            profiles={
                <div className="w-full space-y-6 pb-12">
                    {fields.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[120px] border border-mauve-200 rounded-lg p-6 text-center bg-white">
                            <p className="text-sm text-mauve-500 whitespace-pre-line">
                                No DAQ profiles added yet.
                            </p>
                            <Button
                                type="button"
                                variant="link"
                                onClick={handleAddProfile}
                                className="mt-1 text-xs font-semibold text-mauve-650 hover:text-mauve-850 cursor-pointer text-decoration-none"
                            >
                                Click here to add a profile.
                            </Button>
                        </div>
                    ) : (
                        fields.map((field, index) => (
                            <DAQProfileCard
                                key={field.id}
                                index={index}
                                control={control}
                                register={register}
                                errors={errors}
                                remove={remove}
                                currentMode={watch(`handlersProfile.${index}.mode`)}
                                requiredAxes={availableAxes}
                            />
                        ))
                    )}
                    <div ref={profilesEndRef} />
                </div>
            }

        />
    );
};

