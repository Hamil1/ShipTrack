"use client";

import { useState } from "react";
import { detectCarrier, isValidTrackingNumber } from "@/utils/carrierDetection";
import { TrackingInfo } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface TrackingFormProps {
  onTrackingResult: (result: TrackingInfo) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

export default function TrackingForm({
  onTrackingResult,
  onError,
  isLoading = false,
}: TrackingFormProps) {
  const { token } = useAuth();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [detectedCarrier, setDetectedCarrier] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  const handleTrackingNumberChange = (value: string) => {
    setTrackingNumber(value);

    if (value.trim()) {
      const carrier = detectCarrier(value);
      setDetectedCarrier(carrier);
      setIsValid(isValidTrackingNumber(value));
    } else {
      setDetectedCarrier(null);
      setIsValid(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidTrackingNumber(trackingNumber)) {
      onError("Please enter a valid tracking number");
      return;
    }

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/track", {
        method: "POST",
        headers,
        body: JSON.stringify({ trackingNumber: trackingNumber.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        onTrackingResult(data.data);
      } else {
        onError(data.message || "Failed to track package");
      }
    } catch (error) {
      onError("Network error. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="trackingNumber"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tracking Number
          </label>
          <div className="relative">
            <input
              type="text"
              id="trackingNumber"
              value={trackingNumber}
              onChange={(e) => handleTrackingNumberChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                !isValid && trackingNumber.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter tracking number..."
              disabled={isLoading}
            />
            {detectedCarrier && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {detectedCarrier}
                </span>
              </div>
            )}
          </div>
          {!isValid && trackingNumber.trim() && (
            <p className="mt-1 text-sm text-red-600">
              Invalid tracking number format
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid || !trackingNumber.trim() || isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            !isValid || !trackingNumber.trim() || isLoading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Tracking...
            </div>
          ) : (
            "Track Package"
          )}
        </button>
      </form>

      <div className="mt-6 text-sm text-gray-600">
        <p className="font-medium mb-2">Supported Carriers:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>• UPS (1Z...)</div>
          <div>• FedEx (12-14 digits)</div>
          <div>• USPS (9400...)</div>
          <div>• DHL (10-11 digits)</div>
          <div>• Amazon (TBA...)</div>
          <div>• OnTrac (C...)</div>
        </div>
      </div>
    </div>
  );
}
