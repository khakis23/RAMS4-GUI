import { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MechTestSortableItemProps {
    id: string;
    isOverlay?: boolean;
    children: (args: {
        ref: (node: HTMLElement | null) => void;
        handleRef: (node: HTMLElement | null) => void;
        attributes: any;
        listeners: any;
        style: React.CSSProperties;
        isDragging: boolean;
    }) => ReactNode;
}

export const MechTestSortableItem = ({ id, isOverlay = false, children }: MechTestSortableItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id, disabled: isOverlay });

    const style: React.CSSProperties = isOverlay ? {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        cursor: 'grabbing',
    } : {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <>
            {children({
                ref: isOverlay ? () => {} : setNodeRef,
                handleRef: isOverlay ? () => {} : setActivatorNodeRef,
                attributes: isOverlay ? {} : attributes,
                listeners: isOverlay ? {} : listeners,
                style,
                isDragging: isOverlay ? false : isDragging,
            })}
        </>
    );
};
