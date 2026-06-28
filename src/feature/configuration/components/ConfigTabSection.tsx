import React from 'react';

interface ConfigTabSectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export const ConfigTabSection = ({ title, description, children }: ConfigTabSectionProps) => {
    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col text-left">
                <h2 className="text-xl font-bold text-mauve-850">{title}</h2>
                {description && <p className="text-sm text-mauve-600 font-medium">{description}</p>}
            </div>
            {children}
        </div>
    );
};
