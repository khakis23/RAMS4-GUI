import React, { useState } from 'react';
import { Tabs, TabsOption } from "../../../components/Tabs.tsx";
import { Dropdown } from "../../../components/DropDown.tsx";
import { Button } from "../../../components/Button.tsx";
import { TabGeneral } from "../TabGeneral.tsx";
import { TabDAQ } from "../TabDAQ.tsx";
import { TabXray } from "../TabXray.tsx";
import { useGeneralStore } from "../../../store/configuration/useGeneralStore.ts";

type TabName = 'general' | 'daq' | 'xray' | 'dic';

export const ConfigurationManager = () => {
    const tabs: TabsOption[] = [
        { id: 'general', label: 'General' },
        { id: 'daq', label: 'DAQ' },
        { id: 'xray', label: 'X-ray' },
        { id: 'dic', label: 'DIC' },
    ];
    
    const [activeTab, setActiveTab] = useState<TabName>('general');
    const { settings, selectConfig, saveCurrentConfig, deleteCurrentConfig } = useGeneralStore();

    const dropdownOptions = [
        { id: 'new-blank', label: 'New Blank Config' },
        ...settings.savedConfigs.map((c) => ({ id: c.id, label: c.name })),
    ];

    const handleConfigChange = (id: string) => {
        selectConfig(id);
        console.log('Selected config ID:', id);
        // TODO: API call - Fetch / load the selected config ID from backend (api/fetch data here)
        // TODO: Store update - Sync other tab stores (DAQ, X-ray, DIC) with the loaded config sections
    };

    const handleSave = () => {
        if (settings.activeConfigId === 'new-blank') {
            const name = prompt('Enter a name for this Global Configuration:');
            if (name && name.trim()) {
                saveCurrentConfig(name.trim());
                console.log('Saved new config:', name.trim());
                // TODO: API call - Send compiled global configuration (including general, DAQ, etc.) to backend
            }
        } else {
            const active = settings.savedConfigs.find(c => c.id === settings.activeConfigId);
            const currentName = active ? active.name : 'Saved Config';
            saveCurrentConfig(currentName);
            console.log('Saved config:', currentName);
            // TODO: API call - Send compiled global configuration (including general, DAQ, etc.) to backend
        }
    };

    const handleDelete = () => {
        // TODO: API call - Notify backend to delete the config file
        console.log('Deleting config:', settings.activeConfigId);
        deleteCurrentConfig();
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return <TabGeneral />;
            case 'daq':
                return <TabDAQ />;
            case 'xray':
                return <TabXray />;
            case 'dic':
                return <p className='text-lg font-medium text-mauve-800'>DIC Configuration Not Currently Supported</p>;
            default:
                return null;
        }
    };

    return (
        <div className='flex flex-col gap-6 w-full max-w-4xl mx-auto'>
            {/* TODO Place MINI status bar here */}
            <div className="relative w-full h-18 bg-mauve-100 rounded-3xl p-6 flex items-center justify-between shadow-sm
                                border border-mauve-200 text-center">
                <div className="text-center w-full">
                    <span className="text-xl font-bold text-mauve-800">
                        Mini Status Bar Placeholder
                    </span>
                </div>
            </div>

            {/* Tab bar and Global Controls */}
            <div className='flex flex-col gap-4'>
                <div className='flex items-end justify-between w-full'>
                    <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
                    <div className='flex flex-row gap-4 items-center'>
                        <div className="w-64 shrink-0">
                            <Dropdown
                                options={dropdownOptions}
                                onChange={handleConfigChange}
                                selectedId={settings.activeConfigId}
                                placeholder="Select a Config File"
                            />
                        </div>

                        <Button
                            variant="secondary"
                            onClick={handleSave}
                        >
                            Save Config
                        </Button>

                        <Button
                            variant="danger"
                            disabled={settings.activeConfigId === 'new-blank'}
                            onClick={handleDelete}
                        >
                            Delete Config
                        </Button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className='mt-2 min-h-20 bg-white p-6 rounded-3xl border border-mauve-200 shadow-sm
                max-h-[calc(100vh-260px)] overflow-y-auto'>
                    {activeTab && renderTabContent()}
                </div>
            </div>
        </div>
    );
};
