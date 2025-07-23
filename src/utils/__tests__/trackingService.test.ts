import { trackingService } from "../../services/TrackingService";
import { detectCarrier } from "../carrierDetection";

// Mock the carrier detection
jest.mock("../carrierDetection", () => ({
  detectCarrier: jest.fn(),
}));

// Mock the carrier registry
jest.mock("../../services/CarrierRegistry", () => ({
  carrierRegistry: {
    get: jest.fn(),
    getAll: jest.fn(() => new Map()),
  },
}));

describe("Tracking Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("track", () => {
    it("should throw error for unsupported carrier", async () => {
      (detectCarrier as jest.Mock).mockReturnValue(null);

      await expect(trackingService.track("INVALID123")).rejects.toThrow(
        "Unsupported carrier"
      );
    });

    it("should throw error when carrier provider not found", async () => {
      (detectCarrier as jest.Mock).mockReturnValue("UPS");

      const { carrierRegistry } = require("../../services/CarrierRegistry");
      carrierRegistry.get.mockReturnValue(null);

      await expect(trackingService.track("1Z999AA1234567890")).rejects.toThrow(
        "Carrier provider not found: UPS"
      );
    });

    it("should use mock data when provider is not available", async () => {
      (detectCarrier as jest.Mock).mockReturnValue("UPS");

      const mockProvider = {
        isAvailable: jest.fn(() => false),
        getMockData: jest.fn(() => ({
          trackingNumber: "1Z999AA1234567890",
          carrier: "UPS",
          status: "In Transit",
          location: "Memphis, TN",
          timestamp: new Date(),
          description: "Package in transit",
          events: [],
        })),
        config: { name: "UPS" },
      };

      const { carrierRegistry } = require("../../services/CarrierRegistry");
      carrierRegistry.get.mockReturnValue(mockProvider);

      const result = await trackingService.track("1Z999AA1234567890");

      expect(result.carrier).toBe("UPS");
      expect(result.status).toBe("In Transit");
      expect(mockProvider.isAvailable).toHaveBeenCalled();
      expect(mockProvider.getMockData).toHaveBeenCalledWith(
        "1Z999AA1234567890"
      );
    });

    it("should use real API when provider is available", async () => {
      (detectCarrier as jest.Mock).mockReturnValue("FedEx");

      const mockProvider = {
        isAvailable: jest.fn(() => true),
        track: jest.fn(() =>
          Promise.resolve({
            trackingNumber: "123456789012",
            carrier: "FedEx",
            status: "Delivered",
            location: "New York, NY",
            timestamp: new Date(),
            description: "Package delivered",
            events: [],
          })
        ),
        config: { name: "FedEx" },
      };

      const { carrierRegistry } = require("../../services/CarrierRegistry");
      carrierRegistry.get.mockReturnValue(mockProvider);

      const result = await trackingService.track("123456789012");

      expect(result.carrier).toBe("FedEx");
      expect(result.status).toBe("Delivered");
      expect(mockProvider.isAvailable).toHaveBeenCalled();
      expect(mockProvider.track).toHaveBeenCalledWith("123456789012");
    });

    it("should fallback to mock data on API error", async () => {
      (detectCarrier as jest.Mock).mockReturnValue("FedEx");

      const mockProvider = {
        isAvailable: jest.fn(() => true),
        track: jest.fn(() => Promise.reject(new Error("API Error"))),
        getMockData: jest.fn(() => ({
          trackingNumber: "123456789012",
          carrier: "FedEx",
          status: "In Transit",
          location: "Unknown Location",
          timestamp: new Date(),
          description: "Package in transit",
          events: [],
        })),
        config: { name: "FedEx" },
      };

      const { carrierRegistry } = require("../../services/CarrierRegistry");
      carrierRegistry.get.mockReturnValue(mockProvider);

      const result = await trackingService.track("123456789012");

      expect(result.carrier).toBe("FedEx");
      expect(mockProvider.track).toHaveBeenCalled();
      expect(mockProvider.getMockData).toHaveBeenCalled();
    });
  });
});
