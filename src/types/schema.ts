
type FieldType =
    'text' |
    'number' |
    'dropdown' |
    'checkboxes';

export type FieldWidth = 'small' | 'medium' | 'large' | 'full';

export interface FieldSchema {
    id: string;
    label: string;
    type: FieldType;
    options?: any[];   // dropdowns, checkboxes, etc.
    defaultValue?: any;
    width?: FieldWidth;
    required?: boolean;
    placeholder?: string;

    // "Previous Edge Pointer"
    // This decides if the field should be shown based on the previous edge's id.
    showIf?: (currentState: Record<string, any>) => boolean;
}