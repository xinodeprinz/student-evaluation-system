"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, GraduationCap, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  user: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500";
      case "teacher":
        return "bg-yellow-500";
      case "student":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b-4 border-green-600 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-600 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Student Evaluation
              </h1>
              <p className="text-xs text-gray-600">Cameroon Education System</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-bold text-gray-900">SE System</h1>
            </div>
          </div>

          {/* Desktop User Info & Logout */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-yellow-50 px-4 py-2 rounded-xl border-2 border-green-200">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-yellow-500 rounded-full flex items-center justify-center shadow">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full text-white ${getRoleBadgeColor(
                    user.role
                  )} font-semibold`}
                >
                  {user.role.toUpperCase()}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 bg-white overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-yellow-50 p-4 rounded-xl border-2 border-green-200">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-yellow-500 rounded-full flex items-center justify-center shadow">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full text-white ${getRoleBadgeColor(
                      user.role
                    )} font-semibold inline-block mt-1`}
                  >
                    {user.role.toUpperCase()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-lg"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
