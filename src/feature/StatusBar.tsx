export const StatusBar = () => {
    return (
        <header className="h-20 w-full bg-white border-b border-mauve-200 flex items-center px-6 justify-start shrink-0">
            <div className="flex items-center gap-3">
                {/* Hardware reading card */}
                <div className="flex flex-col justify-center h-14 px-4 bg-mauve-50 border border-mauve-200 rounded-xl text-left shadow-sm">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-mauve-500">Fatigue A</span>
                    <span className="text-sm font-semibold text-mauve-850">0.000 mm</span>
                </div>
            </div>
        </header>
    );
};