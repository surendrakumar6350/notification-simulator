"use client"
import { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useToast } from '../components/Toast';

const Login = () => {
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { addToast, ToastContainer } = useToast();

    const handleLogin = async () => {
        setIsLoggingIn(true);
        setLoginError('');

        try {
            const response = await axios.post('/api/admin/login', {
                password: adminPassword
            });

            if (response.data?.success === true) {
                addToast({
                    type: 'success',
                    message: 'Successfully logged in to admin panel'
                });

                setTimeout(() => {
                    window.location.href = '/admin';
                }, 1000);

            } else {
                setLoginError('Authentication failed. Please check your password.');
                addToast({
                    type: 'error',
                    message: 'Invalid admin password'
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            setLoginError('Something went wrong. Please try again later.');
            addToast({
                type: 'error',
                message: 'Something went wrong. Please try again.'
            });
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
            <ToastContainer />
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">Enter admin password to continue</p>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                            placeholder="Admin Password"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {loginError && (
                        <p className="text-sm text-red-600 text-center -mt-2 mb-2">{loginError}</p>
                    )}

                    <button
                        onClick={handleLogin}
                        disabled={isLoggingIn}
                        className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 transform shadow-lg ${isLoggingIn
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 active:scale-95 text-white'
                            }`}
                    >
                        {isLoggingIn ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Logging in...</span>
                            </div>
                        ) : (
                            'Login to Admin Panel'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;