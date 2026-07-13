import { Controller, FieldErrors, UseFormRegister, useFieldArray, useWatch } from 'react-hook-form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { FieldLabel } from '../../../components/ui/FieldLabel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { tooltips } from "@/config/tooltips.ts";
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

    // Stills points manager
    const {
        fields: pointFields,
        append: appendPoint,
        remove: removePoint
    } = useFieldArray({
        control,
        name: `xrayProfiles.${index}.stillPoints`
    });

    // Watch mesh axis steps for live Grid Size preview
    const axis1Images = useWatch({ control, name: `xrayProfiles.${index}.axis1Images` }) || 0;
    const axis2Images = useWatch({ control, name: `xrayProfiles.${index}.axis2Images` }) || 0;

    return (
        <div className="border rounded-2xl p-6 bg-mauve-50/50 flex flex-col gap-6 text-left shadow-sm">
            {/* Header Section */}
            <div className="flex justify-between items-center border-b border-mauve-200 pb-3">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-mauve-850">X-ray Scan Profile #{index + 1}</span>
                </div>
                <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => removeProfile(index)}
                >
                    Remove Profile
                </Button>
            </div>

            {/* Profile Name & Mode Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <FieldLabel text="Profile Name" tooltip={tooltips.xrayProfileName} required={true} />
                    <Input 
                        placeholder="e.g. Elastic Array"
                        className={profileErrors?.name ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`xrayProfiles.${index}.name`)}
                    />
                    {profileErrors?.name && (
                        <p className="text-xs text-destructive">{profileErrors.name.message}</p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <FieldLabel text="Scan Mode" tooltip={tooltips.xrayProfileMode || "Method of X-ray exposure"} required={true} />
                    <Controller
                        control={control}
                        name={`xrayProfiles.${index}.mode`}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select scan mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rotation-series">Rotation Series (Layers)</SelectItem>
                                    <SelectItem value="stills">Stills (Point List)</SelectItem>
                                    <SelectItem value="tseries">Mapscan: Time Series (tseries)</SelectItem>
                                    <SelectItem value="dscan">Mapscan: Line Scan (dscan)</SelectItem>
                                    <SelectItem value="mesh">Mapscan: Grid Scan (mesh)</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>

            {/* Main Parameters Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2">
                    <FieldLabel text="Exposure Time (s)" tooltip={tooltips.xrayProfileCtime} required={true} />
                    <Input 
                        type="number" 
                        step="any"
                        className={profileErrors?.ctime ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`xrayProfiles.${index}.ctime`, { valueAsNumber: true })}
                    />
                    {profileErrors?.ctime && <p className="text-xs text-destructive">{profileErrors.ctime.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                    <FieldLabel text="Attenuation (mm)" tooltip={tooltips.xrayProfileAtten} required={true} />
                    <Input 
                        type="number" 
                        step="any"
                        className={profileErrors?.atten ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`xrayProfiles.${index}.atten`, { valueAsNumber: true })}
                    />
                    {profileErrors?.atten && <p className="text-xs text-destructive">{profileErrors.atten.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                    <FieldLabel text="Beam Height (mm)" tooltip={tooltips.xrayProfileBeamHeight} required={true} />
                    <Input 
                        type="number" 
                        step="any"
                        className={profileErrors?.beamHeight ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`xrayProfiles.${index}.beamHeight`, { valueAsNumber: true })}
                    />
                    {profileErrors?.beamHeight && <p className="text-xs text-destructive">{profileErrors.beamHeight.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                    <FieldLabel text="Beam Width (mm)" tooltip={tooltips.xrayProfileBeamWidth} required={true} />
                    <Input 
                        type="number" 
                        step="any"
                        className={profileErrors?.beamWidth ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`xrayProfiles.${index}.beamWidth`, { valueAsNumber: true })}
                    />
                    {profileErrors?.beamWidth && <p className="text-xs text-destructive">{profileErrors.beamWidth.message}</p>}
                </div>
            </div>

            {/* Dynamic Coordinates Layout Grid */}
            <div className="flex flex-col gap-6">
                {/* 1. Rotation Series (Layers) */}
                {mode === 'rotation-series' && (
                    <div className="flex flex-col gap-4 border-t border-mauve-200 pt-4 mt-2">
                        <span className="mt-4 mb-3 font-bold text-sm text-mauve-850">Rotation Series Configuration</span>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Reference X (mm)" tooltip={tooltips.xrayProfileX} required={true} />
                                <Input 
                                    type="number" 
                                    step="any"
                                    className={profileErrors?.ramsx ? "border-destructive focus-visible:ring-destructive" : ""}
                                    {...register(`xrayProfiles.${index}.ramsx`, { valueAsNumber: true })}
                                    />
                                {profileErrors?.ramsx && <p className="text-xs text-destructive">{profileErrors.ramsx.message}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Initial Angle (º)" tooltip={tooltips.xrayProfileOmeStart} required={true} />
                                <Input 
                                    type="number" 
                                    step="any"
                                    className={profileErrors?.omeStart ? "border-destructive focus-visible:ring-destructive" : ""}
                                    {...register(`xrayProfiles.${index}.omeStart`, { valueAsNumber: true })}
                                    />
                                {profileErrors?.omeStart && <p className="text-xs text-destructive">{profileErrors.omeStart.message}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Final Angle (º)" tooltip={tooltips.xrayProfileOmeStop} required={true} />
                                <Input 
                                    type="number" 
                                    step="any"
                                    className={profileErrors?.omeStop ? "border-destructive focus-visible:ring-destructive" : ""}
                                    {...register(`xrayProfiles.${index}.omeStop`, { valueAsNumber: true })}
                                    />
                                {profileErrors?.omeStop && <p className="text-xs text-destructive">{profileErrors.omeStop.message}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Number of Images" tooltip={tooltips.numPoints || "Exposure counts"} required={true} />
                                <Input 
                                    type="number" 
                                    className={profileErrors?.numPoints ? "border-destructive focus-visible:ring-destructive" : ""}
                                    {...register(`xrayProfiles.${index}.numPoints`, { valueAsNumber: true })}
                                    />
                                {profileErrors?.numPoints && <p className="text-xs text-destructive">{profileErrors.numPoints.message}</p>}
                            </div>
                        </div>

                        {/* Layer Configuration Card */}
                        <div className="bg-white border rounded-2xl p-4 flex flex-col gap-4 mt-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Layer Start Z (mm)" tooltip={tooltips.xrayProfileLayerStart} required={true} />
                                    <Input 
                                        type="number" 
                                        step="any"
                                        className={profileErrors?.layerStart ? "border-destructive focus-visible:ring-destructive" : ""}
                                        {...register(`xrayProfiles.${index}.layerStart`, { valueAsNumber: true })}
                                        />
                                    {profileErrors?.layerStart && <p className="text-xs text-destructive">{profileErrors.layerStart.message}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Layer End Z (mm)" tooltip={tooltips.xrayProfileLayerEnd} required={true} />
                                    <Input 
                                        type="number" 
                                        step="any"
                                        className={profileErrors?.layerEnd ? "border-destructive focus-visible:ring-destructive" : ""}
                                        {...register(`xrayProfiles.${index}.layerEnd`, { valueAsNumber: true })}
                                        />
                                    {profileErrors?.layerEnd && <p className="text-xs text-destructive">{profileErrors.layerEnd.message}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Number of Layers" tooltip={tooltips.xrayProfileNumLayers} required={true} />
                                    <Input 
                                        type="number" 
                                        className={profileErrors?.numLayers ? "border-destructive focus-visible:ring-destructive" : ""}
                                        {...register(`xrayProfiles.${index}.numLayers`, { valueAsNumber: true })}
                                        />
                                    {profileErrors?.numLayers && <p className="text-xs text-destructive">{profileErrors.numLayers.message}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Stills (Point List) */}
                {mode === 'stills' && (
                    <div className="flex flex-col gap-4 border-t border-mauve-200 pt-4 mt-2">
                        <div className="flex justify-between items-center">
                            <span className="mt-4 mb-3 font-bold text-sm text-mauve-850">Stills Configuration</span>
                            <Button 
                                type="button" 
                                variant="secondary" 
                                className="h-8 text-xs border border-mauve-200 hover:bg-mauve-50 text-mauve-700"
                                onClick={() => appendPoint({ ramsx: 0, ramsz: 0, ome: 0, numPoints: 1 })}
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add Point
                            </Button>
                        </div>
                        {pointFields.length === 0 ? (
                            <p className="text-xs text-mauve-500 italic text-center py-4 bg-white border rounded-xl">
                                No exposure coordinates defined yet. Click &apos;Add Point&apos; above.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {pointFields.map((field, ptIdx) => {
                                    const pointErrors = profileErrors?.stillPoints?.[ptIdx] as any;
                                    return (
                                        <div key={field.id} className="flex items-end gap-3 bg-white p-3 border rounded-xl shadow-sm">
                                            <div className="flex-1 grid grid-cols-4 gap-3">
                                                <div className="flex flex-col gap-2">
                                                    <FieldLabel text="Reference X (mm)" tooltip={tooltips.xrayProfileStillPointX} />
                                                    <Input 
                                                        type="number" 
                                                        step="any"
                                                        className={`h-8 ${pointErrors?.ramsx ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                        {...register(`xrayProfiles.${index}.stillPoints.${ptIdx}.ramsx`, { valueAsNumber: true })}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <FieldLabel text="Reference Z (mm)" tooltip={tooltips.xrayProfileStillPointZ} />
                                                    <Input 
                                                        type="number" 
                                                        step="any"
                                                        className={`h-8 ${pointErrors?.ramsz ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                        {...register(`xrayProfiles.${index}.stillPoints.${ptIdx}.ramsz`, { valueAsNumber: true })}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <FieldLabel text="Reference Angle (º)" tooltip={tooltips.xrayProfileStillPointOme} />
                                                    <Input 
                                                        type="number" 
                                                        step="any"
                                                        className={`h-8 ${pointErrors?.ome ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                        {...register(`xrayProfiles.${index}.stillPoints.${ptIdx}.ome`, { valueAsNumber: true })}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <FieldLabel text="Number of Images" tooltip={tooltips.xrayProfileStillPointCount} />
                                                    <Input 
                                                        type="number" 
                                                        className={`h-8 ${pointErrors?.numPoints ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                        {...register(`xrayProfiles.${index}.stillPoints.${ptIdx}.numPoints`, { valueAsNumber: true })}
                                                    />
                                                </div>
                                            </div>
                                            <Button 
                                                type="button" 
                                                variant="secondary" 
                                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-800 rounded-lg shrink-0"
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

                {mode === 'tseries' && (
                    <div className="flex flex-col gap-4 border-t border-mauve-200 pt-4 mt-2">
                        <span className="mt-4 mb-3 font-bold text-sm text-mauve-850">Time Series Configuration</span>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Reference X (mm)" tooltip={tooltips.xrayProfileX} required={true} />
                                <Input 
                                    type="number" 
                                    step="any"
                                    className={profileErrors?.ramsx ? "border-destructive focus-visible:ring-destructive" : ""}
                                    {...register(`xrayProfiles.${index}.ramsx`, { valueAsNumber: true })}
                                />
                                {profileErrors?.ramsx && <p className="text-xs text-destructive">{profileErrors.ramsx.message}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Reference Z (mm)" tooltip={tooltips.xrayProfileZ} required={true} />
                                <Input 
                                    type="number" 
                                    step="any"
                                    className={profileErrors?.ramsz ? "border-destructive focus-visible:ring-destructive" : ""}
                                    {...register(`xrayProfiles.${index}.ramsz`, { valueAsNumber: true })}
                                />
                                {profileErrors?.ramsz && <p className="text-xs text-destructive">{profileErrors.ramsz.message}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Reference Angle (º)" tooltip={tooltips.xrayProfileOme} required={true} />
                                <Input 
                                    type="number" 
                                    step="any"
                                    className={profileErrors?.ome ? "border-destructive focus-visible:ring-destructive" : ""}
                                    {...register(`xrayProfiles.${index}.ome`, { valueAsNumber: true })}
                                />
                                {profileErrors?.ome && <p className="text-xs text-destructive">{profileErrors.ome.message}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Number of Images" tooltip={tooltips.numPoints} required={true} />
                                <Input 
                                    type="number" 
                                    className={profileErrors?.numPoints ? "border-destructive focus-visible:ring-destructive" : ""}
                                    {...register(`xrayProfiles.${index}.numPoints`, { valueAsNumber: true })}
                                />
                                {profileErrors?.numPoints && <p className="text-xs text-destructive">{profileErrors.numPoints.message}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Mapscan: Line Scan (dscan) */}
                {mode === 'dscan' && (
                    <div className="flex flex-col gap-4 border-t border-mauve-200 pt-4 mt-2">
                        <span className="mt-4 mb-3 font-bold text-sm text-mauve-850">Line Scan Configuration</span>
                        {/* Reference Coords */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Reference X (mm)" tooltip={tooltips.xrayProfileX} required={true} />
                                <Input 
                                    type="number" 
                                    step="any"
                                    className={profileErrors?.ramsx ? "border-destructive focus-visible:ring-destructive" : ""}
                                    {...register(`xrayProfiles.${index}.ramsx`, { valueAsNumber: true })}
                                />
                                {profileErrors?.ramsx && <p className="text-xs text-destructive">{profileErrors.ramsx.message}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Reference Z (mm)" tooltip={tooltips.xrayProfileZ} required={true} />
                                <Input 
                                    type="number" 
                                    step="any"
                                    className={profileErrors?.ramsz ? "border-destructive focus-visible:ring-destructive" : ""}
                                    {...register(`xrayProfiles.${index}.ramsz`, { valueAsNumber: true })}
                                />
                                {profileErrors?.ramsz && <p className="text-xs text-destructive">{profileErrors.ramsz.message}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Reference Angle (º)" tooltip={tooltips.xrayProfileOme} required={true} />
                                <Input 
                                    type="number" 
                                    step="any"
                                    className={profileErrors?.ome ? "border-destructive focus-visible:ring-destructive" : ""}
                                    {...register(`xrayProfiles.${index}.ome`, { valueAsNumber: true })}
                                />
                                {profileErrors?.ome && <p className="text-xs text-destructive">{profileErrors.ome.message}</p>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Number of Images" tooltip={tooltips.numPoints} required={true} />
                                <Input 
                                    type="number" 
                                    className={profileErrors?.numPoints ? "border-destructive focus-visible:ring-destructive" : ""}
                                    {...register(`xrayProfiles.${index}.numPoints`, { valueAsNumber: true })}
                                />
                                {profileErrors?.numPoints && <p className="text-xs text-destructive">{profileErrors.numPoints.message}</p>}
                            </div>
                        </div>

                        {/* Moving Axis controls */}
                        <div className="bg-white border rounded-2xl p-4 flex flex-col gap-4 mt-2">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Moving Axis 1" tooltip={tooltips.xrayProfileAxis1Name} required={true} />
                                    <Controller
                                        control={control}
                                        name={`xrayProfiles.${index}.axis1Name`}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select axis" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                     <SelectItem value="ramsx">X</SelectItem>
                                                     <SelectItem value="ramsz">Z</SelectItem>
                                                     <SelectItem value="ome">Rotation</SelectItem>
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
                                        className={profileErrors?.axis1Start ? "border-destructive focus-visible:ring-destructive" : ""}
                                        {...register(`xrayProfiles.${index}.axis1Start`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.axis1Start && <p className="text-xs text-destructive">{profileErrors.axis1Start.message}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Stop" tooltip={tooltips.xrayProfileAxisStop} required={true} />
                                    <Input 
                                        type="number" 
                                        step="any"
                                        className={profileErrors?.axis1Stop ? "border-destructive focus-visible:ring-destructive" : ""}
                                        {...register(`xrayProfiles.${index}.axis1Stop`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.axis1Stop && <p className="text-xs text-destructive">{profileErrors.axis1Stop.message}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <FieldLabel text="Number of Images" tooltip={tooltips.xrayProfileAxisImages} required={true} />
                                    <Input 
                                        type="number" 
                                        className={profileErrors?.axis1Images ? "border-destructive focus-visible:ring-destructive" : ""}
                                        {...register(`xrayProfiles.${index}.axis1Images`, { valueAsNumber: true })}
                                    />
                                    {profileErrors?.axis1Images && <p className="text-xs text-destructive">{profileErrors.axis1Images.message}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. Mapscan: Grid Scan (mesh) */}
                {mode === 'mesh' && (
                    <div className="flex flex-col gap-4 border-t border-mauve-200 pt-4 mt-2">
                        <span className="font-bold text-sm text-mauve-850">Grid Scan Configuration</span>

                        {/* Reference Coords */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Reference X (mm)" tooltip={tooltips.xrayProfileX} required={true} />
                                <Input 
                                    type="number" 
                                    step="any"
                                    className={profileErrors?.ramsx ? "border-destructive focus-visible:ring-destructive" : ""}
                                    {...register(`xrayProfiles.${index}.ramsx`, { valueAsNumber: true })}
                                />
                                {profileErrors?.ramsx && <p className="text-xs text-destructive">{profileErrors.ramsx.message}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Reference Z (mm)" tooltip={tooltips.xrayProfileZ} required={true} />
                                <Input 
                                    type="number" 
                                    step="any"
                                    className={profileErrors?.ramsz ? "border-destructive focus-visible:ring-destructive" : ""}
                                    {...register(`xrayProfiles.${index}.ramsz`, { valueAsNumber: true })}
                                />
                                {profileErrors?.ramsz && <p className="text-xs text-destructive">{profileErrors.ramsz.message}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Reference Angle (º)" tooltip={tooltips.xrayProfileOme} required={true} />
                                <Input 
                                    type="number" 
                                    step="any"
                                    className={profileErrors?.ome ? "border-destructive focus-visible:ring-destructive" : ""}
                                    {...register(`xrayProfiles.${index}.ome`, { valueAsNumber: true })}
                                />
                                {profileErrors?.ome && <p className="text-xs text-destructive">{profileErrors.ome.message}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <FieldLabel text="Number of Images" tooltip={tooltips.numPoints} required={true} />
                                <Input 
                                    type="number" 
                                    className={profileErrors?.numPoints ? "border-destructive focus-visible:ring-destructive" : ""}
                                    {...register(`xrayProfiles.${index}.numPoints`, { valueAsNumber: true })}
                                />
                                {profileErrors?.numPoints && <p className="text-xs text-destructive">{profileErrors.numPoints.message}</p>}
                            </div>
                        </div>

                        {/* Merged Grid Mesh Configuration Card */}
                        <div className="bg-white border border-mauve-200 rounded-2xl p-5 flex flex-col gap-4 mt-2">
                            {/* Three-column layout: Axis 1 | Axis 2 | Points Preview */}
                            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-6 md:gap-5">
                                {/* Axis 1 Subsection */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-2">
                                        <FieldLabel text="Moving Axis 1" tooltip={tooltips.xrayProfileAxis1Name} required={true} />
                                        <Controller
                                            control={control}
                                            name={`xrayProfiles.${index}.axis1Name`}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="h-8.5">
                                                        <SelectValue placeholder="Select Axis 1" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ramsx">X</SelectItem>
                                                        <SelectItem value="ramsz">Z</SelectItem>
                                                        <SelectItem value="ome">Rotation</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {profileErrors?.axis1Name && <p className="text-xs text-destructive">{profileErrors.axis1Name.message}</p>}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="flex flex-col gap-1.5">
                                            <FieldLabel text="Start" tooltip={tooltips.xrayProfileAxisStart} required={true} />
                                            <Input 
                                                type="number" 
                                                step="any"
                                                className={`h-8 px-2 text-xs ${profileErrors?.axis1Start ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                {...register(`xrayProfiles.${index}.axis1Start`, { valueAsNumber: true })}
                                            />
                                            {profileErrors?.axis1Start && <p className="text-[10px] text-destructive mt-0.5">{profileErrors.axis1Start.message}</p>}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <FieldLabel text="Stop" tooltip={tooltips.xrayProfileAxisStop} required={true} />
                                            <Input 
                                                type="number" 
                                                step="any"
                                                className={`h-8 px-2 text-xs ${profileErrors?.axis1Stop ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                {...register(`xrayProfiles.${index}.axis1Stop`, { valueAsNumber: true })}
                                            />
                                            {profileErrors?.axis1Stop && <p className="text-[10px] text-destructive mt-0.5">{profileErrors.axis1Stop.message}</p>}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <FieldLabel text="Images" tooltip={tooltips.xrayProfileAxisImages} required={true} />
                                            <Input 
                                                type="number" 
                                                className={`h-8 px-2 text-xs ${profileErrors?.axis1Images ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                {...register(`xrayProfiles.${index}.axis1Images`, { valueAsNumber: true })}
                                            />
                                            {profileErrors?.axis1Images && <p className="text-[10px] text-destructive mt-0.5">{profileErrors.axis1Images.message}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Axis 2 Subsection */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-2">
                                        <FieldLabel text="Moving Axis 2" tooltip={tooltips.xrayProfileAxis2Name} required={true} />
                                        <Controller
                                            control={control}
                                            name={`xrayProfiles.${index}.axis2Name`}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="h-8.5">
                                                        <SelectValue placeholder="Select Axis 2" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ramsx">X</SelectItem>
                                                        <SelectItem value="ramsz">Z</SelectItem>
                                                        <SelectItem value="ome">Rotation</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {profileErrors?.axis2Name && <p className="text-xs text-destructive">{profileErrors.axis2Name.message}</p>}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="flex flex-col gap-1.5">
                                            <FieldLabel text="Start" tooltip={tooltips.xrayProfileAxisStart} required={true} />
                                            <Input 
                                                type="number" 
                                                step="any"
                                                className={`h-8 px-2 text-xs ${profileErrors?.axis2Start ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                {...register(`xrayProfiles.${index}.axis2Start`, { valueAsNumber: true })}
                                            />
                                            {profileErrors?.axis2Start && <p className="text-[10px] text-destructive mt-0.5">{profileErrors.axis2Start.message}</p>}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <FieldLabel text="Stop" tooltip={tooltips.xrayProfileAxisStop} required={true} />
                                            <Input 
                                                type="number" 
                                                step="any"
                                                className={`h-8 px-2 text-xs ${profileErrors?.axis2Stop ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                {...register(`xrayProfiles.${index}.axis2Stop`, { valueAsNumber: true })}
                                            />
                                            {profileErrors?.axis2Stop && <p className="text-[10px] text-destructive mt-0.5">{profileErrors.axis2Stop.message}</p>}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <FieldLabel text="Images" tooltip={tooltips.xrayProfileAxisImages} required={true} />
                                            <Input 
                                                type="number" 
                                                className={`h-8 px-2 text-xs ${profileErrors?.axis2Images ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                {...register(`xrayProfiles.${index}.axis2Images`, { valueAsNumber: true })}
                                            />
                                            {profileErrors?.axis2Images && <p className="text-[10px] text-destructive mt-0.5">{profileErrors.axis2Images.message}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Grid Size Preview — matches StatusBar hardware-reading chip style */}
                                <div className="border-t border-mauve-200 pt-4 md:border-t-0 md:pt-0 flex items-stretch justify-center h-full">
                                    <div className="flex flex-col justify-center items-center px-4 py-2 bg-mauve-50 border border-mauve-200 rounded-xl text-center shadow-sm w-full h-full">
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-mauve-500">Grid Size</span>
                                        <span className="text-sm font-semibold text-mauve-850 tabular-nums">
                                            {axis1Images ?? 0} × {axis2Images ?? 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
