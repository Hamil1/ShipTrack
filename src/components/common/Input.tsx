"use client";

import { ReactNode } from "react";

interface InputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isValid?: boolean;
  errorMessage?: string;
  badge?: ReactNode;
  className?: string;
}

export default function Input({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  isValid = true,
  errorMessage,
  badge,
  className = "",
}: InputProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            !isValid && value.trim() ? "border-red-500" : "border-gray-300"
          }`}
          placeholder={placeholder}
          disabled={disabled}
        />
        {badge && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {badge}
          </div>
        )}
      </div>
      {errorMessage && !isValid && value.trim() && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}
