import { useMemo } from 'react';
import { FieldErrors, UseFormRegister, useFieldArray, useWatch } from 'react-hook-form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { FieldLabel } from '../../../components/ui/FieldLabel';
import { ProfileCardLayout } from './ProfileCardLayout';
import { tooltips } from "@/config/tooltips.ts";
import { dicProfileSchema } from '../profileSchemas/dicSchema';
import { Plus, Trash2 } from 'lucide-react';

interface DicProfileCardProps {
    index: number;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    control: any;
    removeProfile: (index: number) => void;
    duplicateProfile?: (index: number) => void;
}

export const DicProfileCard = ({
    index,
    register,
    errors,
    control,
    removeProfile,
    duplicateProfile
}: DicProfileCardProps) => {
    const profileErrors = (errors.dicProfiles as any)?.[index] as any;

    const profileName = useWatch({
        control,
        name: `dicProfiles.${index}.name`,
        defaultValue: ''
    });

    const {
        fields: pointFields,
        append: appendPoint,
        remove: removePoint
    } = useFieldArray({
        control,
        name: `dicProfiles.${index}.stillPoints`
    });

    const profileValues = useWatch({
        control,
        name: `dicProfiles.${index}`
    });

    const isComplete = useMemo(() => {
        if (!profileValues) return false;
        return dicProfileSchema.safeParse(profileValues).success;
    }, [profileValues]);

    const handleAddPoint = () => {
        const currentPoints = profileValues?.stillPoints || [];
        if (currentPoints.length > 0) {
            const last = currentPoints[currentPoints.length - 1];
            appendPoint({
                ramsx: last?.ramsx ?? null,
                ramsz: last?.ramsz ?? null,
                ome: last?.ome ?? null,
                numPoints: last?.numPoints ?? null
            });
        } else {
            appendPoint({ ramsx: null, ramsz: null, ome: null, numPoints: null });
        }
    };

    return (
        <ProfileCardLayout
            index={index}
            name={profileName}
            isComplete={isComplete}
            onRemove={() => removeProfile(index)}
            onDuplicate={duplicateProfile ? () => duplicateProfile(index) : undefined}
            modeSelector={
                <div className="h-8 text-xs font-semibold px-3 py-1.5 bg-white rounded-lg border border-mauve-200 text-mauve-850 shadow-sm select-none flex items-center w-fit">
                    DIC Stills
                </div>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-5 px-5">
                <div className="flex flex-col gap-2">
                    <FieldLabel text="Profile Name" tooltip={tooltips.xrayProfileName} required={true} />
                    <Input 
                        placeholder="e.g. Optical Strain Array"
                        className={`h-8 bg-input/50 border-transparent focus-visible:ring-mauve-300 ${profileErrors?.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        {...register(`dicProfiles.${index}.name`)}
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
                        {...register(`dicProfiles.${index}.ctime`, { valueAsNumber: true })}
                    />
                    {profileErrors?.ctime && <p className="text-xs text-destructive">{profileErrors.ctime.message}</p>}
                </div>
            </div>

            <hr className="border-mauve-150 my-5 mx-5" />

            <div className="flex flex-col">
                <div className="flex justify-end items-center px-5 mb-3">
                    <Button 
                        type="button" 
                        variant="secondary" 
                        className="h-8 text-xs border border-mauve-200 hover:bg-mauve-50 text-mauve-700 bg-white cursor-pointer"
                        onClick={handleAddPoint}
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
                                                {...register(`dicProfiles.${index}.stillPoints.${ptIdx}.ramsx`, { valueAsNumber: true })}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <FieldLabel text="Reference Z (mm)" tooltip={tooltips.xrayProfileStillPointZ} />
                                            <Input 
                                                type="number" 
                                                step="any"
                                                className={`h-8 bg-white border-mauve-250 ${pointErrors?.ramsz ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                {...register(`dicProfiles.${index}.stillPoints.${ptIdx}.ramsz`, { valueAsNumber: true })}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <FieldLabel text="Reference Angle (º)" tooltip={tooltips.xrayProfileStillPointOme} />
                                            <Input 
                                                type="number" 
                                                step="any"
                                                className={`h-8 bg-white border-mauve-250 ${pointErrors?.ome ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                {...register(`dicProfiles.${index}.stillPoints.${ptIdx}.ome`, { valueAsNumber: true })}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <FieldLabel text="Images" tooltip={tooltips.xrayProfileStillPointCount} />
                                            <Input 
                                                type="number" 
                                                className={`h-8 bg-white border-mauve-250 ${pointErrors?.numPoints ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                {...register(`dicProfiles.${index}.stillPoints.${ptIdx}.numPoints`, { valueAsNumber: true })}
                                            />
                                        </div>
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="secondary" 
                                        className="h-8 w-8 text-mauve-400 dark:text-mauve-500 hover:text-destructive hover:bg-destructive/10 dark:hover:text-red-400 dark:hover:bg-red-500/20 rounded-lg shrink-0 cursor-pointer transition-colors"
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
        </ProfileCardLayout>
    );
};
