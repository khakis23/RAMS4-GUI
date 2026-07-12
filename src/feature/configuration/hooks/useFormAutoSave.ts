import { useEffect } from 'react';

interface UseFormAutoSaveProps<T, M> {
    watchedValues: any;
    storeDraft: T;
    updateDraft: (data: Partial<T>) => void;
    mapValues?: (watched: any) => M; // Optional mapping before comparison/save
}

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
    mapValues
}: UseFormAutoSaveProps<T, M>) => {
    useEffect(() => {
        // If custom mapper is provided, transform the watched form values first
        const mappedValues = mapValues ? mapValues(watchedValues) : watchedValues;

        // Prevent infinite auto-save re-render loop by checking for real content changes
        const hasChanged = checkHasChanged(storeDraft, mappedValues);

        if (hasChanged) {
            updateDraft(mappedValues);
        }
    }, [watchedValues, storeDraft, updateDraft, mapValues]);
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

