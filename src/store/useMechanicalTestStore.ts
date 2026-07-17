import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchMechTestFromGateway, postMechTestToGateway } from '../api/mechanicalTestApi';

export interface MechTestCard {
    id: string;
    type: 'ramp' | 'take' | 'group';
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
    addCard: (type?: 'ramp' | 'take' | 'group', parentId?: string) => void;
    removeCard: (id: string) => void;
    updateCardData: (id: string, data: any) => void;
    updateCardType: (id: string, type: 'ramp' | 'take' | 'group') => void;
    reorderCards: (startIndex: number, endIndex: number, parentId?: string) => void;
    ungroupCard: (id: string) => void;
    loadMechTest: (directory: string, experiment: string) => Promise<void>;
    saveMechTest: (directory: string, experiment: string) => Promise<void>;
    resetStore: () => void;
    setHasHydrated: (val: boolean) => void;
}

const checkIsDirty = (current: MechTestCard[], saved: MechTestCard[]) => {
    return JSON.stringify(current) !== JSON.stringify(saved);
};

// Recursive Helper Functions
const addCardRecursive = (cards: MechTestCard[], parentId: string, newCard: MechTestCard): boolean => {
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (card.id === parentId) {
            if (!card.data) card.data = {};
            if (!card.data.cards) card.data.cards = [];
            card.data.cards.push(newCard);
            return true;
        }
        if (card.type === 'group' && card.data?.cards) {
            if (addCardRecursive(card.data.cards, parentId, newCard)) {
                return true;
            }
        }
    }
    return false;
};

const removeCardRecursive = (cards: MechTestCard[], id: string): MechTestCard[] => {
    return cards
        .filter(card => card.id !== id)
        .map(card => {
            if (card.type === 'group' && card.data?.cards) {
                return {
                    ...card,
                    data: {
                        ...card.data,
                        cards: removeCardRecursive(card.data.cards, id)
                    }
                };
            }
            return card;
        });
};

const updateCardDataRecursive = (cards: MechTestCard[], id: string, data: any): MechTestCard[] => {
    return cards.map(card => {
        if (card.id === id) {
            return { ...card, data: { ...card.data, ...data } };
        }
        if (card.type === 'group' && card.data?.cards) {
            return {
                ...card,
                data: {
                    ...card.data,
                    cards: updateCardDataRecursive(card.data.cards, id, data)
                }
            };
        }
        return card;
    });
};

const updateCardTypeRecursive = (cards: MechTestCard[], id: string, type: 'ramp' | 'take' | 'group'): MechTestCard[] => {
    return cards.map(card => {
        if (card.id === id) {
            return { ...card, type, data: type === 'group' ? { cards: [] } : {} };
        }
        if (card.type === 'group' && card.data?.cards) {
            return {
                ...card,
                data: {
                    ...card.data,
                    cards: updateCardTypeRecursive(card.data.cards, id, type)
                }
            };
        }
        return card;
    });
};

const reorderCardsRecursive = (
    cards: MechTestCard[],
    parentId: string | undefined,
    startIndex: number,
    endIndex: number
): MechTestCard[] => {
    if (!parentId) {
        const result = Array.from(cards);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    }
    return cards.map(card => {
        if (card.id === parentId) {
            const innerCards = card.data?.cards ? Array.from(card.data.cards as MechTestCard[]) : [];
            const [removed] = innerCards.splice(startIndex, 1);
            innerCards.splice(endIndex, 0, removed);
            return {
                ...card,
                data: {
                    ...card.data,
                    cards: innerCards
                }
            };
        }
        if (card.type === 'group' && card.data?.cards) {
            return {
                ...card,
                data: {
                    ...card.data,
                    cards: reorderCardsRecursive(card.data.cards, parentId, startIndex, endIndex)
                }
            };
        }
        return card;
    });
};

const ungroupCardRecursive = (cards: MechTestCard[], id: string): MechTestCard[] => {
    const result: MechTestCard[] = [];
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (card.id === id) {
            if (card.type === 'group' && card.data?.cards) {
                result.push(...card.data.cards);
            }
        } else {
            if (card.type === 'group' && card.data?.cards) {
                result.push({
                    ...card,
                    data: {
                        ...card.data,
                        cards: ungroupCardRecursive(card.data.cards, id)
                    }
                });
            } else {
                result.push(card);
            }
        }
    }
    return result;
};

// Serialization Helpers
const formatCardsForBackend = (cards: MechTestCard[]): any[] => {
    return cards.map(card => {
        if (card.type === 'group') {
            return {
                group: formatCardsForBackend(card.data?.cards || [])
            };
        }
        return {
            [card.type]: card.data
        };
    });
};

const parseCardsFromBackend = (items: any[], depth = 0): MechTestCard[] => {
    return items.map((item, idx) => {
        const type = Object.keys(item)[0] as 'ramp' | 'take' | 'group';
        if (type === 'group') {
            return {
                id: `card-loaded-group-${depth}-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                type: 'group',
                data: {
                    cards: parseCardsFromBackend(item.group || [], depth + 1)
                }
            };
        }
        return {
            id: `card-loaded-step-${depth}-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            type,
            data: item[type] || {}
        };
    });
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

            addCard: (type = 'ramp', parentId) => {
                set((state) => {
                    const newCard: MechTestCard = {
                        id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        type,
                        data: type === 'group' ? { cards: [] } : {}
                    };
                    let updatedCards: MechTestCard[];
                    if (parentId) {
                        const cardsClone = JSON.parse(JSON.stringify(state.cards));
                        addCardRecursive(cardsClone, parentId, newCard);
                        updatedCards = cardsClone;
                    } else {
                        updatedCards = [...state.cards, newCard];
                    }
                    const isDirty = checkIsDirty(updatedCards, state.savedCards);
                    return { cards: updatedCards, isDirty };
                });
            },

            removeCard: (id) => {
                set((state) => {
                    const updatedCards = removeCardRecursive(state.cards, id);
                    const isDirty = checkIsDirty(updatedCards, state.savedCards);
                    return { cards: updatedCards, isDirty };
                });
            },

            updateCardData: (id, data) => {
                set((state) => {
                    const updatedCards = updateCardDataRecursive(state.cards, id, data);
                    const isDirty = checkIsDirty(updatedCards, state.savedCards);
                    return { cards: updatedCards, isDirty };
                });
            },

            updateCardType: (id, type) => {
                set((state) => {
                    const updatedCards = updateCardTypeRecursive(state.cards, id, type);
                    const isDirty = checkIsDirty(updatedCards, state.savedCards);
                    return { cards: updatedCards, isDirty };
                });
            },

            reorderCards: (startIndex, endIndex, parentId) => {
                set((state) => {
                    const updatedCards = reorderCardsRecursive(state.cards, parentId, startIndex, endIndex);
                    const isDirty = checkIsDirty(updatedCards, state.savedCards);
                    return { cards: updatedCards, isDirty };
                });
            },

            ungroupCard: (id) => {
                set((state) => {
                    const updatedCards = ungroupCardRecursive(state.cards, id);
                    const isDirty = checkIsDirty(updatedCards, state.savedCards);
                    return { cards: updatedCards, isDirty };
                });
            },

            loadMechTest: async (directory, experiment) => {
                if (!directory || !experiment) return;
                set({ isLoading: true, error: null });
                try {
                    const fetched = await fetchMechTestFromGateway(directory, experiment);
                    if (fetched && Array.isArray(fetched)) {
                        const normalized = parseCardsFromBackend(fetched);
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
                    const formatted = formatCardsForBackend(get().cards);
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
