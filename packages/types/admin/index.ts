interface ProtectedNumber {
    id: string;
    phoneNumber: string;
    addedAt: Date;
    addedBy: string;
    reason?: string;
    isActive: boolean;
    screenshot?: string;
}

interface ProtectedNumberResponse {
    _id: string;
    mobileNumber: string;
    createdAt: string;
    message?: string;
    screenshot?: string;
    updatedAt?: string;
}

interface AdminStats {
    totalProtected: number;
    addedToday: number;
    totalRequests: number;
    blockedRequests: number;
}

type TabId = 'numbers' | 'stats' | 'settings';

interface Tab {
    id: TabId;
    label: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}


interface Log {
    message: string;
    timestamp: string;
    level: string;
    __v?: number;
    _id?: string | { $oid: string };
}

type Pagination = {
    currentPage: number;
    totalPages: number;
    totalLogs: number;
};


type LogsApiResponse = {
    success: true;
    data: Log[];
    pagination: Pagination;
};

interface Feedback {
    _id: { $oid: string };
    rating: number;
    category: string;
    message: string;
    createdAt: string;
}

type ErrorResponse = {
    message: string;
    [key: string]: unknown;
};

export type {
    ProtectedNumber,
    ProtectedNumberResponse,
    AdminStats,
    TabId,
    Tab,
    Log,
    LogsApiResponse,
    Pagination,
    Feedback,
    ErrorResponse
}