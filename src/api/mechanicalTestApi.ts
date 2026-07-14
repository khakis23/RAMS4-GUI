/**
 * Service API for saving and loading Mechanical Test sequences (mechTest<experiment>.json)
 * to/from the user's data directory on the gateway server.
 */

export const postMechTestToGateway = async (
    directory: string,
    experiment: string,
    cards: any[]
): Promise<void> => {
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 100));

    const filePath = directory + `mechTest${experiment}.json`;
    console.log("Saving Mechanical Test sequence to path:", filePath);

    try {
        const response = await fetch('/mock-gateway-api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customFilePath: filePath,
                data: cards
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save mechanical test to mock gateway');
        }
    } catch (err) {
        console.warn("Backend mock server unavailable. Simulating a successful file save in-memory for static demo pages.", err);
    }
};

export const fetchMechTestFromGateway = async (
    directory: string,
    experiment: string
): Promise<any[] | null> => {
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 150));

    const filePath = directory + `mechTest${experiment}.json`;
    console.log(`Checking mechanical test file: ${filePath}`);

    try {
        const response = await fetch(`/mock-gateway-api?path=${encodeURIComponent(filePath)}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (err) {
        console.warn("Backend mock server unavailable. Simulating file not found for static demo pages.", err);
    }

    return null;
};
