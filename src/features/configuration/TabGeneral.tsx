// @ts-ignore
import React from 'react';
import { useGeneralStore } from "../../store/configuration/useGeneralStore.ts";
import { InputField } from '../../components/InputField.tsx';
import { CheckBoxes } from "../../components/CheckBoxes.tsx";


export const TabGeneral = () => {
    const cycleNumber = useGeneralStore((state) => state.cycleNumber);
    const setCycleNumber = useGeneralStore((state) => state.setCycleNumber);
    const sampleName = useGeneralStore((state) => state.sampleName);
    const setSampleName = useGeneralStore((state) => state.setSampleName);
    const requiredAxes = useGeneralStore((state) => state.requiredAxes);
    const setRequiredAxes = useGeneralStore((state) => state.setRequiredAxes);

    const axesOptions = [
        { id: 'tens', label: 'TENS' },
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'ra', label: 'RA' },
        { id: 'rb', label: 'RB' },
    ];

    return (
        <div className="flex flex-col gap-6 w-full text-left">
            {/* Tab Section Header */}
            <div>
                <h3 className="text-lg font-bold text-mauve-800 border-b border-mauve-100 pb-2">
                    General Configuration
                </h3>
            </div>

            {/* Column Grid Layout */}
            <div className="grid grid-cols-2 px-5 gap-x-14 gap-y-6">
                
                {/* Cycle Number */}
                <InputField
                    label="Cycle Number"
                    value={cycleNumber}
                    onChange={setCycleNumber}
                    placeholder="ex. 2026-02"
                />

                {/* Sample Name */}
                <InputField
                    label="Sample Name"
                    value={sampleName}
                    onChange={setSampleName}
                    placeholder="Enter sample name"
                />

                {/* Required Axes */}
                <CheckBoxes
                    label="Required Axes"
                    options={axesOptions}
                    selectedIds={requiredAxes}
                    onChange={setRequiredAxes}
                    direction="horizontal"
                />


            </div>
        </div>
    )
}
