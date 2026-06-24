import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConfigureState {
    cycleNumber: string;
    setCycleNumber: (cycle: string) => void;
    sampleName: string;
    setSampleName: (name: string) => void;
    requiredAxes: string[];
    setRequiredAxes: (axes: string[]) => void;
}

export const useConfigureStore = create<ConfigureState>()(
    persist(
        (set) => ({
            cycleNumber: '',
            setCycleNumber: (cycle) => set({ cycleNumber: cycle }),
            sampleName: '', 
            setSampleName: (name) => set({ sampleName: name }),
            requiredAxes: [],
            setRequiredAxes: (axes) => set({ requiredAxes: axes }),
        }),
        {
            name: 'configure-storage', 
        }
    )
);
