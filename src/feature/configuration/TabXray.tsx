import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "../../components/ui/button.tsx";
import { ConfigTabSection } from "./components/ConfigTabSection.tsx";
import { useConfigurationStore, useValidationStore } from "@/store/useConfigurationStore.ts";
import { compileZodErrors } from "./utils/validationUtils.ts";
import { xrayFormSchema } from "./profileSchemas/xraySchema.ts";
import { XrayProfileCard } from "./components/XrayProfileCard.tsx";
import { useFormAutoSave } from "./hooks/useFormAutoSave.ts";

export const TabXray = () => {
    const { draft, updateDraft } = useConfigurationStore();

    const {
        register,
        control,
        watch,
        formState: { errors }
    } = useForm<z.infer<typeof xrayFormSchema>>({
        resolver: zodResolver(xrayFormSchema),
        mode: "onChange",
        defaultValues: {
            xrayProfiles: (draft.xrayProfiles || []).map(p => ({
                id: p.id,
                name: p.name,
                x: p.x,
                z: p.z,
                omeStart: p.omeStart,
                omeStop: p.omeStop,
                ctime: p.ctime,
                beamHeight: p.beamHeight,
                beamWidth: p.beamWidth,
                atten: p.atten,
            })),
        }
    });

    const {
        fields,
        append,
        remove
    } = useFieldArray({
        control,
        name: "xrayProfiles",
    });

    const watchedValues = watch();

    // Sync form values back to store draft on change if valid
    useFormAutoSave({
        watchedValues,
        schema: xrayFormSchema,
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
            titleTooltip="Coordinates grid scan configurations for incident X-ray beam data collection layers."
            description="Configure parameters for X-ray scan sweeps."
            profiles={
                <div className="w-full space-y-6">
                    {/* Render active scan profiles list */}
                    {fields.map((field, index) => (
                        <XrayProfileCard
                            key={field.id}
                            index={index}
                            register={register}
                            errors={errors}
                            remove={remove}
                        />
                    ))}

                    {/* Add Profile button at bottom */}
                    <Button 
                        type="button" 
                        onClick={() => append({ 
                            id: `xrayProfile${Date.now()}`,
                            name: "",
                            x: "",
                            z: "",
                            omeStart: "",
                            omeStop: "",
                            ctime: "",
                            beamHeight: "",
                            beamWidth: "",
                            atten: ""
                        })}
                        className="w-full mt-4"
                    >
                        Add X-ray Profile
                    </Button>
                </div>
            }
        />
    );
};
