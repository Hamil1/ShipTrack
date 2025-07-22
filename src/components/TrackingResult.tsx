"use client";

import { TrackingInfo } from "@/types";

interface TrackingResultProps {
  trackingInfo: TrackingInfo;
}

export default function TrackingResult({ trackingInfo }: TrackingResultProps) {
  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("delivered")) return "bg-green-100 text-green-800";
    if (lowerStatus.includes("out for delivery"))
      return "bg-blue-100 text-blue-800";
    if (lowerStatus.includes("in transit"))
      return "bg-yellow-100 text-yellow-800";
    if (lowerStatus.includes("exception")) return "bg-red-100 text-red-800";
    if (lowerStatus.includes("picked up"))
      return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Tracking Information
            </h2>
            <p className="text-blue-100 text-sm">
              {trackingInfo.trackingNumber}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 text-white">
              {trackingInfo.carrier}
            </span>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Current Status
            </h3>
            <p className="text-gray-600 mt-1">
              {trackingInfo.location && `${trackingInfo.location} • `}
              {formatDate(trackingInfo.timestamp)}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              trackingInfo.status
            )}`}
          >
            {trackingInfo.status}
          </span>
        </div>
        {trackingInfo.description && (
          <p className="text-gray-700 mt-2 text-sm">
            {trackingInfo.description}
          </p>
        )}
      </div>

      {/* Tracking Timeline */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Tracking History
        </h3>
        <div className="space-y-4">
          {trackingInfo.events.map((event, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div
                  className={`w-3 h-3 rounded-full ${
                    index === 0 ? "bg-blue-600" : "bg-gray-300"
                  }`}
                ></div>
                {index < trackingInfo.events.length - 1 && (
                  <div className="w-0.5 h-8 bg-gray-300 mx-auto mt-1"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {event.status}
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      event.status
                    )}`}
                  >
                    {event.status}
                  </span>
                </div>
                {event.location && (
                  <p className="text-sm text-gray-600 mt-1">
                    📍 {event.location}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(event.timestamp)}
                </p>
                {event.description && (
                  <p className="text-sm text-gray-700 mt-2">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Last updated: {formatDate(trackingInfo.timestamp)}
        </p>
      </div>
    </div>
  );
}
