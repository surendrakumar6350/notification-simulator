"use client";
import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Shield } from "lucide-react";
import { useToast } from "../components/Toast";

type ErrorResponse = {
  message: string;
  [key: string]: unknown; // optional, in case backend sends more fields
};

function isErrorResponse(data: unknown): data is ErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as Record<string, unknown>).message === "string"
  );
}

const Login = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { addToast, ToastContainer } = useToast();

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const response = await axios.post("/api/admin/login", {
        password: adminPassword,
      });

      if (response.data?.success === true) {
        addToast({
          type: "success",
          message: "Successfully logged in to admin panel",
        });

        setTimeout(() => {
          window.location.href = "/admin";
        }, 1000);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg = isErrorResponse(error.response?.data)
          ? error.response?.data.message
          : "An error occurred during login.";

        setLoginError(msg || "An error occurred during login.");
        addToast({ type: "error", message: msg || "Login error" });
      } else {
        console.error("Unexpected error:", error);
        setLoginError("Something went wrong. Please try again later.");
        addToast({ type: "error", message: "Something went wrong. Please try again." });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
      <ToastContainer />
      <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Admin Panel
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Enter your password to continue
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Admin Password"
              className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {loginError && (
            <p className="text-sm text-red-400 text-center -mt-2 mb-2">
              {loginError}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 transform shadow-lg ${isLoggingIn
              ? "bg-gray-700 cursor-not-allowed text-gray-400"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-[1.02] active:scale-95"
              }`}
          >
            {isLoggingIn ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              "Login to Admin Panel"
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          © {new Date().getFullYear()} Secure Admin Panel
        </p>
      </div>
    </div>
  );
};

export default Login;
