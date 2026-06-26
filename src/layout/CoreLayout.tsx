import React from 'react';
import { SideBarMenu } from './parital/SideBarMenu.tsx';
import { HomeView } from './view/HomeView.tsx';
import { ConfigureView } from './view/ConfigureView.tsx';
import { Views } from "../types/views.ts";
import { SettingsMenu } from "./parital/SettingsMenu.tsx";


export const CoreLayout = () => {
    const [currentView, setCurrentView] = React.useState<Views>('home');
    const [settingsActive, setSettingsActive] = React.useState<boolean>(false);

    const renderActiveView = () => {
        switch (currentView) {
            case 'home':
                return <HomeView setView={setCurrentView}/>
            // TODO update returns as implemented
            case 'sequenceBuilder':
                return <div>Sequence Builder Placeholder</div>
            case 'runSequence':
                return <div>Run Sequence Placeholder</div>
            case 'manualControl':
                return <div>Manual Control Placeholder</div>
            case 'configure':
                return <ConfigureView />
            case 'viewData':
                return <div>View Data Placeholder</div>
            default:
                return <HomeView setView={setCurrentView}/>
        }
    }

    return (
        <div
            className="flex h-screen w-screen bg-mauve-100 text-mauve-800 overflow-hidden p-8">

            <div
                className="flex h-full w-full bg-mauve-100 relative">
                <SideBarMenu currentView={currentView} setView={setCurrentView} setSettingsActive={setSettingsActive}/>

                <main className="flex-1 h-full">
                    {renderActiveView()}

                    {settingsActive &&
                    <SettingsMenu onClose={() => setSettingsActive(false)}/>}
                </main>

            </div>
        </div>
    )
}