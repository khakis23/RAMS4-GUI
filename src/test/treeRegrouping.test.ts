import assert from 'node:assert';
import { useMechanicalTestStore, type MechTestCard } from '../store/useMechanicalTestStore.ts';

const runTest = (name: string, fn: () => void) => {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (err: any) {
        console.error(`✗ ${name}`);
        console.error(err);
        process.exitCode = 1;
    }
};

console.log("\nRunning Sequence Tree Regrouping & Edge-Case Verification Suite...\n");

runTest('Tree Move: Moves a standard Ramp step into a Group without data loss', () => {
    useMechanicalTestStore.getState().resetStore();
    const initialCards: MechTestCard[] = [
        {
            id: 'ramp-1',
            type: 'ramp',
            data: { control: 'displacement', endValue: 10, velocity: 1.5 }
        },
        {
            id: 'group-1',
            type: 'group',
            data: { cards: [], loops: 1 }
        }
    ];

    useMechanicalTestStore.getState().setCards(initialCards);

    const updated = useMechanicalTestStore.getState().moveCardInTree('ramp-1', 'group-1');
    assert.notStrictEqual(updated, null, "moveCardInTree must return updated cards array");

    const rootCards = useMechanicalTestStore.getState().cards;
    assert.strictEqual(rootCards.length, 1, "Root cards must contain 1 item after move");
    assert.strictEqual(rootCards[0].id, 'group-1', "Root card must be group-1");

    const groupChildCards = rootCards[0].data?.cards || [];
    assert.strictEqual(groupChildCards.length, 1, "Group cards must contain 1 child card");
    assert.strictEqual(groupChildCards[0].id, 'ramp-1', "Moved child card must be ramp-1");
    assert.strictEqual(groupChildCards[0].data?.velocity, 1.5, "Ramp step velocity must be preserved");
});

runTest('Tree Move: Moves a complex TakeWhile step with nested inner step into a Group intact', () => {
    useMechanicalTestStore.getState().resetStore();
    const initialCards: MechTestCard[] = [
        {
            id: 'takewhile-1',
            type: 'takeWhile',
            data: {
                take: { scanProfileId: 'xray-map-01' },
                step: {
                    id: 'inner-ramp-1',
                    type: 'ramp',
                    data: { control: 'displacement', endValue: 5.0, velocity: 0.2 }
                }
            }
        },
        {
            id: 'group-1',
            type: 'group',
            data: { cards: [], loops: 2 }
        }
    ];

    useMechanicalTestStore.getState().setCards(initialCards);

    const updated = useMechanicalTestStore.getState().moveCardInTree('takewhile-1', 'group-1');
    assert.notStrictEqual(updated, null, "moveCardInTree must return updated cards array");

    const rootCards = useMechanicalTestStore.getState().cards;
    assert.strictEqual(rootCards.length, 1);
    assert.strictEqual(rootCards[0].id, 'group-1');

    const groupChildCards = rootCards[0].data?.cards || [];
    assert.strictEqual(groupChildCards.length, 1);
    assert.strictEqual(groupChildCards[0].id, 'takewhile-1');

    const movedTakeWhile = groupChildCards[0];
    assert.strictEqual(movedTakeWhile.data?.take?.scanProfileId, 'xray-map-01', "take.scanProfileId must be preserved");
    assert.strictEqual(movedTakeWhile.data?.step?.id, 'inner-ramp-1', "inner step ID must be preserved");
    assert.strictEqual(movedTakeWhile.data?.step?.data?.velocity, 0.2, "inner step velocity must be preserved");
});

