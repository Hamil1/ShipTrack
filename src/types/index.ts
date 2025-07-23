export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface TrackingHistory {
  id: number;
  trackingNumber: string;
  carrier: string;
  status: string;
  location: string | null;
  timestamp: Date;
  description: string | null;
  userId: number;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status:
    | "In Transit"
    | "Out for Delivery"
    | "Delivered"
    | "Exception"
    | "Pending"
    | "Unknown";
  location?: string;
  timestamp: Date;
  description?: string;
  events: TrackingEvent[];
}

export interface TrackingEvent {
  status: string;
  location?: string;
  timestamp: Date;
  description?: string;
}

export interface CarrierInfo {
  name: string;
  pattern: RegExp;
  apiEndpoint?: string;
}

export type CarrierType = "UPS" | "FedEx" | "USPS";

export interface AuthResponse {
  user: User;
  token: string;
}

export interface TrackingStatus {
  status:
    | "In Transit"
    | "Out for Delivery"
    | "Delivered"
    | "Exception"
    | "Pending"
    | "Unknown";
  location?: string;
  timestamp: Date;
  description?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
