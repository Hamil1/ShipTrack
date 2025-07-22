import { CarrierInfo, CarrierType } from "@/types";

// Carrier patterns based on tracking number formats
// Focused on the three major US carriers
export const CARRIER_PATTERNS: Record<CarrierType, CarrierInfo> = {
  UPS: {
    name: "UPS",
    pattern: /^1Z[0-9A-Z]{15,16}$/i,
    apiEndpoint: "https://api.ups.com/track",
  },
  FedEx: {
    name: "FedEx",
    pattern: /^[0-9]{12,14}$/,
    apiEndpoint: "https://api.fedex.com/track",
  },
  USPS: {
    name: "USPS",
    pattern: /^(9[0-9]{3})[0-9]{15,18}$/,
    apiEndpoint: "https://api.usps.com/track",
  },
};

/**
 * Detect carrier based on tracking number format
 * @param trackingNumber - The tracking number to analyze
 * @returns The detected carrier or null if not recognized
 */
export function detectCarrier(trackingNumber: string): CarrierType | null {
  const normalizedNumber = trackingNumber.trim().toUpperCase();

  for (const [carrier, info] of Object.entries(CARRIER_PATTERNS)) {
    if (info.pattern.test(normalizedNumber)) {
      return carrier as CarrierType;
    }
  }

  return null;
}

/**
 * Validate tracking number format
 * @param trackingNumber - The tracking number to validate
 * @returns True if valid, false otherwise
 */
export function isValidTrackingNumber(trackingNumber: string): boolean {
  return detectCarrier(trackingNumber) !== null;
}

/**
 * Get carrier information by type
 * @param carrier - The carrier type
 * @returns Carrier information or null if not found
 */
export function getCarrierInfo(carrier: CarrierType): CarrierInfo | null {
  return CARRIER_PATTERNS[carrier] || null;
}