runTest('Tree Move: Moves a step into a depth-2 nested sub-group', () => {
    useMechanicalTestStore.getState().resetStore();
    const initialCards: MechTestCard[] = [
        {
            id: 'dwell-1',
            type: 'dwell',
            data: { duration: 30 }
        },
        {
            id: 'group-1',
            type: 'group',
            data: {
                cards: [
                    {
                        id: 'subgroup-1',
                        type: 'group',
                        data: { cards: [], loops: 5 }
                    }
                ],
                loops: 1
            }
        }
    ];

    useMechanicalTestStore.getState().setCards(initialCards);

    const updated = useMechanicalTestStore.getState().moveCardInTree('dwell-1', 'subgroup-1');
    assert.notStrictEqual(updated, null);

    const rootCards = useMechanicalTestStore.getState().cards;
    assert.strictEqual(rootCards.length, 1);

    const outerGroupCards = rootCards[0].data?.cards || [];
    assert.strictEqual(outerGroupCards.length, 1);
    assert.strictEqual(outerGroupCards[0].id, 'subgroup-1');

    const subGroupCards = outerGroupCards[0].data?.cards || [];
    assert.strictEqual(subGroupCards.length, 1);
    assert.strictEqual(subGroupCards[0].id, 'dwell-1');
    assert.strictEqual(subGroupCards[0].data?.duration, 30);
});

runTest('Tree Move: Moves a step out of a group back to root sequence', () => {
    useMechanicalTestStore.getState().resetStore();
    const initialCards: MechTestCard[] = [
        {
            id: 'group-1',
            type: 'group',
            data: {
                cards: [
                    {
                        id: 'cycle-1',
                        type: 'cycle',
                        data: { count: 100 }
                    }
                ],
                loops: 1
            }
        }
    ];

    useMechanicalTestStore.getState().setCards(initialCards);

    const updated = useMechanicalTestStore.getState().moveCardInTree('cycle-1', null);
    assert.notStrictEqual(updated, null);

    const rootCards = useMechanicalTestStore.getState().cards;
    assert.strictEqual(rootCards.length, 2);
    assert.strictEqual(rootCards[0].id, 'group-1');
    assert.strictEqual(rootCards[0].data?.cards?.length, 0);
    assert.strictEqual(rootCards[1].id, 'cycle-1');
    assert.strictEqual(rootCards[1].data?.count, 100);
});

runTest('Tree Move: Marks store as dirty after regrouping operation', () => {
    useMechanicalTestStore.getState().resetStore();
    const initialCards: MechTestCard[] = [
        { id: 'ramp-1', type: 'ramp', data: {} },
        { id: 'group-1', type: 'group', data: { cards: [] } }
    ];

    useMechanicalTestStore.setState({ cards: initialCards, savedCards: initialCards, isDirty: false });
    assert.strictEqual(useMechanicalTestStore.getState().isDirty, false);

    useMechanicalTestStore.getState().moveCardInTree('ramp-1', 'group-1');
    assert.strictEqual(useMechanicalTestStore.getState().isDirty, true);
});

runTest('Tree Move: Enforces maximum nesting depth of 2 when moving groups', () => {
    useMechanicalTestStore.getState().resetStore();
    const initialCards: MechTestCard[] = [
        {
            id: 'group-1',
            type: 'group',
            data: {
                cards: [
                    {
                        id: 'subgroup-1',
                        type: 'group',
                        data: { cards: [], loops: 1 }
                    }
                ],
                loops: 1
            }
        },
        {
            id: 'group-2',
            type: 'group',
            data: { cards: [], loops: 1 }
        }
    ];

    useMechanicalTestStore.getState().setCards(initialCards);

    // Attempting to move subgroup-1 into group-2 is fine (depth 2)
    const validMove = useMechanicalTestStore.getState().moveCardInTree('subgroup-1', 'group-2');
    assert.notStrictEqual(validMove, null, "Moving sub-group to another top group should succeed");

    // Attempting to move group-2 into subgroup-1 would create depth 3, so it must be blocked
    const invalidMove = useMechanicalTestStore.getState().moveCardInTree('group-1', 'subgroup-1');
    assert.strictEqual(invalidMove, null, "Moving group into sub-group exceeding max depth 2 must fail");
});

