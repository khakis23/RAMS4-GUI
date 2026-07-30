import { useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "../../components/ui/button";
import { ConfigTabSection } from "./components/ConfigTabSection";
import { useConfigurationStore, useValidationStore } from "@/store/useConfigurationStore";
import { compileZodErrors } from "./utils/validationUtils";
import { xrayFormSchema } from "./profileSchemas/xraySchema";
import { XrayProfileCard } from "./components/XrayProfileCard";
import { useFormAutoSave } from "./hooks/useFormAutoSave";
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
    } = useForm<z.infer<typeof xrayFormSchema>>({
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
                stillPoints: p.stillPoints || [],
                mapscanAxes: p.mapscanAxes || [],
                layerRanges: p.layerRanges || []
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
                    stillPoints: p.stillPoints || [],
                    mapscanAxes: p.mapscanAxes || [],
                    layerRanges: p.layerRanges || []
                })),
            });
        }
    }, [lastLoadedPath, reset, draft.xrayProfiles]);

    const {
        fields,
        append,
        remove
    } = useFieldArray({
        control,
        name: "xrayProfiles",
    });

    const watchedValues = watch();
    const profilesEndRef = useRef<HTMLDivElement>(null);

    const handleAddProfile = () => {
        append({
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
            stillPoints: [],
            mapscanAxes: [],
            layerRanges: []
        });
        setTimeout(() => {
            profilesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
    };

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
            profilesTitle="X-ray Scan Profiles"
            profilesDescription="Configure parameters for X-ray scan sweeps, layers, and grids."
            profilesAction={
                <Button 
                    type="button" 
                    onClick={handleAddProfile}
                    className="h-8 px-4 text-xs font-semibold rounded-lg bg-mauve-600 hover:bg-mauve-700 text-white flex items-center gap-1.5 cursor-pointer shadow-sm animate-fade-in"
                >
                    <Plus className="h-3.5 w-3.5" /> Add X-ray Profile
                </Button>
            }
            profiles={
                <div className="w-full space-y-6 pb-12">
                    {fields.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[120px] border border-mauve-200 rounded-lg p-6 text-center bg-white">
                            <p className="text-sm text-mauve-500 whitespace-pre-line">
                                No X-ray profiles added yet.
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
                            <XrayProfileCard
                                key={field.id}
                                index={index}
                                register={register}
                                errors={errors}
                                control={control}
                                removeProfile={remove}
                            />
                        ))
                    )}
                    <div ref={profilesEndRef} />
                </div>
            }

        />
    );
};

