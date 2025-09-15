import endpoints from "./utils/endpoints";
import type { Endpoint, ApiResponse } from "./utils/types";

class ApiService {
    private endpoints: Endpoint[] = [];
    private readonly maxRetries = 2;
    private readonly requestTimeout = 700;

    constructor() {
        this.init();
    }

    private async init() {
        this.endpoints = await endpoints();
    }


    private async makeRequest(
        endpoint: Endpoint,
        mobile: string,
        retryCount = 0
    ): Promise<ApiResponse> {
        try {
            let body: string | undefined = undefined;
            if (endpoint.bodyTemplate) {
                if (typeof endpoint.bodyTemplate === "string") {
                    // Replace placeholder in string templates
                    body = endpoint.bodyTemplate.replace(/\{mobile\}/g, mobile);
                } else {
                    // Deep replace in objects
                    const replaced = JSON.parse(
                        JSON.stringify(endpoint.bodyTemplate).replace(/\{mobile\}/g, mobile)
                    );
                    body = JSON.stringify(replaced);
                }
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

            const response = await fetch(endpoint.url, {
                method: "POST",
                headers: endpoint.headers,
                body,
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            let data: any;
            try {
                data = await response.json();
            } catch {
                data = await response.text();
            }

            return {
                url: endpoint.url,
                success: true,
                data
            };
        } catch (error) {
            if (error instanceof TypeError && error.message === "Failed to fetch") {
                if (retryCount < this.maxRetries) {
                    if (process.env.NODE_ENVV != "production") {
                        console.log(`Retrying request to ${endpoint.url}, attempt ${retryCount + 1}`);
                    }
                    await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
                    return this.makeRequest(endpoint, mobile, retryCount + 1);
                }
            }

            return {
                url: endpoint.url,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }


    async sendToRandomFive(mobile: string): Promise<ApiResponse[]> {
        if (this.endpoints.length < 2) {
            throw new Error("Not enough endpoints to pick two.");
        }

        const shuffled = [...this.endpoints].sort(() => Math.random() - 0.5);
        const selectedEndpoints = shuffled.slice(0, 5);

        const requests = selectedEndpoints.map(endpoint =>
            this.makeRequest(endpoint, mobile)
        );

        const results = await Promise.all(requests);

        results.forEach((result: any) => {
            if (process.env.NODE_ENVV != "production") {
                console.log(`Random parallel response from ${result.url}:`, result);
            }
        });

        return results;
    }

}

export const apiService = new ApiService();