runTest('Tree Move: Prevents circular drop of a parent group into its own child', () => {
    useMechanicalTestStore.getState().resetStore();
    const initialCards: MechTestCard[] = [
        {
            id: 'parent-group',
            type: 'group',
            data: {
                cards: [
                    {
                        id: 'child-group',
                        type: 'group',
                        data: { cards: [], loops: 1 }
                    }
                ],
                loops: 1
            }
        }
    ];

    useMechanicalTestStore.getState().setCards(initialCards);

    const circularMove = useMechanicalTestStore.getState().moveCardInTree('parent-group', 'child-group');
    assert.strictEqual(circularMove, null, "Dropping parent group into its own child must return null");

    const rootCards = useMechanicalTestStore.getState().cards;
    assert.strictEqual(rootCards.length, 1, "Root cards must remain intact after blocked circular drop");
    assert.strictEqual(rootCards[0].id, 'parent-group');
});

runTest('Tree Move: Prevents dropping a card onto a non-group card (isCombineEnabled safeguard)', () => {
    useMechanicalTestStore.getState().resetStore();
    const initialCards: MechTestCard[] = [
        { id: 'ramp-1', type: 'ramp', data: { velocity: 1.0 } },
        { id: 'ramp-2', type: 'ramp', data: { velocity: 2.0 } }
    ];

    useMechanicalTestStore.getState().setCards(initialCards);

    const invalidMove = useMechanicalTestStore.getState().moveCardInTree('ramp-1', 'ramp-2');
    assert.strictEqual(invalidMove, null, "Dropping onto a non-group card must return null");

    const rootCards = useMechanicalTestStore.getState().cards;
    assert.strictEqual(rootCards.length, 2, "Root cards must remain intact when dropping onto non-group card");
    assert.strictEqual(rootCards[0].id, 'ramp-1');
    assert.strictEqual(rootCards[1].id, 'ramp-2');
});

runTest('Tree Move: Supports combine drop directly onto a group card without index', () => {
    useMechanicalTestStore.getState().resetStore();
    const initialCards: MechTestCard[] = [
        { id: 'ramp-1', type: 'ramp', data: { velocity: 3.5 } },
        { id: 'group-1', type: 'group', data: { cards: [], loops: 1 } }
    ];

    useMechanicalTestStore.getState().setCards(initialCards);

    const validMove = useMechanicalTestStore.getState().moveCardInTree('ramp-1', 'group-1');
    assert.notStrictEqual(validMove, null, "Dropping onto group card via combine must succeed");

    const rootCards = useMechanicalTestStore.getState().cards;
    assert.strictEqual(rootCards.length, 1);
    assert.strictEqual(rootCards[0].id, 'group-1');
    assert.strictEqual(rootCards[0].data?.cards?.length, 1);
    assert.strictEqual(rootCards[0].data?.cards?.[0].id, 'ramp-1');
});

runTest('Tree Move: Supports combine drop directly onto a depth-2 subgroup card', () => {
    useMechanicalTestStore.getState().resetStore();
    const initialCards: MechTestCard[] = [
        { id: 'ramp-1', type: 'ramp', data: { velocity: 4.2 } },
        {
            id: 'group-1',
            type: 'group',
            data: {
                cards: [
                    {
                        id: 'subgroup-1',
                        type: 'group',
                        data: { cards: [], loops: 1 }
                    }
                ],
                loops: 1
            }
        }
    ];

    useMechanicalTestStore.getState().setCards(initialCards);

    const validMove = useMechanicalTestStore.getState().moveCardInTree('ramp-1', 'subgroup-1');
    assert.notStrictEqual(validMove, null, "Dropping onto subgroup card via combine must succeed");

    const rootCards = useMechanicalTestStore.getState().cards;
    assert.strictEqual(rootCards.length, 1);
    assert.strictEqual(rootCards[0].id, 'group-1');
    const outerGroupCards = rootCards[0].data?.cards || [];
    assert.strictEqual(outerGroupCards.length, 1);
    assert.strictEqual(outerGroupCards[0].id, 'subgroup-1');

    const subGroupCards = outerGroupCards[0].data?.cards || [];
    assert.strictEqual(subGroupCards.length, 1);
    assert.strictEqual(subGroupCards[0].id, 'ramp-1');
    assert.strictEqual(subGroupCards[0].data?.velocity, 4.2);
});

console.log("\nAll Sequence Tree Regrouping & Edge-Case tests passed successfully!\n");
