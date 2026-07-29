import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { MechTestGroupItem } from './MechTestGroupItem';
import { MechTestCardItem } from './MechTestCardItem';

interface MechTestSortableListProps {
    containerId: string;
    cards: any[];
    namePrefix: string;
    depth: number;
    register: any;
    errors: any;
    control: any;
    watch: any;
    setValue: any;
    reset?: any;
    removeCard: (index: number) => void;
    duplicateCard: (index: number) => void;
    moveOutOfGroup?: (index: number) => void;
    emptyStateMessage?: string;
    isDraggingFromGroup?: boolean;
    className?: string;
}

export const MechTestSortableList = ({
    containerId,
    cards,
    namePrefix,
    depth,
    register,
    errors,
    control,
    watch,
    setValue,
    reset,
    removeCard,
    duplicateCard,
    moveOutOfGroup,
    emptyStateMessage,
    isDraggingFromGroup = false,
    className = ''
}: MechTestSortableListProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: containerId,
    });

    const itemIds = cards.map((c, i) => {
        const childPrefix = depth === 0 ? `cards.${i}` : `${namePrefix}.${i}`;
        return watch(`${childPrefix}.id`) || c.id || `card-${depth}-${i}`;
    });

    const shouldHighlight = isOver && (depth > 0 || isDraggingFromGroup);

    return (
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <div
                ref={setNodeRef}
                className={`flex flex-col gap-2.5 min-h-[80px] p-2.5 ${depth === 0 ? 'pb-20' : 'pb-6'} rounded-md transition-colors ${
                    shouldHighlight ? 'bg-mauve-200/20 dark:bg-mauve-900/20' : ''
                } ${className}`}
            >
                {cards.length === 0 ? (
                    isOver ? (
                        <div className="h-20 border-2 border-dashed border-mauve-400 dark:border-mauve-700 bg-mauve-200/30 dark:bg-mauve-900/30 rounded-md flex items-center justify-center gap-2 text-mauve-700 dark:text-mauve-300 font-semibold text-xs transition-all">
                            <Plus className="h-4 w-4" />
                            <span>{depth === 0 ? "Move Step to Main Sequence" : "Drop Step Into Group"}</span>
                        </div>
                    ) : emptyStateMessage ? (
                        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-mauve-250 bg-mauve-50/20 dark:bg-black/10 text-mauve-500 rounded-md text-center transition-all">
                            <Plus className="h-4 w-4 mb-0.5 text-mauve-400" />
                            <p className="text-xs font-semibold">{emptyStateMessage}</p>
                        </div>
                    ) : null
                ) : null}

                {cards.map((card: any, idx: number) => {
                    const childPrefix = depth === 0 ? `cards.${idx}` : `${namePrefix}.${idx}`;
                    const realCardId = itemIds[idx];

                    if (card.type === 'group') {
                        return (
                            <MechTestGroupItem
                                key={realCardId}
                                cardIdProp={realCardId}
                                index={idx}
                                namePrefix={childPrefix}
                                depth={depth + 1}
                                register={register}
                                errors={errors}
                                control={control}
                                watch={watch}
                                setValue={setValue}
                                reset={reset}
                                removeCard={() => removeCard(idx)}
                                duplicateCard={duplicateCard}
                            />
                        );
                    } else {
                        return (
                            <MechTestCardItem
                                key={realCardId}
                                cardIdProp={realCardId}
                                index={idx}
                                namePrefix={childPrefix}
                                register={register}
                                errors={errors}
                                control={control}
                                watch={watch}
                                setValue={setValue}
                                removeCard={() => removeCard(idx)}
                                duplicateCard={duplicateCard}
                                moveOutOfGroup={moveOutOfGroup ? () => moveOutOfGroup(idx) : undefined}
                            />
                        );
                    }
                })}

                {cards.length > 0 && isOver && (depth > 0 || isDraggingFromGroup) && (
                    <div className="h-14 border-2 border-dashed border-mauve-400 dark:border-mauve-700 bg-mauve-200/30 dark:bg-mauve-900/30 rounded-md flex items-center justify-center gap-2 text-mauve-700 dark:text-mauve-300 font-semibold text-xs transition-all">
                        <Plus className="h-4 w-4" />
                        <span>{depth === 0 ? "Move Step to Main Sequence" : "Drop Step Here"}</span>
                    </div>
                )}
            </div>
        </SortableContext>
    );
};
