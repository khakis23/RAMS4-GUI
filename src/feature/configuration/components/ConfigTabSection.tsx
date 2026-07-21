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
    headerAction?: React.ReactNode;
    profilesAction?: React.ReactNode;
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
    profilesTitleTooltip,
    headerAction,
    profilesAction
}: ConfigTabSectionProps) => {
    return (
        <div className="flex flex-col gap-8 w-full">
            {/* Header section with title and description */}
            <div className="flex justify-between items-start text-left w-full">
                <div className="flex flex-col">
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
                {headerAction && (
                    <div className="shrink-0 pt-1">
                        {headerAction}
                    </div>
                )}
            </div>

            {/* Children components */}
            {hasChildren(children) && (
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-left">
                    {children}
                </div>
            )}

            {/* Profiles section */}
            {profiles && (
                <div className="w-full text-left mt-2">
                    {profilesTitle && (
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-1.5">
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
                            {profilesAction && (
                                <div className="shrink-0">
                                    {profilesAction}
                                </div>
                            )}
                        </div>
                    )}
                    {profiles}
                </div>
            )}
        </div>
    );
};
