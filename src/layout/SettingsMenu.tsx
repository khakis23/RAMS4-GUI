// @ts-ignore
import React from 'react';
import { X } from 'lucide-react';


interface SettingsMenuProps {
    onClose: () => void;
}


export const SettingsMenu = ({onClose}): SettingsMenuProps => {
    return (
        <div
            className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div
                className="w-180 h-120 bg-mauve-100 rounded-3xl p-6 flex flex-col">
                Settings Placeholder {/* TODO Placeholder text */}

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top=4 right=4 p-1.5 rounded-full text-mauve-800
                    hover:bg-mauve-300 transition-all duration-200 cursor-pointer"
                    aria-label="Close Settings">
                    <X className="w-5 h-5 shrink-0" />
                </button>
            </div>
        </div>
    )
}