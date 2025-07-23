import {
  CarrierProvider,
  CarrierConfig,
  CarrierCredentials,
  TrackingInfo,
  TrackingEvent,
} from "@/types/carrier";

export abstract class BaseCarrierProvider implements CarrierProvider {
  constructor(
    public readonly config: CarrierConfig,
    public readonly credentials: CarrierCredentials
  ) {}

  /**
   * Initialize the carrier provider
   */
  async initialize(): Promise<void> {
    // Base implementation - can be overridden by subclasses
    if (this.config.authType === "oauth") {
      await this.initializeOAuth();
    }
  }

  /**
   * Check if the carrier is available/configured
   */
  isAvailable(): boolean {
    switch (this.config.authType) {
      case "none":
        return true;
      case "oauth":
        return !!(this.credentials.clientId && this.credentials.clientSecret);
      case "bearer":
      case "api_key":
        return !!this.credentials.apiKey;
      case "basic":
        return !!(this.credentials.username && this.credentials.password);
      default:
        return false;
    }
  }

  /**
   * Get mock data for this carrier
   */
  getMockData(trackingNumber: string): TrackingInfo | null {
    const mockData = (this.config as any).mockData?.[trackingNumber];
    if (!mockData) return null;

    return {
      ...mockData,
      timestamp: new Date(),
      events: mockData.events.map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp || Date.now()),
      })),
    };
  }

  /**
   * Abstract method that must be implemented by subclasses
   */
  abstract track(trackingNumber: string): Promise<TrackingInfo>;

  /**
   * Initialize OAuth token
   */
  protected async initializeOAuth(): Promise<void> {
    if (!this.credentials.clientId || !this.credentials.clientSecret) {
      throw new Error(`${this.config.name} OAuth credentials not configured`);
    }

    const response = await fetch(
      `${this.config.apiEndpoint}${(this.config as any).endpoints.oauth}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `${this.config.name} OAuth failed: ${response.statusText}`
      );
    }

    const data = await response.json();
    (this as any).accessToken = data.access_token;
  }

  /**
   * Make an authenticated API request
   */
  protected async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.config.apiEndpoint}${endpoint}`;
    let extraHeaders: Record<string, string> = {};
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          extraHeaders[key] = value;
        });
      } else {
        extraHeaders = options.headers as Record<string, string>;
      }
    }
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...extraHeaders,
    };

    // Add authentication headers
    switch (this.config.authType) {
      case "oauth":
        if ((this as any).accessToken) {
          headers.Authorization = `Bearer ${(this as any).accessToken}`;
        }
        break;
      case "bearer":
      case "api_key":
        if (this.credentials.apiKey) {
          headers.Authorization = `Bearer ${this.credentials.apiKey}`;
        }
        break;
      case "basic":
        if (this.credentials.username && this.credentials.password) {
          const credentials = btoa(
            `${this.credentials.username}:${this.credentials.password}`
          );
          headers.Authorization = `Basic ${credentials}`;
        }
        break;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeout || 10000
    );

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Map carrier status to standard status
   */
  protected mapStatus(carrierStatus: string): TrackingInfo["status"] {
    const statusMapping = (this.config as any).statusMapping || {};
    const statusLower = carrierStatus.toLowerCase();

    for (const [key, value] of Object.entries(statusMapping)) {
      if (statusLower.includes(key)) {
        return value as TrackingInfo["status"];
      }
    }

    return "Unknown";
  }

  /**
   * Create tracking event from carrier data
   */
  protected createTrackingEvent(eventData: any): TrackingEvent {
    return {
      status: eventData.status || "Unknown",
      location: eventData.location,
      timestamp: new Date(eventData.timestamp || Date.now()),
      description: eventData.description,
    };
  }
}
