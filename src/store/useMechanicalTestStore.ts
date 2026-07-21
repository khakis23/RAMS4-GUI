import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchMechTestFromGateway, postMechTestToGateway } from '../api/mechanicalTestApi';

export interface MechTestCard {
    id: string;
    type: 'ramp' | 'take' | 'dwell' | 'cycle' | 'group' | 'takeWhile';
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
    addCard: (type?: 'ramp' | 'take' | 'dwell' | 'cycle' | 'group' | 'takeWhile', parentId?: string) => void;
    removeCard: (id: string) => void;
    updateCardData: (id: string, data: any) => void;
    updateCardType: (id: string, type: 'ramp' | 'take' | 'dwell' | 'cycle' | 'group' | 'takeWhile') => void;
    reorderCards: (startIndex: number, endIndex: number, parentId?: string) => void;
    ungroupCard: (id: string) => void;
    loadMechTest: (directory: string, experiment: string) => Promise<void>;
    saveMechTest: (directory: string, experiment: string) => Promise<void>;
    resetStore: () => void;
    setHasHydrated: (val: boolean) => void;
    validationErrors: string[];
    setValidationErrors: (errors: string[]) => void;
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

const updateCardTypeRecursive = (cards: MechTestCard[], id: string, type: 'ramp' | 'take' | 'dwell' | 'cycle' | 'group' | 'takeWhile'): MechTestCard[] => {
    return cards.map(card => {
        if (card.id === id) {
            return { ...card, type, data: type === 'group' ? { cards: [], loops: 1 } : {} };
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
const pruneStepData = (type: string, data: any): any => {
    if (!data) return {};
    const pruned = { ...data };

    if (type === 'ramp') {
        pruned.enable_dic = !!pruned.enable_dic;
        pruned.skipDICpos = !!pruned.skipDICpos;
        pruned.incrementSeg = !!pruned.incrementSeg;
        pruned.wait = pruned.wait !== false;
        pruned.max_displacement = typeof pruned.max_displacement === 'number' ? pruned.max_displacement : 1.0;

        if (pruned.control === 'displacement') {
            if (pruned.dispToggle === 'time') {
                pruned.velocity = null;
            } else {
                pruned.time = null;
            }
        } else {
            pruned.time = null;
            pruned.dispToggle = null;
        }
    } else if (type === 'dwell') {
        pruned.wait = pruned.wait !== false;
    } else if (type === 'cycle') {
        pruned.ampScale = typeof pruned.ampScale === 'number' ? pruned.ampScale : 0.95;
        pruned.discoverEndpoints = !!pruned.discoverEndpoints;
        pruned.recallEndpoints = !!pruned.recallEndpoints;
        pruned["enable DIC"] = !!pruned["enable DIC"];
        pruned.wait = pruned.wait !== false;
    }

    return pruned;
};

const defaultStepData = (type: string, data: any): any => {
    if (!data) return {};
    const defaulted = { ...data };

    if (type === 'ramp') {
        defaulted.control = defaulted.control ?? 'displacement';
        defaulted.dispToggle = defaulted.dispToggle ?? 'time';
        defaulted.axis = defaulted.axis ?? 'A';
        defaulted.mode = defaulted.mode ?? 'absolute';
        defaulted.max_displacement = typeof defaulted.max_displacement === 'number' ? defaulted.max_displacement : 1.0;
        defaulted.enable_dic = !!defaulted.enable_dic;
        defaulted.skipDICpos = !!defaulted.skipDICpos;
        defaulted.incrementSeg = !!defaulted.incrementSeg;
        defaulted.wait = defaulted.wait !== false;
    } else if (type === 'dwell') {
        defaulted.control = defaulted.control ?? 'load';
        defaulted.axis = defaulted.axis ?? 'A';
        defaulted.wait = defaulted.wait !== false;
    } else if (type === 'cycle') {
        defaulted.control = defaulted.control ?? 'displacement';
        defaulted.axis = defaulted.axis ?? 'A';
        defaulted.mode = defaulted.mode ?? 'relative';
        defaulted.countMode = defaulted.countMode ?? 'relative';
        defaulted.ampScale = typeof defaulted.ampScale === 'number' ? defaulted.ampScale : 0.95;
        defaulted.discoverEndpoints = !!defaulted.discoverEndpoints;
        defaulted.recallEndpoints = !!defaulted.recallEndpoints;
        defaulted["enable DIC"] = !!defaulted["enable DIC"];
        defaulted.wait = defaulted.wait !== false;
    }

    return defaulted;
};

const formatCardsForBackend = (cards: MechTestCard[]): any[] => {
    return cards.map(card => {
        if (card.type === 'group') {
            return {
                group: {
                    loops: card.data?.loops ?? 1,
                    steps: formatCardsForBackend(card.data?.cards || [])
                }
            };
        }
        if (card.type === 'takeWhile') {
            const { take, step } = card.data || {};
            return {
                takeWhile: {
                    take: take?.data || {},
                    step: {
                        type: step?.type || 'ramp',
                        data: pruneStepData(step?.type || 'ramp', step?.data)
                    }
                }
            };
        }
        return {
            [card.type]: pruneStepData(card.type, card.data)
        };
    });
};

const parseCardsFromBackend = (items: any[], depth = 0): MechTestCard[] => {
    return items.map((item, idx) => {
        const type = Object.keys(item)[0] as 'ramp' | 'take' | 'dwell' | 'cycle' | 'group' | 'takeWhile';
        if (type === 'group') {
            const groupObj = item.group;
            const isOldFormat = Array.isArray(groupObj);
            const loops = isOldFormat ? 1 : (groupObj?.loops ?? 1);
            const steps = isOldFormat ? groupObj : (groupObj?.steps || []);
            return {
                id: `card-loaded-group-${depth}-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                type: 'group',
                data: {
                    loops,
                    cards: parseCardsFromBackend(steps, depth + 1)
                }
            };
        }
        if (type === 'takeWhile') {
            const { take, step } = item.takeWhile || {};
            const stepType = step?.type || 'ramp';
            return {
                id: `card-loaded-step-${depth}-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                type: 'takeWhile',
                data: {
                    take: {
                        data: take || {}
                    },
                    step: {
                        type: stepType,
                        data: defaultStepData(stepType, step?.data)
                    }
                }
            };
        }
        return {
            id: `card-loaded-step-${depth}-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            type,
            data: defaultStepData(type, item[type])
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
            validationErrors: [],
            _hasHydrated: false,

            setValidationErrors: (errors) => set({ validationErrors: errors }),

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
                        data: type === 'group' ? { cards: [], loops: 1 } : {}
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
                set({ cards: [], savedCards: [], isDirty: false, error: null, isLoading: false, lastLoadedPath: null, validationErrors: [] });
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
