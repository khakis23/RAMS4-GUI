

// Temporary fallback database for static frontend builds (e.g. GitHub Pages) where no active Node.js mock server is running.
// This allows reviewers and users on static hosts to fully interact with the configuration cascades.
const staticMockData: Record<string, (prev: string) => string[]> = {
    cycle: () => ['2026-2', '2026-1'],
    station: () => ['id1a3', 'id1b3'],
    btr: (prev) => {
        const cycle = prev.split('/')[0];
        if (cycle === '2026-2') {
            return ['sjobs-123', 'tcook-456', 'jternus789'];
        } else if (cycle === '2026-1') {
            return ['assmith-10001-a', 'jdeer-4453-6b'];
        }
        return ['sjobs-123', 'tcook-456'];
    },
    sample: (prev) => {
        const parts = prev.split('/');
        const btr = parts[2] || parts[0];
        if (btr === 'sjobs-123') return ["titanium_specimen_02", "titanium_tensile_01"];
        if (btr === 'tcook-456') return ["aluminum_shear_02", "nickel_superalloy_01", "copper_alloy_01"];
        if (btr === 'jternus789') return ["nickel_superalloy_04", "copper_alloy_03"];
        if (btr === 'assmith-10001-a') return ["zircaloy_tube_02", "glassy_carbon_pillar_05", "ti_64_printed_tensile_11"];
        return ["titanium_specimen_02"];
    },
    experiment: (prev) => {
        const parts = prev.split('/');
        const sample = parts[parts.length - 1];
        if (sample === 'titanium_specimen_02' || sample === 'aluminum_shear_02') return ['1', '2', '3'];
        if (sample === 'titanium_tensile_01' || sample === 'glassy_carbon_pillar_05') return ['1', '2', '3', '4'];
        return ['1', '2'];
    }
};

/**
 * Sends a single complete JSON file to the user's data directory on the Python gateway server.
 * Includes a temporary fallback for static host environments.
 */
export const postConfigToGateway = async (
    payload: any
): Promise<void> => {
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log("Saving Config to backend gateway for path:", payload?.configDirectory);

    try {
        const response = await fetch('/mock-gateway-api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Failed to save configuration to mock gateway');
        }
    } catch (err) {
        // Fallback for static hosts
        console.warn("Backend mock server unavailable. Simulating a successful file save in-memory for static demo pages.", err);
    }
};


/**
 * Simulates reading a configuration JSON file from the gateway server at the specified path.
 * Includes a temporary fallback for static host environments to keep demo layouts pre-populated.
 */
