import React, { useState } from 'react';
import {Tabs, TabsOption} from "../../components/Tabs.tsx";
import { TabGeneral } from "../../feature/configuration/TabGeneral.tsx";
import { TabDAQ } from "../../feature/configuration/TabDAQ.tsx";
import { TabXray } from "../../feature/configuration/TabXray.tsx";
import {Button} from "../../components/Button.tsx";
import {Dropdown} from "../../components/DropDown.tsx";


type TabName = 'general' | 'daq' | 'xray' | 'dic';

export const ConfigureView = () => {
    const tabs: TabsOption[] = [
        { id: 'general', label: 'General' },
        { id: 'daq', label: 'DAQ' },
        { id: 'xray', label: 'X-ray' },
        { id: 'dic', label: 'DIC' },
    ]
    const [activeTab, setActiveTab] = useState<TabName>('general');

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

            {/* Tab bar */}
            <div className='flex flex-col gap-4'>
                <div className='flex items-end justify-between w-full'>
                    <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab}/>
                    <div className='flex flex-row gap-4 items-center'>

                        <Button
                            variant="secondary"
                            onClick={() => console.log('Load Config Button')}>
                            Import Config
                        </Button>

                        <Button
                            variant="primary"
                            onClick={() => console.log('Save Config Button')}>
                            Save Config
                        </Button>

                        <div className="w-64 shrink-0">
                            <Dropdown
                                options={[]}
                                onChange={() => console.log('Config File Dropdown')}
                                selectedId={''}
                                placeholder="Select a Config File"
                            />
                        </div>

                    </div>
                </div>

                {/* Tab Content */}
                <div className='mt-2 min-h-20 bg-white p-6 rounded-3xl border border-mauve-200 shadow-sm
                max-h-[calc(100vh-260px)] overflow-y-auto'>
                    {activeTab && renderTabContent()}
                </div>
            </div>
        </div>
    )
}
