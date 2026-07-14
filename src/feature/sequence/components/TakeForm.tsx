import { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { useConfigurationStore } from '@/store/useConfigurationStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { Switch } from '@/components/ui/switch';
import { tooltips } from '@/config/tooltips';

interface TakeFormProps {
    index: number;
    register: any;
    errors: any;
    control: any;
    watch: any;
    setValue: any;
}

const getProfileModeName = (mode: string) => {
    switch (mode) {
        case 'rotation-series': return 'Rotation Series';
        case 'stills': return 'Stills';
        case 'tseries': return 'Mapscan: Time Series';
        case 'dscan': return 'Mapscan: Line Scan';
        case 'mesh': return 'Mapscan: Grid Scan';
        default: return mode || '';
    }
};

export const TakeForm = ({ index, errors, control, watch, setValue }: TakeFormProps) => {
    const { draft } = useConfigurationStore();
    const xrayProfiles = draft?.xrayProfiles || [];

    const selectedProfileID = watch(`cards.${index}.data.profileID`);
    const imageMode = watch(`cards.${index}.data.imgMode`);

    const selectedProfile = xrayProfiles.find((p: any) => p.id === selectedProfileID);
    const selectedProfileMode = selectedProfile?.mode;

    // Default configuration mappings
    useEffect(() => {
        const currentProfileID = watch(`cards.${index}.data.profileID`);
        if (!currentProfileID && xrayProfiles.length > 0) {
            setValue(`cards.${index}.data.profileID`, xrayProfiles[0].id);
            setValue(`cards.${index}.data.pauseTsDaq`, false);
        }
    }, [index, setValue, watch, xrayProfiles]);

    // Handle profile selection changes to set appropriate default image modes
    useEffect(() => {
        const currentImgMode = watch(`cards.${index}.data.imgMode`);
        
        if (selectedProfileMode === 'rotation-series') {
            const isValidRotMode = ['ff', 'nf', 'tomo', 'single-layer'].includes(currentImgMode);
            if (!isValidRotMode) {
                setValue(`cards.${index}.data.imgMode`, 'ff');
            }
        } else if (selectedProfileMode === 'stills') {
            const isValidStillsMode = ['dic', 'ff', 'nf'].includes(currentImgMode);
            if (!isValidStillsMode) {
                setValue(`cards.${index}.data.imgMode`, 'dic');
            }
        } else {
            setValue(`cards.${index}.data.imgMode`, undefined);
        }
    }, [selectedProfileMode, index, setValue, watch]);

    const takeErrors = errors?.cards?.[index]?.data;

    const getModeTooltip = () => {
        if (selectedProfileMode === 'rotation-series') {
            if (imageMode === 'ff') return tooltips.mechTestImageModeFarFieldRotation;
            if (imageMode === 'nf') return tooltips.mechTestImageModeNearFieldRotation;
            if (imageMode === 'tomo') return tooltips.mechTestImageModeTomoRotation;
            if (imageMode === 'single-layer') return tooltips.mechTestImageModeSingleLayerRotation;
        } else if (selectedProfileMode === 'stills') {
            if (imageMode === 'dic') return tooltips.mechTestImageModeDicStills;
            if (imageMode === 'ff') return tooltips.mechTestImageModeFarFieldStills;
            if (imageMode === 'nf') return tooltips.mechTestImageModeNearFieldStills;
        }
        return "Scanning mode configuration for the active detector.";
    };

    const modeTooltip = getModeTooltip();
    const showImageMode = selectedProfileMode === 'rotation-series' || selectedProfileMode === 'stills';

    return (
        <div className="flex flex-col gap-6 pt-4 border-t border-mauve-150">
            {/* Parameters Row (Horizontal Alignment) */}
            <div className="flex flex-col md:flex-row md:items-end gap-6">
                {/* Image Profile Selector */}
                <div className="flex flex-col gap-2 flex-grow md:max-w-md">
                    <FieldLabel text="Image Profile" tooltip={tooltips.mechTestImageProfile} required={true} />
                    <Controller
                        control={control}
                        name={`cards.${index}.data.profileID`}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select an X-ray profile" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {xrayProfiles.length === 0 ? (
                                        <SelectItem value="none" disabled className="text-xs">
                                            No xray profiles configured
                                        </SelectItem>
                                    ) : (
                                        xrayProfiles.map((p: any) => (
                                            <SelectItem key={p.id} value={p.id} className="text-xs cursor-pointer">
                                                {p.name || 'Unnamed Profile'} ({getProfileModeName(p.mode)})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {takeErrors?.profileID && <p className="text-xs text-destructive">{takeErrors.profileID.message}</p>}
                </div>

                {/* Conditional Image Mode Selector */}
                {showImageMode && (
                    <div className="flex flex-col gap-2 w-full md:w-56 shrink-0">
                        <FieldLabel text="Image Mode" required={true} tooltip={modeTooltip} />
                        <Controller
                            control={control}
                            name={`cards.${index}.data.imgMode`}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select image mode" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {selectedProfileMode === 'rotation-series' ? (
                                            <>
                                                <SelectItem value="ff" className="text-xs cursor-pointer">Far-Field</SelectItem>
                                                <SelectItem value="nf" className="text-xs cursor-pointer">Near-Field</SelectItem>
                                                <SelectItem value="tomo" className="text-xs cursor-pointer">Tomography</SelectItem>
                                                <SelectItem value="single-layer" className="text-xs cursor-pointer">Single Layer</SelectItem>
                                            </>
                                        ) : (
                                            <>
                                                <SelectItem value="dic" className="text-xs cursor-pointer">DIC</SelectItem>
                                                <SelectItem value="ff" className="text-xs cursor-pointer">Far-Field</SelectItem>
                                                <SelectItem value="nf" className="text-xs cursor-pointer">Near-Field</SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {takeErrors?.imgMode && <p className="text-xs text-destructive">{takeErrors.imgMode.message}</p>}
                    </div>
                )}

                {/* General parameters (Pause DAQ) inline on the row */}
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl border border-mauve-150 bg-mauve-50/10 h-8 w-full md:w-48 shrink-0">
                    <FieldLabel text="Pause DAQ" tooltip={tooltips.mechTestPauseDaq} />
                    <Controller
                        control={control}
                        name={`cards.${index}.data.pauseTsDaq`}
                        render={({ field }) => (
                            <Switch
                                checked={!!field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                </div>
            </div>
        </div>
    );
};
