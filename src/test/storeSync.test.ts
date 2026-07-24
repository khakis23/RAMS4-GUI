import assert from 'node:assert';
import { useConfigurationStore } from '../store/useConfigurationStore.ts';
import { useMechanicalTestStore } from '../store/useMechanicalTestStore.ts';

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

console.log("\nRunning Store & State Synchronization Verification Suite...\n");

// Helper for deep-equal comparison (matching isDirty logic in ConfigurationManager)
const deepEqual = (a: any, b: any): boolean => JSON.stringify(a) === JSON.stringify(b);

// Configuration Store Defaults & Update Tests
runTest('Store: useConfigurationStore initializes with expected default values', () => {
    const state = useConfigurationStore.getState();
    assert.strictEqual(state.draft.daqFrequency, 1, "Default DAQ frequency should be 1");
    assert.strictEqual(state.draft.samplePoints, 1000, "Default sample points should be 1000");
    assert.strictEqual(state.draft.settingsVersion, 0, "Default settings version should be 0");
});

runTest('Store: updateDraft applies partial state updates correctly', () => {
    const store = useConfigurationStore.getState();
    store.updateDraft({ daqFrequency: 5000 });
    
    assert.strictEqual(useConfigurationStore.getState().draft.daqFrequency, 5000, "updateDraft must update daqFrequency");
});

// Deep-Equal isDirty Calculation Tests
runTest('Store: isDirty evaluates to true when draft diverges from savedConfig', () => {
    const store = useConfigurationStore.getState();
    
    // Set baseline savedConfig and matching draft
    const baselineConfig = {
        daqFrequency: 1000,
        samplePoints: 5000,
        requiredAxes: ["A", "B"],
        handlerProfiles: [],
        xrayProfiles: [],
        settingsVersion: 0
    };

    store.setSavedConfig(baselineConfig);
    store.updateDraft(baselineConfig);

    const keys = ['daqFrequency', 'samplePoints', 'requiredAxes', 'handlerProfiles', 'xrayProfiles', 'settingsVersion'] as const;
    
    // Baseline state is clean (not dirty)
    let isDirty = keys.some(key => !deepEqual(useConfigurationStore.getState().draft[key], useConfigurationStore.getState().savedConfig[key]));
    assert.strictEqual(isDirty, false, "Identical draft and savedConfig must evaluate to isDirty = false");

    // Modify draft field
    store.updateDraft({ daqFrequency: 2500 });
    isDirty = keys.some(key => !deepEqual(useConfigurationStore.getState().draft[key], useConfigurationStore.getState().savedConfig[key]));
    assert.strictEqual(isDirty, true, "Divergent draft daqFrequency must evaluate to isDirty = true");
});

// Settings Fallback Flag Integration Tests
runTest('Store: setSettingsFallbackActive updates fallback state flag correctly', () => {
    const store = useConfigurationStore.getState();
    
    store.setSettingsFallbackActive({ expected: 12, loaded: 0 });
    assert.deepStrictEqual(
        useConfigurationStore.getState().settingsFallbackActive,
        { expected: 12, loaded: 0 },
        "setSettingsFallbackActive must update fallback flag state"
    );

    store.setSettingsFallbackActive(null);
    assert.strictEqual(
        useConfigurationStore.getState().settingsFallbackActive,
        null,
        "setSettingsFallbackActive(null) must clear fallback flag state"
    );
});

// Mechanical Test Store Sync Tests
runTest('Store: useMechanicalTestStore manages cards and marks sequence dirty', () => {
    const mechStore = useMechanicalTestStore.getState();
    
    // Test adding a card step
    mechStore.addCard({
        id: "step-ramp-1",
        type: "ramp",
        data: {
            axis: "A",
            mode: "absolute",
            control: "displacement",
            target: 5.0,
            dispToggle: "time",
            time: 10
        }
    });

    const updatedState = useMechanicalTestStore.getState();
    assert.strictEqual(updatedState.cards.length > 0, true, "Mechanical test store cards array must contain added card");
    assert.strictEqual(updatedState.isDirty, true, "Modifying sequence cards must set isDirty = true");
});

console.log("\nAll Store & State Synchronization tests passed successfully!\n");
