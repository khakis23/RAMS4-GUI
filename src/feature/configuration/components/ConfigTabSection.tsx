import React from 'react';

interface ConfigTabSectionProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
    profiles?: React.ReactNode;
    profilesTitle?: string;
}

const hasChildren = (children: React.ReactNode): boolean => {
    if (!children) return false;
    const childArray = React.Children.toArray(children);
    return childArray.some(child => {
        if (React.isValidElement(child) && child.type === React.Fragment) {
            return React.Children.count((child.props as any).children) > 0;
        }
        return child !== null && child !== undefined && child !== '';
    });
};

export const ConfigTabSection = ({
    title,
    description,
    children,
    profiles,
    profilesTitle
}: ConfigTabSectionProps) => {
    return (
        <div className="flex flex-col gap-8 w-full">
            {/* Header section with title and description */}
            <div className="flex flex-col text-left">
                <h2 className="text-xl font-bold text-mauve-850">{title}</h2>
                {description && <p className="text-sm text-mauve-600 font-medium">{description}</p>}
            </div>

            {/* Children components */}
            {hasChildren(children) && (
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-left">
                    {children}
                </div>
            )}

            {/* Profiles section */}
            {profiles && (
                <div className="w-full border rounded-lg p-6 bg-card text-left shadow-sm mt-4">
                    {profilesTitle && <h4 className="text-md font-bold mb-4">{profilesTitle}</h4>}
                    {profiles}
                </div>
            )}
        </div>
    );
};
