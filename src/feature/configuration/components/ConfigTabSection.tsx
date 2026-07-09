import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip.tsx';

interface ConfigTabSectionProps {
    title: string;
    titleTooltip?: string;
    description?: string;
    children?: React.ReactNode;
    profiles?: React.ReactNode;
    profilesTitle?: string;
    profilesTitleTooltip?: string;
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
    titleTooltip,
    description,
    children,
    profiles,
    profilesTitle,
    profilesTitleTooltip
}: ConfigTabSectionProps) => {
    return (
        <div className="flex flex-col gap-8 w-full">
            {/* Header section with title and description */}
            <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                    <h2 className="text-xl font-bold text-mauve-850">{title}</h2>
                    {titleTooltip && (
                        <TooltipProvider>
                            <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-mauve-600 hover:text-mauve-800 cursor-pointer transition-colors" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs text-xs p-2">
                                    {titleTooltip}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                {description && <p className="text-sm text-mauve-600 font-medium mt-1">{description}</p>}
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
                    {profilesTitle && (
                        <div className="flex items-center gap-1.5 mb-4">
                            <h4 className="text-md font-bold">{profilesTitle}</h4>
                            {profilesTitleTooltip && (
                                <TooltipProvider>
                                    <Tooltip delayDuration={200}>
                                        <TooltipTrigger asChild>
                                            <Info className="h-3.5 w-3.5 text-mauve-600 hover:text-mauve-800 cursor-pointer transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs text-xs p-2">
                                            {profilesTitleTooltip}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    )}
                    {profiles}
                </div>
            )}
        </div>
    );
};
