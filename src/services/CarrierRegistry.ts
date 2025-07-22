import {
  CarrierRegistry,
  CarrierType,
  CarrierProvider,
  TrackingEvent,
} from "@/types/carrier";
import { FedExProvider } from "@/providers/FedExProvider";
import { USPSProvider } from "@/providers/USPSProvider";
import { UPSProvider } from "@/providers/UPSProvider";
import { BaseCarrierProvider } from "@/providers/BaseCarrierProvider";

export class CarrierRegistryService implements CarrierRegistry {
  private providers = new Map<CarrierType, CarrierProvider>();
  private configs = new Map<CarrierType, any>();

  constructor() {
    this.initialize();
  }

  private async initialize() {
    console.log("🚀 Initializing CarrierRegistry...");
    await this.loadConfigurations();
    await this.initializeProviders();
    console.log("✅ CarrierRegistry initialization complete");
  }

  /**
   * Load carrier configurations from JSON files
   */
  private async loadConfigurations() {
    try {
      console.log("📁 Loading carrier configurations...");
      // In a real implementation, you'd load these dynamically
      // For now, we'll import them statically
      const fedexConfig = await import("../../config/carriers/fedex.json");
      const uspsConfig = await import("../../config/carriers/usps.json");
      const upsConfig = await import("../../config/carriers/ups.json");

      this.configs.set("FedEx", fedexConfig);
      this.configs.set("USPS", uspsConfig);
      this.configs.set("UPS", upsConfig);

      console.log("  ✅ All configurations loaded successfully");
      console.log("  - FedEx config:", !!fedexConfig);
      console.log("  - USPS config:", !!uspsConfig);
      console.log("  - UPS config:", !!upsConfig);
    } catch (error) {
      console.error("Failed to load carrier configurations:", error);
    }
  }

  /**
   * Initialize carrier providers
   */
  private async initializeProviders() {
    console.log("🔧 Initializing carrier providers...");
    // Initialize FedEx provider
    const fedexConfig = this.configs.get("FedEx");
    console.log("  - FedEx config found:", !!fedexConfig);
    console.log("  - FEDEX_CLIENT_ID:", !!process.env.FEDEX_CLIENT_ID);
    console.log("  - FEDEX_CLIENT_SECRET:", !!process.env.FEDEX_CLIENT_SECRET);

    if (fedexConfig) {
      const fedexProvider = new FedExProvider(
        {
          name: fedexConfig.name,
          pattern: new RegExp(fedexConfig.pattern),
          apiEndpoint: fedexConfig.apiEndpoint,
          authType: fedexConfig.authType,
          rateLimit: fedexConfig.rateLimit,
          timeout: fedexConfig.timeout,
          retries: fedexConfig.retries,
          endpoints: fedexConfig.endpoints,
          mockData: fedexConfig.mockData,
          statusMapping: fedexConfig.statusMapping,
        },
        {
          clientId: process.env.FEDEX_CLIENT_ID,
          clientSecret: process.env.FEDEX_CLIENT_SECRET,
        }
      );

      await fedexProvider.initialize();
      this.register("FedEx", fedexProvider);
      console.log("  ✅ FedEx provider registered successfully");
    }

    // Initialize USPS provider
    const uspsConfig = this.configs.get("USPS");
    console.log("  - USPS config found:", !!uspsConfig);
    console.log(
      "  - USPS_WEB_TOOLS_USER_ID:",
      !!process.env.USPS_WEB_TOOLS_USER_ID
    );

    if (uspsConfig) {
      const uspsProvider = new USPSProvider(
        {
          name: uspsConfig.name,
          pattern: new RegExp(uspsConfig.pattern),
          apiEndpoint: uspsConfig.apiEndpoint,
          authType: uspsConfig.authType,
          rateLimit: uspsConfig.rateLimit,
          timeout: uspsConfig.timeout,
          retries: uspsConfig.retries,
          endpoints: uspsConfig.endpoints,
          mockData: uspsConfig.mockData,
          statusMapping: uspsConfig.statusMapping,
        },
        {
          userId: process.env.USPS_WEB_TOOLS_USER_ID,
        }
      );

      await uspsProvider.initialize();
      this.register("USPS", uspsProvider);
      console.log("  ✅ USPS provider registered successfully");
    }

    // Initialize UPS provider
    const upsConfig = this.configs.get("UPS");
    console.log("  - UPS config found:", !!upsConfig);
    console.log("  - UPS_CLIENT_ID:", !!process.env.UPS_CLIENT_ID);
    console.log("  - UPS_CLIENT_SECRET:", !!process.env.UPS_CLIENT_SECRET);

    if (upsConfig) {
      try {
        const upsProvider = new UPSProvider(
          {
            name: upsConfig.name,
            pattern: new RegExp(upsConfig.pattern),
            apiEndpoint: upsConfig.apiEndpoint,
            authType: upsConfig.authType,
            rateLimit: upsConfig.rateLimit,
            timeout: upsConfig.timeout,
            retries: upsConfig.retries,
            endpoints: upsConfig.endpoints,
            mockData: upsConfig.mockData,
            statusMapping: upsConfig.statusMapping,
          },
          {
            clientId: process.env.UPS_CLIENT_ID,
            clientSecret: process.env.UPS_CLIENT_SECRET,
          }
        );

        await upsProvider.initialize();
        this.register("UPS", upsProvider);
        console.log("  ✅ UPS provider registered successfully");
      } catch (error) {
        console.log("  ❌ UPS provider initialization failed:", error);
        console.log(
          "  ℹ️  UPS will use mock data when credentials are not available"
        );

        // Create a mock UPS provider for when credentials are not available
        const mockUPSProvider = new MockUPSProvider(
          {
            name: upsConfig.name,
            pattern: new RegExp(upsConfig.pattern),
            authType: "none",
            mockData: upsConfig.mockData,
            statusMapping: upsConfig.statusMapping,
          },
          {}
        );

        this.register("UPS", mockUPSProvider);
        console.log("  ✅ Mock UPS provider registered as fallback");
      }
    } else {
      console.log("  ❌ UPS config not found");
    }

    // Initialize mock providers for other carriers
    // this.initializeMockProviders(); // Disabled - focusing on major carriers only

    console.log("✅ CarrierRegistry initialization complete");
  }

