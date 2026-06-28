import React from 'react';
import { useGeneralStore } from "../../store/configuration/useGeneralStore.ts";
import { InputField } from '../../components/InputField.tsx';
import { CheckBoxes } from "../../components/CheckBoxes.tsx";
import { ConfigTabSection } from "./components/ConfigTabSection.tsx";

export const TabGeneral = () => {
    const { settings, updateGeneralField } = useGeneralStore();
    const { cycleNumber, sampleName, requiredAxes } = settings.currentConfig;

    const axesOptions = [
        { id: 'tens', label: 'TENS' },
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'ra', label: 'RA' },
        { id: 'rb', label: 'RB' },
    ];

    return (
        <ConfigTabSection title="General Configuration">
            <div className="relative bg-mauve-100/50 p-6 rounded-3xl flex flex-col gap-6">
                <div className="grid grid-cols-2 px-5 gap-x-14 gap-y-6 text-left">
                    {/* Cycle Number */}
                    <InputField
                        label="Cycle Number"
                        value={cycleNumber}
                        onChange={(val) => updateGeneralField('cycleNumber', val)}
                        placeholder="ex. 2026-02"
                    />

                    {/* Sample Name */}
                    <InputField
                        label="Sample Name"
                        value={sampleName}
                        onChange={(val) => updateGeneralField('sampleName', val)}
                        placeholder="Enter sample name"
                    />

                    {/* Required Axes */}
                    <CheckBoxes
                        label="Required Axes"
                        options={axesOptions}
                        selectedIds={requiredAxes}
                        onChange={(axes) => updateGeneralField('requiredAxes', axes)}
                        direction="horizontal"
                    />
                </div>
            </div>
        </ConfigTabSection>
    );
};
