import { ReactNode } from 'react';
import { Button } from '../../../components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Trash2 } from 'lucide-react';

interface ProfileCardLayoutProps {
    index: number;
    name: string;
    isComplete: boolean;
    onRemove: () => void;
    modeSelector: ReactNode;
    children: ReactNode;
}

export const ProfileCardLayout = ({
    index,
    name,
    isComplete,
    onRemove,
    modeSelector,
    children
}: ProfileCardLayoutProps) => {
    return (
        <div className="flex flex-col bg-mauve-100/30 rounded-md border border-mauve-250 transition-all duration-100 hover:shadow-sm animate-prepend-card">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={`item-${index}`} className="border-b-0 border-transparent">
                    <div className="flex items-center justify-between p-4 gap-3">
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="w-72 shrink-0">
                                {modeSelector}
                            </div>
                        </div>

                        <AccordionTrigger className="flex-grow py-1.5 px-4 text-xs font-bold text-mauve-850 hover:no-underline [&>svg]:text-mauve-500 shrink min-w-0">
                            <span className="flex items-center gap-2 select-none truncate">
                                <span className="truncate">{name || 'Unnamed Profile'}</span>
                                {!isComplete && (
                                    <span className="text-[11px] font-semibold text-destructive dark:text-red-400 dark:bg-red-500/20 bg-red-500/10 px-1.5 py-0.5 rounded-sm shrink-0 select-none">
                                        (incomplete)
                                    </span>
                                )}
                            </span>
                        </AccordionTrigger>

                        <div className="shrink-0 flex items-center">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={onRemove}
                                className="h-8 w-8 text-mauve-400 dark:text-mauve-500 hover:text-destructive hover:bg-destructive/10 dark:hover:text-red-400 dark:hover:bg-red-500/20 rounded-lg cursor-pointer transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <AccordionContent className="pt-5 pb-0 bg-white border-t border-mauve-150 text-left px-0">
                        {children}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};
