import { Views } from '../types/views.ts';

interface StatusBarProps {
    currentView: Views;
}

const VIEW_NAMES: Record<Views, string> = {
    home: 'Home',
    sequenceBuilder: 'Sequence Builder',
    runSequence: 'Run Sequence',
    manualControl: 'Manual Control',
    configure: 'Configure',
    viewData: 'View Data'
};

export const StatusBar = ({ currentView }: StatusBarProps) => {
    return (
        <header className="h-20 w-full bg-white border-b border-mauve-200 flex items-center px-4 md:px-6 justify-between shrink-0">
            {/* TODO PLACEHOLDERS: Left Hardware Reading Panel */}
            <div className="px-2 flex items-center gap-1.5 sm:gap-3 md:gap-4 lg:gap-6 min-w-0 overflow-hidden">

                <div className="flex flex-col justify-center h-14 px-2 sm:px-3 md:px-4 bg-mauve-50 border border-mauve-200 rounded-sm text-left min-w-0 shrink">
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-wider font-bold text-mauve-500 truncate">Tension</span>
                    <span className="text-xs sm:text-sm font-semibold text-mauve-850 truncate">0.000 mm</span>
                </div>

                <div className="flex flex-col justify-center h-14 px-2 sm:px-3 md:px-4 bg-mauve-50 border border-mauve-200 rounded-sm text-left min-w-0 shrink">
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-wider font-bold text-mauve-500 truncate">Fatigue A</span>
                    <span className="text-xs sm:text-sm font-semibold text-mauve-850 truncate">0.000 mm</span>
                </div>

                <div className="flex flex-col justify-center h-14 px-2 sm:px-3 md:px-4 bg-mauve-50 border border-mauve-200 rounded-sm text-left min-w-0 shrink">
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-wider font-bold text-mauve-500 truncate">Fatigue B</span>
                    <span className="text-xs sm:text-sm font-semibold text-mauve-850 truncate">0.000 mm</span>
                </div>

                <div className="flex flex-col justify-center h-14 px-2 sm:px-3 md:px-4 bg-mauve-50 border border-mauve-200 rounded-sm text-left min-w-0 shrink">
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-wider font-bold text-mauve-500 truncate">Rotation A</span>
                    <span className="text-xs sm:text-sm font-semibold text-mauve-850 truncate">0.000 mm</span>
                </div>

                <div className="flex flex-col justify-center h-14 px-2 sm:px-3 md:px-4 bg-mauve-50 border border-mauve-200 rounded-sm text-left min-w-0 shrink">
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-wider font-bold text-mauve-500 truncate">Rotation B</span>
                    <span className="text-xs sm:text-sm font-semibold text-mauve-850 truncate">0.000 mm</span>
                </div>
            </div>

            {/* Right Active Page Title Block */}
            <div className="flex items-center gap-4 h-14 pl-4 md:pl-6 border-l border-mauve-150 shrink-0">
                <span className="text-sm md:text-md font-bold text-mauve-850 uppercase tracking-wide">
                    {VIEW_NAMES[currentView] || 'Configure'}
                </span>
            </div>
        </header>
    );
};