"use client";
import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import axios, { AxiosError } from 'axios';

// Types
interface TrackingEntry {
    ip: string;
    timestamp: string;
}

interface TrackingData {
    number: string;
    totalEntries: number;
    recentEntries: TrackingEntry[];
}

interface ToastProps {
    type: 'success' | 'error' | 'info';
    message: string;
}

// Simple Toast Hook
const useToast = () => {
    const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);

    const addToast = (toast: ToastProps) => {
        const id = Date.now();
        setToasts(prev => [...prev, { ...toast, id }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const ToastContainer = () => (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${toast.type === 'success'
                        ? 'bg-green-500 text-white'
                        : toast.type === 'error'
                            ? 'bg-red-500 text-white'
                            : 'bg-blue-500 text-white'
                        }`}
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );

    return { addToast, ToastContainer };
};

// Main Component
const NumberTracker: React.FC = () => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [isTrackingLoading, setIsTrackingLoading] = useState(false);
    const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const { addToast, ToastContainer } = useToast();

    // Validation function
    const validatePhoneNumber = (number: string): boolean => {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(number);
    };

    // Handle track number
    const handleTrackNumber = async () => {
        if (!trackingNumber.trim()) {
            addToast({
                type: 'error',
                message: 'Please enter a phone number to track',
            });
            return;
        }

        if (!validatePhoneNumber(trackingNumber)) {
            addToast({
                type: 'error',
                message: 'Please enter a valid 10-digit Indian mobile number',
            });
            return;
        }

        setIsTrackingLoading(true);
        setHasSearched(true);
        setTrackingData(null);

        try {
            const res = await axios.get(`/api/admin/track-number?number=${trackingNumber}`);
            const data = res.data;

            if (data.success) {
                setTrackingData({
                    number: data.number,
                    totalEntries: data.totalEntries,
                    recentEntries: data.recentEntries || []
                });

                addToast({
                    type: 'success',
                    message: `Found ${data.totalEntries} entries for +91${data.number}`,
                });
            } else {
                setTrackingData(null);
                addToast({
                    type: 'error',
                    message: data.message || 'Failed to fetch tracking data',
                });
            }
        } catch (error) {
            console.error('Error tracking number:', error);
            const err = error as AxiosError<{ message: string }>;
            const message = err?.response?.data?.message || 'Failed to track number. Please try again.';

            setTrackingData(null);
            addToast({
                type: 'error',
                message,
            });
        } finally {
            setIsTrackingLoading(false);
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleTrackNumber();
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Search className="w-5 h-5 text-purple-400" />
                        Number Tracker
                    </h3>
                </div>

                {/* Search Input */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Track Number
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                +91
                            </span>
                            <input
                                type="text"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter 10-digit number to track"
                                className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleTrackNumber}
                            disabled={isTrackingLoading || !trackingNumber}
                            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none disabled:cursor-not-allowed"
                        >
                            {isTrackingLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Tracking...</span>
                                </div>
                            ) : (
                                'Track Number'
                            )}
                        </button>
                    </div>
                </div>

                {/* Tracking Results */}
                {trackingData && (
                    <div className="space-y-4">
                        {/* Summary */}
                        <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <span className="font-mono text-white text-lg break-all">
                                    +91{trackingData.number}
                                </span>
                                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-sm rounded-full border border-purple-500/20 whitespace-nowrap">
                                    {trackingData.totalEntries} Total Entries
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 break-words">
                                Last activity:{" "}
                                {trackingData.recentEntries.length > 0
                                    ? new Date(trackingData.recentEntries[0].timestamp).toLocaleString(
                                        "en-IN",
                                        {
                                            timeZone: "Asia/Kolkata",
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }
                                    )
                                    : "No recent activity"}
                            </p>
                        </div>


                        {/* Recent Entries */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-3">Recent Activity</h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                                {trackingData.recentEntries.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-gray-400 text-sm">No recent activity found</p>
                                    </div>
                                ) : (
                                    trackingData.recentEntries.map((entry, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600/50 hover:bg-gray-700/70 transition-colors duration-200"
                                        >
                                            <div className="flex items-center space-x-3 min-w-0">
                                                <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                                                <div className="min-w-0">
                                                    <p className="text-sm text-white font-mono break-all">
                                                        IP: {entry.ip}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(entry.timestamp).toLocaleString("en-IN", {
                                                            timeZone: "Asia/Kolkata",
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            second: "2-digit",
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* No results message */}
                {hasSearched && !trackingData && !isTrackingLoading && (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-400">No tracking data found for this number</p>
                        <p className="text-gray-500 text-sm mt-1">Try searching for a different number</p>
                    </div>
                )}

                {/* Initial state */}
                {!hasSearched && !trackingData && (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Search className="w-6 h-6 text-purple-400" />
                        </div>
                        <p className="text-gray-400">Enter a phone number to start tracking</p>
                        <p className="text-gray-500 text-sm mt-1">View detailed activity logs and statistics</p>
                    </div>
                )}
            </div>

            <style jsx>{`
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
          background-color: #4b5563;
        }
        .scrollbar-track-gray-800::-webkit-scrollbar-track {
          background-color: #1f2937;
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #1f2937;
        }
        ::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
        </>
    );
};

export default NumberTracker;