  /**
   * Initialize mock providers for carriers without real APIs
   */
  private initializeMockProviders() {
    const mockCarriers: CarrierType[] = ["DHL", "Amazon", "OnTrac"];

    mockCarriers.forEach((carrier) => {
      const mockProvider = new MockCarrierProvider(
        {
          name: carrier,
          pattern: this.getMockPattern(carrier),
          authType: "none",
        },
        {}
      );

      this.register(carrier, mockProvider);
    });
  }

  /**
   * Get mock pattern for carrier
   */
  private getMockPattern(carrier: CarrierType): RegExp {
    const patterns: Record<CarrierType, RegExp> = {
      UPS: /^1Z[0-9A-Z]{15,16}$/i,
      FedEx: /^[0-9]{12,14}$/,
      USPS: /^(9[0-9]{3})[0-9]{15,18}$/,
      DHL: /^[0-9]{10,11}$/,
      Amazon: /^TBA[0-9]{12}$/i,
      OnTrac: /^C[0-9]{8}$/i,
      CanadaPost: /^[0-9]{16}$/,
      RoyalMail: /^[A-Z]{2}[0-9]{9}GB$/i,
    };

    return patterns[carrier] || /^[0-9]+$/;
  }

  /**
   * Register a carrier provider
   */
  register(carrier: CarrierType, provider: CarrierProvider): void {
    this.providers.set(carrier, provider);
    console.log(`Registered carrier: ${carrier}`);
  }

  /**
   * Get a carrier provider
   */
  get(carrier: CarrierType): CarrierProvider | null {
    return this.providers.get(carrier) || null;
  }

  /**
   * Get all registered providers
   */
  getAll(): Map<CarrierType, CarrierProvider> {
    return new Map(this.providers);
  }

  /**
   * Check if a carrier is supported
   */
  isSupported(carrier: CarrierType): boolean {
    return this.providers.has(carrier);
  }

  /**
   * Get all supported carriers
   */
  getSupportedCarriers(): CarrierType[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get carrier configuration
   */
  getConfig(carrier: CarrierType): any {
    return this.configs.get(carrier);
  }
}

/**
 * Mock carrier provider for carriers without real APIs
 */
class MockCarrierProvider extends BaseCarrierProvider {
  async track(trackingNumber: string): Promise<TrackingInfo> {
    // Return mock data or generate generic response
    const mockData = this.getMockData(trackingNumber);
    if (mockData) {
      return mockData;
    }

    // Generate generic tracking info
    return {
      trackingNumber: trackingNumber,
      carrier: this.config.name,
      status: "In Transit",
      location: "Unknown Location",
      timestamp: new Date(),
      description: "Package information not available",
      events: [
        {
          status: "In Transit",
          location: "Unknown Location",
          timestamp: new Date(),
          description: "Package information not available",
        },
      ],
    };
  }
}

/**
 * Mock UPS provider for when OAuth credentials are not available
 */
class MockUPSProvider extends BaseCarrierProvider {
  async track(trackingNumber: string): Promise<TrackingInfo> {
    // Return mock data from config or generate generic response
    const mockData = this.getMockData(trackingNumber);
    if (mockData) {
      return mockData;
    }

    // Generate generic UPS tracking info
    const now = new Date();
    const events: TrackingEvent[] = [
      {
        status: "In Transit",
        location: "Memphis, TN",
        timestamp: now,
        description: "Package in transit to next facility",
      },
      {
        status: "Arrived at Facility",
        location: "Louisville, KY",
        timestamp: new Date(now.getTime() - 86400000),
        description: "Package arrived at UPS facility",
      },
      {
        status: "Picked Up",
        location: "New York, NY",
        timestamp: new Date(now.getTime() - 172800000),
        description: "Package picked up by UPS",
      },
    ];

    return {
      trackingNumber: trackingNumber,
      carrier: this.config.name,
      status: "In Transit",
      location: "Memphis, TN",
      timestamp: now,
      description: "Package in transit to next facility",
      events: events,
    };
  }
}

// Export singleton instance
export const carrierRegistry = new CarrierRegistryService();
