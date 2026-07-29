import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip.tsx';

interface ConfigTabSectionProps {
    title?: string;
    titleTooltip?: string;
    description?: string;
    topContent?: React.ReactNode;
    children?: React.ReactNode;
    profiles?: React.ReactNode;
    profilesTitle?: string;
    profilesTitleTooltip?: string;
    profilesDescription?: string;
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
    topContent,
    children,
    profiles,
    profilesTitle,
    profilesTitleTooltip,
    profilesDescription,
    profilesAction
}: ConfigTabSectionProps) => {
    return (
        <div className="flex flex-col gap-6 w-full text-left">
            {/* Top Content (e.g. Advanced DAQ Config Accordion in TabDAQ) */}
            {topContent && (
                <div className="w-full">
                    {topContent}
                </div>
            )}

            {/* Children components (e.g. SPEC & Aerotech cards side-by-side) */}
            {hasChildren(children) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6 text-left">
                    {children}
                </div>
            )}

            {/* Profiles section */}
            {profiles && (
                <div className="w-full text-left mt-2">
                    {profilesTitle && (
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <h4 className="text-md font-bold text-mauve-850">{profilesTitle}</h4>
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
                                {profilesDescription && (
                                    <p className="text-xs text-mauve-500 font-medium mt-0.5">{profilesDescription}</p>
                                )}
                            </div>
                            {profilesAction && (
                                <div className="shrink-0 pt-0.5">
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



