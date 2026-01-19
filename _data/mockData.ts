/**
 * Mock Data Utility for Hackathon Development
 * 
 * Simulates database calls with configurable delays for realistic development.
 * Usage: const users = await loadMockData<User[]>('users/all.json');
 */

// Default simulated database delay in milliseconds
const DEFAULT_DELAY_MS = 500;

/**
 * Simulates loading data from a database with a configurable delay.
 * 
 * @template T - The expected return type of the data
 * @param filename - Path to the JSON file relative to /_data (e.g., 'users/all.json')
 * @param delayMs - Optional delay in milliseconds (default: 500ms)
 * @returns Promise resolving to strictly typed data
 * 
 * @example
 * // Load user data
 * const users = await loadMockData<User[]>('users/all.json');
 * 
 * @example
 * // Load single transaction with custom delay
 * const transaction = await loadMockData<Transaction>('transactions/1.json', 200);
 */
export async function loadMockData<T>(
    filename: string,
    delayMs: number = DEFAULT_DELAY_MS
): Promise<T> {
    // Simulate database latency
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    try {
        // Dynamic import of JSON data
        // Note: In Next.js, you'll need to ensure JSON files are in /public or use fs in API routes
        const data = await import(`@/_data/${filename}`);
        return data.default as T;
    } catch (error) {
        console.error(`[loadMockData] Failed to load: ${filename}`, error);
        throw new Error(`Failed to load mock data from: ${filename}`);
    }
}

/**
 * Batch load multiple data files with parallel execution.
 * All files are loaded simultaneously, returning when all complete.
 * 
 * @template T - Object type mapping filenames to their data types
 * @param files - Array of filenames to load
 * @returns Promise resolving to an object with filename keys and typed data values
 * 
 * @example
 * const { users, products } = await loadMockDataBatch<{
 *   'users/all.json': User[];
 *   'products/featured.json': Product[];
 * }>(['users/all.json', 'products/featured.json']);
 */
export async function loadMockDataBatch<T extends Record<string, unknown>>(
    files: (keyof T)[]
): Promise<T> {
    const results = await Promise.all(
        files.map(async (filename) => {
            const data = await loadMockData<T[typeof filename]>(filename as string);
            return [filename, data] as const;
        })
    );

    return Object.fromEntries(results) as T;
}

/**
 * Load data with loading state callback for UI feedback.
 * Useful for showing loading indicators in components.
 */
export async function loadMockDataWithState<T>(
    filename: string,
    onLoadingChange: (isLoading: boolean) => void,
    delayMs?: number
): Promise<T> {
    onLoadingChange(true);
    try {
        const data = await loadMockData<T>(filename, delayMs);
        return data;
    } finally {
        onLoadingChange(false);
    }
}

/**
 * Simulate a database write operation with delay.
 * Useful for testing form submissions and mutations.
 */
export async function simulateMutation<T>(
    data: T,
    delayMs: number = DEFAULT_DELAY_MS
): Promise<{ success: boolean; data: T; timestamp: string }> {
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
    };
}
