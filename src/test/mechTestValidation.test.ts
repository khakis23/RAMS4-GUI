import assert from 'node:assert';
import {
    rampSchema,
    dwellSchema,
    cycleSchema,
    takeSchema,
    takeWhileSchema,
    customSchema,
    mechTestFormSchema
} from '../feature/sequence/profileSchemas/mechTestSchema.ts';
import { dicFormSchema } from '../feature/configuration/profileSchemas/dicSchema.ts';
import { formatCardsForBackend, parseCardsFromBackend } from '../store/useMechanicalTestStore.ts';

// Helper runner for grouping test assertions cleanly
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

console.log("\nRunning Mechanical Test Sequence Rule Verification Suite...\n");

// Ramp Command Tests
runTest('Ramp: Valid displacement control with time toggle', () => {
    const validRampTime = {
        target: 1,
        time: 1,
        max_displacement: 1,
        axis: "A",
        mode: "absolute",
        control: "displacement",
        dispToggle: "time",
        enable_dic: false,
        skipDICpos: false,
        incrementSeg: false,
        wait: true,
        velocity: null
    };
    const result = rampSchema.safeParse(validRampTime);
    assert.strictEqual(result.success, true, "Ramp with time toggle should be valid");
});

runTest('Ramp: Valid displacement control with velocity toggle', () => {
    const validRampVel = {
        target: 1,
        time: null,
        max_displacement: 1,
        axis: "A",
        mode: "absolute",
        control: "displacement",
        dispToggle: "velocity",
        enable_dic: false,
        skipDICpos: false,
        incrementSeg: false,
        wait: true,
        velocity: 1
    };
    const result = rampSchema.safeParse(validRampVel);
    assert.strictEqual(result.success, true, "Ramp with velocity toggle should be valid");
});

runTest('Ramp: Valid load control with velocity rate', () => {
    const validRampLoad = {
        target: 1,
        time: null,
        max_displacement: 1,
        axis: "B",
        mode: "absolute",
        control: "load",
        velocity: 1,
        enable_dic: true,
        skipDICpos: false,
        incrementSeg: false,
        wait: true
    };
    const result = rampSchema.safeParse(validRampLoad);
    assert.strictEqual(result.success, true, "Ramp with load control should be valid");
});

runTest('Ramp: Invalid displacement control missing time parameter', () => {
    const invalidRamp = {
        target: 1,
        time: null,
        axis: "A",
        mode: "absolute",
        control: "displacement",
        dispToggle: "time"
    };
    const result = rampSchema.safeParse(invalidRamp);
    assert.strictEqual(result.success, false, "Ramp with displacement time toggle missing time must fail");
});

// Dwell Command Tests
runTest('Dwell: Valid dwell step configuration', () => {
    const validDwell = {
        target: 1,
        velocity: 1,
        time: 1,
        axis: "A",
        control: "load",
        incrementSeg: false,
        wait: true
    };
    const result = dwellSchema.safeParse(validDwell);
    assert.strictEqual(result.success, true, "Dwell command should be valid");
});

runTest('Dwell: Invalid dwell step missing required duration time', () => {
    const invalidDwell = {
        target: 1,
        velocity: 1,
        axis: "A",
        control: "load"
    };
    const result = dwellSchema.safeParse(invalidDwell);
    assert.strictEqual(result.success, false, "Dwell missing duration time must fail");
});

// Cycle Command Tests
runTest('Cycle: Valid cyclic loading step configuration', () => {
    const validCycle = {
        upper: 1,
        lower: 1,
        frequency: 1,
        cycleEnd: 1,
        ampScale: 0.95,
        manualDispUpper: null,
        manualDispLower: null,
        axis: "A",
        mode: "absolute",
        control: "displacement",
        countMode: "relative",
        discoverEndpoints: false,
        recallEndpoints: false,
        "enable DIC": false,
        incrementSeg: false,
        wait: true
    };
    const result = cycleSchema.safeParse(validCycle);
    assert.strictEqual(result.success, true, "Cycle step should be valid");
});

