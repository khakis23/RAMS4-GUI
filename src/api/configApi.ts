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

export interface PathsResponse {
    cycles: string[];
    users: string[];
    samples: string[];
    experimentNumbers: string[];
}

/**
 * TODO TEMP: This is a placeholder pseudo backend mock.
 *  - It would be convenient if these were sent in access order (so for example, current cycle is usually on top).
 *
 * TODO This obviously wont work they way it is, because we'd have to make a new request each time the user
 *      selects a new item from the dropdown list.
 */
export const fetchPaths = async (): Promise<PathsResponse> => {
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Mock directory names
    return {
        cycles: ["2026-2", "2026-1", "2025-3", "2025-2"],
        users: ["jdoe", "asmith", "rjackson"],
        samples: ["aluminum-123", "steel-specimen-3b", "titanium-cell-02"],
        experimentNumbers: ["1", "2", "3", "4"],
    };
};
