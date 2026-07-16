import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchMechTestFromGateway, postMechTestToGateway } from '../api/mechanicalTestApi';

export interface MechTestCard {
    id: string;
    type: 'ramp' | 'take';
    data: any;
}

interface MechanicalTestState {
    cards: MechTestCard[];
    savedCards: MechTestCard[];
    isDirty: boolean;
    isLoading: boolean;
    error: string | null;
    lastLoadedPath: string | null;
    _hasHydrated: boolean;

    setCards: (cards: MechTestCard[]) => void;
    addCard: (type?: 'ramp' | 'take') => void;
    removeCard: (id: string) => void;
    updateCardData: (id: string, data: any) => void;
    updateCardType: (id: string, type: 'ramp' | 'take') => void;
    reorderCards: (startIndex: number, endIndex: number) => void;
    loadMechTest: (directory: string, experiment: string) => Promise<void>;
    saveMechTest: (directory: string, experiment: string) => Promise<void>;
    resetStore: () => void;
    setHasHydrated: (val: boolean) => void;
}

const checkIsDirty = (current: MechTestCard[], saved: MechTestCard[]) => {
    return JSON.stringify(current) !== JSON.stringify(saved);
};

export const useMechanicalTestStore = create<MechanicalTestState>()(
    persist(
        (set, get) => ({
            cards: [],
            savedCards: [],
            isDirty: false,
            isLoading: false,
            error: null,
            lastLoadedPath: null,
            _hasHydrated: false,

            setCards: (cards) => {
                set((state) => {
                    const isDirty = checkIsDirty(cards, state.savedCards);
                    return { cards, isDirty };
                });
            },

            addCard: (type = 'ramp') => {
                set((state) => {
                    const newCard: MechTestCard = {
                        id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        type,
                        data: {}
                    };
                    const updatedCards = [...state.cards, newCard];
                    const isDirty = checkIsDirty(updatedCards, state.savedCards);
                    return { cards: updatedCards, isDirty };
                });
            },

            removeCard: (id) => {
                set((state) => {
                    const updatedCards = state.cards.filter((card) => card.id !== id);
                    const isDirty = checkIsDirty(updatedCards, state.savedCards);
                    return { cards: updatedCards, isDirty };
                });
            },

            updateCardData: (id, data) => {
                set((state) => {
                    const updatedCards = state.cards.map((card) =>
                        card.id === id ? { ...card, data } : card
                    );
                    const isDirty = checkIsDirty(updatedCards, state.savedCards);
                    return { cards: updatedCards, isDirty };
                });
            },

            updateCardType: (id, type) => {
                set((state) => {
                    const updatedCards = state.cards.map((card) =>
                        card.id === id ? { ...card, type, data: {} } : card
                    );
                    const isDirty = checkIsDirty(updatedCards, state.savedCards);
                    return { cards: updatedCards, isDirty };
                });
            },

            reorderCards: (startIndex, endIndex) => {
                set((state) => {
                    const result = Array.from(state.cards);
                    const [removed] = result.splice(startIndex, 1);
                    result.splice(endIndex, 0, removed);
                    const isDirty = checkIsDirty(result, state.savedCards);
                    return { cards: result, isDirty };
                });
            },

            loadMechTest: async (directory, experiment) => {
                if (!directory || !experiment) return;
                set({ isLoading: true, error: null });
                try {
                    const fetched = await fetchMechTestFromGateway(directory, experiment);
                    if (fetched && Array.isArray(fetched)) {
                        // Ensure every loaded item has a unique client-side ID
                        const normalized = fetched.map((item, idx) => {
                            const type = Object.keys(item)[0] as 'ramp' | 'take';
                            return {
                                id: `card-loaded-${idx}-${Date.now()}`,
                                type,
                                data: item[type] || {}
                            };
                        });
                        set({
                            cards: normalized,
                            savedCards: JSON.parse(JSON.stringify(normalized)),
                            isDirty: false,
                            lastLoadedPath: `${directory}::${experiment}`
                        });
                    } else {
                        set({
                            cards: [],
                            savedCards: [],
                            isDirty: false,
                            lastLoadedPath: `${directory}::${experiment}`
                        });
                    }
                } catch (err: any) {
                    set({ error: err.message || 'Failed to load mechanical test' });
                } finally {
                    set({ isLoading: false });
                }
            },

            saveMechTest: async (directory, experiment) => {
                if (!directory || !experiment) return;
                set({ isLoading: true, error: null });
                try {
                    // Format cards back to mock backend structure: [{ [type]: data }]
                    const formatted = get().cards.map((card) => ({
                        [card.type]: card.data
                    }));
                    await postMechTestToGateway(directory, experiment, formatted);
                    const cardsClone = JSON.parse(JSON.stringify(get().cards));
                    set({
                        savedCards: cardsClone,
                        isDirty: false,
                        lastLoadedPath: `${directory}::${experiment}`
                    });
                } catch (err: any) {
                    set({ error: err.message || 'Failed to save mechanical test' });
                    throw err;
                } finally {
                    set({ isLoading: false });
                }
            },

            resetStore: () => {
                set({ cards: [], savedCards: [], isDirty: false, error: null, isLoading: false, lastLoadedPath: null });
            },

            setHasHydrated: (val) => set({ _hasHydrated: val })
        }),
        {
            name: 'mechanical-test-store',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            }
        }
    )
);
