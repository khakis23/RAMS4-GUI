// @ts-ignore
import React from 'react';
import { SideBarMenu } from './SideBarMenu';
import { HomeMenu } from './HomeMenu';
import { Views } from "../types/Views";


export const CoreLayout = () => {
    const [currentView, setCurrentView] = React.useState<Views>('home');

    const renderActiveView = () => {
        switch (currentView) {
            case 'home':
                return <HomeMenu setView={setCurrentView}/>
            // TODO update returns as implemented
            case 'sequenceBuilder':
                return <div>Sequence Builder Placeholder</div>
            case 'runSequence':
                return <div>Run Sequence Placeholder</div>
            case 'manualControl':
                return <div>Manual Control Placeholder</div>
            case 'configure':
                return <div>Configure Placeholder</div>
            case 'viewData':
                return <div>View Data Placeholder</div>
            default:
                return <HomeMenu setView={setCurrentView}/>
        }
    }

    return (
        <div
            className="flex h-screen w-screen bg-mauve-100 text-mauve-800 overflow-hidden p-8">

            <div
                className="flex h-full w-full bg-mauve-100 relative">
                <SideBarMenu currentView={currentView} setView={setCurrentView}/>

                <main className="flex-1">
                    {renderActiveView()}
                </main>

            </div>
        </div>
    )
}