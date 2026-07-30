import { useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button.tsx';
import { ConfigTabSection } from './components/ConfigTabSection.tsx';
import { useConfigurationStore, useValidationStore } from '@/store/useConfigurationStore.ts';
import { compileZodErrors } from './utils/validationUtils.ts';
import { dicFormSchema } from './profileSchemas/dicSchema.ts';
import { DicProfileCard } from './components/DicProfileCard.tsx';
import { useFormAutoSave } from './hooks/useFormAutoSave.ts';
import { Plus } from 'lucide-react';

export const TabDIC = () => {
    const { draft, updateDraft, lastLoadedPath } = useConfigurationStore();
    const loadedPathRef = useRef<string>("");

    const {
        register,
        control,
        watch,
        reset,
        formState: { errors }
    } = useForm<any>({
        resolver: zodResolver(dicFormSchema),
        mode: "onChange",
        defaultValues: {
            dicProfiles: (draft.dicProfiles || []).map(p => ({
                id: p.id,
                name: p.name,
                mode: 'stills' as const,
                ctime: p.ctime ?? null,
                stillPoints: p.stillPoints || []
            })),
        }
    });

    useEffect(() => {
        if (lastLoadedPath && lastLoadedPath !== loadedPathRef.current) {
            loadedPathRef.current = lastLoadedPath;
            reset({
                dicProfiles: (draft.dicProfiles || []).map(p => ({
                    id: p.id,
                    name: p.name,
                    mode: 'stills' as const,
                    ctime: p.ctime ?? null,
                    stillPoints: p.stillPoints || []
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
        name: "dicProfiles",
    });

    const watchedValues = watch();
    const profilesEndRef = useRef<HTMLDivElement>(null);

    const handleAddProfile = () => {
        append({
            id: `dicProfile${Date.now()}`,
            name: "",
            mode: "stills",
            ctime: null,
            stillPoints: []
        });
        setTimeout(() => {
            profilesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
    };

    useFormAutoSave({
        watchedValues,
        storeDraft: draft,
        updateDraft,
        mapValues: (watched: any) => ({
            dicProfiles: watched.dicProfiles || []
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

    return (
        <ConfigTabSection
            profilesTitle="DIC Profiles"
            profilesDescription="Configure parameters for Digital Image Correlation (DIC) still scans."
            profilesAction={
                <Button 
                    type="button" 
                    onClick={handleAddProfile}
                    className="h-8 px-4 text-xs font-semibold rounded-lg bg-mauve-600 hover:bg-mauve-700 text-white flex items-center gap-1.5 cursor-pointer shadow-sm animate-fade-in"
                >
                    <Plus className="h-3.5 w-3.5" /> Add DIC Profile
                </Button>
            }
            profiles={
                <div className="w-full space-y-6 pb-12">
                    {fields.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[120px] border border-mauve-200 rounded-lg p-6 text-center bg-white">
                            <p className="text-sm text-mauve-500 whitespace-pre-line">
                                No DIC profiles added yet.
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
                            <DicProfileCard
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

