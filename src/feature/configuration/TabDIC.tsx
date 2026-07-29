import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { FieldLabel } from '@/components/ui/FieldLabel.tsx';
import { ConfigTabSection } from './components/ConfigTabSection.tsx';
import { useConfigurationStore, useValidationStore } from '@/store/useConfigurationStore.ts';
import { compileZodErrors } from './utils/validationUtils.ts';
import { dicFormSchema } from './profileSchemas/dicSchema.ts';
import { useFormAutoSave } from './hooks/useFormAutoSave.ts';
import { tooltips } from '@/config/tooltips.ts';

export const TabDIC = () => {
    const { draft, updateDraft, lastLoadedPath } = useConfigurationStore();
    const loadedPathRef = useRef<string>("");

    const {
        register,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm<any>({
        resolver: zodResolver(dicFormSchema),
        mode: "onChange",
        defaultValues: {
            dicEnabled: draft.dicEnabled ?? false,
            dicX: draft.dicX ?? null,
            dicZ: draft.dicZ ?? null,
            dicAngle: draft.dicAngle ?? null,
            dicExposureTime: draft.dicExposureTime ?? null,
            dicStepSize: draft.dicStepSize ?? null,
        }
    });

    useEffect(() => {
        if (lastLoadedPath && lastLoadedPath !== loadedPathRef.current) {
            loadedPathRef.current = lastLoadedPath;
            reset({
                dicEnabled: draft.dicEnabled ?? false,
                dicX: draft.dicX ?? null,
                dicZ: draft.dicZ ?? null,
                dicAngle: draft.dicAngle ?? null,
                dicExposureTime: draft.dicExposureTime ?? null,
                dicStepSize: draft.dicStepSize ?? null,
            });
        }
    }, [lastLoadedPath, reset, draft]);

    const watchedValues = watch();
    const dicEnabled = watchedValues.dicEnabled;

    useFormAutoSave({
        watchedValues,
        storeDraft: draft,
        updateDraft,
        mapValues: (watched: any) => ({
            dicEnabled: !!watched.dicEnabled,
            dicX: watched.dicX ?? null,
            dicZ: watched.dicZ ?? null,
            dicAngle: watched.dicAngle ?? null,
            dicExposureTime: watched.dicExposureTime ?? null,
            dicStepSize: watched.dicStepSize ?? null,
        })
    });

    const { setErrors } = useValidationStore();
    useEffect(() => {
        const result = dicFormSchema.safeParse(watchedValues);
        if (!result.success) {
            const errorMessages = compileZodErrors(result.error);
            const existingErrors = useValidationStore.getState().errors['dic'] || [];
            const hasChanged =
                existingErrors.length !== errorMessages.length ||
                errorMessages.some((msg: string, idx: number) => msg !== existingErrors[idx]);

            if (hasChanged) {
                setErrors('dic', errorMessages);
            }
        } else {
            const existingErrors = useValidationStore.getState().errors['dic'] || [];
            if (existingErrors.length > 0) {
                setErrors('dic', []);
            }
        }
    }, [watchedValues, setErrors]);

    const handleDisableDic = () => {
        setValue('dicEnabled', false);
        setValue('dicX', null);
        setValue('dicZ', null);
        setValue('dicAngle', null);
        setValue('dicExposureTime', null);
        setValue('dicStepSize', null);
    };

    return (
        <ConfigTabSection
            title="DIC Configuration"
            description="Configure parameters for Digital Image Correlation (DIC)."
            headerAction={
                dicEnabled ? (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleDisableDic}
                        className="h-8 px-3 text-xs font-semibold rounded-lg bg-white border border-mauve-300 text-mauve-800 hover:text-destructive hover:border-destructive hover:bg-destructive/10 cursor-pointer transition-colors shadow-sm"
                    >
                        Disable DIC
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={() => setValue('dicEnabled', true)}
                        className="h-8 px-4 text-xs font-semibold rounded-lg bg-mauve-600 hover:bg-mauve-700 text-white flex items-center gap-1.5 cursor-pointer shadow-sm animate-fade-in"
                    >
                        Enable DIC
                    </Button>
                )
            }
        >
            <div className="col-span-2 w-full">
                {!dicEnabled ? (
                    <div className="flex flex-col items-center justify-center min-h-[120px] border border-mauve-200 rounded-lg p-6 text-center bg-white">
                        <p className="text-sm text-mauve-500 whitespace-pre-line">
                            {"DIC not enabled yet."}
                        </p>
                        <Button
                            type="button"
                            variant="link"
                            onClick={() => setValue('dicEnabled', true)}
                            className="mt-1 text-xs font-semibold text-mauve-650 hover:text-mauve-850 cursor-pointer text-decoration-none"
                        >
                            Click here to enable DIC.
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-5 border border-mauve-200 rounded-lg bg-white">
                        <div className="flex flex-col gap-2">
                            <FieldLabel text="X Position (mm)" tooltip={tooltips.dicXPosition} required={true} />
                            <Input
                                type="number"
                                step="any"
                                className={`h-8 bg-input/50 border-transparent focus-visible:ring-mauve-300 ${errors?.dicX ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                {...register('dicX', { valueAsNumber: true })}
                            />
                            {errors?.dicX && (
                                <p className="text-xs text-destructive">{errors.dicX.message as string}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <FieldLabel text="Z Position (mm)" tooltip={tooltips.dicZPosition} required={true} />
                            <Input
                                type="number"
                                step="any"
                                className={`h-8 bg-input/50 border-transparent focus-visible:ring-mauve-300 ${errors?.dicZ ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                {...register('dicZ', { valueAsNumber: true })}
                            />
                            {errors?.dicZ && (
                                <p className="text-xs text-destructive">{errors.dicZ.message as string}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <FieldLabel text="Angle (º)" tooltip={tooltips.dicAngle} required={true} />
                            <Input
                                type="number"
                                step="any"
                                className={`h-8 bg-input/50 border-transparent focus-visible:ring-mauve-300 ${errors?.dicAngle ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                {...register('dicAngle', { valueAsNumber: true })}
                            />
                            {errors?.dicAngle && (
                                <p className="text-xs text-destructive">{errors.dicAngle.message as string}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <FieldLabel text="Exposure time (s)" tooltip={tooltips.dicExposureTime} required={false} />
                            <Input
                                type="number"
                                step="any"
                                placeholder="optional"
                                className={`h-8 bg-input/50 border-transparent focus-visible:ring-mauve-300 ${errors?.dicExposureTime ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                {...register('dicExposureTime', { valueAsNumber: true })}
                            />
                            {errors?.dicExposureTime && (
                                <p className="text-xs text-destructive">{errors.dicExposureTime.message as string}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <FieldLabel text="Step Size (mm)" tooltip={tooltips.dicStepSize} required={false} />
                            <Input
                                type="number"
                                step="any"
                                placeholder="optional"
                                className={`h-8 bg-input/50 border-transparent focus-visible:ring-mauve-300 ${errors?.dicStepSize ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                {...register('dicStepSize', { valueAsNumber: true })}
                            />
                            {errors?.dicStepSize && (
                                <p className="text-xs text-destructive">{errors.dicStepSize.message as string}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </ConfigTabSection>
    );
};
