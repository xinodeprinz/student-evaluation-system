"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, Lock, AlertCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      toast.success("Login successful!");

      // Redirect based on role
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50 flex items-center justify-center p-4">
      <Toaster position="top-right" />

      <div className="w-full max-w-md">
        {/* Cameroon Flag Colors */}
        <div className="h-2 bg-green-600 rounded-t-xl"></div>
        <div className="h-2 bg-red-500"></div>
        <div className="h-2 bg-yellow-400 rounded-b-xl mb-6"></div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-yellow-500 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Student Evaluation
            </h1>
            <p className="text-green-50">Cameroon Education System</p>
          </div>

          {/* Login Form */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Welcome Back
            </h2>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm font-semibold">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="your.email@school.cm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t-2 border-gray-100">
              <p className="text-xs text-gray-600 text-center mb-3 font-semibold">
                Demo Credentials
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-red-50 p-2 rounded text-center">
                  <p className="font-bold text-red-700">Admin</p>
                  <p className="text-gray-600 mt-1">admin@school.cm</p>
                  <p className="text-gray-600">admin123</p>
                </div>
                <div className="bg-yellow-50 p-2 rounded text-center">
                  <p className="font-bold text-yellow-700">Teacher</p>
                  <p className="text-gray-600 mt-1">teacher@school.cm</p>
                  <p className="text-gray-600">teacher123</p>
                </div>
                <div className="bg-green-50 p-2 rounded text-center">
                  <p className="font-bold text-green-700">Student</p>
                  <p className="text-gray-600 mt-1">student@school.cm</p>
                  <p className="text-gray-600">student123</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          © 2024 Student Evaluation System - Cameroon
        </p>
      </div>
    </div>
  );
}
