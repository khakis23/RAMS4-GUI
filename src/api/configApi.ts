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

    // Log path parameters and full JSON structure for inspection
    console.log("Saving Config to backend...");
    console.log("Full Staged JSON Payload:", payload);
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

    // Mock directory names
    switch (getDir) {
        case 'cycle':
            return ['2026-2', '2026-1'];
        case 'station':
            return ['id1a3', 'id1b3'];
        case 'btr':
            switch (prevDirName) {
                case '2026-2':
                    return ['sjobs-123', 'tcook-456', 'jternus789']
                case '2026-1':
                    return ['assmith-10001-a', 'jdeer-4453-6b']
                default:
                    return [];
            }
        case 'sample':
            switch (prevDirName) {
                case 'sjobs-123':
                    return ["titanium_specimen_02", "titanium_tensile_01"];
                case 'tcook-456':
                    return ["aluminum_shear_02", "nickel_superalloy_01", "copper_alloy_01"];
                case 'jternus789':
                    return ["nickel_superalloy_04", "copper_alloy_03"];
                case 'assmith-10001-a':
                    return ["zircaloy_tube_02", "glassy_carbon_pillar_05", "ti_64_printed_tensile_11"];
                case 'jdeer-4453-6b':
                    return [];
                default:
                    return [];
        }
        case 'experiment':
            switch (prevDirName) {
                case 'titanium_specimen_02':
                case 'aluminum_shear_02':
                    return ['1', '2', '3'];
                case 'titanium_tensile_01':
                case 'aluminum_dogbone_06':
                case 'glassy_carbon_pillar_05':
                    return ['1', '2', '3', '4'];
                default:
                    return ['1', '2'];
            }
    }
};
