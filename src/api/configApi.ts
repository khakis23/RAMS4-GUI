/**
 * Sends a single complete JSON file to the user's data directory on the Python gateway server.
 *
 * @param userId    Unique User ID
 * @param fileType  Type of file being saved
 * @param fileName  Name of the file being saved (without extension)
 * @param payload   Full JSON data to be saved
 */
export const postConfigToGateway = async (
    payload: any
): Promise<void> => {
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log("Saving Config to backend gateway for path:", payload?.configDirectory);

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
};


/**
 * Simulates reading a configuration JSON file from the gateway server at the specified path.
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
        console.error("Failed to load configuration from mock gateway server", err);
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
        const response = await fetch(`/mock-gateway-api?action=list&path=${encodeURIComponent(relativePath)}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (err) {
        console.error(`Failed to list mock directories for ${getDir}`, err);
    }
    
    return [];
};
