import React from 'react';


interface ConfigTabSectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

export const ConfigTabSection = ({
    title,
    description,
    children,
    className = ''
}: ConfigTabSectionProps) => {
    return (
        <div className={`flex flex-col gap-6 w-full text-left mb-6 ${className}`}>
            {/* Tab Section Header */}
            <div>
                <h3 className="text-lg font-bold text-mauve-800 border-b border-mauve-100 pb-2">
                    {title}
                </h3>
                {description && (
                    <p className="text-sm font-medium text-mauve-600 mt-1.5">
                        {description}
                    </p>
                )}
            </div>

            {/* Content Area */}
            {children}
        </div>
    );
};
