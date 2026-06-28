
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

/**
 * Checks if all currently visible required fields in a schema are filled.
 */
export const isProfileValid = (data: Record<string, any>, schema: FieldSchema[]): boolean => {
    return schema.every((field) => {
        // Check if the field is conditionally visible
        const isVisible = field.showIf ? field.showIf(data) : true;
        if (!isVisible) {
            return true; // Hidden fields are automatically valid/ignored
        }

        // Check if the field is required
        const isRequired = field.required !== false;
        if (isRequired) {
            const value = data[field.id];

            // Treat undefined, null, and empty strings as unfilled
            return value !== undefined && value !== null && String(value).trim() !== '';
        }

        return true;
    });
};