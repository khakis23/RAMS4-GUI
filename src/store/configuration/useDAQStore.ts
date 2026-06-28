import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HandlerProfile {
    id: string;
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

export interface DAQSettings {
    masterFrequency: string;
    samplePoints: string;
    handlerProfiles: HandlerProfile[];
}

interface DAQStore {
    settings: DAQSettings;
    setSettings: (settings: DAQSettings) => void;
    addProfile: () => void;
    updateProfile: (id: string, updatedProfile: HandlerProfile) => void;
    removeProfile: (id: string) => void;
    resetSettings: () => void;
}

const defaultHandlerProfile = (): HandlerProfile => ({
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
    mode: 'time-series',
    filename: '',
    signalLoad: '',
    signalStrain: '',
    verboseAxis: '',
    verboseSystem: 0,
    verboseTask: '',
    verboseIO: -1,
    verboseAi: '',
});

const defaultSettings: DAQSettings = {
    masterFrequency: '1',
    samplePoints: '',
    handlerProfiles: [defaultHandlerProfile()],
};

export const useDAQStore = create<DAQStore>()(
    persist(
        (set) => ({
            settings: defaultSettings,
            setSettings: (newSettings) => set({ settings: newSettings }),
            addProfile: () => set((state) => ({
                settings: {
                    ...state.settings,
                    handlerProfiles: [...state.settings.handlerProfiles, defaultHandlerProfile()],
                }
            })),
            updateProfile: (id, updatedProfile) => set((state) => ({
                settings: {
                    ...state.settings,
                    handlerProfiles: state.settings.handlerProfiles.map((p) =>
                        p.id === id ? updatedProfile : p
                    ),
                }
            })),
            removeProfile: (id) => set((state) => ({
                settings: {
                    ...state.settings,
                    handlerProfiles: state.settings.handlerProfiles.filter((p) => p.id !== id),
                }
            })),
            resetSettings: () => set({ settings: defaultSettings }),
        }),
        {
            name: 'daq-config-storage',
        }
    )
);
