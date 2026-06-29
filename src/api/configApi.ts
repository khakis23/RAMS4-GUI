/**
 * Sends a single complete JSON file to the user's data directory on the Python gateway server.
 *
 * @param userId    Unique User ID
 * @param fileType  Type of file being saved
 * @param fileName  Name of the file being saved (without extension)
 * @param payload   Full JSON data to be saved
 */
export const postConfigToGateway = async (
    userId: string,
    fileType: 'config' | 'xray' | 'dic',
    fileName: string,
    payload: any
): Promise<void> => {
    // Strip JSON extension
    const cleanFileName = fileName.replace(/\.json$/, '');

    // Encode query params and fetch
    const url = `/api/data/?user_id=${encodeURIComponent(userId)}&file_type=${encodeURIComponent(fileType)}&file_name=${encodeURIComponent(cleanFileName)}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    // Error handling (log to console)
    if (!response.ok) {
        let errorDetails = '';
        try {
            const errorJson = await response.json();
            errorDetails = JSON.stringify(errorJson, null, 2);
        } catch (e) {
            errorDetails = await response.text();
        }
        console.error(`Gateway API Error Details:\n${errorDetails}`);
        throw new Error(`Gateway API returned error status: ${response.status}\n${errorDetails}`);
    }
};
