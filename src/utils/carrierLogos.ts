import { CarrierType } from "@/types";

/**
 * Get the logo URL for a carrier
 * @param carrier - The carrier type
 * @returns The URL to the carrier's logo
 */
export function getCarrierLogo(carrier: CarrierType): string {
  const logos: Record<CarrierType, string> = {
    FedEx: "/carriers/fedex.svg",
    UPS: "/carriers/ups.svg",
    USPS: "/carriers/usps.svg",
  };

  return logos[carrier] || "/carriers/unknown.svg";
}

/**
 * Get the display name for a carrier
 * @param carrier - The carrier type
 * @returns The display name for the carrier
 */
export function getCarrierDisplayName(carrier: CarrierType): string {
  const names: Record<CarrierType, string> = {
    FedEx: "FedEx",
    UPS: "UPS",
    USPS: "USPS",
  };

  return names[carrier] || carrier;
}
