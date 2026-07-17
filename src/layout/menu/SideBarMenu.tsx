import React from 'react';
import { Settings, Sliders, PlayCircle, Cpu, FileJson, BarChart3, Sun, Moon } from 'lucide-react';
import { Views } from "../../types/views.ts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip.tsx";
import { useConfigurationStore } from "@/store/useConfigurationStore.ts";

interface SideBarMenuProps {
    currentView: Views;
    setView: (view: Views) => void;
    setSettingsActive: (active: boolean) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

interface NavItem {
    name: string;
    view: Views;
    icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
    { name: 'Configure', view: 'configure', icon: Sliders },
    { name: 'Sequence Builder', view: 'sequenceBuilder', icon: FileJson },
    { name: 'Run Sequence', view: 'runSequence', icon: PlayCircle },
    { name: 'Manual Control', view: 'manualControl', icon: Cpu },
    { name: 'View Data', view: 'viewData', icon: BarChart3 },
];

export const SideBarMenu = ({ currentView, setView, setSettingsActive, theme, toggleTheme }: SideBarMenuProps) => {
    const { settingsFallbackActive } = useConfigurationStore();

    return (
        <TooltipProvider delayDuration={350}>
            <aside className="w-16 h-full bg-mauve-400 dark:bg-sidebar flex flex-col items-center py-6 justify-between shrink-0 z-50">
                {/* Navigation Items */}
                <nav className="flex flex-col items-center gap-4 w-full">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.view;
                        return (
                            <Tooltip key={item.name}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => setView(item.view)}
                                        className={`w-10 h-10 rounded-md flex items-center justify-center transition-all duration-200 cursor-pointer ${
                                            isActive 
                                                ? 'bg-white text-mauve-850 shadow-sm dark:bg-sidebar-accent dark:text-sidebar-accent-foreground' 
                                                : 'text-mauve-100 hover:bg-white/10 hover:text-white dark:text-sidebar-foreground dark:hover:bg-sidebar-accent/50 dark:hover:text-sidebar-accent-foreground'
                                        }`}
                                        aria-label={item.name}
                                    >
                                        <Icon className="w-5 h-5 shrink-0" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="text-xs p-2">
                                    {item.name}
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </nav>

                {/* Bottom group: Theme Toggle and Settings */}
                <div className="flex flex-col items-center gap-4 w-full">
                    {/* Theme Toggle Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={toggleTheme}
                                className="w-10 h-10 rounded-md flex items-center justify-center text-mauve-100 hover:bg-white/10 hover:text-white dark:text-sidebar-foreground dark:hover:bg-sidebar-accent/50 dark:hover:text-sidebar-accent-foreground transition-all duration-200 cursor-pointer"
                                aria-label="Toggle Theme"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="w-5 h-5 shrink-0" />
                                ) : (
                                    <Moon className="w-5 h-5 shrink-0" />
                                )}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs p-2">
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </TooltipContent>
                    </Tooltip>

                    {/* Settings button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => setSettingsActive(true)}
                                className="w-10 h-10 rounded-md flex items-center justify-center text-mauve-100 hover:bg-white/10 hover:text-white dark:text-sidebar-foreground dark:hover:bg-sidebar-accent/50 dark:hover:text-sidebar-accent-foreground transition-all duration-200 cursor-pointer relative"
                                aria-label="Settings"
                            >
                                <Settings className="w-5 h-5 shrink-0" />
                                {settingsFallbackActive && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full border border-mauve-400" />
                                )}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs p-2">
                            Settings
                        </TooltipContent>
                    </Tooltip>
                </div>
            </aside>
        </TooltipProvider>
    );
};