import { useEffect, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { useConfigurationStore, useValidationStore } from "@/store/useConfigurationStore.ts";
import { ConfigTabSection } from './components/ConfigTabSection.tsx';
import { FieldLabel } from '../../components/ui/FieldLabel.tsx';
import { compileZodErrors } from "./utils/validationUtils.ts";
import { daqSchema } from "./profileSchemas/daqSchema.ts";
import { DAQProfileCard } from "./components/DAQProfileCard.tsx";
import { useFormAutoSave } from "./hooks/useFormAutoSave.ts";
import { tooltips } from "@/config/tooltips.ts";

export const TabDAQ = () => {
    const { draft, updateDraft, lastLoadedPath } = useConfigurationStore();
    const loadedPathRef = useRef<string>("");

    const {
        register,
        control,
        watch,
        reset,
        formState: { errors },
    } = useForm<z.infer<typeof daqSchema>>({
        resolver: zodResolver(daqSchema),
        mode: "onChange",
        defaultValues: {
            requiredAxes: draft.requiredAxes || ["A", "B", "RA", "RB"],
            daqFrequency: draft.daqFrequency,
            samplePoints: draft.samplePoints,
            handlersProfile: (draft.handlerProfiles || []).map(profile => {
                const rawAi = profile.verboseAi || "";
                return {
                    ...profile,
                    verboseAxis: profile.verboseAxis || "-1",
                    verboseTask: profile.verboseTask || "-1",
                    verboseSystem: profile.verboseSystem ?? -1,
                    verboseIO: profile.verboseIO ?? -1,
                    aiLoadA: rawAi.includes("LoadA"),
                    aiStrain: rawAi.includes("Strain"),
                    aiCustom: rawAi
                        .split(",")
                        .map(x => x.trim())
                        .filter(x => x && x !== "LoadA" && x !== "Strain")
                        .join(", "),
                };
            }),
        },
    });

    // Re-initialize form defaultValues when a new file is loaded from the gateway
    useEffect(() => {
        if (lastLoadedPath && lastLoadedPath !== loadedPathRef.current) {
            loadedPathRef.current = lastLoadedPath;
            reset({
                requiredAxes: draft.requiredAxes || ["A", "B", "RA", "RB"],
                daqFrequency: draft.daqFrequency,
                samplePoints: draft.samplePoints,
                handlersProfile: (draft.handlerProfiles || []).map(profile => {
                    const rawAi = profile.verboseAi || "";
                    return {
                        ...profile,
                        verboseAxis: profile.verboseAxis || "-1",
                        verboseTask: profile.verboseTask || "-1",
                        verboseSystem: profile.verboseSystem ?? -1,
                        verboseIO: profile.verboseIO ?? -1,
                        aiLoadA: rawAi.includes("LoadA"),
                        aiStrain: rawAi.includes("Strain"),
                        aiCustom: rawAi
                            .split(",")
                            .map(x => x.trim())
                            .filter(x => x && x !== "LoadA" && x !== "Strain")
                            .join(", "),
                    };
                }),
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

    // Map errors to the global validation errors list dynamically by validating watchedValues against Zod schema
    const { setErrors } = useValidationStore();
    useEffect(() => {
        const mappedProfiles = (watchedValues.handlersProfile || []).map((profile: any) => {
            const aiArray: string[] = [];
            if (profile.aiLoadA) aiArray.push("LoadA");
            if (profile.aiStrain) aiArray.push("Strain");
            if (profile.aiCustom) {
                const customs = profile.aiCustom
                    .split(",")
                    .map((x: string) => x.trim())
                    .filter(Boolean);
                aiArray.push(...customs);
            }
            
            return {
                mode: profile.mode,
                filename: profile.filename,
                verboseAxis: profile.verboseAxis,
                verboseTask: profile.verboseTask,
                verboseSystem: profile.verboseSystem,
                verboseIO: profile.verboseIO,
                verboseAi: aiArray.join(", "),
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

    // Automatically sync changes to Zustand store draft using custom sync hook
    useFormAutoSave({
        watchedValues,
        schema: daqSchema,
        storeDraft: draft,
        updateDraft,
        mapValues: (watched) => {
            const mappedProfiles = (watched.handlersProfile || []).map((profile: any) => {
                const aiArray: string[] = [];
                if (profile.aiLoadA) aiArray.push("LoadA");
                if (profile.aiStrain) aiArray.push("Strain");
                if (profile.aiCustom) {
                    const customs = profile.aiCustom
                        .split(",")
                        .map((x: string) => x.trim())
                        .filter(Boolean);
                    aiArray.push(...customs);
                }
                
                return {
                    mode: profile.mode,
                    filename: profile.filename,
                    verboseAxis: profile.verboseAxis,
                    verboseTask: profile.verboseTask,
                    verboseSystem: profile.verboseSystem,
                    verboseIO: profile.verboseIO,
                    verboseAi: aiArray.join(", "),
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
            title="Data Acquisition Configuration"
            titleTooltip={tooltips.daqSectionTitle}
            description="Configure parameters for Data Acquisition."
            profilesTitle="DAQ Handler Profiles"
            profilesTitleTooltip={tooltips.daqProfilesHeader}
            profiles={
                <div className="w-full space-y-6">
                    {/* Render handler profile cards */}
                    {fields.map((field, index) => (
                        <DAQProfileCard
                            key={field.id}
                            index={index}
                            control={control}
                            register={register}
                            errors={errors}
                            remove={remove}
                            currentMode={watch(`handlersProfile.${index}.mode`)}
                        />
                    ))}

                    {/* Add Profile button inside the card area */}
                    <Button 
                        type="button" 
                        onClick={() => append({ 
                            mode: "time-series", 
                            filename: "",
                            verboseAxis: "-1",
                            verboseSystem: -1,
                            verboseTask: "-1",
                            verboseIO: -1,
                            verboseAi: "",
                            aiLoadA: false,
                            aiStrain: false,
                            aiCustom: "",
                            frequency: undefined as any,
                            cycles: []
                        })}
                        className="w-full mt-4"
                    >
                        Add Handler Profile
                    </Button>
                </div>
            }
        >
            {/* Sampling Frequency Field */}
            <div className="flex flex-col gap-2">
                <FieldLabel text="Sampling Frequency" tooltip={tooltips.daqFrequency} required={true} />
                <Controller
                    control={control}
                    name="daqFrequency"
                    render={({ field }) => (
                        <Select 
                            onValueChange={(val) => field.onChange(Number(val))} 
                            value={field.value ? String(field.value) : undefined}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 kHz</SelectItem>
                                <SelectItem value="5">5 kHz</SelectItem>
                                <SelectItem value="10">10 kHz</SelectItem>
                                <SelectItem value="20">20 kHz</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.daqFrequency && (
                    <p className="text-xs text-destructive">{errors.daqFrequency.message}</p>
                )}
            </div>

            {/* Sample Points Field */}
            <div className="flex flex-col gap-2">
                <FieldLabel text="Sample Points" tooltip={tooltips.samplePoints} required={true} />
                <Input 
                    type="number" 
                    placeholder="Enter points (min 100)" 
                    {...register('samplePoints', { valueAsNumber: true })}
                />
                {errors.samplePoints && (
                    <p className="text-xs text-destructive">{errors.samplePoints.message}</p>
                )}
            </div>
        </ConfigTabSection>
    );
}
