"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Login successful! Redirecting...");

      setTimeout(() => {
        if (data.user.role === "admin") {
          router.push("/dashboard/admin");
        } else if (data.user.role === "teacher") {
          router.push("/dashboard/teacher");
        } else {
          router.push("/dashboard/student");
        }
      }, 500);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role: string) => {
    const credentials: { [key: string]: { email: string; password: string } } =
      {
        admin: { email: "admin@school.cm", password: "admin123" },
        teacher: { email: "teacher@school.cm", password: "teacher123" },
        student: { email: "student@school.cm", password: "student123" },
      };
    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50 flex items-center justify-center p-4">
      <Toaster position="top-right" />

      <div className="w-full max-w-md">
        {/* Cameroon Flag Colors */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
          className="flex h-3 rounded-t-xl overflow-hidden mb-6 shadow-lg"
        >
          <div className="flex-1 bg-green-600"></div>
          <div className="flex-1 bg-red-500"></div>
          <div className="flex-1 bg-yellow-400"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 via-yellow-500 to-red-500 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
            >
              <GraduationCap className="w-12 h-12 text-green-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Student Evaluation
            </h1>
            <p className="text-green-50">Cameroon Education System</p>
          </div>

          {/* Login Form */}
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Welcome Back
            </h2>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg"
              >
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-semibold">{error}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all hover:border-gray-300"
                    placeholder="your.email@school.cm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all hover:border-gray-300"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white py-3 rounded-xl font-bold hover:from-green-700 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t-2 border-gray-100">
              <p className="text-xs text-gray-600 text-center mb-3 font-bold uppercase tracking-wide">
                Quick Access Demo
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => quickLogin("admin")}
                  className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 p-3 rounded-xl text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <p className="font-bold text-sm">Admin</p>
                  <p className="text-xs opacity-90 mt-1">Full Access</p>
                </button>
                <button
                  onClick={() => quickLogin("teacher")}
                  className="bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 p-3 rounded-xl text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <p className="font-bold text-sm">Teacher</p>
                  <p className="text-xs opacity-90 mt-1">Grade Entry</p>
                </button>
                <button
                  onClick={() => quickLogin("student")}
                  className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 p-3 rounded-xl text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <p className="font-bold text-sm">Student</p>
                  <p className="text-xs opacity-90 mt-1">View Grades</p>
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                Click any role to auto-fill credentials
              </p>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-gray-600 text-sm mt-6">
          © 2024 Student Evaluation System - Cameroon
        </p>
      </div>
    </div>
  );
}
