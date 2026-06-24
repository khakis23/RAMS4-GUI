import React, { useState } from 'react';
import {Tabs, TabsOption} from "../components/Tabs.tsx";
import { TabGeneral } from "../features/Configuration/TabGeneral.tsx";


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
                return <p className='text-lg font-medium text-mauve-800'>DAQ Settings Content</p>;
            case 'xray':
                return <p className='text-lg font-medium text-mauve-800'>X-ray Settings Content</p>;
            case 'dic':
                return <p className='text-lg font-medium text-mauve-800'>DIC Settings Content</p>;
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

            <div className='flex flex-col gap-4'>
                {/* 4. Separate Tab Bar (holds the border-bottom line) */}
                <div className='border-b border-mauve-200 pb-2 w-full'>
                    <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab}/>
                </div>
                {/* 5. Separate Content Box (renders below the tab bar) */}
                <div className='mt-2 min-h-20 bg-white p-6 rounded-3xl border border-mauve-200 shadow-sm'>
                    {activeTab && renderTabContent()}
                </div>
            </div>
        </div>
    )
}
