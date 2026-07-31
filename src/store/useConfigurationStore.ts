import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface XrayStillPoint {
    ramsx: number;
    ramsz: number;
    ome: number;
    numPoints: number;
}

export interface MapscanAxis {
    axisName: string;
    start: number;
    stop: number;
    points: number;
}

export interface RotationLayerRange {
    omeStart: number;
    omeStop: number;
    numPoints: number;
    layerStart: number;
    layerEnd: number;
    numLayers: number;
}

export interface XrayProfile {
    id: string;
    name: string;
    mode: 'rotation-series' | 'stills' | 'mapscan' | 'tseries' | 'dscan' | 'mesh';
    ramsx?: number | null;
    ramsz?: number | null;
    ome?: number | null;
    ctime?: number | null;
    beamHeight?: number | null;
    beamWidth?: number | null;
    atten?: number | null;
    numPoints?: number | null;

    /* Mode-specific optional parameters */
    omeStart?: number;
    omeStop?: number;
    layerStart?: number;
    layerEnd?: number;
    numLayers?: number;

    stillPoints?: XrayStillPoint[];
    mapscanAxes?: MapscanAxis[];
    layerRanges?: RotationLayerRange[];

    axis1Name?: string;
    axis1Start?: number;
    axis1Stop?: number;
    axis1Images?: number;

    axis2Name?: string;
    axis2Start?: number;
    axis2Stop?: number;
    axis2Images?: number;
}

export interface DicStillPoint {
    ramsx: number;
    ramsz: number;
    ome: number;
    numPoints: number;
}

export interface DicProfile {
    id: string;
    name: string;
    mode: 'stills';
    ctime: number;
    stillPoints: DicStillPoint[];
}

export interface AxisSetting {
    name: string;
    max_velocity: number;
    max_acceleration: number;
}

export interface SignalSetting {
    name: string;
    slope: number;
    intercept: number;
    channel: number;
}

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

// All configuration settings (metadata, DAQ, X-ray, and DIC) live here
export interface GlobalConfig {
    // Metadata
    cycleNumber: string;
    sampleName: string;
    userId: string;
    experimentNumber: string;
    configDirectory: string;

    // DAQ
    requiredAxes: string[];
    daqFrequency: number;
    samplePoints: number;
    handlerProfiles: HandlerProfile[];

    // X-ray
    xrayProfiles: XrayProfile[];

    // DIC
    dicProfiles: DicProfile[];

    // Settings
    settingsVersion?: number;
    specHost: string;
    requireSpecEnable: boolean;
    systemName: string;
    controllerHost: string;
    axisCount: number;
    taskCount: number;
    axesSettings: AxisSetting[];
    signalSettings: SignalSetting[];
}

export interface HandlerProfileCycle {
    start: number;
    stop: number | 'inf';
    step: number;
}

export interface HandlerProfile {
    // General fields
    mode: string;
    filename: string;
    signalLoad?: string;
    signalStrain?: string;

    // Verbose fields
    verboseAxis: string;
    verboseSystem: number;
    verboseTask: string;
    verboseIO: number;
    verboseAi: string[];

    // Time-series specific fields
    frequency?: number;
    cycles?: HandlerProfileCycle[];

    // Peak-valley specific fields
    signalAxis?: string;
    signalItem?: string;
    signalProminence?: number;

    // PSO specific fields
    psoAxis?: string;
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

interface ValidationState {
    errors: Record<string, string[]>;
    setErrors: (tab: string, errors: string[]) => void;
}

export const useValidationStore = create<ValidationState>((set) => ({
    errors: {},
    setErrors: (tab, errors) => set((state) => ({
        errors: {
            ...state.errors,
            [tab]: errors,
        }
    })),
}));
