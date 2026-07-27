import { Droppable } from '@hello-pangea/dnd';
import { MechTestGroupItem } from './MechTestGroupItem';
import { MechTestCardItem } from './MechTestCardItem';

interface MechTestSequenceListProps {
    droppableId: string;
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
    isDragging?: boolean;
    draggingSourceId?: string | null;
    emptyStateMessage?: string;
    className?: string;
}

export const MechTestSequenceList = ({
    droppableId,
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
    isDragging,
    draggingSourceId,
    emptyStateMessage,
    className = '',
}: MechTestSequenceListProps) => {
    const isCombine = depth === 0 && (draggingSourceId ? draggingSourceId === 'root-sequence' : true);

    return (
        <Droppable droppableId={droppableId} type="CARD" isCombineEnabled={isCombine}>
            {(droppableProvided, droppableSnapshot) => (
                <div
                    ref={droppableProvided.innerRef}
                    {...droppableProvided.droppableProps}
                    className={`flex flex-col gap-4 min-h-[80px] p-3 rounded-md transition-colors ${className}`}
                >
                    {cards.length === 0 && !droppableSnapshot.isDraggingOver && emptyStateMessage ? (
                        <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-mauve-250 bg-mauve-50/10 text-mauve-500 rounded-sm text-center">
                            <p className="text-xs font-semibold">
                                {emptyStateMessage}
                            </p>
                        </div>
                    ) : null}

                    {cards.map((card: any, idx: number) => {
                        const childPrefix = depth === 0 ? `cards.${idx}` : `${namePrefix}.${idx}`;
                        const realCardId = watch(`${childPrefix}.id`) || card.id;

                        if (card.type === 'group') {
                            return (
                                <MechTestGroupItem
                                    key={card.id || idx}
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
                                    isDragging={isDragging}
                                    draggingSourceId={draggingSourceId}
                                />
                            );
                        } else {
                            return (
                                <MechTestCardItem
                                    key={card.id || idx}
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
                    {droppableProvided.placeholder}
                </div>
            )}
        </Droppable>
    );
};