export const fetchConfigFromGateway = async (
    directory: string,
    experiment: string
): Promise<any | null> => {
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 150));
    
    const filePath = directory + `config${experiment}.json`;
    console.log(`Checking config file: ${filePath}`);
    
    try {
        const response = await fetch(`/mock-gateway-api?path=${encodeURIComponent(filePath)}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (err) {
        console.warn("Backend mock server unavailable. Resolving in-memory mock configuration presets for static demo pages.", err);
    }
    
    // Temporary static fallback configuration to ensure titanium_specimen_02 runs with realistic inputs in demo builds
    if (directory.includes("titanium_specimen_02") && experiment === "1") {
        return {
            cycleNumber: "2026-2",
            userId: "sjobs-123",
            sampleName: "titanium_specimen_02",
            experimentNumber: "1",
            configDirectory: "/nfs/chess/aux/cycles/2026-2/id1a3/sjobs-123/metadata/titanium_specimen_02/",
            requiredAxes: ["A", "B", "RA"],
            daqFrequency: 10,
            samplePoints: 500,
            handlerProfiles: [
                {
                    mode: "time-series",
                    filename: "ts_specimen_1",
                    verboseAxis: "A",
                    verboseSystem: 1,
                    verboseTask: "A",
                    verboseIO: 0,
                    verboseAi: "A",
                    frequency: 10
                }
            ],
            xrayProfiles: []
        };
    }
    
    return null; // File does not exist, initialize defaults
};


type PathType = 'cycle' | 'station' | 'btr' | 'sample' | 'experiment';

export interface PathsResponse {
    cycles: string[];
    users: string[];
    samples: string[];
    experimentNumbers: string[];
}

/**
 * /nfs/chess/aux/cycles/current/id1a3/<BTR>/metadata/
 */
export const fetchDirItems = async (getDir: PathType, prevDirName: string): Promise<string[]> => {
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 100));

    let relativePath = '';
    switch (getDir) {
        case 'cycle':
            relativePath = 'nfs/chess/aux/cycles/';
            break;
        case 'station':
            relativePath = `nfs/chess/aux/cycles/${prevDirName}/`;
            break;
        case 'btr':
            // prevDirName is '<cycle>/<station>'
            relativePath = `nfs/chess/aux/cycles/${prevDirName}/`;
            break;
        case 'sample':
            // prevDirName is '<cycle>/<station>/<btr>'
            relativePath = `nfs/chess/aux/cycles/${prevDirName}/metadata/`;
            break;
        case 'experiment':
            // prevDirName is '<cycle>/<station>/<btr>/metadata/<sample>'
            relativePath = `nfs/chess/aux/cycles/${prevDirName}/`;
            break;
    }

    try {
        const response = await fetch(`/mock-gateway-api?action=list&path=${encodeURIComponent(relativePath)}&type=${getDir}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (err) {
        console.warn(`Backend mock server unavailable. Falling back to static demo directory listing for ${getDir}`, err);
    }
    
    // Return temporary static options list for browser demo environments
    const fallbackFn = staticMockData[getDir];
    return fallbackFn ? fallbackFn(prevDirName) : [];
};


export const getSettingsDir = (configDirectory: string): string => {
    const match = configDirectory.match(/(?:nfs\/chess\/aux\/)?cycles\/([^\/]+)\/([^\/]+)/);
    if (match) {
        return `/nfs/chess/aux/cycles/${match[1]}/${match[2]}/RAMS-settings/`;
    }
    return '/nfs/chess/aux/cycles/current/RAMS-settings/';
};

/**
 * Reads a versioned settings configuration file (settings<version>.json)
 * from the gateway server. If version is not found, it falls back to the latest.
 * 
 * TEMPORARY FRONTEND GATEWAY CONNECTOR
 */
export const fetchSettingsFromGateway = async (directory: string, version: number | null | undefined): Promise<{ data: any; version: number } | null> => {
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 150));

    const settingsDir = getSettingsDir(directory);
    
    // Helper to scan settings folder and find highest version
    const getLatestVersion = async (): Promise<number | null> => {
        try {
            const listUrl = `/mock-gateway-api?action=list&path=${encodeURIComponent(settingsDir)}&type=settings`;
            const response = await fetch(listUrl);
            if (response.ok) {
                const versions: number[] = await response.json();
                if (versions.length > 0) {
                    return Math.max(...versions);
                }
            }
        } catch (e) {
            console.warn("Failed to list settings files from mock gateway", e);
        }
        return null;
    };

    let targetVersion: number | null = version !== undefined && version !== null ? version : null;

    if (targetVersion === null) {
        const latest = await getLatestVersion();
        if (latest !== null) {
            targetVersion = latest;
        } else {
            return null; // Let caller apply template defaults
        }
    }

    const filePath = `${settingsDir}settings${targetVersion}.json`;
    console.log(`Checking settings file: ${filePath}`);

    try {
        const response = await fetch(`/mock-gateway-api?path=${encodeURIComponent(filePath)}`);
        if (response.ok) {
            const data = await response.json();
            return { data, version: targetVersion };
        } else if (response.status === 404 && version !== undefined && version !== null) {
            // Target settings version goes missing. Attempt fallback to latest settings version.
            const latest = await getLatestVersion();
            if (latest !== null) {
                const fallbackResponse = await fetch(`/mock-gateway-api?path=${encodeURIComponent(`${settingsDir}settings${latest}.json`)}`);
                if (fallbackResponse.ok) {
                    const data = await fallbackResponse.json();
                    return { data, version: latest }; // caller will notice the mismatch
                }
            }
        }
    } catch (err) {
        console.warn("Backend mock server unavailable or settings file not found. Resolving in-memory mock configuration presets.", err);
    }

    // Temporary static fallback configuration to ensure titanium_specimen_02 runs with realistic inputs in demo builds
    if (directory.includes("titanium_specimen_02")) {
        return {
            version: 0,
            data: {
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
                    { name: "Load A", slope: 1.0, intercept: 0.0, channel: 0 },
                    { name: "Load B", slope: 1.0, intercept: 0.0, channel: 1 },
                    { name: "Torque", slope: 1.0, intercept: 0.0, channel: 2 }
                ]
            }
        };
    }

    return null;
};

/**
 * Saves settings properties to gateway server using auto-incrementing file naming: settings{N}.json.
 * 
 * TEMPORARY FRONTEND GATEWAY CONNECTOR
 */
export const postSettingsToGateway = async (directory: string, settings: any): Promise<{ success: boolean; version: number }> => {
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 150));

    const settingsDir = getSettingsDir(directory);
    const targetFile = `${settingsDir}settings_auto_increment`;
    const payload = {
        specHost: settings.specHost,
        requireSpecEnable: settings.requireSpecEnable,
        systemName: settings.systemName,
        controllerHost: settings.controllerHost,
        axisCount: settings.axisCount,
        taskCount: settings.taskCount,
        axesSettings: settings.axesSettings,
        signalSettings: settings.signalSettings
    };

    try {
        const response = await fetch('/mock-gateway-api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customFilePath: targetFile, data: payload })
        });
        if (response.ok) {
            const resData = await response.json();
            return { success: true, version: resData.version };
        }
        throw new Error('Failed to save settings configuration');
    } catch (err) {
        console.warn("Failed to save settings config to gateway. Simulating in-memory success.", err);
        return { success: true, version: 1 };
    }
};
