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
        console.warn("Backend mock server unavailable. Simulating fallback settings for static demo pages.", err);
    }

    // Temporary static fallback configuration to ensure titanium_specimen_02 runs with realistic inputs in demo builds
    if (directory.includes("titanium_specimen_02") && experiment === "1") {
        return [
            {
                id: "step-1",
                type: "ramp",
                data: {
                    axis: "A",
                    mode: "incremental",
                    control: "displacement",
                    target: 5.0,
                    dispToggle: "time",
                    time: 60.0,
                    velocity: null,
                    max_displacement: 10.0,
                    enable_dic: true,
                    skipDICpos: false,
                    incrementSeg: false,
                    wait: true
                }
            },
            {
                id: "step-2",
                type: "take",
                data: {
                    profileID: "rotation-1",
                    imgMode: "rotation-series",
                    pauseTsDaq: false
                }
            }
        ];
    }

    return null;
};
