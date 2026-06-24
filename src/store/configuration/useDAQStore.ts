import { create } from 'zustand'
import { persist } from 'zustand/middleware'


interface DAQStore {
    // TODO
}

export const useDAQStore = create<DAQStore>()(
    persist(
        (set) => ({
            // TODO
        }),
        {
            name: 'daq-storage'
        })
)