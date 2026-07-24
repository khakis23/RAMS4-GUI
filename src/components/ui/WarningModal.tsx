import React from 'react';
import { Button } from './button.tsx';

export interface WarningModalProps {
    isOpen: boolean;
    title: string;
    titleColorClass?: string;
    description: string | React.ReactNode;
    confirmText: string;
    cancelText?: string;
    discardText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    onDiscard?: () => void;
    children?: React.ReactNode;
}

export const WarningModal: React.FC<WarningModalProps> = ({
    isOpen,
    title,
    titleColorClass = "text-destructive",
    description,
    confirmText,
    cancelText,
    discardText,
    onConfirm,
    onCancel,
    onDiscard,
    children
}) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={onCancel}
        >
            <div 
                className="bg-white dark:bg-[#1a1715] rounded-md p-6 max-w-md w-full shadow-2xl border border-mauve-150 dark:border-mauve-850 flex flex-col gap-4 text-left animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`flex items-center gap-2.5 font-bold text-lg ${titleColorClass} dark:text-red-400`}>
                    <span>{title}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-mauve-300/90 leading-relaxed">
                    {description}
                </div>

                {children}

                <div className="flex gap-2 justify-end mt-2">
                    {cancelText && (
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onCancel}
                        >
                            {cancelText}
                        </Button>
                    )}
                    {discardText && onDiscard && (
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onDiscard}
                        >
                            {discardText}
                        </Button>
                    )}
                    {confirmText && (
                        <Button 
                            type="button" 
                            variant="destructive" 
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
