import { useMemo } from 'react';
import { Controller, FieldErrors, UseFormRegister, useFieldArray, useWatch } from 'react-hook-form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { FieldLabel } from '../../../components/ui/FieldLabel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
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


    const profileValues = useWatch({
        control,
        name: `xrayProfiles.${index}`
    });

    const isComplete = useMemo(() => {
        if (!profileValues) return false;
        return xrayProfileSchema.safeParse(profileValues).success;
    }, [profileValues]);

    return (
        <div className="flex flex-col bg-mauve-100/30 rounded-md border border-mauve-250 transition-all duration-100 hover:shadow-sm">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={`item-${index}`} className="border-b-0 border-transparent">
                    <div className="flex items-center justify-between p-4 gap-3">
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="w-72 shrink-0">
                                <Controller
                                    control={control}
                                    name={`xrayProfiles.${index}.mode`}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="h-7 text-xs font-semibold rounded-lg border-mauve-200 focus:ring-mauve-300 bg-white shadow-sm">
                                                <SelectValue placeholder="Select scan mode" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                <SelectItem value="rotation-series" className="text-xs cursor-pointer">Rotation Series (Layers)</SelectItem>
                                                <SelectItem value="stills" className="text-xs cursor-pointer">Stills (Point List)</SelectItem>
                                                <SelectItem value="tseries" className="text-xs cursor-pointer">Mapscan: Time Series (tseries)</SelectItem>
                                                <SelectItem value="dscan" className="text-xs cursor-pointer">Mapscan: Line Scan (dscan)</SelectItem>
                                                <SelectItem value="mesh" className="text-xs cursor-pointer">Mapscan: Grid Scan (mesh)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>

                        <AccordionTrigger className="flex-grow py-1.5 px-4 text-xs font-bold text-mauve-850 hover:no-underline [&>svg]:text-mauve-500 shrink min-w-0">
                            <span className="flex items-center gap-2 select-none truncate">
                                <span className="truncate">{profileName || 'Unnamed Profile'}</span>
                                {!isComplete && (
                                    <span className="text-[10px] text-mauve-400 font-normal shrink-0 italic">
                                        (incomplete)
                                    </span>
                                )}
                            </span>
                        </AccordionTrigger>

                        <div className="shrink-0 flex items-center">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeProfile(index)}
                                className="h-8 w-8 text-mauve-400 dark:text-mauve-500 hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <AccordionContent className="pt-5 pb-0 bg-white border-t border-mauve-150 text-left px-0">
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
                {/* Rotation Series (Layers) */}
                {mode === 'rotation-series' && (
                    <div className="flex flex-col gap-5">
                        <div className="px-5 flex flex-col gap-2">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                        <div className="bg-xray-shading py-5 px-5 flex flex-col gap-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Initial Angle (º)" tooltip={tooltips.xrayProfileOmeStart} required={true} />
                                    <Input 
                                        type="number" 
                                        step="any"
                                        className={`h-8 bg-white border-mauve-250 ${profileErrors?.omeStart ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.omeStart`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.omeStart && <p className="text-xs text-destructive">{profileErrors.omeStart.message}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Final Angle (º)" tooltip={tooltips.xrayProfileOmeStop} required={true} />
                                    <Input 
                                        type="number" 
                                        step="any"
                                        className={`h-8 bg-white border-mauve-250 ${profileErrors?.omeStop ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.omeStop`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.omeStop && <p className="text-xs text-destructive">{profileErrors.omeStop.message}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Number of Images" tooltip={tooltips.numPoints || "Exposure counts"} required={true} />
                                    <Input 
                                        type="number" 
                                        className={`h-8 bg-white border-mauve-250 ${profileErrors?.numPoints ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.numPoints`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.numPoints && <p className="text-xs text-destructive">{profileErrors.numPoints.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-mauve-250/30 pt-4">
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Layer Start Z (mm)" tooltip={tooltips.xrayProfileLayerStart} required={true} />
                                    <Input 
                                        type="number" 
                                        step="any"
                                        className={`h-8 bg-white border-mauve-250 ${profileErrors?.layerStart ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.layerStart`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.layerStart && <p className="text-xs text-destructive">{profileErrors.layerStart.message}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Layer End Z (mm)" tooltip={tooltips.xrayProfileLayerEnd} required={true} />
                                    <Input 
                                        type="number" 
                                        step="any"
                                        className={`h-8 bg-white border-mauve-250 ${profileErrors?.layerEnd ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.layerEnd`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.layerEnd && <p className="text-xs text-destructive">{profileErrors.layerEnd.message}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Number of Layers" tooltip={tooltips.xrayProfileNumLayers} required={true} />
                                    <Input 
                                        type="number" 
                                        className={`h-8 bg-white border-mauve-250 ${profileErrors?.numLayers ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.numLayers`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.numLayers && <p className="text-xs text-destructive">{profileErrors.numLayers.message}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stills (Point List) */}
                {mode === 'stills' && (
                    <div className="flex flex-col">
                        <div className="flex justify-end items-center px-5 mb-3">
                            <Button 
                                type="button" 
                                variant="secondary" 
                                className="h-8 text-xs border border-mauve-200 hover:bg-mauve-50 text-mauve-700 bg-white"
                                onClick={() => appendPoint({ ramsx: 0, ramsz: 0, ome: 0, numPoints: 1 })}
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add Point
                            </Button>
                        </div>
                        {pointFields.length === 0 ? (
                            <div className="pb-5">
                                <p className="text-xs text-mauve-500 italic text-center py-4 bg-mauve-100/20 border border-mauve-150 mx-5 rounded-xl">
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
                                                    <FieldLabel text="Number of Images" tooltip={tooltips.xrayProfileStillPointCount} />
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
                                                className="h-8 w-8 p-0 text-red-650 hover:bg-red-50 hover:text-red-800 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300 rounded-lg shrink-0 bg-white border border-mauve-200"
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

                {/* Mapscan: Time Series (tseries) */}
                {mode === 'tseries' && (
                    <div className="bg-xray-shading py-5 px-5">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Reference X (mm)" tooltip={tooltips.xrayProfileX} required={true} />
                                <Input 
                                    type="number" 
                                    step="any"
                                    className={`h-8 bg-white border-mauve-250 ${profileErrors?.ramsx ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                    {...register(`xrayProfiles.${index}.ramsx`, { valueAsNumber: true })}
                                />
                                {profileErrors?.ramsx && <p className="text-xs text-destructive">{profileErrors.ramsx.message}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Reference Z (mm)" tooltip={tooltips.xrayProfileZ} required={true} />
                                <Input 
                                    type="number" 
                                    step="any"
                                    className={`h-8 bg-white border-mauve-250 ${profileErrors?.ramsz ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                    {...register(`xrayProfiles.${index}.ramsz`, { valueAsNumber: true })}
                                />
                                {profileErrors?.ramsz && <p className="text-xs text-destructive">{profileErrors.ramsz.message}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Reference Angle (º)" tooltip={tooltips.xrayProfileOme} required={true} />
                                <Input 
                                    type="number" 
                                    step="any"
                                    className={`h-8 bg-white border-mauve-250 ${profileErrors?.ome ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                    {...register(`xrayProfiles.${index}.ome`, { valueAsNumber: true })}
                                />
                                {profileErrors?.ome && <p className="text-xs text-destructive">{profileErrors.ome.message}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Number of Images" tooltip={tooltips.numPoints} required={true} />
                                <Input 
                                    type="number" 
                                    className={`h-8 bg-white border-mauve-250 ${profileErrors?.numPoints ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                    {...register(`xrayProfiles.${index}.numPoints`, { valueAsNumber: true })}
                                />
                                {profileErrors?.numPoints && <p className="text-xs text-destructive">{profileErrors.numPoints.message}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Mapscan: Line Scan (dscan) */}
                {mode === 'dscan' && (
                    <div className="flex flex-col gap-5">
                        {/* Reference Coords */}
                        <div className="px-5 flex flex-col gap-2">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Number of Images" tooltip={tooltips.numPoints} required={true} />
                                    <Input 
                                        type="number" 
                                        className={`h-8 bg-input/50 border-transparent focus-visible:ring-mauve-300 ${profileErrors?.numPoints ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.numPoints`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.numPoints && <p className="text-xs text-destructive">{profileErrors.numPoints.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Moving Axis control */}
                        <div className="bg-xray-shading py-5 px-5">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Moving Axis" tooltip={tooltips.xrayProfileAxis1Name} required={true} />
                                    <Controller
                                        control={control}
                                        name={`xrayProfiles.${index}.axis1Name`}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="h-8 bg-white border-mauve-200">
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
                                    {profileErrors?.axis1Name && <p className="text-xs text-destructive">{profileErrors.axis1Name.message}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Start" tooltip={tooltips.xrayProfileAxisStart} required={true} />
                                    <Input 
                                        type="number" 
                                        step="any"
                                        className={`h-8 bg-white border-mauve-250 ${profileErrors?.axis1Start ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.axis1Start`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.axis1Start && <p className="text-xs text-destructive">{profileErrors.axis1Start.message}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Stop" tooltip={tooltips.xrayProfileAxisStop} required={true} />
                                    <Input 
                                        type="number" 
                                        step="any"
                                        className={`h-8 bg-white border-mauve-250 ${profileErrors?.axis1Stop ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.axis1Stop`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.axis1Stop && <p className="text-xs text-destructive">{profileErrors.axis1Stop.message}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Number of Images" tooltip={tooltips.xrayProfileAxisImages} required={true} />
                                    <Input 
                                        type="number" 
                                        className={`h-8 bg-white border-mauve-250 ${profileErrors?.axis1Images ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.axis1Images`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.axis1Images && <p className="text-xs text-destructive">{profileErrors.axis1Images.message}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mapscan: Grid Scan (mesh) */}
                {mode === 'mesh' && (
                    <div className="flex flex-col gap-5">
                        {/* Reference Coords */}
                        <div className="px-5 flex flex-col gap-2">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Number of Images" tooltip={tooltips.numPoints} required={true} />
                                    <Input 
                                        type="number" 
                                        className={`h-8 bg-input/50 border-transparent focus-visible:ring-mauve-300 ${profileErrors?.numPoints ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.numPoints`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.numPoints && <p className="text-xs text-destructive">{profileErrors.numPoints.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Contiguous Shaded region for Axis Sweeps */}
                        <div className="bg-xray-shading py-5 px-5 flex flex-col gap-5">
                            {/* Axis 1 Sweep */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Moving Axis" tooltip={tooltips.xrayProfileAxis1Name} required={true} />
                                    <Controller
                                        control={control}
                                        name={`xrayProfiles.${index}.axis1Name`}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="h-8 bg-white border-mauve-200">
                                                    <SelectValue placeholder="Select Axis 1" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white">
                                                    <SelectItem value="ramsx" className="text-xs cursor-pointer">X</SelectItem>
                                                    <SelectItem value="ramsz" className="text-xs cursor-pointer">Z</SelectItem>
                                                    <SelectItem value="ome" className="text-xs cursor-pointer">Rotation</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {profileErrors?.axis1Name && <p className="text-xs text-destructive">{profileErrors.axis1Name.message}</p>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Start" tooltip={tooltips.xrayProfileAxisStart} required={true} />
                                    <Input 
                                        type="number" 
                                        step="any"
                                        className={`h-8 bg-white border-mauve-250 ${profileErrors?.axis1Start ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.axis1Start`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.axis1Start && <p className="text-xs text-destructive">{profileErrors.axis1Start.message}</p>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Stop" tooltip={tooltips.xrayProfileAxisStop} required={true} />
                                    <Input 
                                        type="number" 
                                        step="any"
                                        className={`h-8 bg-white border-mauve-250 ${profileErrors?.axis1Stop ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.axis1Stop`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.axis1Stop && <p className="text-xs text-destructive">{profileErrors.axis1Stop.message}</p>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Images" tooltip={tooltips.xrayProfileAxisImages} required={true} />
                                    <Input 
                                        type="number" 
                                        className={`h-8 bg-white border-mauve-250 ${profileErrors?.axis1Images ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.axis1Images`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.axis1Images && <p className="text-xs text-destructive">{profileErrors.axis1Images.message}</p>}
                                </div>
                            </div>

                            {/* Axis 2 Sweep */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-mauve-250/30 pt-4">
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Moving Axis" tooltip={tooltips.xrayProfileAxis2Name} required={true} />
                                    <Controller
                                        control={control}
                                        name={`xrayProfiles.${index}.axis2Name`}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="h-8 bg-white border-mauve-200">
                                                    <SelectValue placeholder="Select Axis 2" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white">
                                                    <SelectItem value="ramsx" className="text-xs cursor-pointer">X</SelectItem>
                                                    <SelectItem value="ramsz" className="text-xs cursor-pointer">Z</SelectItem>
                                                    <SelectItem value="ome" className="text-xs cursor-pointer">Rotation</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {profileErrors?.axis2Name && <p className="text-xs text-destructive">{profileErrors.axis2Name.message}</p>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Start" tooltip={tooltips.xrayProfileAxisStart} required={true} />
                                    <Input 
                                        type="number" 
                                        step="any"
                                        className={`h-8 bg-white border-mauve-250 ${profileErrors?.axis2Start ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.axis2Start`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.axis2Start && <p className="text-xs text-destructive">{profileErrors.axis2Start.message}</p>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Stop" tooltip={tooltips.xrayProfileAxisStop} required={true} />
                                    <Input 
                                        type="number" 
                                        step="any"
                                        className={`h-8 bg-white border-mauve-250 ${profileErrors?.axis2Stop ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.axis2Stop`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.axis2Stop && <p className="text-xs text-destructive">{profileErrors.axis2Stop.message}</p>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Images" tooltip={tooltips.xrayProfileAxisImages} required={true} />
                                    <Input 
                                        type="number" 
                                        className={`h-8 bg-white border-mauve-250 ${profileErrors?.axis2Images ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        {...register(`xrayProfiles.${index}.axis2Images`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.axis2Images && <p className="text-xs text-destructive">{profileErrors.axis2Images.message}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};
