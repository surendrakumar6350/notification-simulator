"use client";
import React, { useState, useRef } from 'react';
import {
  Shield, Plus, Search,
  Users, Activity, Terminal, Loader2, Clock, TrendingUp
} from 'lucide-react';
import { useToast } from './Toast';
import axios, { AxiosError } from 'axios';
import { useEffect } from 'react';
import type {
  ProtectedNumber, ProtectedNumberResponse, AdminStats,
  Log, LogsApiResponse, Feedback
} from '../type';
import { MessageSquare, Calendar, Tag, ChevronDown } from 'lucide-react';
import { renderStars, getCategoryColor } from '../utils/Pannel';
import { StatsSkeleton } from './StatsSkeleton';
import { ProtectionRequestsSkeleton } from './ProtectionRequestsSkeleton';
import { FeedbackSkeleton } from './FeedbackSkeleton';
import { TbGitPullRequestDraft } from "react-icons/tb";

const AdminPanel: React.FC = () => {
  const [protectionRequests, setProtectionRequests] = useState<ProtectedNumber[]>([]);
  const [protectionRequestLoading, setProtectionRequestLoading] = useState(true);
  const [newNumber, setNewNumber] = useState('');
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalProtected: 0,
    addedToday: 0,
    totalRequests: 0,
    blockedRequests: 0
  });
  const [displayStats, setDisplayStats] = useState<AdminStats>({
    totalProtected: 0,
    addedToday: 0,
    totalRequests: 0,
    blockedRequests: 0
  });
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const [logs, setLogs] = useState<Log[]>([]);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreLogs, setHasMoreLogs] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [feedbackSearchTerm, setFeedbackSearchTerm] = useState('');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedbackLoading, setFeedbacksLoading] = useState(true);

  const { addToast, ToastContainer } = useToast();

  useEffect(() => {
    const loadProtectedNumbers = async () => {
      try {
        const res = await axios.get('/api/admin/recent-protected');
        const data = res.data;

        if (data.success) {
          const formattedNumbers: ProtectedNumber[] = data.data.map((item: ProtectedNumberResponse) => ({
            id: item._id,
            phoneNumber: item.mobileNumber,
            addedAt: new Date(item.createdAt),
            addedBy: 'admin',
            reason: item.message || 'No reason provided',
            isActive: true,
            screenshot: item.screenshot || undefined
          }));

          setProtectionRequests(formattedNumbers);
          setProtectionRequestLoading(false);
        } else {
          console.error('Failed to fetch protected numbers:', data.message);
        }
      } catch (error) {
        console.error('Error fetching recent protected numbers:', error);
      }
    };

    const loadStats = async () => {
      try {
        const res = await axios.get('/api/admin/stats');
        const data = res.data;

        if (data.success) {
          const statsFromApi = data.data;

          setStats({
            totalProtected: statsFromApi.totalProtectedNumbers ?? 0,
            addedToday: statsFromApi.slidingWindow.successPercent ?? 0,
            totalRequests: statsFromApi.last24hRequests ?? 0,
            blockedRequests: statsFromApi.totalRequests ?? 0
          });
        } else {
          console.error('Failed to fetch stats:', data.message);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    const loadRecentFeedbacks = async () => {
      try {
        const res = await axios.get('/api/admin/recent-feedback');
        const data = res.data;

        if (data.success) {
          const statsFromApi = data.recentFeedback;

          setFeedbacks(statsFromApi);
          setFeedbacksLoading(false);
        } else {
          console.error('Failed to fetch Feedbacks:', data.message);
        }
      } catch (error) {
        console.error('Error fetching Feedbacks:', error);
      }
    };

    loadProtectedNumbers();
    loadRecentFeedbacks();
    loadStats();
  }, []);


  useEffect(() => {
    const duration = 1000; // ms
    const frameRate = 30; // fps
    const steps = Math.floor(duration / (1000 / frameRate));
    const startStats = { ...displayStats };
    const endStats = { ...stats };
    let currentStep = 0;
    if (
      Object.values(endStats).some((v) => v > 0) &&
      (Object.keys(endStats) as (keyof AdminStats)[]).some((key) => startStats[key] !== endStats[key])
    ) {
      if (animationRef.current) clearInterval(animationRef.current);
      animationRef.current = setInterval(() => {
        currentStep++;
        setDisplayStats((prev) => {
          const next: AdminStats = { ...prev };
          (Object.keys(endStats) as (keyof AdminStats)[]).forEach((key) => {
            const start = startStats[key];
            const end = endStats[key];
            next[key] = Math.round(start + ((end - start) * currentStep) / steps);
          });
          return next;
        });
        if (currentStep >= steps) {
          setDisplayStats({ ...endStats });
          if (animationRef.current) clearInterval(animationRef.current);
        }
      }, 1000 / frameRate);
    } else {
      setDisplayStats({ ...endStats });
    }
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.totalProtected, stats.addedToday, stats.totalRequests, stats.blockedRequests]);

  const validatePhoneNumber = (number: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(number);
  };

  const handleAddNumber = async () => {
    if (!newNumber.trim()) {
      addToast({
        type: 'error',
        message: 'Please enter a phone number',
      });
      return;
    }

    if (!validatePhoneNumber(newNumber)) {
      addToast({
        type: 'error',
        message: 'Please enter a valid 10-digit Indian mobile number',
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post('/api/admin/protect-number', {
        phoneNumber: newNumber,
        reason: reason.trim() || 'Manual addition',
      });

      const data = res.data;

      if (data.success) {
        setNewNumber('');
        setReason('');

        addToast({
          type: 'success',
          message: `Number +91${newNumber} added to protection list`,
        });
      } else {
        addToast({
          type: 'error',
          message: data.message || 'Something went wrong',
        });
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;

      const message =
        err?.response?.data?.message || 'Failed to add number. Please try again.';
      addToast({
        type: 'error',
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNumbers = protectionRequests.filter(num =>
    num.phoneNumber.includes(searchTerm) ||
    num.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadMoreLogs = async () => {
    if (isLoadingMore || !hasMoreLogs) return;

    setIsLoadingMore(true);

    try {
      const res = await axios.get<LogsApiResponse>(`/api/admin/log`, {
        params: { page, limit: 50 },
      });

      if (!res.data.success) {
        console.error("Failed to load logs:");
        setHasMoreLogs(false);
        return;
      }

      const logsData = res.data.data;

      if (logsData.length === 0) {
        setHasMoreLogs(false);
      } else {
        setLogs((prev) => {
          const updated = [...(prev ?? []), ...res.data.data];
          const MAX_LOGS = 1000;
          return updated.length > MAX_LOGS
            ? updated.slice(updated.length - MAX_LOGS)
            : updated;
        });

        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setHasMoreLogs(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMoreLogs();
      setIsInitialLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Filter feedbacks based on search term
  const filteredFeedbacks = feedbacks.filter(feedback =>
    feedback.message.toLowerCase().includes(feedbackSearchTerm.toLowerCase()) ||
    feedback.category.toLowerCase().includes(feedbackSearchTerm.toLowerCase())
  );


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <ToastContainer />

      {/* Main Content */}
      <div className=" min-h-screen">
        {/* Header */}
        <header className="bg-gray-900/80 border-b border-gray-700 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            {/* Left Side */}
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                ⚡ Dashboard
              </h2>
            </div>
          </div>
        </header>


        <div className="p-6">
          <div className="space-y-6">
            {/* Stats Grid */}
            {displayStats.totalProtected != 0 ? <>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-400" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white" aria-live="polite">{displayStats.totalProtected}</p>
                    <p className="text-sm text-gray-400">Protected Numbers</p>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <Plus className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">
                      {displayStats.addedToday.toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white" aria-live="polite">
                      {displayStats.addedToday.toFixed(2)}%
                    </p>
                    <p className="text-sm text-gray-400">Success</p>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-purple-400" />
                    </div>
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white" aria-live="polite">{displayStats.totalRequests.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Today Requests</p>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-red-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white" aria-live="polite">{displayStats.blockedRequests}</p>
                    <p className="text-sm text-gray-400">Total Requests</p>
                  </div>
                </div>
              </div>

            </> : <StatsSkeleton />}

            {/* Add Number Card */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Add Protection</h3>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                      +91
                    </span>
                    <input
                      type="text"
                      value={newNumber}
                      onChange={(e) => setNewNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit number"
                      className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason for protection"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="lg:col-span-3 flex items-end">
                  <button
                    onClick={handleAddNumber}
                    disabled={isLoading}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Adding...</span>
                      </div>
                    ) : (
                      'Add Protection'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* First Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Protection Requests */}
              {protectionRequestLoading ? <ProtectionRequestsSkeleton /> : <>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white"><TbGitPullRequestDraft className="inline-block align-middle mr-1 mb-1" /> Protection Requests</h3>
                    <span className="text-sm text-gray-400">({filteredNumbers.length})</span>
                  </div>

                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search numbers or reasons..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hidden">
                    {filteredNumbers.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-400">No protection requests found</p>
                      </div>
                    ) : (
                      filteredNumbers.map((number) => (
                        <div
                          key={number.id}
                          className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-white">+91{number.phoneNumber}</span>
                            <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20">
                              Active
                            </span>
                          </div>
                          <div className="text-sm text-gray-400 space-y-1">
                            <p>Added: {number.addedAt.toLocaleDateString()}</p>
                            {number.reason && <p>Reason: {number.reason}</p>}
                          </div>
                          {number.screenshot && (
                            <button
                              onClick={() => {
                                const base64Data = number.screenshot?.split(',')[1];
                                const contentType = number.screenshot?.match(/data:(.*?);base64/)?.[1] || 'image/jpeg';
                                const byteCharacters = atob(base64Data || '');
                                const byteNumbers = new Array(byteCharacters.length);
                                for (let i = 0; i < byteCharacters.length; i++) {
                                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                                }
                                const byteArray = new Uint8Array(byteNumbers);
                                const blob = new Blob([byteArray], { type: contentType });
                                const url = URL.createObjectURL(blob);
                                window.open(url, '_blank');
                                setTimeout(() => URL.revokeObjectURL(url), 1000);
                              }}
                              className="mt-2 text-blue-400 hover:text-blue-300 text-xs"
                            >
                              📷 View Screenshot
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>}


              {/* System Logs */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 scrollbar-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-green-400" />
                    System Logs
                  </h3>
                  <span className="text-sm text-gray-400">({logs.length})</span>
                </div>

                <div
                  className="bg-black rounded-lg p-4 font-mono text-sm h-[400px] overflow-y-auto border border-gray-700 scrollbar-hidden"
                  onScroll={(e) => {
                    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
                    const scrollThreshold = 5;
                    const isNearBottom = scrollTop + clientHeight >= scrollHeight - scrollThreshold;

                    if (isNearBottom && hasMoreLogs && !isLoadingMore) {
                      loadMoreLogs();
                    }
                  }}
                >
                  {isInitialLoading ? (
                    <div className="flex flex-col items-center justify-center h-32 space-y-3 scrollbar-hidden">
                      <div className="flex items-center space-x-2">
                        <Terminal className="w-6 h-6 text-green-400 animate-pulse" />
                        <span className="text-green-400">Initializing Terminal...</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Waiting for system events...</p>
                    </div>
                  ) : (
                    <>
                      {logs.map((log, index) => (
                        <div
                          key={index}
                          className={`mb-2 ${log.level === "error"
                            ? "text-red-400"
                            : log.level === "warn"
                              ? "text-yellow-400"
                              : "text-green-400"
                            } text-xs sm:text-sm`}
                        >
                          <span className="text-gray-500 mr-2 text-[10px] sm:text-xs">
                            [{new Date(log.timestamp).toLocaleString()}]
                          </span>
                          <span className="font-semibold">{log.level.toUpperCase()}:</span>
                          <span className="ml-2 break-words">{log.message}</span>
                        </div>
                      ))}

                      {isLoadingMore && (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-4 h-4 text-green-400 animate-spin mr-2" />
                          <span className="text-gray-400">Loading more logs...</span>
                        </div>
                      )}

                      {!hasMoreLogs && logs.length > 10 && (
                        <div className="text-center py-2">
                          <span className="text-gray-500 text-sm">--- End of logs ---</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* ONLY ADDITION: Simple scroll hint at bottom */}
                {hasMoreLogs && (logs?.length || 0) > 5 && (
                  <div className="flex items-center justify-center mt-2 text-xs text-gray-400">
                    <ChevronDown className="w-5 h-5 mr-1 animate-bounce" />
                    <span>Scroll up for more logs</span>
                    <ChevronDown className="w-5 h-5 ml-1 animate-bounce" />
                  </div>
                )}

              </div>
            </div>

            {/* Second Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Feedback */}
              {feedbackLoading ? <FeedbackSkeleton /> : <>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-400" />
                      User Feedback
                    </h3>
                    <span className="text-sm text-gray-400">({filteredFeedbacks.length})</span>
                  </div>

                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={feedbackSearchTerm}
                      onChange={(e) => setFeedbackSearchTerm(e.target.value)}
                      placeholder="Search feedback messages or categories..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hidden">
                    {filteredFeedbacks.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                          <MessageSquare className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-400">No feedback found</p>
                      </div>
                    ) : (
                      filteredFeedbacks.map((feedback: Feedback) => (
                        <div
                          key={feedback._id.$oid}
                          className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-200"
                        >
                          {/* Header with rating and category */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {renderStars(feedback.rating)}
                              <span className="text-white font-medium">({feedback.rating}/5)</span>
                            </div>
                            <span className={`hidden md:block  px-2 py-1 text-xs rounded-full border capitalize ${getCategoryColor(feedback.category)}`}>
                              <Tag className="w-3 h-3 inline mr-1" />
                              {feedback.category}
                            </span>
                          </div>

                          {/* Message */}
                          <div className="mb-3">
                            <p className="text-gray-300 text-sm leading-relaxed">
                              {feedback.message}
                            </p>
                          </div>

                          {/* Date */}
                          <div className="flex items-center text-xs text-gray-400">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(feedback.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>

                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>}


              {/* Placeholder for future section */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-8 h-8 border-2 border-gray-600 border-dashed rounded"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">Coming Soon</h3>
                    <p className="text-gray-500 text-sm">Additional dashboard features will be added here</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;