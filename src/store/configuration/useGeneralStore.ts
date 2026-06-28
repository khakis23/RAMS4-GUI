import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GeneralConfig {
    cycleNumber: string;
    sampleName: string;
    requiredAxes: string[];
}

export interface GlobalConfigTemplate {
    id: string;
    name: string;
    general: GeneralConfig;
    // TODO: Add other config sections (DAQ settings, DIC settings) here in the future
}

export interface GlobalConfigSettings {
    activeConfigId: string;
    currentConfig: GeneralConfig;
    savedConfigs: GlobalConfigTemplate[];
}

interface ConfigureState {
    settings: GlobalConfigSettings;
    selectConfig: (id: string) => void;
    updateGeneralField: (key: keyof GeneralConfig, value: any) => void;
    saveCurrentConfig: (name: string) => void;
    deleteCurrentConfig: () => void;
    resetSettings: () => void;
}

const defaultGeneralConfig = (): GeneralConfig => ({
    cycleNumber: '',
    sampleName: '',
    requiredAxes: [],
});

const defaultSettings: GlobalConfigSettings = {
    activeConfigId: 'new-blank',
    currentConfig: defaultGeneralConfig(),
    savedConfigs: [],
};

export const useGeneralStore = create<ConfigureState>()(
    persist(
        (set) => ({
            settings: defaultSettings,
            selectConfig: (id) => set((state) => {
                if (id === 'new-blank') {
                    return {
                        settings: {
                            ...state.settings,
                            activeConfigId: 'new-blank',
                            currentConfig: defaultGeneralConfig(),
                        }
                    };
                }
                const selected = state.settings.savedConfigs.find((c) => c.id === id);
                return {
                    settings: {
                        ...state.settings,
                        activeConfigId: id,
                        currentConfig: selected ? { ...selected.general } : defaultGeneralConfig(),
                    }
                };
            }),
            updateGeneralField: (key, value) => set((state) => ({
                settings: {
                    ...state.settings,
                    currentConfig: {
                        ...state.settings.currentConfig,
                        [key]: value,
                    }
                }
            })),
            saveCurrentConfig: (name) => set((state) => {
                const isNew = state.settings.activeConfigId === 'new-blank';
                const id = isNew
                    ? (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9))
                    : state.settings.activeConfigId;

                const savedConfig: GlobalConfigTemplate = {
                    id,
                    name,
                    general: { ...state.settings.currentConfig },
                };

                const updatedConfigs = isNew
                    ? [...state.settings.savedConfigs, savedConfig]
                    : state.settings.savedConfigs.map((c) => c.id === id ? savedConfig : c);

                return {
                    settings: {
                        ...state.settings,
                        activeConfigId: id,
                        currentConfig: savedConfig.general,
                        savedConfigs: updatedConfigs,
                    }
                };
            }),
            deleteCurrentConfig: () => set((state) => {
                const id = state.settings.activeConfigId;
                if (id === 'new-blank') return {};

                const updatedConfigs = state.settings.savedConfigs.filter((c) => c.id !== id);

                return {
                    settings: {
                        ...state.settings,
                        activeConfigId: 'new-blank',
                        currentConfig: defaultGeneralConfig(),
                        savedConfigs: updatedConfigs,
                    }
                };
            }),
            resetSettings: () => set({ settings: defaultSettings }),
        }),
        {
            name: 'general-config-storage',
        }
    )
);
