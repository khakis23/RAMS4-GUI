import { create } from 'zustand'
import { persist } from 'zustand/middleware'


export interface XrayStore {
    xrayProfile: XrayConfig;
    setXrayProfile: (profile: XrayConfig) => void;
}

interface XrayConfig {
    x: number;
    z: number;
    ome_0: number;
    ome_f: number;
    ctime: number;
    beam_h: number;
    beam_w: number;
    atten: number;
}

const defaultXrayConfig: XrayConfig = {
    x: 0,
    z: 0,
    ome_0: 0,
    ome_f: 0,
    ctime: 0,
    beam_h: 0,
    beam_w: 0,
    atten: 0,
}

export const useXrayStore = create<XrayStore>()(
    persist(
        (set) => ({
            xrayProfile: defaultXrayConfig,
            setXrayProfile: (profile) => set({ xrayProfile: profile }),
        }),
        {
            name: 'xray-config-storage',
        }
    )
);