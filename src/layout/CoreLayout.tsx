import React from 'react';
import { SideBarMenu } from './menu/SideBarMenu.tsx';
import { ConfigureView } from './view/ConfigureView.tsx';
import { MechanicalTestBuilder } from '../feature/sequence/MechanicalTestBuilder.tsx';
import { Views } from "../types/views.ts";
import { SettingsMenu } from "./menu/SettingsMenu.tsx";
import { StatusBar } from '../feature/StatusBar.tsx';

export const CoreLayout = () => {
    const [currentView, setCurrentView] = React.useState<Views>('configure');
    const [settingsActive, setSettingsActive] = React.useState<boolean>(false);
    const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark' || saved === 'light') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    React.useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    const renderActiveView = () => {
        switch (currentView) {
            case 'sequenceBuilder':
                return <MechanicalTestBuilder />;
            case 'runSequence':
                return <div>Run Sequence Placeholder</div>;
            case 'manualControl':
                return <div>Manual Control Placeholder</div>;
            case 'configure':
                return <ConfigureView />;
            case 'viewData':
                return <div>View Data Placeholder</div>;
            default:
                return <ConfigureView />;
        }
    };

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
            {/* Left Fixed Sidebar */}
            <SideBarMenu 
                currentView={currentView} 
                setView={setCurrentView} 
                setSettingsActive={setSettingsActive}
                theme={theme}
                toggleTheme={toggleTheme}
            />

            {/* Right Content Area */}
            <div className="flex-1 h-full flex flex-col min-w-0">
                {/* Top Status Bar with View Title */}
                <StatusBar currentView={currentView} />

                {/* Active View Content viewport with padding and scroll */}
                <main className="flex-1 overflow-y-auto p-8 min-h-0">
                    {renderActiveView()}
                </main>
            </div>

            {settingsActive && (
                <SettingsMenu onClose={() => setSettingsActive(false)} />
            )}
        </div>
    );
};