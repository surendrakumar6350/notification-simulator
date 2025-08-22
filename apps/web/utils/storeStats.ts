import { Redis } from "ioredis";

let redis: Redis | null = null;
function getRedis(): Redis {
    if (!redis) {
        redis = new Redis(process.env.REDIS_URL as string);
    }
    return redis;
}

export type WorkerResultItem = {
    url: string;
    success: boolean;
    error?: string;
};

export type WorkerResponse = {
    hello: string;
    message: string;
    result: WorkerResultItem[];
};

const WINDOW_SIZE = 100; // last N requests

async function storeStats(workerResponse: WorkerResponse): Promise<void> {
    try {
        const results = workerResponse.result || [];
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;

        const redisClient = getRedis();

        // Build array of values to push (batch insert)
        const values: string[] = [
            ...Array(successCount).fill("1"),  // successes
            ...Array(failureCount).fill("0")   // failures
        ];

        if (values.length > 0) {
            // Push all new results in one LPUSH
            await redisClient.lpush("worker:sliding", ...values);

            // Trim to maintain sliding window
            await redisClient.ltrim("worker:sliding", 0, WINDOW_SIZE - 1);
        }

    } catch (error) {
        console.error("Error storing stats:", error);
    }
}

export default storeStats;
