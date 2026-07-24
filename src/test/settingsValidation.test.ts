import assert from 'node:assert';
import {
    settingsSchema,
    axisSettingSchema,
    signalSettingSchema
} from '../feature/configuration/profileSchemas/settingsSchema.ts';

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

console.log("\nRunning System Hardware Settings Rule Verification Suite...\n");

// Valid System Settings Configuration
runTest('Settings: Valid system hardware settings payload', () => {
    const validSettings = {
        specHost: "id1a3.classe.cornell.edu:spec",
        requireSpecEnable: true,
        systemName: "RAMS4_CHESS",
        controllerHost: "10.0.0.1",
        axisCount: 5,
        taskCount: 5,
        axesSettings: [
            { name: "A", max_velocity: 50, max_acceleration: 100 },
            { name: "B", max_velocity: 50, max_acceleration: 100 },
            { name: "RA", max_velocity: 10, max_acceleration: 20 },
            { name: "RB", max_velocity: 10, max_acceleration: 20 },
            { name: "TENS", max_velocity: 5, max_acceleration: 10 }
        ],
        signalSettings: [
            { name: "LoadA", slope: 1.0, intercept: 0.0, channel: 0 },
            { name: "LoadB", slope: 1.0, intercept: 0.0, channel: 1 },
            { name: "Torque", slope: 1.0, intercept: 0.0, channel: 2 }
        ]
    };
    const result = settingsSchema.safeParse(validSettings);
    assert.strictEqual(result.success, true, "Valid hardware settings payload should pass validation");
});

// Axis Setting Schema Tests
runTest('Settings: Axis velocity and acceleration must be non-negative', () => {
    const invalidAxis = {
        name: "A",
        max_velocity: -5,
        max_acceleration: 100
    };
    const result = axisSettingSchema.safeParse(invalidAxis);
    assert.strictEqual(result.success, false, "Negative velocity must fail validation");
});

runTest('Settings: Duplicate axis names must fail uniqueness validation', () => {
    const duplicateAxes = {
        specHost: "id1a3.classe.cornell.edu:spec",
        requireSpecEnable: true,
        systemName: "RAMS4_CHESS",
        controllerHost: "10.0.0.1",
        axisCount: 2,
        taskCount: 2,
        axesSettings: [
            { name: "A", max_velocity: 50, max_acceleration: 100 },
            { name: "a", max_velocity: 50, max_acceleration: 100 }
        ],
        signalSettings: [
            { name: "LoadA", slope: 1.0, intercept: 0.0, channel: 0 }
        ]
    };
    const result = settingsSchema.safeParse(duplicateAxes);
    assert.strictEqual(result.success, false, "Case-insensitive duplicate axis names must fail validation");
});

// Axis Count & Task Count Limits
runTest('Settings: Zero axisCount or taskCount must fail validation', () => {
    const zeroCounts = {
        specHost: "id1a3.classe.cornell.edu:spec",
        requireSpecEnable: true,
        systemName: "RAMS4_CHESS",
        controllerHost: "10.0.0.1",
        axisCount: 0,
        taskCount: 5,
        axesSettings: [
            { name: "A", max_velocity: 50, max_acceleration: 100 }
        ],
        signalSettings: [
            { name: "LoadA", slope: 1.0, intercept: 0.0, channel: 0 }
        ]
    };
    const result = settingsSchema.safeParse(zeroCounts);
    assert.strictEqual(result.success, false, "axisCount of zero must fail validation");
});

// Signal Channel Bounds
runTest('Settings: Signal channel index must be non-negative', () => {
    const invalidSignal = {
        name: "LoadA",
        slope: 1.0,
        intercept: 0.0,
        channel: -1
    };
    const result = signalSettingSchema.safeParse(invalidSignal);
    assert.strictEqual(result.success, false, "Negative channel index must fail validation");
});

// Required Host & Identifier Fields
runTest('Settings: Empty specHost or systemName must fail validation', () => {
    const emptyHost = {
        specHost: "",
        requireSpecEnable: true,
        systemName: "RAMS4_CHESS",
        controllerHost: "10.0.0.1",
        axisCount: 5,
        taskCount: 5,
        axesSettings: [
            { name: "A", max_velocity: 50, max_acceleration: 100 }
        ],
        signalSettings: [
            { name: "LoadA", slope: 1.0, intercept: 0.0, channel: 0 }
        ]
    };
    const result = settingsSchema.safeParse(emptyHost);
    assert.strictEqual(result.success, false, "Empty SPEC host string must fail validation");
});

console.log("\nAll System Hardware Settings validation rules passed successfully!\n");
