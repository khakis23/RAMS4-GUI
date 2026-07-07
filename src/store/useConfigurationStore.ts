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

export interface ConfigurationState {
    draft: GlobalConfig;
    updateDraft: (fieldsToUpdate: Partial<GlobalConfig>) => void;
}

// All configuration settings (metadata, DAQ, and X-ray) live here
export interface GlobalConfig {
    // Metadata
    cycleNumber: string;
    sampleName: string;
    userId: string;
    experimentNumber: string;

    // DAQ
    requiredAxes: string[];
    daqFrequency: number;
    samplePoints: number;
    handlerProfiles: HandlerProfile[];

    // X-ray
    xrayProfiles: XrayProfile[];
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
    requiredAxes: ["A", "B", "RA", "RB"],
    daqFrequency: 1,
    samplePoints: 1000,
    handlerProfiles: [],
    xrayProfiles: [
        {
            id: "xrayProfile1",
            name: "xrayProfile1",
            x: "0",
            z: "0",
            omeStart: "0",
            omeStop: "0",
            ctime: "1",
            beamHeight: "1",
            beamWidth: "1",
            atten: "0",
        }
    ]
});

export const useConfigurationStore = create<ConfigurationState>()(
    persist(
        (set) => ({
            draft: defaultDraftConfig(),
            updateDraft: (fieldsToUpdate) => set((state) => ({
                draft: {
                    ...state.draft,
                    ...fieldsToUpdate,
                },
            })),
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
