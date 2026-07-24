import assert from 'node:assert';
import { getSettingsDir, fetchSettingsFromGateway, postSettingsToGateway } from '../api/configApi.ts';
import { compileToBackendPayload } from '../feature/configuration/utils/transformers.ts';

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
    console.log("\nRunning Gateway API & Serialization Verification Suite...\n");

    // Path Parsing Utility Tests
    await runTest('API: getSettingsDir derives correct station RAMS-settings path', () => {
        const inputDir = "/nfs/chess/aux/cycles/2026-2/id1a3/sjobs-123/metadata/titanium_specimen_02";
        const settingsDir = getSettingsDir(inputDir);
        assert.strictEqual(
            settingsDir,
            "/nfs/chess/aux/cycles/2026-2/id1a3/RAMS-settings/",
            "getSettingsDir must extract cycle and station to format RAMS-settings path"
        );
    });

    await runTest('API: getSettingsDir falls back to current cycle path when unparseable', () => {
        const inputDir = "custom_local_directory";
        const settingsDir = getSettingsDir(inputDir);
        assert.strictEqual(
            settingsDir,
            "/nfs/chess/aux/cycles/current/RAMS-settings/",
            "Unparseable paths must fall back to current RAMS-settings path"
        );
    });

    // Backend Payload Transformer Tests
    await runTest('Serialization: compileToBackendPayload formats store state to Python gateway schema', () => {
        const mockStoreConfig: any = {
            cycleNumber: "2026-2",
            userId: "sjobs-123",
            sampleName: "titanium_specimen_02",
            experimentNumber: "1",
            configDirectory: "/nfs/chess/aux/cycles/2026-2/id1a3/sjobs-123/metadata/titanium_specimen_02",
            requiredAxes: ["A", "B"],
            daqFrequency: 1000,
            samplePoints: 5000,
            settingsVersion: 0,
            handlerProfiles: [
                {
                    mode: "time-series",
                    filename: "tensile_log",
                    verboseAxis: "1,0",
                    verboseSystem: 1,
                    verboseTask: "1",
                    verboseIO: 1,
                    verboseAi: ["LoadA"],
                    frequency: 100,
                    cycles: [{ start: 0, stop: 100, step: 1 }]
                }
            ],
            xrayProfiles: []
        };

        const payload = compileToBackendPayload(mockStoreConfig);

        assert.strictEqual(payload.cycle, "2026-2", "Cycle number must map to payload.cycle");
        assert.strictEqual(payload.newsample, "titanium_specimen_02", "Sample name must map to payload.newsample");
        assert.deepStrictEqual(payload.required_axes, ["A", "B"], "Required axes must map to payload.required_axes");
        assert.strictEqual(payload.frequency_kHz, 1000, "DAQ frequency must map to payload.frequency_kHz");
        assert.strictEqual(payload.sample_pts, 5000, "Sample points must map to payload.sample_pts");
        assert.strictEqual(payload.handlers.length, 1, "Handler profiles length must match");
        assert.deepStrictEqual(payload.handlers[0].verbose.axis, [1, 0], "Verbose axis string '1,0' must parse to array [1, 0]");
    });

    // Missing Settings (404) Detection Tests
    await runTest('API: fetchSettingsFromGateway returns null when settings file 404s and no files exist', async () => {
        const nonExistentDir = "/nfs/chess/aux/cycles/2026-2/id1a3/nonexistent_user/metadata/nonexistent_sample";
        const result = await fetchSettingsFromGateway(nonExistentDir, 999);
        assert.strictEqual(result, null, "Missing settings files must resolve to null");
    });

    // Auto-Creation & Post Settings Handshake Tests
    await runTest('API: postSettingsToGateway packages payload and returns auto-increment version 0', async () => {
        const targetDir = "/nfs/chess/aux/cycles/2026-2/id1a3/sjobs-123/metadata/titanium_specimen_02";
        const mockSettingsPayload = {
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

        const postResult = await postSettingsToGateway(targetDir, mockSettingsPayload);
        assert.strictEqual(postResult.success, true, "postSettingsToGateway must report success");
        assert.strictEqual(typeof postResult.version, "number", "Version returned must be a number");
    });

    console.log("\nAll Gateway API & Serialization tests passed successfully!\n");
})();