runTest('Cycle: Invalid cycle step missing required frequency', () => {
    const invalidCycle = {
        upper: 1,
        lower: 1,
        cycleEnd: 1,
        axis: "A",
        mode: "absolute",
        control: "displacement",
        countMode: "relative"
    };
    const result = cycleSchema.safeParse(invalidCycle);
    assert.strictEqual(result.success, false, "Cycle missing frequency must fail");
});

// Take Command Tests
runTest('Take: Valid image acquisition step configuration', () => {
    const validTake = {
        profileID: "xrayProfile1784655169284",
        pauseTsDaq: false,
        incrementSeg: false,
        imgMode: "nf"
    };
    const result = takeSchema.safeParse(validTake);
    assert.strictEqual(result.success, true, "Take step should be valid");
});

runTest('Take: Invalid take step missing required profileID', () => {
    const invalidTake = {
        pauseTsDaq: false,
        imgMode: "nf"
    };
    const result = takeSchema.safeParse(invalidTake);
    assert.strictEqual(result.success, false, "Take missing profileID must fail");
});

// Take-While Command Tests
runTest('Take-While: Valid concurrent image and motion step', () => {
    const validTakeWhile = {
        take: {
            data: {
                profileID: "xrayProfile1784655183509",
                imgMode: null,
                pauseTsDaq: false
            }
        },
        step: {
            type: "dwell",
            data: {
                velocity: 1,
                wait: true,
                target: 1,
                time: 1,
                axis: "A",
                control: "load"
            }
        }
    };
    const result = takeWhileSchema.safeParse(validTakeWhile);
    assert.strictEqual(result.success, true, "TakeWhile step should be valid");
});

// Custom Step Tests
runTest('Custom: Valid custom step with typed parameters', () => {
    const validCustom = {
        commandName: "Laser Trigger",
        parameters: [
            { key: "power", type: "Number", value: 100 },
            { key: "enabled", type: "Bool", value: true },
            { key: "label", type: "String", value: "high-power" }
        ]
    };
    const result = customSchema.safeParse(validCustom);
    assert.strictEqual(result.success, true, "Custom step with typed parameters should be valid");
});

runTest('Custom: Serializes custom step with nested args schema', () => {
    const customCard: any = {
        id: "card-custom-1",
        type: "custom",
        data: {
            commandName: "my_cmd",
            parameters: [
                { key: "some_key", type: "String", value: "some_value" },
                { key: "some_bool", type: "Bool", value: true },
                { key: "some_num", type: "Number", value: 123 }
            ]
        }
    };
    const formatted = formatCardsForBackend([customCard]);
    assert.deepStrictEqual(formatted, [
        {
            custom: {
                commandName: "my_cmd",
                args: {
                    some_key: "some_value",
                    some_bool: true,
                    some_num: 123
                }
            }
        }
    ], "Formatted custom step should place parameter key-values under args object");
});

runTest('Custom: Parses custom step with nested args schema from backend', () => {
    const backendPayload = [
        {
            custom: {
                commandName: "my_cmd",
                args: {
                    some_key: "some_value",
                    some_bool: true,
                    some_num: 123
                }
            }
        }
    ];
    const parsed = parseCardsFromBackend(backendPayload);
    assert.strictEqual(parsed.length, 1);
    assert.strictEqual(parsed[0].type, 'custom');
    assert.strictEqual(parsed[0].data.commandName, 'my_cmd');
    assert.deepStrictEqual(parsed[0].data.parameters, [
        { key: "some_key", type: "String", value: "some_value" },
        { key: "some_bool", type: "Bool", value: true },
        { key: "some_num", type: "Number", value: 123 }
    ], "Parsed custom step should extract parameter array from args object");
});

runTest('Custom: Backward compatibility for legacy flat custom step payload', () => {
    const legacyPayload = [
        {
            custom: {
                commandName: "legacy_cmd",
                legacy_key: "legacy_val",
                legacy_flag: false
            }
        }
    ];
    const parsed = parseCardsFromBackend(legacyPayload);
    assert.strictEqual(parsed[0].data.commandName, 'legacy_cmd');
    assert.deepStrictEqual(parsed[0].data.parameters, [
        { key: "legacy_key", type: "String", value: "legacy_val" },
        { key: "legacy_flag", type: "Bool", value: false }
    ], "Parsed legacy custom step should extract parameters directly from root payload");
});

