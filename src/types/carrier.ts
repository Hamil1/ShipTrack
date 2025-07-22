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

export interface CarrierConfig {
  name: string;
  pattern: RegExp;
  apiEndpoint?: string;
  authType: "none" | "bearer" | "oauth" | "api_key" | "basic";
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  timeout?: number;
  retries?: number;
  endpoints?: {
    oauth?: string;
    track?: string;
  };
  mockData?: Record<string, any>;
  statusMapping?: Record<string, string>;
}

export interface CarrierCredentials {
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  userId?: string;
}

export interface CarrierApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface CarrierProvider {
  readonly config: CarrierConfig;
  readonly credentials: CarrierCredentials;

  /**
   * Initialize the carrier provider
   */
  initialize(): Promise<void>;

  /**
   * Get tracking information for a tracking number
   */
  track(trackingNumber: string): Promise<TrackingInfo>;

  /**
   * Check if the carrier is available/configured
   */
  isAvailable(): boolean;

  /**
   * Get mock data for this carrier
   */
  getMockData(trackingNumber: string): TrackingInfo | null;
}

export type CarrierType =
  | "UPS"
  | "FedEx"
  | "USPS";

export interface CarrierRegistry {
  register(carrier: CarrierType, provider: CarrierProvider): void;
  get(carrier: CarrierType): CarrierProvider | null;
  getAll(): Map<CarrierType, CarrierProvider>;
  isSupported(carrier: CarrierType): boolean;
}
