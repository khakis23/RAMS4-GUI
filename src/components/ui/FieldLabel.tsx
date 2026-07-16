import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.tsx';

interface FieldLabelProps {
    text: string;
    tooltip?: string;
    required?: boolean;
}

export const FieldLabel = ({ text, tooltip, required }: FieldLabelProps) => {
    if (required) {}
    return (
        <div className="flex items-center gap-1.5 text-sm font-medium text-left">
            <span>
                {text}
            </span>
            {tooltip && (
                <TooltipProvider>
                    <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-xs p-2">
                            {tooltip}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );
};
