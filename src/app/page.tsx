"use client";

import { useState, useEffect } from "react";
import TrackingForm from "@/components/TrackingForm";
import TrackingResult from "@/components/TrackingResult";
import TrackingHistory from "@/components/TrackingHistory";
import AuthPrompt from "@/components/AuthPrompt";
import { TrackingInfo } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorDisplay, Card } from "@/components/common";

export default function Home() {
  const { user, token } = useAuth();
  const [trackingResult, setTrackingResult] = useState<TrackingInfo | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"track" | "history">("track");

  const handleTrackingResult = (result: TrackingInfo) => {
    setTrackingResult(result);
    setError(null);
    setIsLoading(false);

    // Start real-time polling for active shipments
    if (result.status !== "Delivered" && result.status !== "Exception") {
      startPolling(result.trackingNumber);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTrackingResult(null);
    setIsLoading(false);
  };

  const handleTrackingStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const startPolling = (trackingNumber: string) => {
    setIsPolling(true);
    const interval = setInterval(async () => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`/api/track/${trackingNumber}`, {
          headers,
        });

        const data = await response.json();

        if (data.success) {
          setTrackingResult(data.data);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 30000); // Poll every 30 seconds

    setPollingInterval(interval);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setIsPolling(false);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Track Your Packages
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Universal tracking for all major carriers
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-blue-500 px-3 py-1 rounded-full">UPS</span>
              <span className="bg-blue-500 px-3 py-1 rounded-full">FedEx</span>
              <span className="bg-blue-500 px-3 py-1 rounded-full">USPS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation for authenticated users */}
      {user && (
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab("track")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "track"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Track Package
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "history"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Tracking History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === "track" || !user ? (
          <>
            {/* Auth Prompt for non-authenticated users */}
            <AuthPrompt />

            {/* Tracking Form */}
            <TrackingForm
              onTrackingResult={handleTrackingResult}
              onError={handleError}
              isLoading={isLoading}
            />

            {/* Error Display */}
            {error && (
              <div className="mb-8">
                <ErrorDisplay error={error} />
              </div>
            )}

            {/* Tracking Result */}
            {trackingResult && (
              <div className="mb-8">
                <TrackingResult trackingInfo={trackingResult} />

                {/* Real-time polling controls */}
                {isPolling && (
                  <Card className="mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        <span className="text-sm text-blue-800">
                          Auto-updating tracking information...
                        </span>
                      </div>
                      <button
                        onClick={stopPolling}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Stop Updates
                      </button>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </>
        ) : (
          /* Tracking History */
          token && <TrackingHistory token={token} />
        )}

        {/* Features Section */}
        <Card title="Why Choose ShipTrack?" className="text-center mt-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Real-time Updates
              </h3>
              <p className="text-gray-600">
                Get instant updates on your package status with live tracking
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Universal Support
              </h3>
              <p className="text-gray-600">
                Track packages from all major carriers in one place
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure & Private
              </h3>
              <p className="text-gray-600">
                Your tracking data is secure and never shared with third parties
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