// Group Nesting Limit Tests
runTest('Group: Single nested group (depth 1) is valid', () => {
    const singleNestedGroup = {
        cards: [
            {
                id: "group-1",
                type: "group",
                data: {
                    loops: 99,
                    cards: [
                        {
                            id: "step-1",
                            type: "take",
                            data: {
                                profileID: "xrayProfile1784655183509",
                                pauseTsDaq: false
                            }
                        }
                    ]
                }
            }
        ]
    };
    const result = mechTestFormSchema.safeParse(singleNestedGroup);
    assert.strictEqual(result.success, true, "Single nested group should be valid");
});

runTest('Group: Double nested group (depth 2) is valid', () => {
    const doubleNestedGroup = {
        cards: [
            {
                id: "group-outer",
                type: "group",
                data: {
                    loops: 1,
                    cards: [
                        {
                            id: "group-inner",
                            type: "group",
                            data: {
                                loops: 1,
                                cards: [
                                    {
                                        id: "step-1",
                                        type: "take",
                                        data: {
                                            profileID: "xrayProfile1784655183509",
                                            pauseTsDaq: false
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        ]
    };
    const result = mechTestFormSchema.safeParse(doubleNestedGroup);
    assert.strictEqual(result.success, true, "Double nested group (depth 2) should be valid");
});

runTest('Group: Triple nested group (depth 3) must exceed nesting limit and fail', () => {
    const tripleNestedGroup = {
        cards: [
            {
                id: "group-depth-1",
                type: "group",
                data: {
                    loops: 1,
                    cards: [
                        {
                            id: "group-depth-2",
                            type: "group",
                            data: {
                                loops: 1,
                                cards: [
                                    {
                                        id: "group-depth-3",
                                        type: "group",
                                        data: {
                                            loops: 1,
                                            cards: [
                                                {
                                                    id: "step-1",
                                                    type: "take",
                                                    data: {
                                                        profileID: "xrayProfile1784655183509",
                                                        pauseTsDaq: false
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        ]
    };
    const result = mechTestFormSchema.safeParse(tripleNestedGroup);
    assert.strictEqual(result.success, false, "Triple nested group (depth 3) must fail validation");
});

// DIC Tab Validation Tests
runTest('DIC: Valid DIC Stills profile with point list coordinates', () => {
    const validDicForm = {
        dicProfiles: [
            {
                id: "dic-1",
                name: "Optical Strain Scan",
                mode: "stills",
                ctime: 1.0,
                stillPoints: [
                    {
                        ramsx: 10.5,
                        ramsz: 20.0,
                        ome: 0,
                        numPoints: 1
                    }
                ]
            }
        ]
    };
    const result = dicFormSchema.safeParse(validDicForm);
    assert.strictEqual(result.success, true, "DIC form with valid profile should pass validation");
});

runTest('DIC: Invalid DIC Stills profile with zero points (must fail completeness validation)', () => {
    const invalidDicForm = {
        dicProfiles: [
            {
                id: "dic-2",
                name: "Empty DIC Stills",
                mode: "stills",
                ctime: 1.0,
                stillPoints: []
            }
        ]
    };
    const result = dicFormSchema.safeParse(invalidDicForm);
    assert.strictEqual(result.success, false, "DIC Stills profile with zero points must fail validation");
});

runTest('DIC: Invalid DIC Stills profile missing Profile Name', () => {
    const missingNameDicForm = {
        dicProfiles: [
            {
                id: "dic-3",
                name: "",
                mode: "stills",
                ctime: 1.0,
                stillPoints: [
                    { ramsx: 0, ramsz: 0, ome: 0, numPoints: 1 }
                ]
            }
        ]
    };
    const result = dicFormSchema.safeParse(missingNameDicForm);
    assert.strictEqual(result.success, false, "DIC profile missing Profile Name must fail validation");
});

console.log("\nAll Mechanical Test Sequence validation rules passed successfully!\n");
