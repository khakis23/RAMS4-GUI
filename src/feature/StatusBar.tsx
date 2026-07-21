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
        <header className="h-16 w-full bg-white border-b border-mauve-200 flex items-center px-4 md:px-6 justify-between shrink-0">
            {/* TODO PLACEHOLDERS: Left Hardware Reading Panel */}
            <div className="px-2 flex items-center gap-1.5 sm:gap-3 md:gap-4 lg:gap-6 min-w-0 overflow-hidden">

                <div className="flex flex-col justify-center h-11 px-2 sm:px-3 md:px-4 bg-mauve-50 border border-mauve-200 rounded-sm text-left min-w-0 shrink">
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-bold text-mauve-500 truncate leading-none mb-0.5">Tension</span>
                    <span className="text-[11px] sm:text-xs font-semibold text-mauve-850 truncate leading-none">0.000 mm</span>
                </div>

                <div className="flex flex-col justify-center h-11 px-2 sm:px-3 md:px-4 bg-mauve-50 border border-mauve-200 rounded-sm text-left min-w-0 shrink">
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-bold text-mauve-500 truncate leading-none mb-0.5">Fatigue A</span>
                    <span className="text-[11px] sm:text-xs font-semibold text-mauve-850 truncate leading-none">0.000 mm</span>
                </div>

                <div className="flex flex-col justify-center h-11 px-2 sm:px-3 md:px-4 bg-mauve-50 border border-mauve-200 rounded-sm text-left min-w-0 shrink">
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-bold text-mauve-500 truncate leading-none mb-0.5">Fatigue B</span>
                    <span className="text-[11px] sm:text-xs font-semibold text-mauve-850 truncate leading-none">0.000 mm</span>
                </div>

                <div className="flex flex-col justify-center h-11 px-2 sm:px-3 md:px-4 bg-mauve-50 border border-mauve-200 rounded-sm text-left min-w-0 shrink">
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-bold text-mauve-500 truncate leading-none mb-0.5">Rotation A</span>
                    <span className="text-[11px] sm:text-xs font-semibold text-mauve-850 truncate leading-none">0.000 mm</span>
                </div>

                <div className="flex flex-col justify-center h-11 px-2 sm:px-3 md:px-4 bg-mauve-50 border border-mauve-200 rounded-sm text-left min-w-0 shrink">
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-bold text-mauve-500 truncate leading-none mb-0.5">Rotation B</span>
                    <span className="text-[11px] sm:text-xs font-semibold text-mauve-850 truncate leading-none">0.000 mm</span>
                </div>
            </div>

            {/* Right Active Page Title Block */}
            <div className="flex items-center gap-4 h-11 pl-4 md:pl-6 border-l border-mauve-150 shrink-0">
                <span className="text-xs sm:text-sm font-bold text-mauve-850 uppercase tracking-wide">
                    {VIEW_NAMES[currentView] || 'Configure'}
                </span>
            </div>
        </header>
    );
};