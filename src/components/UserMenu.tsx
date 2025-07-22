"use client";

import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-700 hidden md:block">
          {user.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Backdrop to close menu when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
