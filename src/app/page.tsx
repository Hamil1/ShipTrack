"use client";

import { useState, useEffect } from "react";
import TrackingForm from "@/components/TrackingForm";
import TrackingResult from "@/components/TrackingResult";
import TrackingHistory from "@/components/TrackingHistory";
import AuthPrompt from "@/components/AuthPrompt";
import { TrackingInfo } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

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

  // Start real-time polling for tracking updates
  const startPolling = (trackingNumber: string) => {
    setIsPolling(true);

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/track/${trackingNumber}`);
        const data = await response.json();

        if (data.success) {
          setTrackingResult(data.data);

          // Stop polling if package is delivered or has exception
          if (
            data.data.status === "Delivered" ||
            data.data.status === "Exception"
          ) {
            stopPolling();
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 30000); // Poll every 30 seconds

    setPollingInterval(interval);
  };

  // Stop real-time polling
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setIsPolling(false);
  };

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ShipTrack</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Universal package tracking for all major carriers. Track your
            shipments from UPS, FedEx, and USPS with one simple interface.
          </p>
          {isPolling && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg inline-block">
              <div className="flex items-center text-blue-800">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm font-medium">
                  Real-time updates enabled - checking every 30 seconds
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        {user && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-lg shadow-lg p-1">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("track")}
                  className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "track"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Track Package
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "history"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Tracking History
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === "track" || !user ? (
            <>
              {/* Auth Prompt for non-authenticated users */}
              <AuthPrompt />

              {/* Tracking Form */}
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                  Track Your Package
                </h2>
                <TrackingForm
                  onTrackingResult={handleTrackingResult}
                  onError={handleError}
                  isLoading={isLoading}
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Error
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tracking Result */}
              {trackingResult && (
                <div className="mb-8">
                  <TrackingResult trackingInfo={trackingResult} />

                  {/* Real-time polling controls */}
                  {isPolling && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Tracking History */
            token && <TrackingHistory token={token} />
          )}

          {/* Features Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Why Choose ShipTrack?
            </h2>
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Universal Tracking
                </h3>
                <p className="text-gray-600">
                  Track packages from all major carriers with one unified
                  interface.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Real-time Updates
                </h3>
                <p className="text-gray-600">
                  Get the latest tracking information with real-time updates.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-purple-600"
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Secure & Reliable
                </h3>
                <p className="text-gray-600">
                  Your tracking data is secure and protected with
                  industry-standard encryption.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
