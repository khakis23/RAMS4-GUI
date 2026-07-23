import { useConfigurationStore } from '@/store/useConfigurationStore';

const DEFAULT_FALLBACK_AXES = ['A', 'B', 'RA', 'RB', 'TENS'];

/**
 * Hook to retrieve the list of available hardware axes defined in System Settings.
 * Falls back to DEFAULT_FALLBACK_AXES (['A', 'B', 'RA', 'RB', 'TENS']) if no settings are configured.
 */
export const useAvailableAxes = (): string[] => {
    const draft = useConfigurationStore((state) => state.draft);
    
    if (draft.axesSettings && draft.axesSettings.length > 0) {
        const customNames = draft.axesSettings
            .map((a) => a.name?.trim())
            .filter((name): name is string => Boolean(name && name.length > 0));
        
        if (customNames.length > 0) {
            return customNames;
        }
    }
    
    return DEFAULT_FALLBACK_AXES;
};
