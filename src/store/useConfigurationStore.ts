import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GlobalConfig, HandlerProfile, XrayProfile, DicProfile, XrayStillPoint, MapscanAxis, RotationLayerRange, DicStillPoint, AxisSetting, SignalSetting, HandlerProfileCycle } from '@/types/config'

/**
 * Zustand state slice for managing the global configuration lifecycle.
 */
export interface ConfigurationState {
    draft: GlobalConfig;
    savedConfig: GlobalConfig | null;
    lastLoadedPath: string;
    settingsFallbackActive: { expected: number; loaded: number | 'default' | 'missing' } | null;
    _hasHydrated: boolean;
    updateDraft: (fieldsToUpdate: Partial<GlobalConfig>) => void;
    setSavedConfig: (config: GlobalConfig | null) => void;
    setLastLoadedPath: (path: string) => void;
    setSettingsFallbackActive: (fallback: { expected: number; loaded: number | 'default' | 'missing' } | null) => void;
    setHasHydrated: (val: boolean) => void;
}

const defaultDraftConfig = (): GlobalConfig => ({
    cycleNumber: "",
    sampleName: "",
    userId: "",
    experimentNumber: "",
    configDirectory: "",
    requiredAxes: ["A", "B", "RA", "RB"],
    daqFrequency: 1,
    samplePoints: 1000,
    handlerProfiles: [],
    xrayProfiles: [],
    dicProfiles: [],
    settingsVersion: 0,
    specHost: "id1a3.classe.cornell.edu:spec",
    requireSpecEnable: true,
    systemName: "RAMS4_CHESS",
    controllerHost: "10.0.0.1",
    axisCount: 5,
    taskCount: 5,
    axesSettings: [
        { name: "A", max_velocity: 50, max_acceleration: 100 },
        { name: "B", max_velocity: 50, max_acceleration: 100 },
        { name: "RA", max_velocity: 10, max_acceleration: 20 },
        { name: "RB", max_velocity: 10, max_acceleration: 20 },
        { name: "TENS", max_velocity: 5, max_acceleration: 10 }
    ],
    signalSettings: [
        { name: "LoadA", slope: 1.0, intercept: 0.0, channel: 0 },
        { name: "LoadB", slope: 1.0, intercept: 0.0, channel: 1 },
        { name: "Torque", slope: 1.0, intercept: 0.0, channel: 2 }
    ]
});

/**
 * Persistent Zustand store holding the global configuration state.
 * Contains draft values, saved state, hydration status, and fallback tracking.
 */
export const useConfigurationStore = create<ConfigurationState>()(
    persist(
        (set) => ({
            draft: defaultDraftConfig(),
            savedConfig: null,
            lastLoadedPath: "",
            settingsFallbackActive: null,
            _hasHydrated: false,
            updateDraft: (fieldsToUpdate) => set((state) => ({
                draft: {
                    ...state.draft,
                    ...fieldsToUpdate,
                },
            })),
            setSavedConfig: (config) => set({ savedConfig: config }),
            setLastLoadedPath: (path) => set({ lastLoadedPath: path }),
            setSettingsFallbackActive: (fallback) => set({ settingsFallbackActive: fallback }),
            setHasHydrated: (val) => set({ _hasHydrated: val }),
        }),
        {
            name: 'configuration-store',
            partialize: (state) => ({
                draft: state.draft,
                savedConfig: state.savedConfig,
                lastLoadedPath: state.lastLoadedPath
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            }
        }
    )
);

/**
 * State slice tracking validation errors per configuration tab.
 * Used to block navigation if a tab (like DAQ, X-ray) has invalid configurations.
 */
interface ValidationState {
    errors: Record<string, string[]>;
    setErrors: (tab: string, errors: string[]) => void;
}

/**
 * Transient Zustand store for tab validation errors.
 * This state is NOT persisted across sessions.
 */
export const useValidationStore = create<ValidationState>((set) => ({
    errors: {},
    setErrors: (tab, errors) => set((state) => ({
        errors: {
            ...state.errors,
            [tab]: errors,
        }
    })),
}));
