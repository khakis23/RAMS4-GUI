import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DAQConfig {
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
    cycles?: string;

    // Peak-valley specific fields
    signalAxis?: string;
    signalItem?: string;
    signalProminence?: number;

    // PSO specific fields
    psoAxis?: string;
}

interface DAQStore {
    // General DAQ settings
    frequency: string;
    setFrequency: (frequency: string) => void;
    samplePoints: number;
    setSamplePoints: (points: number) => void;

    // DAQ Handlers
    config: DAQConfig;
    setConfig: (config: DAQConfig) => void;
    resetConfig: () => void;
}

const defaultConfig: DAQConfig = {
    mode: 'time-series',
    filename: '',
    signalLoad: '',
    signalStrain: '',
    verboseAxis: '',
    verboseSystem: 0,
    verboseTask: '',
    verboseIO: -1,
    verboseAi: '',
};

export const useDAQStore = create<DAQStore>()(
    persist(
        (set) => ({
            // General DAQ settings
            frequency: '',
            setFrequency: (frequency) => set({ frequency }),
            samplePoints: 0,
            setSamplePoints: (points) => set({ samplePoints: points }),

            // DAQ Handlers
            config: defaultConfig,
            setConfig: (newConfig) => set({ config: newConfig }),
            resetConfig: () => set({ config: defaultConfig }),
        }),
        {
            name: 'daq-config-storage',
        }
    )
);
