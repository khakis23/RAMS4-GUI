// @ts-ignore
import React from 'react';


export interface TabsOption {
    id: string;
    label: string;
}

interface TabsProps {
    tabs: TabsOption[];       // tabs to render
    activeTab: string;
    onChange: (tabID: any) => void;
}

export const Tabs = ({tabs, activeTab, onChange}: TabsProps) => {
    return (
        <div className='flex border-b border-mauve-200 gap-2 pb-2'>
            {tabs.map((tab) => {
                const isActive = tab.id === activeTab;

                return (
                    <button
                key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`py-1.5 px-3 rounded-full transition-all cursor-pointer 
                    hover:bg-mauve-300 duration-200 hover:text-mauve-800 ${
                isActive ? 'text-mauve-800 font-bold' : 'text-mauve-500 font-semibold'
            }`}
            role="tab"
            aria-selected={isActive}
                >
            {tab.label}
            </button>
                );
            })}
        </div>
    );
};
