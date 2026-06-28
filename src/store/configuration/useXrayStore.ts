import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export interface XraySettings {
    activeProfileId: string;
    currentProfile: XrayProfile;
    savedProfiles: XrayProfile[];
}

interface XrayStore {
    settings: XraySettings;
    selectProfile: (id: string) => void;
    updateCurrentField: (key: keyof XrayProfile, value: any) => void;
    saveCurrentProfile: (name: string) => void;
    deleteCurrentProfile: () => void;
    resetSettings: () => void;
}

export const createBlankXrayProfile = (id = 'new-blank', name = 'New Blank Profile'): XrayProfile => ({
    id,
    name,
    x: '',
    z: '',
    omeStart: '',
    omeStop: '',
    ctime: '',
    beamHeight: '',
    beamWidth: '',
    atten: '',
});

const defaultSettings: XraySettings = {
    activeProfileId: 'new-blank',
    currentProfile: createBlankXrayProfile(),
    savedProfiles: [],
};

export const useXrayStore = create<XrayStore>()(
    persist(
        (set) => ({
            settings: defaultSettings,
            selectProfile: (id) => set((state) => {
                if (id === 'new-blank') {
                    return {
                        settings: {
                            ...state.settings,
                            activeProfileId: 'new-blank',
                            currentProfile: createBlankXrayProfile(),
                        }
                    };
                }
                const selected = state.settings.savedProfiles.find((p) => p.id === id);
                return {
                    settings: {
                        ...state.settings,
                        activeProfileId: id,
                        currentProfile: selected ? { ...selected } : createBlankXrayProfile(),
                    }
                };
            }),
            updateCurrentField: (key, value) => set((state) => ({
                settings: {
                    ...state.settings,
                    currentProfile: {
                        ...state.settings.currentProfile,
                        [key]: value,
                    }
                }
            })),
            saveCurrentProfile: (name) => set((state) => {
                const isNew = state.settings.activeProfileId === 'new-blank';
                const id = isNew 
                    ? (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9))
                    : state.settings.activeProfileId;

                const savedProfile: XrayProfile = {
                    ...state.settings.currentProfile,
                    id,
                    name,
                };

                const updatedProfiles = isNew
                    ? [...state.settings.savedProfiles, savedProfile]
                    : state.settings.savedProfiles.map((p) => p.id === id ? savedProfile : p);

                return {
                    settings: {
                        ...state.settings,
                        activeProfileId: id,
                        currentProfile: savedProfile,
                        savedProfiles: updatedProfiles,
                    }
                };
            }),
            deleteCurrentProfile: () => set((state) => {
                const id = state.settings.activeProfileId;
                if (id === 'new-blank') return {};

                const updatedProfiles = state.settings.savedProfiles.filter((p) => p.id !== id);

                return {
                    settings: {
                        ...state.settings,
                        activeProfileId: 'new-blank',
                        currentProfile: createBlankXrayProfile(),
                        savedProfiles: updatedProfiles,
                    }
                };
            }),
            resetSettings: () => set({ settings: defaultSettings }),
        }),
        {
            name: 'xray-config-storage',
        }
    )
);