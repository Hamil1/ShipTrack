import { BaseCarrierProvider } from "./BaseCarrierProvider";
import { TrackingInfo, TrackingEvent } from "@/types/carrier";

export class UPSProvider extends BaseCarrierProvider {
  async track(trackingNumber: string): Promise<TrackingInfo> {
    try {
      // UPS Tracking API request format based on documentation
      const response = await this.makeRequest(
        (this.config as any).endpoints.track,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inquiryNumber: trackingNumber,
            locale: "en_US",
            returnSignature: false,
            returnMilestones: true,
            returnPOD: false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`UPS API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Debug: Log the UPS API response
      console.log("=== UPS API RESPONSE ===");
      console.log("Full response:", JSON.stringify(data, null, 2));
      console.log("==========================");

      if (
        !data.trackResponse ||
        !data.trackResponse.shipment ||
        data.trackResponse.shipment.length === 0
      ) {
        throw new Error("Tracking number not found");
      }

      const shipment = data.trackResponse.shipment[0];
      const packageData = shipment.package[0];
      const activity = packageData.activity;

      // Debug: Log the package data structure
      console.log("=== UPS PACKAGE DATA ===");
      console.log("Package data:", JSON.stringify(packageData, null, 2));
      console.log("Activity exists:", !!activity);
      console.log("Activity type:", typeof activity);
      console.log("Activity length:", activity?.length);
      console.log("========================");

      // Extract events from activity
      const events: TrackingEvent[] =
        activity?.map((event: any) => ({
          status: event.status?.description || event.status?.type || "Unknown",
          location:
            event.location?.address?.city &&
            event.location?.address?.stateProvinceCode
              ? `${event.location.address.city}, ${event.location.address.stateProvinceCode}`
              : undefined,
          timestamp: new Date(event.date + "T" + event.time),
          description:
            event.status?.description || event.status?.type || undefined,
        })) || [];

      // Get the latest event for current status
      const latestEvent = events[0] || {
        status: "Unknown",
        timestamp: new Date(),
        description: "No tracking information available",
      };

      return {
        trackingNumber: trackingNumber,
        carrier: this.config.name,
        status: this.mapStatus(latestEvent.status),
        location: latestEvent.location,
        timestamp: latestEvent.timestamp,
        description: latestEvent.description,
        events: events,
      };
    } catch (error) {
      console.error("UPS API error:", error);
      throw new Error(
        `UPS tracking failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
