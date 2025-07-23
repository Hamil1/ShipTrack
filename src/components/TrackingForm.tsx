"use client";

import { useState } from "react";
import { detectCarrier, isValidTrackingNumber } from "@/utils/carrierDetection";
import { TrackingInfo } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Input, Button, CarrierBadge, Card } from "./common";

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
    <Card title="Track Your Package" className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="trackingNumber"
          label="Tracking Number"
          value={trackingNumber}
          onChange={handleTrackingNumberChange}
          placeholder="Enter tracking number..."
          disabled={isLoading}
          isValid={isValid}
          errorMessage="Invalid tracking number format"
          badge={detectedCarrier && <CarrierBadge carrier={detectedCarrier} />}
        />

        <Button
          type="submit"
          disabled={!isValid || !trackingNumber.trim()}
          loading={isLoading}
          loadingText="Tracking..."
        >
          Track Package
        </Button>
      </form>

      <div className="mt-6 text-sm text-gray-600">
        <p className="font-medium mb-2">Supported Carriers:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>• UPS (1Z...)</div>
          <div>• FedEx (12-14 digits)</div>
          <div>• USPS (9400...)</div>
        </div>
      </div>
    </Card>
  );
}
