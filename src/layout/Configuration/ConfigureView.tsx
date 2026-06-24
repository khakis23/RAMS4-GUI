// @ts-ignore
import React, { useState } from 'react';
import {Tabs, TabsOption} from "../../components/Tabs";
import { GeneralTab } from "./GeneralTab";


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
                return <GeneralTab />;
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
            <div>
                <h1 className='text-3xl font-bold'>Staus Bar Placeholder</h1>
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
