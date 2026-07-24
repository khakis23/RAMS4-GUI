import { useEffect, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "../../components/ui/button.tsx";
import { Input } from "../../components/ui/input.tsx";
import { Switch } from "../../components/ui/switch.tsx";
import { ConfigTabSection } from "./components/ConfigTabSection.tsx";
import { FieldLabel } from "../../components/ui/FieldLabel.tsx";
import { useConfigurationStore, useValidationStore } from "@/store/useConfigurationStore.ts";
import { compileZodErrors } from "./utils/validationUtils.ts";
import { settingsSchema } from "./profileSchemas/settingsSchema.ts";
import { SettingsAxisCard } from "./components/SettingsAxisCard.tsx";
import { SettingsSignalCard } from "./components/SettingsSignalCard.tsx";
import { useFormAutoSave } from "./hooks/useFormAutoSave.ts";
import { tooltips } from "@/config/tooltips.ts";
import { Plus, X } from 'lucide-react';

export const TabSettings = () => {
    const { draft, updateDraft, lastLoadedPath, settingsFallbackActive, setSettingsFallbackActive } = useConfigurationStore();
    const loadedPathRef = useRef<string>("");

    const {
        register,
        control,
        watch,
        reset,
        formState: { errors }
    } = useForm<z.infer<typeof settingsSchema>>({
        resolver: zodResolver(settingsSchema),
        mode: "onChange",
        defaultValues: {
            specHost: draft.specHost || "id1a3.classe.cornell.edu:spec",
            requireSpecEnable: draft.requireSpecEnable ?? true,
            systemName: draft.systemName || "RAMS4_CHESS",
            controllerHost: draft.controllerHost || "10.0.0.1",
            axisCount: draft.axisCount ?? 5,
            taskCount: draft.taskCount ?? 5,
            axesSettings: (draft.axesSettings || []).map(a => ({
                name: a.name,
                max_velocity: a.max_velocity,
                max_acceleration: a.max_acceleration
            })),
            signalSettings: (draft.signalSettings || []).map(s => ({
                name: s.name,
                slope: s.slope,
                intercept: s.intercept,
                channel: s.channel
            }))
        }
    });

    const {
        fields: axesFields,
        append: appendAxis,
        remove: removeAxis
    } = useFieldArray({
        control,
        name: "axesSettings"
    });

    const {
        fields: signalsFields,
        append: appendSignal,
        remove: removeSignal
    } = useFieldArray({
        control,
        name: "signalSettings"
    });

    const watchedValues = watch();

    // Sync form updates into store draft state on every change
    useFormAutoSave({
        watchedValues,
        storeDraft: draft,
        updateDraft,
        mapValues: (watched: any) => ({
            specHost: watched.specHost,
            requireSpecEnable: watched.requireSpecEnable,
            systemName: watched.systemName,
            controllerHost: watched.controllerHost,
            axisCount: watched.axisCount,
            taskCount: watched.taskCount,
            axesSettings: watched.axesSettings || [],
            signalSettings: watched.signalSettings || []
        })
    });

    // Connect validation errors to central validation store under 'settings' key
    const { setErrors } = useValidationStore();
    useEffect(() => {
        const result = settingsSchema.safeParse(watchedValues);
        if (!result.success) {
            const errorMessages = compileZodErrors(result.error);
            const existingErrors = useValidationStore.getState().errors['settings'] || [];
            const hasChanged = 
                existingErrors.length !== errorMessages.length ||
                errorMessages.some((msg: string, idx: number) => msg !== existingErrors[idx]);
            
            if (hasChanged) {
                setErrors('settings', errorMessages);
            }
        } else {
            const existingErrors = useValidationStore.getState().errors['settings'] || [];
            if (existingErrors.length > 0) {
                setErrors('settings', []);
            }
        }
    }, [watchedValues, setErrors]);

    // Reset defaults or synchronize when a new configuration folder is loaded
    useEffect(() => {
        if (lastLoadedPath && lastLoadedPath !== loadedPathRef.current) {
            loadedPathRef.current = lastLoadedPath;
            reset({
                specHost: draft.specHost || "id1a3.classe.cornell.edu:spec",
                requireSpecEnable: draft.requireSpecEnable ?? true,
                systemName: draft.systemName || "RAMS4_CHESS",
                controllerHost: draft.controllerHost || "10.0.0.1",
                axisCount: draft.axisCount ?? 5,
                taskCount: draft.taskCount ?? 5,
                axesSettings: (draft.axesSettings || []).map(a => ({
                    name: a.name,
                    max_velocity: a.max_velocity,
                    max_acceleration: a.max_acceleration
                })),
                signalSettings: (draft.signalSettings || []).map(s => ({
                    name: s.name,
                    slope: s.slope,
                    intercept: s.intercept,
                    channel: s.channel
                }))
            });
        }
    }, [lastLoadedPath, reset, draft]);

    return (
        <div className="flex flex-col gap-6 w-full text-left">
            {settingsFallbackActive && (
                <div className="mt-10 flex px-4 items-center justify-between p-2 bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700/60 rounded-md text-amber-900 dark:text-amber-200 text-xs font-semibold shrink-0 shadow-sm">
                    <div>
                        Warning: Expected settings version {settingsFallbackActive.expected} was missing. Loaded version {settingsFallbackActive.loaded} instead.
                    </div>
                    <button
                        type="button"
                        onClick={() => setSettingsFallbackActive(null)}
                        className="p-1 rounded-full hover:bg-amber-200/50 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 transition-colors cursor-pointer"
                        aria-label="Dismiss warning"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <ConfigTabSection
            title="System Settings"
            // titleTooltip={tooltips.settingsSectionTitle}
            profilesTitle="Axes & Calibrations"
            profilesTitleTooltip="Define controller boundaries and calibration matrices."
            profiles={
                <div className="w-full space-y-8">
                    {/* Axis limits Mini Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-sm text-mauve-850">Axis Parameters</span>
                            <Button
                                type="button"
                                variant="secondary"
                                className="h-8 text-xs border border-mauve-200 hover:bg-mauve-50 text-mauve-700"
                                onClick={() => appendAxis({ name: "", max_velocity: 10, max_acceleration: 20 })}
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add Axis
                            </Button>
                        </div>
                        <div className="flex flex-col gap-3">
                            {axesFields.map((field, idx) => {
                                const takenNames = (watchedValues.axesSettings || [])
                                    .map((a: any) => a?.name)
                                    .filter((name: string, i: number) => !!name && i !== idx);
                                return (
                                    <SettingsAxisCard
                                        key={field.id}
                                        index={idx}
                                        control={control as any}
                                        register={register}
                                        errors={errors}
                                        remove={removeAxis}
                                        showRemove={axesFields.length > 1}
                                        takenNames={takenNames}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Input Calibration Signal Mini Section */}
                    <div className="flex flex-col gap-4 border-t border-mauve-150 pt-6">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-sm text-mauve-850">Input Signals</span>
                            <Button
                                type="button"
                                variant="secondary"
                                className="h-8 text-xs border border-mauve-200 hover:bg-mauve-50 text-mauve-700"
                                onClick={() => appendSignal({ name: "", slope: 1.0, intercept: 0.0, channel: 0 })}
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add Signal
                            </Button>
                        </div>
                        <div className="flex flex-col gap-3">
                            {signalsFields.map((field, idx) => {
                                const takenSignalNames = (watchedValues.signalSettings || [])
                                    .map((s: any) => s?.name)
                                    .filter((name: string, i: number) => !!name && i !== idx);
                                return (
                                    <SettingsSignalCard 
                                        key={field.id}
                                        index={idx}
                                        control={control as any}
                                        register={register}
                                        errors={errors}
                                        remove={removeSignal}
                                        showRemove={signalsFields.length > 1}
                                        takenNames={takenSignalNames}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            }
        >
            {/* SPEC configurations card */}
            <div className="flex flex-col gap-6 w-full">
                <div className="flex flex-col gap-2">
                    <FieldLabel text="Setting Version" tooltip={tooltips.settingsVersion} />
                    <Input 
                        value={draft.settingsVersion ?? 0}
                        readOnly
                        className="bg-mauve-50/80 dark:bg-zinc-800 text-slate-900 dark:text-slate-100 font-medium font-mono border-mauve-200 dark:border-mauve-900 cursor-default select-none focus-visible:ring-0 focus-visible:border-0 dark:focus-visible:border-mauve-800"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <FieldLabel text="Spec Host" tooltip={tooltips.settingsSpecHost} required={true} />
                    <Input 
                        placeholder="e.g. host:spec"
                        className={errors.specHost ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register('specHost')}
                    />
                    {errors.specHost && (
                        <p className="text-xs text-destructive">{errors.specHost.message}</p>
                    )}
                </div>

                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-mauve-150 bg-mauve-50/10 h-9 w-full mt-2">
                    <FieldLabel text="Require SPEC Connection" tooltip={tooltips.settingsRequireSpecEnable} />
                    <Controller
                        control={control}
                        name="requireSpecEnable"
                        render={({ field }) => (
                            <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                        )}
                    />
                </div>
            </div>

            {/* Aerotech Controller parameters card */}
            <div className="flex flex-col gap-6 w-full">
                <div className="flex flex-col gap-2">
                    <FieldLabel text="System Name" tooltip={tooltips.settingsSystemName} required={true} />
                    <Input 
                        placeholder="e.g. RAMS4_CHESS"
                        className={errors.systemName ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register('systemName')}
                    />
                    {errors.systemName && (
                        <p className="text-xs text-destructive">{errors.systemName.message}</p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <FieldLabel text="Aerotech Hostname / IP" tooltip={tooltips.settingsHostname} required={true} />
                    <Input 
                        placeholder="e.g. 10.0.0.1"
                        className={errors.controllerHost ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register('controllerHost')}
                    />
                    {errors.controllerHost && (
                        <p className="text-xs text-destructive">{errors.controllerHost.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <FieldLabel text="Axis Count" tooltip={tooltips.settingsAxisCount} required={true} />
                        <Input 
                            type="number" 
                            placeholder="e.g. 5"
                            className={errors.axisCount ? "border-destructive focus-visible:ring-destructive" : ""}
                            {...register('axisCount', { valueAsNumber: true })}
                        />
                        {errors.axisCount && (
                            <p className="text-xs text-destructive">{errors.axisCount.message}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <FieldLabel text="Task Count" tooltip={tooltips.settingsTaskCount} required={true} />
                        <Input 
                            type="number" 
                            placeholder="e.g. 5"
                            className={errors.taskCount ? "border-destructive focus-visible:ring-destructive" : ""}
                            {...register('taskCount', { valueAsNumber: true })}
                        />
                        {errors.taskCount && (
                            <p className="text-xs text-destructive">{errors.taskCount.message}</p>
                        )}
                    </div>
                </div>
            </div>
        </ConfigTabSection>
        </div>
    );
};
