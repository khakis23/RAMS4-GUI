import { useMemo } from 'react';
import { Controller, FieldErrors, UseFormRegister, useFieldArray, useWatch } from 'react-hook-form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { FieldLabel } from '../../../components/ui/FieldLabel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { ProfileCardLayout } from './ProfileCardLayout';
import { tooltips } from "@/config/tooltips.ts";
import { xrayProfileSchema } from '../profileSchemas/xraySchema';
import { Plus, Trash2 } from 'lucide-react';

interface XrayProfileCardProps {
    index: number;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    control: any;
    removeProfile: (index: number) => void;
}

export const XrayProfileCard = ({
    index,
    register,
    errors,
    control,
    removeProfile
}: XrayProfileCardProps) => {
    const profileErrors = (errors.xrayProfiles as any)?.[index] as any;

    // Watch the active mode of this card to dynamically render fields
    const mode = useWatch({
        control,
        name: `xrayProfiles.${index}.mode`,
        defaultValue: 'rotation-series'
    });

    const profileName = useWatch({
        control,
        name: `xrayProfiles.${index}.name`,
        defaultValue: ''
    });

    // Stills points manager
    const {
        fields: pointFields,
        append: appendPoint,
        remove: removePoint
    } = useFieldArray({
        control,
        name: `xrayProfiles.${index}.stillPoints`
    });

    // Mapscan axes manager
    const {
        fields: mapscanFields,
        append: appendMapscanAxis,
        remove: removeMapscanAxis
    } = useFieldArray({
        control,
        name: `xrayProfiles.${index}.mapscanAxes`
    });

    // Rotation series layer ranges manager
    const {
        fields: layerFields,
        append: appendLayerRange,
        remove: removeLayerRange
    } = useFieldArray({
        control,
        name: `xrayProfiles.${index}.layerRanges`
    });

    const profileValues = useWatch({
        control,
        name: `xrayProfiles.${index}`
    });

    const isComplete = useMemo(() => {
        if (!profileValues) return false;
        return xrayProfileSchema.safeParse(profileValues).success;
    }, [profileValues]);

    return (
        <ProfileCardLayout
            index={index}
            name={profileName}
            isComplete={isComplete}
            onRemove={() => removeProfile(index)}
            modeSelector={
                <Controller
                    control={control}
                    name={`xrayProfiles.${index}.mode`}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-7 text-xs font-semibold rounded-lg border-mauve-200 focus:ring-mauve-300 bg-white shadow-sm">
                                <SelectValue placeholder="Select scan mode" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="rotation-series" className="text-xs cursor-pointer">Rotation Series</SelectItem>
                                <SelectItem value="stills" className="text-xs cursor-pointer">Stills</SelectItem>
                                <SelectItem value="mapscan" className="text-xs cursor-pointer">Mapscan</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-5 px-5">
                <div className="flex flex-col gap-2">
                    <FieldLabel text="Profile Name" tooltip={tooltips.xrayProfileName} required={true} />
                    <Input 
                        placeholder="e.g. Elastic Array"
                        className={`h-8 bg-input/50 border-transparent focus-visible:ring-mauve-300 ${profileErrors?.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        {...register(`xrayProfiles.${index}.name`)}
                    />
                    {profileErrors?.name && (
                        <p className="text-xs text-destructive">{profileErrors.name.message}</p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <FieldLabel text="Exposure Time (s)" tooltip={tooltips.xrayProfileCtime} required={true} />
                    <Input 
                        type="number" 
                        step="any"
                        className={`h-8 bg-input/50 border-transparent focus-visible:ring-mauve-300 ${profileErrors?.ctime ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        {...register(`xrayProfiles.${index}.ctime`, { valueAsNumber: true })}
                    />
                    {profileErrors?.ctime && <p className="text-xs text-destructive">{profileErrors.ctime.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                    <FieldLabel text="Attenuation (mm)" tooltip={tooltips.xrayProfileAtten} required={true} />
                    <Input 
                        type="number" 
                        step="any"
                        className={`h-8 bg-input/50 border-transparent focus-visible:ring-mauve-300 ${profileErrors?.atten ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        {...register(`xrayProfiles.${index}.atten`, { valueAsNumber: true })}
                    />
                    {profileErrors?.atten && <p className="text-xs text-destructive">{profileErrors.atten.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                    <FieldLabel text="Beam Height (mm)" tooltip={tooltips.xrayProfileBeamHeight} required={true} />
                    <Input 
                        type="number" 
                        step="any"
                        className={`h-8 bg-input/50 border-transparent focus-visible:ring-mauve-300 ${profileErrors?.beamHeight ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        {...register(`xrayProfiles.${index}.beamHeight`, { valueAsNumber: true })}
                    />
                    {profileErrors?.beamHeight && <p className="text-xs text-destructive">{profileErrors.beamHeight.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                    <FieldLabel text="Beam Width (mm)" tooltip={tooltips.xrayProfileBeamWidth} required={true} />
                    <Input 
                        type="number" 
                        step="any"
                        className={`h-8 bg-input/50 border-transparent focus-visible:ring-mauve-300 ${profileErrors?.beamWidth ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        {...register(`xrayProfiles.${index}.beamWidth`, { valueAsNumber: true })}
                    />
                    {profileErrors?.beamWidth && <p className="text-xs text-destructive">{profileErrors.beamWidth.message}</p>}
                </div>
            </div>

            <hr className="border-mauve-150 my-5 mx-5" />

            <div className="flex flex-col">
                {/* 1. STILLS PROFILE */}
                {mode === 'stills' && (
                    <div className="flex flex-col">
                        <div className="flex justify-end items-center px-5 mb-3">
                            <Button 
                                type="button" 
                                variant="secondary" 
                                className="h-8 text-xs border border-mauve-200 hover:bg-mauve-50 text-mauve-700 bg-white cursor-pointer"
                                onClick={() => appendPoint({ ramsx: null, ramsz: null, ome: null, numPoints: null })}
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add Point
                            </Button>
                        </div>
                        {pointFields.length === 0 ? (
                            <div className="px-5 pb-5">
                                <p className="text-xs text-mauve-500 italic text-center py-4 bg-mauve-100/20 border border-mauve-150 rounded-xl">
                                    No exposure coordinates defined yet. Click &apos;Add Point&apos; above.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col bg-xray-shading pb-5">
                                {pointFields.map((field, ptIdx) => {
                                    const pointErrors = profileErrors?.stillPoints?.[ptIdx] as any;
                                    return (
                                        <div key={field.id} className="flex items-end gap-3 py-3 px-5 border-b border-mauve-150/40 last:border-b-0">
                                            <div className="flex-1 grid grid-cols-4 gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <FieldLabel text="Reference X (mm)" tooltip={tooltips.xrayProfileStillPointX} />
                                                    <Input 
                                                        type="number" 
                                                        step="any"
                                                        className={`h-8 bg-white border-mauve-250 ${pointErrors?.ramsx ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                        {...register(`xrayProfiles.${index}.stillPoints.${ptIdx}.ramsx`, { valueAsNumber: true })}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <FieldLabel text="Reference Z (mm)" tooltip={tooltips.xrayProfileStillPointZ} />
                                                    <Input 
                                                        type="number" 
                                                        step="any"
                                                        className={`h-8 bg-white border-mauve-250 ${pointErrors?.ramsz ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                        {...register(`xrayProfiles.${index}.stillPoints.${ptIdx}.ramsz`, { valueAsNumber: true })}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <FieldLabel text="Reference Angle (º)" tooltip={tooltips.xrayProfileStillPointOme} />
                                                    <Input 
                                                        type="number" 
                                                        step="any"
                                                        className={`h-8 bg-white border-mauve-250 ${pointErrors?.ome ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                        {...register(`xrayProfiles.${index}.stillPoints.${ptIdx}.ome`, { valueAsNumber: true })}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <FieldLabel text="Images" tooltip={tooltips.xrayProfileStillPointCount} />
                                                    <Input 
                                                        type="number" 
                                                        className={`h-8 bg-white border-mauve-250 ${pointErrors?.numPoints ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                        {...register(`xrayProfiles.${index}.stillPoints.${ptIdx}.numPoints`, { valueAsNumber: true })}
                                                    />
                                                </div>
                                            </div>
                                            <Button 
                                                type="button" 
                                                variant="secondary" 
                                                className="h-8 w-8 p-0 text-red-650 hover:text-destructive hover:bg-destructive/10 dark:hover:text-red-400 dark:hover:bg-red-500/20 rounded-lg shrink-0 bg-white border border-mauve-200 cursor-pointer"
                                                onClick={() => removePoint(ptIdx)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* 2. MAPSCAN PROFILE */}
                {mode === 'mapscan' && (
                    <div className="flex flex-col">
                        {/* Reference Section */}
                        <div className="px-5 mb-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Reference X (mm)" tooltip={tooltips.xrayProfileX} required={true} />
                                    <Input 
                                        type="number" 
                                        step="any"
                                        className={`h-8 bg-input/50 border-transparent focus-visible:ring-mauve-300 ${profileErrors?.ramsx ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.ramsx`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.ramsx && <p className="text-xs text-destructive">{profileErrors.ramsx.message}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Reference Z (mm)" tooltip={tooltips.xrayProfileZ} required={true} />
                                    <Input 
                                        type="number" 
                                        step="any"
                                        className={`h-8 bg-input/50 border-transparent focus-visible:ring-mauve-300 ${profileErrors?.ramsz ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.ramsz`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.ramsz && <p className="text-xs text-destructive">{profileErrors.ramsz.message}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Reference Angle (º)" tooltip={tooltips.xrayProfileOme} required={true} />
                                    <Input 
                                        type="number" 
                                        step="any"
                                        className={`h-8 bg-input/50 border-transparent focus-visible:ring-mauve-300 ${profileErrors?.ome ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.ome`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.ome && <p className="text-xs text-destructive">{profileErrors.ome.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Add Axis Button Header */}
                        <div className="flex justify-end items-center px-5 mb-3">
                            <Button 
                                type="button" 
                                variant="secondary" 
                                disabled={mapscanFields.length >= 2}
                                className="h-8 text-xs border border-mauve-200 hover:bg-mauve-50 text-mauve-700 bg-white disabled:opacity-50 cursor-pointer"
                                onClick={() => appendMapscanAxis({ axisName: "ramsx", start: null, stop: null, points: null })}
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add Axis
                            </Button>
                        </div>

                        {/* Axes Card List */}
                        {mapscanFields.length === 0 ? (
                            <div className="px-5 pb-5">
                                <p className="text-xs text-mauve-500 italic text-center py-4 bg-mauve-100/20 border border-mauve-150 rounded-xl">
                                    No moving axes defined yet. Click &apos;Add Axis&apos; above (maximum 2 axes).
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col bg-xray-shading pb-5">
                                {mapscanFields.map((field, axIdx) => {
                                    const axisErrors = profileErrors?.mapscanAxes?.[axIdx] as any;
                                    return (
                                        <div key={field.id} className="flex items-end gap-3 py-3 px-5 border-b border-mauve-150/40 last:border-b-0">
                                            <div className="flex-1 grid grid-cols-4 gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <FieldLabel text="Moving Axis" tooltip={tooltips.xrayProfileAxis1Name} required={true} />
                                                    <Controller
                                                        control={control}
                                                        name={`xrayProfiles.${index}.mapscanAxes.${axIdx}.axisName`}
                                                        render={({ field: selectField }) => (
                                                            <Select onValueChange={selectField.onChange} value={selectField.value}>
                                                                <SelectTrigger className="h-8 bg-white border-mauve-250">
                                                                    <SelectValue placeholder="Select axis" />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-white">
                                                                    <SelectItem value="ramsx" className="text-xs cursor-pointer">X</SelectItem>
                                                                    <SelectItem value="ramsz" className="text-xs cursor-pointer">Z</SelectItem>
                                                                    <SelectItem value="ome" className="text-xs cursor-pointer">Rotation</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <FieldLabel text="Start" tooltip={tooltips.xrayProfileAxisStart} required={true} />
                                                    <Input 
                                                        type="number" 
                                                        step="any"
                                                        className={`h-8 bg-white border-mauve-250 ${axisErrors?.start ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                        {...register(`xrayProfiles.${index}.mapscanAxes.${axIdx}.start`, { valueAsNumber: true })}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <FieldLabel text="Stop" tooltip={tooltips.xrayProfileAxisStop} required={true} />
                                                    <Input 
                                                        type="number" 
                                                        step="any"
                                                        className={`h-8 bg-white border-mauve-250 ${axisErrors?.stop ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                        {...register(`xrayProfiles.${index}.mapscanAxes.${axIdx}.stop`, { valueAsNumber: true })}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <FieldLabel text="Points" tooltip={tooltips.xrayProfileAxisImages} required={true} />
                                                    <Input 
                                                        type="number" 
                                                        className={`h-8 bg-white border-mauve-250 ${axisErrors?.points ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                        {...register(`xrayProfiles.${index}.mapscanAxes.${axIdx}.points`, { valueAsNumber: true })}
                                                    />
                                                </div>
                                            </div>
                                            <Button 
                                                type="button" 
                                                variant="secondary" 
                                                className="h-8 w-8 p-0 text-red-650 hover:text-destructive hover:bg-destructive/10 dark:hover:text-red-400 dark:hover:bg-red-500/20 rounded-lg shrink-0 bg-white border border-mauve-200 cursor-pointer"
                                                onClick={() => removeMapscanAxis(axIdx)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* 3. ROTATION SERIES PROFILE */}
                {mode === 'rotation-series' && (
                    <div className="flex flex-col">
                        {/* Reference Section (Single Field: Reference X) */}
                        <div className="px-5 mb-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Reference X (mm)" tooltip={tooltips.xrayProfileX} required={true} />
                                    <Input 
                                        type="number" 
                                        step="any"
                                        className={`h-8 bg-input/50 border-transparent focus-visible:ring-mauve-300 ${profileErrors?.ramsx ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.ramsx`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.ramsx && <p className="text-xs text-destructive">{profileErrors.ramsx.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Add Layer Range Button Header */}
                        <div className="flex justify-end items-center px-5 mb-3">
                            <Button 
                                type="button" 
                                variant="secondary" 
                                className="h-8 text-xs border border-mauve-200 hover:bg-mauve-50 text-mauve-700 bg-white cursor-pointer"
                                onClick={() => appendLayerRange({ omeStart: null, omeStop: null, numPoints: null, layerStart: null, layerEnd: null, numLayers: null })}
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add Layer Range
                            </Button>
                        </div>

                        {/* Layer Ranges Card List */}
                        {layerFields.length === 0 ? (
                            <div className="px-5 pb-5">
                                <p className="text-xs text-mauve-500 italic text-center py-4 bg-mauve-100/20 border border-mauve-150 rounded-xl">
                                    No rotation layer ranges defined yet. Click &apos;Add Layer Range&apos; above.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col bg-xray-shading pb-5">
                                {layerFields.map((field, rngIdx) => {
                                    const rangeErrors = profileErrors?.layerRanges?.[rngIdx] as any;
                                    return (
                                        <div key={field.id} className="flex items-end gap-3 py-3 px-5 border-b border-mauve-150/40 last:border-b-0">
                                            <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-3">
                                                <div className="flex flex-col gap-2">
                                                    <FieldLabel text="Initial Angle (º)" tooltip={tooltips.xrayProfileOmeStart} required={true} />
                                                    <Input 
                                                        type="number" 
                                                        step="any"
                                                        className={`h-8 bg-white border-mauve-250 ${rangeErrors?.omeStart ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                        {...register(`xrayProfiles.${index}.layerRanges.${rngIdx}.omeStart`, { valueAsNumber: true })}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <FieldLabel text="Final Angle (º)" tooltip={tooltips.xrayProfileOmeStop} required={true} />
                                                    <Input 
                                                        type="number" 
                                                        step="any"
                                                        className={`h-8 bg-white border-mauve-250 ${rangeErrors?.omeStop ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                        {...register(`xrayProfiles.${index}.layerRanges.${rngIdx}.omeStop`, { valueAsNumber: true })}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <FieldLabel text="Points" tooltip={tooltips.numPoints || "Exposure counts"} required={true} />
                                                    <Input 
                                                        type="number" 
                                                        className={`h-8 bg-white border-mauve-250 ${rangeErrors?.numPoints ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                        {...register(`xrayProfiles.${index}.layerRanges.${rngIdx}.numPoints`, { valueAsNumber: true })}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <FieldLabel text="Layer Start (mm)" tooltip={tooltips.xrayProfileLayerStart} required={true} />
                                                    <Input 
                                                        type="number" 
                                                        step="any"
                                                        className={`h-8 bg-white border-mauve-250 ${rangeErrors?.layerStart ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                        {...register(`xrayProfiles.${index}.layerRanges.${rngIdx}.layerStart`, { valueAsNumber: true })}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <FieldLabel text="Layer End (mm)" tooltip={tooltips.xrayProfileLayerEnd} required={true} />
                                                    <Input 
                                                        type="number" 
                                                        step="any"
                                                        className={`h-8 bg-white border-mauve-250 ${rangeErrors?.layerEnd ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                        {...register(`xrayProfiles.${index}.layerRanges.${rngIdx}.layerEnd`, { valueAsNumber: true })}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <FieldLabel text="Layers" tooltip={tooltips.xrayProfileNumLayers} required={true} />
                                                    <Input 
                                                        type="number" 
                                                        className={`h-8 bg-white border-mauve-250 ${rangeErrors?.numLayers ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                        {...register(`xrayProfiles.${index}.layerRanges.${rngIdx}.numLayers`, { valueAsNumber: true })}
                                                    />
                                                </div>
                                            </div>

                                            <Button 
                                                type="button" 
                                                variant="secondary" 
                                                className="h-8 w-8 p-0 text-red-650 hover:text-destructive hover:bg-destructive/10 dark:hover:text-red-400 dark:hover:bg-red-500/20 rounded-lg shrink-0 bg-white border border-mauve-200 cursor-pointer"
                                                onClick={() => removeLayerRange(rngIdx)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ProfileCardLayout>
    );
};
