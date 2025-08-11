"use client";
import React, { useState } from 'react';
import { Shield, Plus, Search, Download, Trash2, Settings, Users, Activity } from 'lucide-react';
import { useToast } from './Toast';
import axios, { AxiosError } from 'axios';
import { useEffect } from 'react';

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

const tabs: Tab[] = [
  { id: 'numbers', label: 'Protected Numbers', icon: Shield },
  { id: 'stats', label: 'Statistics', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
];


const AdminPanel: React.FC = () => {
  const [protectedNumbers, setProtectedNumbers] = useState<ProtectedNumber[]>([]);
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
  const [activeTab, setActiveTab] = useState<TabId>('numbers');
  const { addToast, ToastContainer } = useToast();


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

        setProtectedNumbers(formattedNumbers);
      } else {
        addToast({
          type: 'error',
          message: data.message || 'Failed to load protected numbers',
        });
      }
    } catch (error) {
      console.error('Error fetching recent protected numbers:', error);
      addToast({
        type: 'error',
        message: 'Unable to load protected numbers. Please try again later.',
      });
    }
  };


  const loadStats = () => {
    // Mock stats - replace with actual API call
    setStats({
      totalProtected: 156,
      addedToday: 8,
      totalRequests: 2451,
      blockedRequests: 387
    });
  };

  useEffect(() => {
    loadProtectedNumbers();
    loadStats();
  }, [loadProtectedNumbers, loadStats]);

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

  const handleRemoveNumber = async (id: string, phoneNumber: string) => {
    try {
      setProtectedNumbers(prev => prev.filter(num => num.id !== id));
      addToast({
        type: 'success',
        message: `Number +91${phoneNumber} removed from protection list`
      });

      setStats(prev => ({
        ...prev,
        totalProtected: prev.totalProtected - 1
      }));

    } catch (error) {
      console.error('Error removing number:', error);
      addToast({
        type: 'error',
        message: 'Failed to remove number'
      });
    }
  };

  const handleExport = () => {
    const csvContent = [
      'Phone Number,Added At,Added By,Reason,Status',
      ...protectedNumbers.map(num =>
        `+91${num.phoneNumber},${num.addedAt.toISOString()},${num.addedBy},"${num.reason}",${num.isActive ? 'Active' : 'Inactive'}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `protected-numbers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      message: 'Protected numbers exported successfully'
    });
  };

  const filteredNumbers = protectedNumbers.filter(num =>
    num.phoneNumber.includes(searchTerm) ||
    num.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <ToastContainer />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">SMS Bomber Management</p>
              </div>
            </div>
            <button
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'numbers' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Protected</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProtected}</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Added Today</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.addedToday}</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Plus className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Requests</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalRequests}</p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Blocked Requests</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.blockedRequests}</p>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Add Number Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add Number to Protection List</span>
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      +91
                    </span>
                    <input
                      type="text"
                      value={newNumber}
                      onChange={(e) => setNewNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit number"
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason for protection"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleAddNumber}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Adding...</span>
                      </div>
                    ) : (
                      'Add Number'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by number or reason..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <button
                  onClick={handleExport}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Protected Numbers List */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Protection Requests ({filteredNumbers.length})
                </h3>

                {filteredNumbers.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'No numbers match your search' : 'No protected numbers yet'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredNumbers.map((number) => (
                      <div
                        key={number.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              +91{number.phoneNumber}
                            </span>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                              {number.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-300">
                            <span>Added: {number.addedAt.toLocaleDateString()}</span>
                            <span>By: {number.addedBy}</span>
                            {number.reason && (
                              <span
                                title={number.reason}
                                className="truncate max-w-xs inline-block align-middle"
                              >
                                Reason: {number.reason}
                              </span>
                            )}

                          </div>

                          {number.screenshot && (
                            <div className="mt-2">
                              <button
                                onClick={() => {
                                  // Remove prefix if it exists
                                  const base64Data = number.screenshot?.split(',')[1];
                                  const contentType = number.screenshot?.match(/data:(.*?);base64/)?.[1] || 'image/jpeg';

                                  // Decode base64
                                  const byteCharacters = atob(base64Data || '');
                                  const byteNumbers = new Array(byteCharacters.length);
                                  for (let i = 0; i < byteCharacters.length; i++) {
                                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                                  }
                                  const byteArray = new Uint8Array(byteNumbers);

                                  // Create blob and open
                                  const blob = new Blob([byteArray], { type: contentType });
                                  const url = URL.createObjectURL(blob);
                                  window.open(url, '_blank');
                                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                                }}
                                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                              >
                                📷 View Screenshot
                              </button>

                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleRemoveNumber(number.id, number.phoneNumber)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors duration-200"
                          title="Remove from protection list"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">System Statistics</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl">
                  <h3 className="text-sm font-medium text-blue-600 dark:text-blue-300 mb-2">Protection Rate</h3>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">
                    {((stats.blockedRequests / stats.totalRequests) * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl">
                  <h3 className="text-sm font-medium text-green-600 dark:text-green-300 mb-2">Success Rate</h3>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-200">
                    {(((stats.totalRequests - stats.blockedRequests) / stats.totalRequests) * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-xl">
                  <h3 className="text-sm font-medium text-purple-600 dark:text-purple-300 mb-2">Average Daily</h3>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-200">
                    {Math.round(stats.totalRequests / 30)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Admin Settings</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Auto-protection Threshold
                  </label>
                  <input
                    type="number"
                    defaultValue="5"
                    className="w-full max-w-xs px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Automatically protect numbers after this many complaints
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rate Limit (requests per minute)
                  </label>
                  <input
                    type="number"
                    defaultValue="60"
                    className="w-full max-w-xs px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;