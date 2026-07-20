import { useEffect } from 'react';

interface UseFormAutoSaveProps<T, M> {
    watchedValues: any;
    storeDraft: T;
    updateDraft: (data: Partial<T>) => void;
    mapValues?: (watched: any) => M; // Optional mapping before comparison/save
    disabled?: boolean;
}

const sanitizeObject = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
    } else if (obj !== null && typeof obj === 'object') {
        const cleanObj: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const val = obj[key];
                if (val === undefined || (typeof val === 'number' && isNaN(val))) {
                    cleanObj[key] = null;
                } else {
                    cleanObj[key] = sanitizeObject(val);
                }
            }
        }
        return cleanObj;
    }
    return obj;
};

/**
 * Syncs React Hook Form values to the Zustand store draft on every change,
 * regardless of validation state. This allows partial/in-progress data to
 * persist across tab switches so the user never loses their work.
 * Prevents infinite rendering loops by verifying values have actually changed.
 */
export const useFormAutoSave = <T, M = T>({
    watchedValues,
    storeDraft,
    updateDraft,
    mapValues,
    disabled
}: UseFormAutoSaveProps<T, M>) => {
    useEffect(() => {
        if (disabled) return;

        // If custom mapper is provided, transform the watched form values first
        let mappedValues = mapValues ? mapValues(watchedValues) : watchedValues;

        // Clean all NaN/undefined fields to standard null values before comparison and store update
        mappedValues = sanitizeObject(mappedValues);

        // Prevent infinite auto-save re-render loop by checking for real content changes
        const hasChanged = checkHasChanged(storeDraft, mappedValues);

        if (hasChanged) {
            updateDraft(mappedValues);
        }
    }, [watchedValues, storeDraft, updateDraft, mapValues, disabled]);
};

/**
 * Deep comparison helper to check if incoming changes differ from the store draft
 */
const checkHasChanged = (current: any, incoming: any): boolean => {
    if (typeof current !== 'object' || current === null || typeof incoming !== 'object' || incoming === null) {
        return current !== incoming;
    }

    // Only compare keys that are actually present in the incoming update payload
    return Object.keys(incoming).some((key) => {
        return JSON.stringify(current[key]) !== JSON.stringify(incoming[key]);
    });
};

