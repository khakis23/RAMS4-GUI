import React from 'react';
import { useXrayStore, XrayProfile } from "../../store/configuration/useXrayStore.ts";
import { DynamicForm } from "../../components/DynamicForm";
import { xraySchema } from "./profileSchemas/xraySchema.ts";
import { ConfigTabSection } from "./components/ConfigTabSection.tsx";
import { Dropdown } from "../../components/DropDown.tsx";
import { Button } from "../../components/Button.tsx";
import { isProfileValid } from "../../types/schema.ts"


export const TabXray = () => {
    const { settings, selectProfile, updateCurrentField, saveCurrentProfile, deleteCurrentProfile } = useXrayStore();

    const isRequiredFilled = isProfileValid(settings.currentProfile, xraySchema);

    const dropdownOptions = [
        { id: 'new-blank', label: 'New Blank Profile' },
        ...settings.savedProfiles.map((p) => ({ id: p.id, label: p.name })),
    ];

    const handleSave = () => {
        if (settings.activeProfileId === 'new-blank') {
            const name = prompt('Enter a name for this X-ray profile:');
            if (name && name.trim()) {
                saveCurrentProfile(name.trim());
            }
        } else {
            const currentName = settings.currentProfile.name || 'Saved Profile';
            saveCurrentProfile(currentName);
        }
    };

    return (
        <ConfigTabSection
            title="X-ray Scan Profiles"
            description="Create and save different X-ray scan profiles."
        >
            {/* Profile Selection & Actions Bar */}
            <div className="flex items-end justify-between gap-6 mb-6">
                <div className="w-64 shrink-0">
                    <Dropdown
                        label="Select Profile"
                        options={dropdownOptions}
                        selectedId={settings.activeProfileId}
                        onChange={selectProfile}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        disabled={!isRequiredFilled}
                        onClick={handleSave}
                    >
                        Save Profile
                    </Button>
                    <Button
                        variant="danger"
                        disabled={settings.activeProfileId === 'new-blank'}
                        onClick={deleteCurrentProfile}
                    >
                        Delete Profile
                    </Button>
                </div>
            </div>

            {/* Active Profile Card */}
            <div className="relative bg-mauve-100/50 p-6 rounded-3xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-mauve-150 pb-2">
                    <span className="text-sm font-bold text-mauve-700">
                        {settings.activeProfileId === 'new-blank' ? 'New Profile Draft' : settings.currentProfile.name}
                    </span>
                </div>

                <DynamicForm
                    schema={xraySchema}
                    data={settings.currentProfile}
                    onChange={(updated: XrayProfile) => {
                        Object.keys(updated).forEach((key) => {
                            const val = updated[key as keyof XrayProfile];
                            if (val !== settings.currentProfile[key as keyof XrayProfile]) {
                                updateCurrentField(key as keyof XrayProfile, val);
                            }
                        });
                    }}
                    layout="horizontal"
                />
            </div>

            <p className='text-xs font-small text-mauve-800 mt-4 text-left pl-2'>* Required</p>
        </ConfigTabSection>
    );
};
