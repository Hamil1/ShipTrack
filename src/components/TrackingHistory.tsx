"use client";

import { useState, useEffect } from "react";
import { TrackingInfo } from "@/types";

interface TrackingHistoryProps {
  token: string;
}

interface HistoryItem {
  id: number;
  trackingNumber: string;
  carrier: string;
  status: string;
  location: string | null;
  timestamp: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export default function TrackingHistory({ token }: TrackingHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTracking, setSelectedTracking] = useState<TrackingInfo | null>(
    null
  );

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/track/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setHistory(data.data);
      } else {
        setError(data.message || "Failed to load tracking history");
      }
    } catch (err) {
      setError("Failed to load tracking history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackingClick = async (trackingNumber: string) => {
    try {
      const response = await fetch(`/api/track/${trackingNumber}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSelectedTracking(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch tracking details:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "text-green-600 bg-green-100";
      case "in transit":
        return "text-blue-600 bg-blue-100";
      case "out for delivery":
        return "text-orange-600 bg-orange-100";
      case "exception":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Tracking History
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Tracking History
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Tracking History
      </h2>

      {history.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tracking history yet
          </h3>
          <p className="text-gray-600">
            Start tracking packages to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleTrackingClick(item.trackingNumber)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-mono text-sm text-gray-600">
                      {item.trackingNumber}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {item.carrier}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span>{item.location}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(item.timestamp)}</span>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected tracking details modal */}
      {selectedTracking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Tracking Details
                </h3>
                <button
                  onClick={() => setSelectedTracking(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
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
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Tracking Number
                  </span>
                  <p className="font-mono text-lg">
                    {selectedTracking.trackingNumber}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Carrier
                  </span>
                  <p className="text-lg">{selectedTracking.carrier}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Status
                  </span>
                  <p className="text-lg">{selectedTracking.status}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Location
                  </span>
                  <p className="text-lg">{selectedTracking.location}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Description
                  </span>
                  <p className="text-lg">{selectedTracking.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
