import React from 'react';
import { useDAQStore, HandlerProfile } from "../../store/configuration/useDAQStore.ts";
import { DynamicForm } from "../../components/DynamicForm";
import { daqHandlerSchema } from "./profileSchemas/daqHandlerSchema.ts";
import { Dropdown } from "../../components/DropDown.tsx";
import { InputField } from "../../components/InputField.tsx";
import { ConfigTabSection } from "../../layout/parital/ConfigTabSection.tsx";
import { AddButton } from "../../components/AddButton.tsx";


const frequencyOptions = [
    { id: '1', label: '1 kHz' },
    { id: '5', label: '5 kHz' },
    { id: '10', label: '10 kHz' },
    { id: '20', label: '20 kHz' },
];

export const TabDAQ = () => {
    const { settings, setSettings, addProfile, updateProfile, removeProfile } = useDAQStore();

    const handleFrequencyChange = (newFreqId: string) => {
        setSettings({
            ...settings,
            masterFrequency: newFreqId
        });
    };

    const handleSamplePointsChange = (val: string) => {
        setSettings({
            ...settings,
            samplePoints: val
        });
    };

    return (
        <div className='flex flex-col gap-10 text-left'>
            <ConfigTabSection
                title="Data Acquisition Configuration"
                description="Configure the general parameters for Data Acquisition."
            >
                {/* Column Grid Layout */}
                <div className="grid grid-cols-2 px-5 gap-x-14 gap-y-6">
                    <Dropdown
                        label="Sampling Frequency"
                        options={frequencyOptions}
                        selectedId={settings.masterFrequency}
                        onChange={handleFrequencyChange}
                    />

                    <InputField
                        label="Sample Points"
                        value={settings.samplePoints}
                        type="number"
                        onChange={handleSamplePointsChange}
                        placeholder="Enter number of sample points..."
                    />
                </div>
            </ConfigTabSection>

            <ConfigTabSection
                title="DAQ Handler Profiles"
                description="Create and save different profiles for how data is acquired."
            >
                <div className="flex flex-col gap-6 w-full">
                    {/* Render handler profile cards */}
                    {settings.handlerProfiles.map((profile, index) => (
                        <div
                            key={profile.id}
                            className="relative bg-mauve-100/50 p-6 rounded-3xl flex flex-col gap-4"
                        >
                            {/* Profile Card Header */}
                            <div className="flex items-center justify-between border-b border-mauve-150 pb-2">
                                <span className="text-sm font-bold text-mauve-700">
                                    Handler Profile #{index + 1}
                                </span>
                                {settings.handlerProfiles.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeProfile(profile.id)}
                                        className="text-xs font-bold text-red-600 hover:text-red-800 cursor-pointer transition-colors duration-200"
                                    >
                                        Remove Profile
                                    </button>
                                )}
                            </div>

                            {/* Dynamic form for profile */}
                            <DynamicForm
                                schema={daqHandlerSchema}
                                data={profile}
                                onChange={(updatedProfile: HandlerProfile) => updateProfile(profile.id, updatedProfile)}
                                layout="horizontal"
                            />
                        </div>
                    ))}

                    <div className="flex flex-col gap-3">
                        <AddButton
                            label="Add Handler Profile"
                            onClick={addProfile}
                        />
                        <p className='text-xs font-small text-mauve-800'>* Required</p>
                    </div>
                </div>
            </ConfigTabSection>
        </div>
    );
};
