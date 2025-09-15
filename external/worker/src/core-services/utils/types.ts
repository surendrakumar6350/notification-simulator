export interface Endpoint {
    url: string;
    headers: Record<string, string>;
    bodyTemplate: string | Record<string, any>;
}
export interface ApiResponse {
    url: string;
    success: boolean;
    data?: any;
    error?: string;
}