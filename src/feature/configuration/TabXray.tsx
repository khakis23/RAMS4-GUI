import { useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "../../components/ui/button.tsx";
import { ConfigTabSection } from "./components/ConfigTabSection.tsx";
import { useConfigurationStore, useValidationStore } from "@/store/useConfigurationStore.ts";
import { compileZodErrors } from "./utils/validationUtils.ts";
import { xrayFormSchema } from "./profileSchemas/xraySchema.ts";
import { XrayProfileCard } from "./components/XrayProfileCard.tsx";
import { useFormAutoSave } from "./hooks/useFormAutoSave.ts";
import { tooltips } from "@/config/tooltips.ts";
import { Plus } from 'lucide-react';

export const TabXray = () => {
    const { draft, updateDraft, lastLoadedPath } = useConfigurationStore();
    const loadedPathRef = useRef<string>("");

    const {
        register,
        control,
        watch,
        reset,
        formState: { errors }
    } = useForm<any>({
        resolver: zodResolver(xrayFormSchema),
        mode: "onChange",
        defaultValues: {
            xrayProfiles: (draft.xrayProfiles || []).map(p => ({
                id: p.id,
                name: p.name,
                mode: p.mode || 'rotation-series',
                ramsx: p.ramsx ?? null,
                ramsz: p.ramsz ?? null,
                ome: p.ome ?? null,
                ctime: p.ctime ?? null,
                beamHeight: p.beamHeight ?? null,
                beamWidth: p.beamWidth ?? null,
                atten: p.atten ?? null,
                numPoints: p.numPoints ?? null,
                omeStart: p.omeStart ?? null,
                omeStop: p.omeStop ?? null,
                layerStart: p.layerStart ?? null,
                layerEnd: p.layerEnd ?? null,
                numLayers: p.numLayers ?? null,
                stillPoints: p.stillPoints || [],
                axis1Name: p.axis1Name || "ramsx",
                axis1Start: p.axis1Start ?? null,
                axis1Stop: p.axis1Stop ?? null,
                axis1Images: p.axis1Images ?? null,
                axis2Name: p.axis2Name || "ramsz",
                axis2Start: p.axis2Start ?? null,
                axis2Stop: p.axis2Stop ?? null,
                axis2Images: p.axis2Images ?? null
            })),
        }
    });

    // Re-initialize form defaultValues when a new file is loaded from the gateway
    useEffect(() => {
        if (lastLoadedPath && lastLoadedPath !== loadedPathRef.current) {
            loadedPathRef.current = lastLoadedPath;
            reset({
                xrayProfiles: (draft.xrayProfiles || []).map(p => ({
                    id: p.id,
                    name: p.name,
                    mode: p.mode || 'rotation-series',
                    ramsx: p.ramsx ?? null,
                    ramsz: p.ramsz ?? null,
                    ome: p.ome ?? null,
                    ctime: p.ctime ?? null,
                    beamHeight: p.beamHeight ?? null,
                    beamWidth: p.beamWidth ?? null,
                    atten: p.atten ?? null,
                    numPoints: p.numPoints ?? null,
                    omeStart: p.omeStart ?? null,
                    omeStop: p.omeStop ?? null,
                    layerStart: p.layerStart ?? null,
                    layerEnd: p.layerEnd ?? null,
                    numLayers: p.numLayers ?? null,
                    stillPoints: p.stillPoints || [],
                    axis1Name: p.axis1Name || "ramsx",
                    axis1Start: p.axis1Start ?? null,
                    axis1Stop: p.axis1Stop ?? null,
                    axis1Images: p.axis1Images ?? null,
                    axis2Name: p.axis2Name || "ramsz",
                    axis2Start: p.axis2Start ?? null,
                    axis2Stop: p.axis2Stop ?? null,
                    axis2Images: p.axis2Images ?? null
                })),
            });
        }
    }, [lastLoadedPath, reset, draft]);

    const {
        fields,
        append,
        remove
    } = useFieldArray({
        control,
        name: "xrayProfiles",
    });

    const watchedValues = watch();

    // Sync form values to the store draft on every change — including partial/invalid state
    useFormAutoSave({
        watchedValues,
        storeDraft: draft,
        updateDraft,
        mapValues: (watched: any) => ({
            xrayProfiles: watched.xrayProfiles || []
        })
    });

    // Connect errors to validation warning store under 'xray' key by validating watchedValues against Zod schema
    const { setErrors } = useValidationStore();
    useEffect(() => {
        const result = xrayFormSchema.safeParse(watchedValues);
        if (!result.success) {
            const errorMessages = compileZodErrors(result.error);
            
            const existingErrors = useValidationStore.getState().errors['xray'] || [];
            const hasChanged = 
                existingErrors.length !== errorMessages.length ||
                errorMessages.some((msg: string, idx: number) => msg !== existingErrors[idx]);
            
            if (hasChanged) {
                setErrors('xray', errorMessages);
            }
        } else {
            const existingErrors = useValidationStore.getState().errors['xray'] || [];
            if (existingErrors.length > 0) {
                setErrors('xray', []);
            }
        }
    }, [watchedValues, setErrors]);

    return (
        <ConfigTabSection
            title="X-ray Scan Profiles"
            titleTooltip={tooltips.xraySectionTitle}
            description="Configure parameters for X-ray scan sweeps, layers, and grids."
            profiles={
                <div className="w-full space-y-6">
                    {/* Render active scan profiles list */}
                    {fields.map((field, index) => (
                        <XrayProfileCard
                            key={field.id}
                            index={index}
                            register={register}
                            errors={errors}
                            control={control}
                            removeProfile={remove}
                        />
                    ))}

                    {/* Add Profile button at bottom */}
                    <Button 
                        type="button" 
                        onClick={() => append({ 
                            id: `xrayProfile${Date.now()}`,
                            name: "",
                            mode: "rotation-series",
                            ramsx: null,
                            ramsz: null,
                            ome: null,
                            ctime: null,
                            beamHeight: null,
                            beamWidth: null,
                            atten: null,
                            numPoints: null,
                            stillPoints: []
                        })}
                        className="w-full mt-4 flex items-center justify-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add X-ray Profile
                    </Button>
                </div>
            }
        />
    );
};
