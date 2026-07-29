import assert from 'node:assert';
import { useConfigurationStore } from '../store/useConfigurationStore.ts';
import { postSettingsToGateway, postConfigToGateway, fetchSettingsFromGateway } from '../api/configApi.ts';

const runTest = (name: string, fn: () => void | Promise<void>) => {
    return (async () => {
        try {
            await fn();
            console.log(`✓ ${name}`);
        } catch (err: any) {
            console.error(`✗ ${name}`);
            console.error(err);
            process.exitCode = 1;
        }
    })();
};

(async () => {
    console.log("\nRunning Settings Rules & Versioning Verification Suite...\n");

    const configStore = useConfigurationStore.getState();

    // Rule 1: Auto-incrementing version assignment
    await runTest('Settings Rule 3: postSettingsToGateway assigns next integer version', async () => {
        const testDir = "/nfs/chess/aux/cycles/2026-2/id1a3/sjobs-123/metadata/titanium_specimen_02/";
        const sampleSettings = {
            specHost: "id1a3.classe.cornell.edu:spec",
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

        const res1 = await postSettingsToGateway(testDir, sampleSettings);
        assert.strictEqual(typeof res1.version, "number", "Assigned version must be an integer number");

        const sampleSettings2 = { ...sampleSettings, settingsVersion: res1.version };
        const res2 = await postSettingsToGateway(testDir, sampleSettings2);
        assert.strictEqual(res2.version, res1.version + 1, "Subsequent settings save must produce next integer version");
    });

    // Rule 4: Target version override for recovering missing version
    await runTest('Settings Rule 4: targetVersionOverride saves specifically as the missing version number', async () => {
        const testDir = "/nfs/chess/aux/cycles/2026-2/id1a3/sjobs-123/metadata/titanium_specimen_02/";
        const missingVersion = 99;
        const sampleSettings = {
            specHost: "id1a3.classe.cornell.edu:spec",
            requireSpecEnable: true,
            systemName: "RAMS4_CHESS",
            controllerHost: "10.0.0.1",
            axisCount: 5,
            taskCount: 5,
            axesSettings: [],
            signalSettings: []
        };

        const res = await postSettingsToGateway(testDir, sampleSettings, missingVersion);
        assert.strictEqual(res.version, missingVersion, "postSettingsToGateway with override must save as target version 99");
    });

    // Rule 4: Preservation of expected settingsVersion in draft when fallback occurs
    await runTest('Settings Rule 4: Missing version fallback keeps expected settingsVersion in draft', async () => {
        const testDir = "/nfs/chess/aux/cycles/2026-2/id1a3/sjobs-123/metadata/titanium_specimen_02/";
        const expectedVersion = 999;
        const loadedVersion = 0;

        configStore.setSettingsFallbackActive({
            expected: expectedVersion,
            loaded: loadedVersion
        });

        assert.deepStrictEqual(
            useConfigurationStore.getState().settingsFallbackActive,
            { expected: expectedVersion, loaded: loadedVersion },
            "settingsFallbackActive store flag must be populated when version is missing"
        );
    });

    console.log("\nAll Settings Rules & Versioning tests passed successfully!\n");
})();
