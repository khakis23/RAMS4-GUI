// @ts-ignore
import React from 'react';
import {NAVIGATION_ITEMS} from "../constants/navigation";
import {Views} from "../types/Views";


interface HomeMenuProps {
    setView: (view: Views) => void;
}


export const HomeView = ({setView}: HomeMenuProps) => {
    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">

            {/* Status Bar TODO placeholder */}
            <div className="relative w-full h-36 bg-mauve-100 rounded-3xl p-6 flex items-center justify-between shadow-sm
                                border border-mauve-200">
                <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-green-500 animate-pulse">
                    </span>
                    <span className="text-md font-medium text-mauve-800">
                        Connected
                    </span>
                </div>
                <h2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-semibold text-mauve-800">
                    Status Bar Placeholder
                </h2>
            </div>

            {/* Navigation button boxes */}
            <div className="grid grid-cols-3 gap-6">
                {NAVIGATION_ITEMS.map((item) => (
                    <button
                    key={item.name}
                    onClick={() => setView(item.view)}
                    className="flex flex-col p-6 h-48 bg-mauve-100 border border-mauve-200 rounded-3xl
                    text-center cursor-pointer transition-all duration-300 ease-out shadow-md shadow-mauve-200
                    hover:-translate-y-1 hover:shadow-xl hover:shadow-mauve-800/10 justify-center">
                        {/* Button name / icon */}
                        <h2 className="text-lg font-semibold text-mauve-800">
                            {item.name}
                        </h2>
                        <p className="text-sm font-medium text-mauve-600">
                            {item.desc}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    )
}
