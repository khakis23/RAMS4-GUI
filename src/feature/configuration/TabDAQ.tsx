import React from 'react';
import { useDAQStore } from "../../store/configuration/useDAQStore.ts";
import { DynamicForm } from "../../components/DynamicForm.tsx";
import { daqHandlerSchema } from "./profileSchemas/daqHandlerSchema.ts";
import {Dropdown} from "../../components/DropDown.tsx";
import {InputField} from "../../components/InputField.tsx";
import {ConfigTabSection} from "../../layout/parital/ConfigTabSection.tsx";


const frequencyOptions = [
    { id: '1', label: '1 kHz' },
    { id: '5', label: '5 kHz' },
    { id: '10', label: '10 kHz' },
    { id: '20', label: '20 kHz' },
]

export const TabDAQ = () => {
    const { config, setConfig } = useDAQStore();
    const [samplePoints, setSamplePoints] = React.useState('');

    const frequencyVal = config.frequency?.toString() || '1';
    const handleFrequencyChange = (newFreqId: string) => {
        setConfig({
            ...config,
            frequency: Number(newFreqId)
        });
    };

    return (
        <div>
            <ConfigTabSection
                title="Data Acquisition Configuration"
                description="Configure the general parameters for Data Acquisition."
            >
                {/* Column Grid Layout */}
                <div className="grid grid-cols-2 px-5 gap-x-14 gap-y-6">
                    <Dropdown
                        label="Sampling Frequency"
                        options={frequencyOptions}
                        selectedId={frequencyVal}
                        onChange={handleFrequencyChange}
                    />

                    <InputField
                        label="Sample Points"
                        value={samplePoints}
                        type="number"
                        onChange={setSamplePoints}
                        placeholder="Enter number of sample points..."
                    />
                </div>
            </ConfigTabSection>

            <ConfigTabSection
                title="DAQ Handler Profiles"
                description="Create and save different profiles for how data is acquired."
            >
                <div className="flex flex-col gap-4">
                    <DynamicForm
                        schema={daqHandlerSchema}
                        data={config}
                        onChange={setConfig}
                        layout='horizontal'
                    />
                    <p className='text-xs font-small text-mauve-800'>* Required</p>
                </div>
            </ConfigTabSection>
        </div>
    )
}
