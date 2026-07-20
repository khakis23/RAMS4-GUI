import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2, Plus, Copy, Ungroup, TriangleRight, ScanEye, AudioWaveform, Gauge, Group } from 'lucide-react';
import { MechTestCardItem } from './MechTestCardItem';
import { useConfigurationStore } from '@/store/useConfigurationStore';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { rampSchema, takeSchema, dwellSchema, cycleSchema, takeWhileSchema } from '../profileSchemas/mechTestSchema';

interface MechTestGroupItemProps {
    index: number;
    namePrefix: string;
    depth: number; // Nesting depth: 1 or 2
    register: any;
    errors: any;
    control: any;
    watch: any;
    setValue: any;
    removeCard: (index: number) => void;
    duplicateCard: (index: number) => void;
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragEnd: () => void;
    isDragging: boolean;
}

export const MechTestGroupItem = ({
    index,
    namePrefix,
    depth,
    register,
    errors,
    control,
    watch,
    setValue,
    removeCard,
    duplicateCard,
    onDragStart,
    onDragOver,
    onDragEnd,
    isDragging
}: MechTestGroupItemProps) => {
    const { draft } = useConfigurationStore();
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // Watch child cards inside this group
    const childCards = watch(`${namePrefix}.data.cards`) || [];

    const isCardComplete = (card: any, prefix: string): boolean => {
        if (card.type === 'ramp') {
            const data = watch(`${prefix}.data`) || {};
            return rampSchema.safeParse(data).success;
        } else if (card.type === 'take') {
            const data = watch(`${prefix}.data`) || {};
            return takeSchema.safeParse(data).success;
        } else if (card.type === 'dwell') {
            const data = watch(`${prefix}.data`) || {};
            return dwellSchema.safeParse(data).success;
        } else if (card.type === 'cycle') {
            const data = watch(`${prefix}.data`) || {};
            return cycleSchema.safeParse(data).success;
        } else if (card.type === 'takeWhile') {
            const data = watch(`${prefix}.data`) || {};
            return takeWhileSchema.safeParse(data).success;
        } else if (card.type === 'group') {
            const innerCards = watch(`${prefix}.data.cards`) || [];
            if (innerCards.length === 0) return false;
            return innerCards.every((c: any, i: number) => 
                isCardComplete(c, `${prefix}.data.cards.${i}`)
            );
        }
        return false;
    };

    const isGroupComplete = childCards.length > 0 && childCards.every((card: any, idx: number) => 
        isCardComplete(card, `${namePrefix}.data.cards.${idx}`)
    );

    const renderCardHeaderSummary = (card: any, prefix: string): React.ReactNode => {
        if (card.type === 'ramp') {
            const axis = watch(`${prefix}.data.axis`);
            const controlMode = watch(`${prefix}.data.control`);
            const content = (axis && controlMode) ? `${axis}, ${controlMode}` : 'Unconfigured';
            return (
                <span className="inline-flex items-center gap-1">
                    <TriangleRight className="h-3.5 w-3.5 text-mauve-500 dark:text-mauve-600 shrink-0 inline align-middle" />
                    <span className="align-middle">[{content}]</span>
                </span>
            );
        } else if (card.type === 'take') {
            const profileID = watch(`${prefix}.data.profileID`);
            const xrayProfiles = draft?.xrayProfiles || [];
            const profile = xrayProfiles.find((p: any) => p.id === profileID);
            const content = profile ? (profile.name || 'Unnamed') : 'Unconfigured';
            return (
                <span className="inline-flex items-center gap-1">
                    <ScanEye className="h-3.5 w-3.5 text-mauve-500 dark:text-mauve-600 shrink-0 inline align-middle" />
                    <span className="align-middle">[{content}]</span>
                </span>
            );
        } else if (card.type === 'dwell') {
            const axis = watch(`${prefix}.data.axis`);
            const controlMode = watch(`${prefix}.data.control`);
            const content = (axis && controlMode) ? `${axis}, ${controlMode}` : 'Unconfigured';
            return (
                <span className="inline-flex items-center gap-1">
                    <Gauge className="h-3.5 w-3.5 text-mauve-500 dark:text-mauve-600 shrink-0 inline align-middle" />
                    <span className="align-middle">[{content}]</span>
                </span>
            );
        } else if (card.type === 'cycle') {
            const axis = watch(`${prefix}.data.axis`);
            const controlMode = watch(`${prefix}.data.control`);
            const content = (axis && controlMode) ? `${axis}, ${controlMode}` : 'Unconfigured';
            return (
                <span className="inline-flex items-center gap-1">
                    <AudioWaveform className="h-3.5 w-3.5 text-mauve-500 dark:text-mauve-600 shrink-0 inline align-middle" />
                    <span className="align-middle">[{content}]</span>
                </span>
            );
        } else if (card.type === 'takeWhile') {
            const profileID = watch(`${prefix}.data.take.data.profileID`);
            const xrayProfiles = draft?.xrayProfiles || [];
            const profile = xrayProfiles.find((p: any) => p.id === profileID);
            const takeContent = profile ? (profile.name || 'Unnamed') : 'Unconfigured';

            const stepType = watch(`${prefix}.data.step.type`) || 'ramp';
            const stepAxis = watch(`${prefix}.data.step.data.axis`);
            const stepControl = watch(`${prefix}.data.step.data.control`);
            const stepContent = (stepAxis && stepControl) ? `${stepAxis}, ${stepControl}` : 'Unconfigured';

            const StepIcon = stepType === 'ramp' ? TriangleRight : stepType === 'dwell' ? Gauge : AudioWaveform;

            return (
                <span className="inline-flex items-center gap-1">
                    <ScanEye className="h-3.5 w-3.5 text-mauve-500 dark:text-mauve-600 shrink-0 inline align-middle" />
                    <span className="align-middle">[{takeContent}]</span>
                    <span className="text-mauve-400 dark:text-mauve-600 mx-0.5 align-middle">+</span>
                    <StepIcon className="h-3.5 w-3.5 text-mauve-500 dark:text-mauve-600 shrink-0 inline align-middle" />
                    <span className="align-middle">[{stepContent}]</span>
                </span>
            );
        } else if (card.type === 'group') {
            const innerCards = watch(`${prefix}.data.cards`) || [];
            return (
                <span className="inline-flex items-center gap-1">
                    <Group className="h-3.5 w-3.5 text-mauve-500 dark:text-mauve-600 shrink-0 inline align-middle" />
                    <span className="inline-flex items-center gap-0.5 align-middle">
                        [
                        {innerCards.length === 0 ? (
                            <span>Empty</span>
                        ) : (
                            innerCards.map((c: any, i: number) => (
                                <span key={c.id || i} className="inline-flex items-center">
                                    {renderCardHeaderSummary(c, `${prefix}.data.cards.${i}`)}
                                    {i < innerCards.length - 1 && <span className="text-mauve-400 dark:text-mauve-600 mr-1.5 align-middle">,</span>}
                                </span>
                            ))
                        )}
                        ]
                    </span>
                </span>
            );
        }
        return null;
    };

    const getGroupHeaderSummary = () => {
        if (childCards.length === 0) return <span>Empty Group</span>;
        return (
            <span className="inline-flex items-center gap-1 flex-wrap align-middle">
                {childCards.map((card: any, idx: number) => (
                    <span key={card.id || idx} className="inline-flex items-center gap-0.5 align-middle">
                        {renderCardHeaderSummary(card, `${namePrefix}.data.cards.${idx}`)}
                        {idx < childCards.length - 1 && <span className="text-mauve-400 dark:text-mauve-600 mr-1.5 align-middle">,</span>}
                    </span>
                ))}
            </span>
        );
    };

    // Inner Drag & Drop Handlers for children reordering
    const handleInnerDragStart = (idx: number, e: React.DragEvent) => {
        e.stopPropagation();
        setDraggedIndex(idx);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(idx));
    };

    const handleInnerDragOver = (idx: number, e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedIndex === null || draggedIndex === idx) return;
        
        const updatedCards = Array.from(childCards);
        const [removed] = updatedCards.splice(draggedIndex, 1);
        updatedCards.splice(idx, 0, removed);
        setValue(`${namePrefix}.data.cards`, updatedCards, { shouldDirty: true, shouldValidate: true });
        setDraggedIndex(idx);
    };

    const handleInnerDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleAddCard = (type: 'ramp' | 'group') => {
        const newCard = {
            id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            data: type === 'group' ? { cards: [] } : {}
        };
        setValue(`${namePrefix}.data.cards`, [...childCards, newCard], { shouldDirty: true, shouldValidate: true });
    };

    const handleUngroup = () => {
        const parts = namePrefix.split('.');
        if (parts.length <= 2) {
            const parentCards = watch('cards') || [];
            const updatedParentCards = Array.from(parentCards);
            updatedParentCards.splice(index, 1, ...childCards);
            setValue('cards', updatedParentCards, { shouldDirty: true, shouldValidate: true });
        } else {
            const parentPath = parts.slice(0, -1).join('.');
            const parentCards = watch(parentPath) || [];
            const updatedParentCards = Array.from(parentCards);
            updatedParentCards.splice(index, 1, ...childCards);
            setValue(parentPath, updatedParentCards, { shouldDirty: true, shouldValidate: true });
        }
    };

    const cloneCardWithNewIds = (card: any): any => {
        const newId = card.type === 'group'
            ? `card-group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            : `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        if (card.type === 'group' && card.data?.cards) {
            return {
                ...card,
                id: newId,
                data: {
                    ...card.data,
                    cards: card.data.cards.map((c: any) => cloneCardWithNewIds(c))
                }
            };
        }

        return {
            ...card,
            id: newId,
            data: JSON.parse(JSON.stringify(card.data || {}))
        };
    };

    const duplicateChildCard = (idx: number) => {
        const originalCard = childCards[idx];
        if (!originalCard) return;
        const duplicatedCard = cloneCardWithNewIds(originalCard);

        const updatedCards = [...childCards];
        updatedCards.splice(idx + 1, 0, duplicatedCard);
        setValue(`${namePrefix}.data.cards`, updatedCards, { shouldDirty: true, shouldValidate: true });
    };

    // Determine progressive shading background color
    const shadingBg = depth === 1 
        ? 'bg-mauve-100 dark:bg-black/15 border-l-2 border-l-mauve-400'
        : 'bg-mauve-200 dark:bg-black/30 border-l-2 border-l-primary/60';

    const cardId = watch(`${namePrefix}.id` as any) as string || `group-${index}`;

    return (
        <div 
            draggable={true}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            className={`flex flex-col border rounded-md transition-all duration-100 ${
                depth === 1 ? 'bg-mauve-100 dark:bg-black/5' : 'bg-mauve-200 dark:bg-black/15'
            } ${isDragging ? 'opacity-50 border-dashed border-mauve-400 shadow-lg' : 'border-mauve-200 hover:shadow-sm'}`}
        >
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={cardId} className="border-b-0">
                    {/* Header bar */}
                    <div className={`flex items-center justify-between p-4 ${shadingBg} gap-3`}>
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="text-mauve-300 cursor-grab active:cursor-grabbing hover:text-mauve-500 transition-colors p-1">
                                <GripVertical className="h-4 w-4 shrink-0" />
                            </div>

                            <span className="text-xs font-bold text-mauve-500 w-18 shrink-0">
                                {depth === 1 ? 'Group' : 'Sub-Group'} #{index + 1}
                            </span>
                        </div>

                        {/* Title Accordion Trigger */}
                        <AccordionTrigger className="flex-grow py-1.5 px-4 text-xs font-bold text-mauve-850 hover:no-underline [&>svg]:text-mauve-500 shrink min-w-0">
                            <span className="flex items-center gap-2 select-none truncate pr-4">
                                <span className="truncate">{getGroupHeaderSummary()}</span>
                                {!isGroupComplete && (
                                    <span className="text-[11px] font-semibold text-destructive dark:text-red-400 bg-red-500/10 dark:bg-red-500/20 px-1.5 py-0.5 rounded-sm shrink-0 select-none">
                                        (incomplete)
                                    </span>
                                )}
                            </span>
                        </AccordionTrigger>

                        {/* Actions group: Ungroup & Delete */}
                        <div className="shrink-0 flex items-center gap-1.5">
                            <TooltipProvider>
                                <Tooltip delayDuration={200}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleUngroup}
                                            className="h-8 w-8 text-mauve-400 dark:text-mauve-500 hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <Ungroup className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs text-xs p-2 bg-popover text-popover-foreground rounded shadow-md border border-mauve-150">
                                        Ungroup
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip delayDuration={200}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => duplicateCard(index)}
                                            className="h-8 w-8 text-mauve-400 dark:text-mauve-500 hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs text-xs p-2 bg-popover text-popover-foreground rounded shadow-md border border-mauve-150">
                                        Duplicate
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeCard(index)}
                                className="h-8 w-8 text-mauve-400 dark:text-mauve-500 hover:text-destructive hover:bg-destructive/10 dark:hover:text-red-400 dark:hover:bg-red-500/20 rounded-lg cursor-pointer transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Subsequence Content */}
                    <AccordionContent className={`p-5 border-t border-mauve-150 pb-5 text-left ${
                        depth === 1 ? 'bg-mauve-50/40 dark:bg-black/10' : 'bg-mauve-100/50 dark:bg-black/25'
                    }`}>
                        {childCards.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 border border-dashed border-mauve-200 rounded-sm bg-mauve-50/5 mb-4 text-center">
                                <p className="text-xs text-mauve-500">No steps in this group.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 mb-5">
                                {childCards.map((card: any, idx: number) => {
                                    const childPrefix = `${namePrefix}.data.cards.${idx}`;
                                    if (card.type === 'group') {
                                        return (
                                            <MechTestGroupItem
                                                key={card.id}
                                                index={idx}
                                                namePrefix={childPrefix}
                                                depth={2}
                                                register={register}
                                                errors={errors}
                                                control={control}
                                                watch={watch}
                                                setValue={setValue}
                                                removeCard={() => {
                                                    const updatedCards = childCards.filter((_: any, i: number) => i !== idx);
                                                    setValue(`${namePrefix}.data.cards`, updatedCards, { shouldDirty: true, shouldValidate: true });
                                                }}
                                                duplicateCard={duplicateChildCard}
                                                onDragStart={(e) => handleInnerDragStart(idx, e)}
                                                onDragOver={(e) => handleInnerDragOver(idx, e)}
                                                onDragEnd={handleInnerDragEnd}
                                                isDragging={draggedIndex === idx}
                                            />
                                        );
                                    } else {
                                        return (
                                            <MechTestCardItem
                                                key={card.id}
                                                index={idx}
                                                namePrefix={childPrefix}
                                                register={register}
                                                errors={errors}
                                                control={control}
                                                watch={watch}
                                                setValue={setValue}
                                                removeCard={() => {
                                                    const updatedCards = childCards.filter((_: any, i: number) => i !== idx);
                                                    setValue(`${namePrefix}.data.cards`, updatedCards, { shouldDirty: true, shouldValidate: true });
                                                }}
                                                duplicateCard={duplicateChildCard}
                                                onDragStart={(e) => handleInnerDragStart(idx, e)}
                                                onDragOver={(e) => handleInnerDragOver(idx, e)}
                                                onDragEnd={handleInnerDragEnd}
                                                isDragging={draggedIndex === idx}
                                            />
                                        );
                                    }
                                })}
                            </div>
                        )}

                        {/* Action buttons inside group */}
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => handleAddCard('ramp')}
                                className="h-7 px-3 text-xs font-semibold rounded-lg bg-white border border-mauve-200 hover:bg-mauve-50 text-mauve-700 flex items-center gap-1 cursor-pointer"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add Step
                            </Button>

                            {depth < 2 && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => handleAddCard('group')}
                                    className="h-7 px-3 text-xs font-semibold rounded-lg bg-white border border-mauve-200 hover:bg-mauve-50 text-mauve-700 flex items-center gap-1 cursor-pointer"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <Group className="h-3.5 w-3.5 ml-0.5" />
                                    Add Group
                                </Button>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};
