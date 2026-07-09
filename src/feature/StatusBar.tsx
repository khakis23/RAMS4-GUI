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
        <header className="h-20 w-full bg-white border-b border-mauve-200 flex items-center px-6 justify-between shrink-0">
            {/* Left Hardware Reading Panel */}
            <div className="flex items-center gap-3">
                <div className="flex flex-col justify-center h-14 px-4 bg-mauve-50 border border-mauve-200 rounded-xl text-left shadow-sm">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-mauve-500">Fatigue A</span>
                    <span className="text-sm font-semibold text-mauve-850">0.000 mm</span>
                </div>
            </div>

            {/* Right Active Page Title Block */}
            <div className="flex items-center gap-4 h-14 pl-6 border-l border-mauve-150">
                <span className="text-md font-bold text-mauve-850 uppercase tracking-wide">
                    {VIEW_NAMES[currentView] || 'Configure'}
                </span>
            </div>
        </header>
    );
};