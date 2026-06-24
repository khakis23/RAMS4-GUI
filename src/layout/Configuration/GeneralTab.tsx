// @ts-ignore
import React from 'react';
import { useConfigureStore } from "../../store/useConfigureStore";
import { InputField } from '../../components/InputField';
import { CheckBoxes } from "../../components/CheckBoxes.tsx";


export const GeneralTab = () => {
    const cycleNumber = useConfigureStore((state) => state.cycleNumber);
    const setCycleNumber = useConfigureStore((state) => state.setCycleNumber);
    const sampleName = useConfigureStore((state) => state.sampleName);
    const setSampleName = useConfigureStore((state) => state.setSampleName);
    const requiredAxes = useConfigureStore((state) => state.requiredAxes);
    const setRequiredAxes = useConfigureStore((state) => state.setRequiredAxes);

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
