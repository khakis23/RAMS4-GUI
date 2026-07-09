import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { FieldLabel } from '../../../components/ui/FieldLabel';

interface XrayProfileCardProps {
    index: number;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    remove: (index: number) => void;
}

export const XrayProfileCard = ({
    index,
    register,
    errors,
    remove
}: XrayProfileCardProps) => {
    const profileErrors = (errors.xrayProfiles as any)?.[index] as any;

    return (
        <div className="border rounded-xl p-6 bg-mauve-50/50 flex flex-col gap-4 text-left">
            {/* Card Header */}
            <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-sm text-mauve-850">X-ray Profile #{index + 1}</span>
                <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => remove(index)}
                >
                    Remove Profile
                </Button>
            </div>

            {/* Profile Name */}
            <div className="flex flex-col gap-2 max-w-sm">
                <FieldLabel text="Profile Name" tooltip="The file path to the X-ray scan coordinate grid (e.g. 'ff_elastic_array.txt')." required={true} />
                <Input 
                    placeholder="Enter profile name"
                    className={profileErrors?.name ? "border-destructive focus-visible:ring-destructive" : ""}
                    {...register(`xrayProfiles.${index}.name`)}
                />
                {profileErrors?.name && (
                    <p className="text-xs text-destructive">{profileErrors.name.message}</p>
                )}
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-2 gap-6 mt-2">
                <div className="flex flex-col gap-2">
                    <FieldLabel text="X Position (mm)" tooltip="The X-coordinate position of the specimen stages for this scan layer in mm." required={true} />
                    <Input 
                        className={profileErrors?.x ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`xrayProfiles.${index}.x`)} 
                    />
                    {profileErrors?.x && <p className="text-xs text-destructive">{profileErrors.x.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                    <FieldLabel text="Z Position (mm)" tooltip="The Z-coordinate position of the specimen stages for this scan layer in mm." required={true} />
                    <Input 
                        className={profileErrors?.z ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`xrayProfiles.${index}.z`)} 
                    />
                    {profileErrors?.z && <p className="text-xs text-destructive">{profileErrors.z.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                    <FieldLabel text="Initial Angle (º)" tooltip="The starting rotation angle (Omega) of the stage for this fly scan layer in degrees." required={true} />
                    <Input 
                        className={profileErrors?.omeStart ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`xrayProfiles.${index}.omeStart`)} 
                    />
                    {profileErrors?.omeStart && <p className="text-xs text-destructive">{profileErrors.omeStart.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                    <FieldLabel text="Final Angle (º)" tooltip="The ending rotation angle (Omega) of the stage for this fly scan layer in degrees." required={true} />
                    <Input 
                        className={profileErrors?.omeStop ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`xrayProfiles.${index}.omeStop`)} 
                    />
                    {profileErrors?.omeStop && <p className="text-xs text-destructive">{profileErrors.omeStop.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                    <FieldLabel text="Exposure Time (s)" tooltip="Exposure count time per step in seconds." required={true} />
                    <Input 
                        className={profileErrors?.ctime ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`xrayProfiles.${index}.ctime`)} 
                    />
                    {profileErrors?.ctime && <p className="text-xs text-destructive">{profileErrors.ctime.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                    <FieldLabel text="Attenuation (mm)" tooltip="The attenuator foil thickness in mm. Must be in 0.25 mm increments from 0 to 20 mm." required={true} />
                    <Input 
                        className={profileErrors?.atten ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`xrayProfiles.${index}.atten`)} 
                    />
                    {profileErrors?.atten && <p className="text-xs text-destructive">{profileErrors.atten.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                    <FieldLabel text="Beam Height (mm)" tooltip="Vertical slit height of the incident X-ray beam in mm." required={true} />
                    <Input 
                        className={profileErrors?.beamHeight ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`xrayProfiles.${index}.beamHeight`)} 
                    />
                    {profileErrors?.beamHeight && <p className="text-xs text-destructive">{profileErrors.beamHeight.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                    <FieldLabel text="Beam Width (mm)" tooltip="Horizontal slit width of the incident X-ray beam in mm." required={true} />
                    <Input 
                        className={profileErrors?.beamWidth ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register(`xrayProfiles.${index}.beamWidth`)} 
                    />
                    {profileErrors?.beamWidth && <p className="text-xs text-destructive">{profileErrors.beamWidth.message}</p>}
                </div>
            </div>
        </div>
    );
};
