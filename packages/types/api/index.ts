export type Entry = {
    ip: string;
    timestamp: Date;
};

// Type for worker response
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

export type TrackingEntry = {
    ip: string;
    timestamp: Date;
};