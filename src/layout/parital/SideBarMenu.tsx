// @ts-ignore
import React from 'react';
import { Settings } from 'lucide-react';
import { Views } from "../../types/views.ts";
import {NAVIGATION_ITEMS} from "../../constants/navigation.ts";


interface SideBarMenuProps {
    currentView: Views;
    setView: (view: Views) => void;
    setSettingsActive: (active: boolean) => void;
}


export const SideBarMenu = ({currentView, setView, setSettingsActive}: SideBarMenuProps) => {
    return (
        <>
            {/* Spacer that pushes the content to the right */}
            <div className="w-12 h-full shrink-0"></div>
            <aside
                className="group absolute h-full top-0 left-0 w-12 bg-mauve-400 rounded-4xl flex flex-col items-center py-6
                gap-4 z-50 transition-all duration-300 ease-in-out hover:w-64">

                {/* Menu buttons */}
                <nav className="flex flex-col w-full px-3 gap-2 opacity-0 pointer-events-none group-hover:opacity-100
                group-hover:pointer-events-auto transition-opacity duration-300">
                    {NAVIGATION_ITEMS.map((item) => (
                        <a
                            key={item.name}
                            onClick={() => setView(item.view)}
                            className={`w-full px-4 py-2 rounded-xl  hover:bg-white/10 transition-colors
                            duration-200 block whitespace-nowrap text-center text-lg
                            ${currentView === item.view ? 'font-bold text-mauve-900' : 'font-medium text-mauve-800'}`}>
                                {item.name}
                        </a>
                    ))}

                    {/* Settings button */}
                    <div
                        className="absolute bottom-4 left-0 right-0 justify-center flex">
                        <a
                            className="flex items-center justify-center w-10 h-10 rounded-xl text-mauve-800
                            hover:bg-white/10 transition-all duration-200"
                            aria-label="Settings"
                            onClick={() => setSettingsActive(true)}>
                            <Settings className="w-42px h-42px shrink-0"/>
                        </a>
                    </div>
                </nav>
            </aside>
        </>
    )
}