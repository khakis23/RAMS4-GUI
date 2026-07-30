import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchMechTestFromGateway, postMechTestToGateway } from '../api/mechanicalTestApi.ts';

export interface MechTestCard {
    id: string;
    type: 'ramp' | 'take' | 'dwell' | 'cycle' | 'group' | 'takeWhile' | 'custom';
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

    expandedGroupIds: Record<string, boolean>;
    setGroupExpanded: (id: string, expanded: boolean) => void;
    setCards: (cards: MechTestCard[]) => void;
    addCard: (type?: 'ramp' | 'take' | 'dwell' | 'cycle' | 'group' | 'takeWhile' | 'custom', parentId?: string) => void;
    removeCard: (id: string) => void;
    updateCardData: (id: string, data: any) => void;
    updateCardType: (id: string, type: 'ramp' | 'take' | 'dwell' | 'cycle' | 'group' | 'takeWhile' | 'custom') => void;
    reorderCards: (startIndex: number, endIndex: number, parentId?: string) => void;
    moveCardInTree: (cardId: string, targetGroupId: string | null, targetIndex?: number) => MechTestCard[] | null;
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

const updateCardTypeRecursive = (cards: MechTestCard[], id: string, type: 'ramp' | 'take' | 'dwell' | 'cycle' | 'group' | 'takeWhile' | 'custom'): MechTestCard[] => {
    return cards.map(card => {
        if (card.id === id) {
            return {
                ...card,
                type,
                data: type === 'group'
                    ? { cards: [], loops: 1 }
                    : (type === 'custom' ? { commandName: '', parameters: [] } : {})
            };
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

const getSubtreeGroupDepth = (card: MechTestCard): number => {
    if (card.type !== 'group' || !card.data?.cards || card.data.cards.length === 0) {
        return 1;
    }
    let maxChildDepth = 0;
    for (const child of card.data.cards) {
        if (child.type === 'group') {
            maxChildDepth = Math.max(maxChildDepth, getSubtreeGroupDepth(child));
        }
    }
    return 1 + maxChildDepth;
};

const findCardDepthAndPath = (
    cards: MechTestCard[],
    targetId: string,
    currentDepth = 1,
    currentPath: string[] = []
): { depth: number; path: string[]; card: MechTestCard } | null => {
    for (const card of cards) {
        const path = [...currentPath, card.id];
        if (card.id === targetId) {
            return { depth: currentDepth, path, card };
        }
        if (card.type === 'group' && card.data?.cards) {
            const found = findCardDepthAndPath(card.data.cards, targetId, currentDepth + 1, path);
            if (found) return found;
        }
    }
    return null;
};

const findAndDetachCardRecursive = (
    cardsList: MechTestCard[],
    idToFind: string
): { cards: MechTestCard[]; detached: MechTestCard | null } => {
    let detachedCard: MechTestCard | null = null;
    const newCards: MechTestCard[] = [];

    for (const item of cardsList) {
        if (item.id === idToFind) {
            detachedCard = item;
            continue;
        }

        if (item.type === 'group' && item.data?.cards) {
            const { cards: childNew, detached } = findAndDetachCardRecursive(item.data.cards, idToFind);
            if (detached) {
                detachedCard = detached;
                newCards.push({
                    ...item,
                    data: {
                        ...item.data,
                        cards: childNew
                    }
                });
                continue;
            }
        }

        newCards.push(item);
    }

    return { cards: newCards, detached: detachedCard };
};

const attachCardRecursive = (
    cardsList: MechTestCard[],
    targetGroupId: string | null,
    cardToAttach: MechTestCard,
    targetIndex?: number
): MechTestCard[] => {
    if (targetGroupId === null) {
        const result = [...cardsList];
        if (targetIndex !== undefined && targetIndex >= 0 && targetIndex <= result.length) {
            result.splice(targetIndex, 0, cardToAttach);
        } else {
            result.push(cardToAttach);
        }
        return result;
    }

    return cardsList.map((item) => {
        if (item.id === targetGroupId && item.type === 'group') {
            const groupChildCards = item.data?.cards ? [...item.data.cards] : [];
            if (targetIndex !== undefined && targetIndex >= 0 && targetIndex <= groupChildCards.length) {
                groupChildCards.splice(targetIndex, 0, cardToAttach);
            } else {
                groupChildCards.push(cardToAttach);
            }
            return {
                ...item,
                data: {
                    ...item.data,
                    cards: groupChildCards
                }
            };
        }

        if (item.type === 'group' && item.data?.cards) {
            return {
                ...item,
                data: {
                    ...item.data,
                    cards: attachCardRecursive(item.data.cards, targetGroupId, cardToAttach, targetIndex)
                }
            };
        }

        return item;
    });
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
        pruned.incrementSeg = !!pruned.incrementSeg;
        pruned.wait = pruned.wait !== false;
    } else if (type === 'cycle') {
        pruned.ampScale = typeof pruned.ampScale === 'number' ? pruned.ampScale : 0.95;
        pruned.discoverEndpoints = !!pruned.discoverEndpoints;
        pruned.recallEndpoints = !!pruned.recallEndpoints;
        pruned["enable DIC"] = !!pruned["enable DIC"];
        pruned.incrementSeg = !!pruned.incrementSeg;
        pruned.wait = pruned.wait !== false;
    } else if (type === 'take') {
        pruned.incrementSeg = !!pruned.incrementSeg;
        pruned.pauseTsDaq = !!pruned.pauseTsDaq;
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
        defaulted.incrementSeg = !!defaulted.incrementSeg;
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
        defaulted.incrementSeg = !!defaulted.incrementSeg;
        defaulted.wait = defaulted.wait !== false;
    } else if (type === 'take') {
        defaulted.incrementSeg = !!defaulted.incrementSeg;
        defaulted.pauseTsDaq = !!defaulted.pauseTsDaq;
    }

    return defaulted;
};

export const formatCardsForBackend = (cards: MechTestCard[]): any[] => {
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
        if (card.type === 'custom') {
            const argsPayload: Record<string, any> = {};
            if (Array.isArray(card.data?.parameters)) {
                card.data.parameters.forEach((param: any) => {
                    if (param && param.key && String(param.key).trim() !== '') {
                        const k = String(param.key).trim();
                        let parsedVal: any = param.value;
                        if (param.type === 'Bool') {
                            parsedVal = String(param.value) === 'true' || param.value === true;
                        } else if (param.type === 'Number') {
                            parsedVal = typeof param.value === 'number' ? param.value : (Number(param.value) || 0);
                        } else {
                            parsedVal = String(param.value ?? '');
                        }
                        argsPayload[k] = parsedVal;
                    }
                });
            }
            return {
                custom: {
                    commandName: card.data?.commandName || '',
                    args: argsPayload
                }
            };
        }
        return {
            [card.type]: pruneStepData(card.type, card.data)
        };
    });
};

export const parseCardsFromBackend = (items: any[], depth = 0): MechTestCard[] => {
    return items.map((item, idx) => {
        const type = Object.keys(item)[0] as 'ramp' | 'take' | 'dwell' | 'cycle' | 'group' | 'takeWhile' | 'custom';
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
        if (type === 'custom') {
            const customObj = item.custom || {};
            const commandName = customObj.commandName || customObj.name || '';
            const parameters: Array<{ key: string; type: 'Bool' | 'Number' | 'String'; value: any }> = [];
            const argsObj = (customObj.args && typeof customObj.args === 'object' && !Array.isArray(customObj.args)) 
                ? customObj.args 
                : customObj;

            Object.entries(argsObj).forEach(([k, v]) => {
                if (k !== 'commandName' && k !== 'name' && k !== 'args') {
                    let valType: 'Bool' | 'Number' | 'String' = 'String';
                    if (typeof v === 'boolean') {
                        valType = 'Bool';
                    } else if (typeof v === 'number') {
                        valType = 'Number';
                    }
                    parameters.push({ key: k, type: valType, value: v });
                }
            });
            return {
                id: `card-loaded-step-${depth}-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                type: 'custom',
                data: {
                    commandName,
                    parameters
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
            _hasHydrated: false,
            expandedGroupIds: {},
            validationErrors: [],
            setGroupExpanded: (id, expanded) => set((state) => ({
                expandedGroupIds: { ...state.expandedGroupIds, [id]: expanded }
            })),
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

            moveCardInTree: (cardId, targetGroupId, targetIndex) => {
                const currentCards = get().cards;
                if (!cardId) return null;

                // Validate target depth and circular drops
                if (targetGroupId !== null) {
                    // Prevent circular drop onto self
                    if (cardId === targetGroupId) return null;

                    const targetInfo = findCardDepthAndPath(currentCards, targetGroupId);
                    if (!targetInfo) return null;

                    // Ensure target is actually a group card
                    if (targetInfo.card.type !== 'group') {
                        return null;
                    }

                    // Prevent circular drop into own descendant
                    if (targetInfo.path.includes(cardId)) {
                        return null;
                    }

                    // Enforce max nesting depth of 2 for group items
                    const targetDepth = targetInfo.depth;
                    const { detached } = findAndDetachCardRecursive(currentCards, cardId);
                    if (!detached) return null;

                    if (detached.type === 'group') {
                        const cardSubtreeDepth = getSubtreeGroupDepth(detached);
                        if (targetDepth + cardSubtreeDepth > 2) {
                            return null;
                        }
                    }
                }

                const { cards: detachedTree, detached } = findAndDetachCardRecursive(currentCards, cardId);
                if (!detached) return null;

                const updatedCards = attachCardRecursive(detachedTree, targetGroupId, detached, targetIndex);
                set({
                    cards: updatedCards,
                    isDirty: checkIsDirty(updatedCards, get().savedCards)
                });
                return updatedCards;
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
