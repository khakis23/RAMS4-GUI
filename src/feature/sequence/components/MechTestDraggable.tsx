import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';

interface MechTestDraggableProps {
    draggableId: string;
    index: number;
    children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => ReactNode;
}

export const MechTestDraggable = ({
    draggableId,
    index,
    children,
}: MechTestDraggableProps) => {
    return (
        <Draggable draggableId={draggableId} index={index}>
            {(provided, snapshot) => {
                const content = children(provided, snapshot);
                if (snapshot.isDragging) {
                    return createPortal(content, document.body);
                }
                return content;
            }}
        </Draggable>
    );
};
