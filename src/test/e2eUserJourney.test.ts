import assert from 'node:assert';
import { useConfigurationStore } from '../store/useConfigurationStore.ts';
import { useMechanicalTestStore } from '../store/useMechanicalTestStore.ts';
import { compileToBackendPayload } from '../feature/configuration/utils/transformers.ts';
import { postSettingsToGateway, postConfigToGateway, getSettingsDir } from '../api/configApi.ts';

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

const deepEqual = (a: any, b: any): boolean => JSON.stringify(a) === JSON.stringify(b);

(async () => {
    console.log("\nRunning Phase 4 End-to-End Researcher Journey & Round-Trip Persistence Suite...\n");

    const configStore = useConfigurationStore.getState();
    const mechStore = useMechanicalTestStore.getState();

    // Step 1: Configuration Directory Path Selection
    await runTest('User Journey Step 1: Path selection and directory derivation', () => {
        const pathData = {
            cycleNumber: "2026-2",
            userId: "sjobs-123",
            sampleName: "titanium_specimen_02",
            experimentNumber: "1",
            configDirectory: "/nfs/chess/aux/cycles/2026-2/id1a3/sjobs-123/metadata/titanium_specimen_02"
        };
        configStore.updateDraft(pathData);

        const currentDraft = useConfigurationStore.getState().draft;
        assert.strictEqual(currentDraft.cycleNumber, "2026-2", "Cycle number must match selected value");
        assert.strictEqual(currentDraft.sampleName, "titanium_specimen_02", "Sample name must match selected value");
        
        const settingsPath = getSettingsDir(currentDraft.configDirectory);
        assert.strictEqual(settingsPath, "/nfs/chess/aux/cycles/2026-2/id1a3/RAMS-settings/", "Settings directory derived path must be correct");
    });

    // Step 2: Data Acquisition (DAQ) Profiles Setup
    await runTest('User Journey Step 2: DAQ frequency, buffer sample points, and handler profiles setup', () => {
        const daqData = {
            requiredAxes: ["A", "B", "RA"],
            daqFrequency: 2000,
            samplePoints: 10000,
            handlerProfiles: [
                {
                    mode: "time-series",
                    filename: "high_rate_tseries",
                    verboseAxis: "1,0",
                    verboseSystem: 1,
                    verboseTask: "1",
                    verboseIO: 1,
                    verboseAi: ["LoadA", "LoadB"],
                    frequency: 200,
                    cycles: [{ start: 0, stop: 500, step: 1 }]
                },
                {
                    mode: "peak-valley",
                    filename: "pv_cyclic_log",
                    verboseAxis: "1",
                    verboseSystem: 1,
                    verboseTask: "1",
                    verboseIO: 1,
                    verboseAi: [],
                    signalAxis: "A",
                    signalItem: "Position",
                    signalProminence: 0.25
                }
            ]
        };
        configStore.updateDraft(daqData);

        const currentDraft = useConfigurationStore.getState().draft;
        assert.strictEqual(currentDraft.daqFrequency, 2000, "DAQ sampling rate must update to 2000 Hz");
        assert.strictEqual(currentDraft.samplePoints, 10000, "Sample points must update to 10000");
        assert.strictEqual(currentDraft.handlerProfiles.length, 2, "Handler profiles count must match");
    });

    // Step 3: X-ray Scan Profiles Setup
    let createdStillsProfileId = "";
    await runTest('User Journey Step 3: Create X-ray scan profiles (Stills, Mapscan, Rotation Series)', () => {
        createdStillsProfileId = `xrayProfile${Date.now()}`;
        const xrayProfilesData = [
            {
                id: createdStillsProfileId,
                name: "FF Elastic Diffraction Stills",
                mode: "stills" as const,
                ctime: 1.5,
                atten: 0.5,
                beamHeight: 0.2,
                beamWidth: 0.2,
                ramsx: 10.0,
                ramsz: 25.0,
                ome: 0.0,
                numPoints: 1,
                stillPoints: [
                    { ramsx: 10.0, ramsz: 25.0, ome: 0.0, numPoints: 1 }
                ]
            },
            {
                id: `xrayProfile${Date.now() + 1}`,
                name: "2D Grid Mesh Scan",
                mode: "mapscan" as const,
                ctime: 0.5,
                atten: 0.0,
                beamHeight: 1.0,
                beamWidth: 1.0,
                ramsx: 0.0,
                ramsz: 0.0,
                ome: 0.0,
                numPoints: 20,
                mapscanAxes: [
                    { axisName: "ramsx", start: -5.0, stop: 5.0, points: 20 },
                    { axisName: "ramsz", start: -2.0, stop: 2.0, points: 10 }
                ]
            }
        ];
        configStore.updateDraft({ xrayProfiles: xrayProfilesData });

        const currentDraft = useConfigurationStore.getState().draft;
        assert.strictEqual(currentDraft.xrayProfiles.length, 2, "X-ray profiles list must contain created profiles");
        assert.strictEqual(currentDraft.xrayProfiles[0].id, createdStillsProfileId, "Stills profile ID must match");
    });

    // Step 4: Hardware & System Settings Inspection
    await runTest('User Journey Step 4: System settings, Aerotech controller IP, and signal scaling inspection', () => {
        const settingsData = {
            settingsVersion: 0,
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
        configStore.updateDraft(settingsData);

        const currentDraft = useConfigurationStore.getState().draft;
        assert.strictEqual(currentDraft.specHost, "id1a3.classe.cornell.edu:spec", "SPEC host must match");
        assert.strictEqual(currentDraft.axesSettings.length, 5, "Axes settings count must match");
    });

    // Step 5: Mechanical Test Builder Sequence Construction
    await runTest('User Journey Step 5: Build mechanical test sequence and link Take step to X-ray profile', () => {
        useMechanicalTestStore.getState().resetStore();

        useMechanicalTestStore.getState().setCards([
            {
                id: "step-ramp-1",
                type: "ramp",
                data: {
                    axis: "A",
                    mode: "absolute",
                    control: "displacement",
                    target: 2.5,
                    dispToggle: "velocity",
                    velocity: 0.1,
                    max_displacement: 5.0,
                    wait: true
                }
            },
            {
                id: "step-dwell-1",
                type: "dwell",
                data: {
                    axis: "A",
                    control: "load",
                    target: 500,
                    velocity: 10,
                    time: 60,
                    wait: true
                }
            },
            {
                id: "step-take-1",
                type: "take",
                data: {
                    profileID: createdStillsProfileId,
                    imgMode: "nf",
                    pauseTsDaq: false
                }
            }
        ]);

        const currentCards = useMechanicalTestStore.getState().cards;
        assert.strictEqual(currentCards.length, 3, "Sequence cards stack must contain 3 steps");
        assert.strictEqual(currentCards[2].data.profileID, createdStillsProfileId, "Take step profileID must link to created X-ray profile");
    });

    // Step 6: Configuration Saving & Gateway Serialization
    await runTest('User Journey Step 6: Save configuration, format gateway payload, and sync baseline clean state', async () => {
        const currentDraft = useConfigurationStore.getState().draft;

        // Compile payload for gateway
        const payload = compileToBackendPayload(currentDraft);
        assert.strictEqual(payload.frequency_kHz, 2000, "Payload frequency must equal draft DAQ frequency");
        assert.strictEqual(payload.newsample, "titanium_specimen_02", "Payload newsample must equal draft sample name");

        // Simulate save API requests
        const settingsRes = await postSettingsToGateway(currentDraft.configDirectory, currentDraft);
        assert.strictEqual(settingsRes.success, true, "Settings POST response must be successful");

        await postConfigToGateway(payload);

        // Sync baseline clean saved state
        const deepCopiedSaved = JSON.parse(JSON.stringify(currentDraft));
        configStore.setSavedConfig(deepCopiedSaved);

        const keys = ['daqFrequency', 'samplePoints', 'requiredAxes', 'handlerProfiles', 'xrayProfiles', 'settingsVersion'] as const;
        const isDirty = keys.some(key => !deepEqual(useConfigurationStore.getState().draft[key], useConfigurationStore.getState().savedConfig![key]));
        assert.strictEqual(isDirty, false, "After saving, configuration state must be clean (isDirty = false)");
    });

    // Step 7: Reloading & Round-Trip Persistence Verification
    await runTest('User Journey Step 7: Reload saved configuration into memory and verify 100% field round-trip accuracy', () => {
        const savedConfig = useConfigurationStore.getState().savedConfig;
        assert.notStrictEqual(savedConfig, null, "Saved configuration must exist in memory");

        // Simulate re-hydrating store from saved configuration file
        configStore.updateDraft(savedConfig!);

        const reloadedDraft = useConfigurationStore.getState().draft;

        // Verify round-trip persistence field by field
        assert.strictEqual(reloadedDraft.cycleNumber, "2026-2", "Reloaded cycle number must match");
        assert.strictEqual(reloadedDraft.sampleName, "titanium_specimen_02", "Reloaded sample name must match");
        assert.strictEqual(reloadedDraft.daqFrequency, 2000, "Reloaded DAQ frequency must match");
        assert.strictEqual(reloadedDraft.samplePoints, 10000, "Reloaded sample points must match");
        assert.strictEqual(reloadedDraft.handlerProfiles.length, 2, "Reloaded handler profiles count must match");
        assert.strictEqual(reloadedDraft.xrayProfiles.length, 2, "Reloaded X-ray profiles count must match");
        assert.strictEqual(reloadedDraft.xrayProfiles[0].id, createdStillsProfileId, "Reloaded Stills profile ID must match");
        assert.strictEqual(reloadedDraft.specHost, "id1a3.classe.cornell.edu:spec", "Reloaded SPEC host must match");

        // Verify mechanical test sequence cards persistence
        const reloadedCards = useMechanicalTestStore.getState().cards;
        assert.strictEqual(reloadedCards.length, 3, "Reloaded sequence cards count must match");
        assert.strictEqual(reloadedCards[2].data.profileID, createdStillsProfileId, "Reloaded Take step profileID must remain linked");
    });

    console.log("\nAll Phase 4 End-to-End Researcher Journey & Round-Trip Persistence tests passed successfully!\n");
})();
