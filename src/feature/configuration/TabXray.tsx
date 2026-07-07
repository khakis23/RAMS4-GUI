import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "../../components/ui/button.tsx";
import { ConfigTabSection } from "./components/ConfigTabSection.tsx";
import { useConfigurationStore, useValidationStore } from "@/store/useConfigurationStore.ts";
import { compileFormErrors } from "./utils/validationUtils.ts";
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

    // Connect errors to validation warning store under 'xray' key
    const { setErrors } = useValidationStore();
    useEffect(() => {
        const errorMessages = compileFormErrors(errors);
        
        const existingErrors = useValidationStore.getState().errors['xray'] || [];
        const hasChanged = 
            existingErrors.length !== errorMessages.length ||
            errorMessages.some((msg: string, idx: number) => msg !== existingErrors[idx]);
        
        if (hasChanged) {
            setErrors('xray', errorMessages);
        }
    }, [errors, setErrors]);

    return (
        <ConfigTabSection
            title="X-ray Scan Profiles"
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
                            id: `xrayProfile${fields.length + 1}`,
                            name: `xrayProfile${fields.length + 1}`,
                            x: "0",
                            z: "0",
                            omeStart: "0",
                            omeStop: "0",
                            ctime: "1",
                            beamHeight: "1",
                            beamWidth: "1",
                            atten: "0"
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
