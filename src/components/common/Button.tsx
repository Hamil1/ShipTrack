"use client";

import { ReactNode } from "react";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
}

export default function Button({
  type = "button",
  disabled = false,
  loading = false,
  loadingText = "Loading...",
  children,
  onClick,
  className = "",
  variant = "primary",
}: ButtonProps) {
  const baseClasses =
    "w-full py-3 px-4 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const disabledClasses = "bg-gray-300 text-gray-500 cursor-not-allowed";

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${baseClasses} ${
        isDisabled ? disabledClasses : variantClasses[variant]
      } ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <LoadingSpinner className="mr-2" />
          {loadingText}
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// Loading Spinner component
interface LoadingSpinnerProps {
  className?: string;
}

function LoadingSpinner({ className = "" }: LoadingSpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full h-5 w-5 border-b-2 border-white ${className}`}
    ></div>
  );
}
