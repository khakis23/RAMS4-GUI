import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface XrayProfile {
    id: string;
    name: string;
    x: string;
    z: string;
    omeStart: string;
    omeStop: string;
    ctime: string;
    beamHeight: string;
    beamWidth: string;
    atten: string;
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
    lastLoadedPath: string;
    updateDraft: (fieldsToUpdate: Partial<GlobalConfig>) => void;
    setLastLoadedPath: (path: string) => void;
}

// All configuration settings (metadata, DAQ, and X-ray) live here
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

    // Settings
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
    stop: number;
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
    verboseAi: string;

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
            lastLoadedPath: "",
            updateDraft: (fieldsToUpdate) => set((state) => ({
                draft: {
                    ...state.draft,
                    ...fieldsToUpdate,
                },
            })),
            setLastLoadedPath: (path) => set({ lastLoadedPath: path }),
        }),
        {
            name: 'configuration-store',
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
