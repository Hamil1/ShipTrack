"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "./UserMenu";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function Header() {
  // Todo: What are the statuses for the tracking number?
  const { user, logout, login, register } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsAuthLoading(true);
    setAuthError(null);

    const result = await login(email, password);

    if (result.success) {
      setShowAuthModal(false);
      setAuthError(null);
    } else {
      setAuthError(result.error || "Login failed");
    }

    setIsAuthLoading(false);
  };

  const handleRegister = async (
    name: string,
    email: string,
    password: string
  ) => {
    setIsAuthLoading(true);
    setAuthError(null);

    const result = await register(name, email, password);

    if (result.success) {
      setShowAuthModal(false);
      setAuthError(null);
    } else {
      setAuthError(result.error || "Registration failed");
    }

    setIsAuthLoading(false);
  };

  const openAuthModal = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthError(null);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthError(null);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">ShipTrack</h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Track Package
              </a>
              {user && (
                <a
                  href="#history"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  History
                </a>
              )}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <UserMenu user={user} onLogout={logout} />
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => openAuthModal("login")}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuthModal("register")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <button
              onClick={closeAuthModal}
              className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-gray-600 z-10"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {authMode === "login" ? (
              <LoginForm
                onLogin={handleLogin}
                onSwitchToRegister={() => setAuthMode("register")}
                isLoading={isAuthLoading}
                error={authError}
              />
            ) : (
              <RegisterForm
                onRegister={handleRegister}
                onSwitchToLogin={() => setAuthMode("login")}
                isLoading={isAuthLoading}
                error={authError}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
