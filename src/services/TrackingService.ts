import { TrackingInfo, CarrierType } from "@/types/carrier";
import { carrierRegistry } from "./CarrierRegistry";
import { detectCarrier } from "@/utils/carrierDetection";

export class TrackingService {
  /**
   * Get tracking information for a tracking number
   */
  async track(trackingNumber: string): Promise<TrackingInfo> {
    const normalizedNumber = trackingNumber.trim().toUpperCase();

    // Detect carrier
    const carrier = detectCarrier(normalizedNumber);
    if (!carrier) {
      throw new Error("Unsupported carrier");
    }

    console.log(`🔍 Tracking Service Debug:`);
    console.log(`  - Tracking number: ${normalizedNumber}`);
    console.log(`  - Detected carrier: ${carrier}`);

    // Get carrier provider
    const provider = carrierRegistry.get(carrier);
    if (!provider) {
      console.log(`  - Provider not found for carrier: ${carrier}`);
      console.log(
        `  - Available carriers:`,
        Array.from(carrierRegistry.getAll().keys())
      );
      throw new Error(`Carrier provider not found: ${carrier}`);
    }

    console.log(`  - Provider found: ${provider.constructor.name}`);
    console.log(`  - Provider available: ${provider.isAvailable()}`);

    try {
      // Check if provider is available (has credentials)
      if (provider.isAvailable()) {
        console.log(`Using real API for ${carrier}`);
        return await provider.track(normalizedNumber);
      } else {
        console.log(`Using mock data for ${carrier} (no credentials)`);
        const mockData = provider.getMockData(normalizedNumber);
        if (mockData) {
          return mockData;
        }

        // Generate generic response
        return {
          trackingNumber: normalizedNumber,
          carrier: provider.config.name,
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
    } catch (error) {
      console.error(`${carrier} tracking error:`, error);

      // Fallback to mock data on API failure
      const mockData = provider.getMockData(normalizedNumber);
      if (mockData) {
        console.log(`Falling back to mock data for ${carrier}`);
        return mockData;
      }

      throw new Error(
        `Tracking failed for ${carrier}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get all supported carriers
   */
  getSupportedCarriers(): CarrierType[] {
    return carrierRegistry.getSupportedCarriers();
  }

  /**
   * Check if a carrier is supported
   */
  isCarrierSupported(carrier: CarrierType): boolean {
    return carrierRegistry.isSupported(carrier);
  }

  /**
   * Get carrier provider information
   */
  getCarrierInfo(carrier: CarrierType) {
    const provider = carrierRegistry.get(carrier);
    if (!provider) return null;

    return {
      name: provider.config.name,
      isAvailable: provider.isAvailable(),
      hasApi: provider.isAvailable(),
      hasMockData: true, // All providers have mock data fallback
    };
  }
}

// Export singleton instance
export const trackingService = new TrackingService();
