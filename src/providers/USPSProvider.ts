import { BaseCarrierProvider } from "./BaseCarrierProvider";
import { TrackingInfo, TrackingEvent } from "@/types/carrier";

export class USPSProvider extends BaseCarrierProvider {
  async track(trackingNumber: string): Promise<TrackingInfo> {
    try {
      // USPS uses XML API
      const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
<TrackFieldRequest USERID="${this.credentials.userId}">
  <Revision>1</Revision>
  <ClientIp>127.0.0.1</ClientIp>
  <SourceId>ShipTrack</SourceId>
  <TrackID ID="${trackingNumber}"></TrackID>
</TrackFieldRequest>`;

      const response = await fetch(
        `${this.config.apiEndpoint}${(this.config as any).endpoints.track}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            API: "TrackV2",
            XML: xmlRequest,
          }),
        }
      );

      if (!response.ok) {
        // Handle specific HTTP errors
        if (response.status === 403) {
          throw new Error(
            "USPS API access denied - geographic restrictions may apply. USPS Web Tools API is primarily available for US-based users."
          );
        }
        if (response.status === 429) {
          throw new Error(
            "USPS API temporarily unavailable. Please try again later."
          );
        }
        throw new Error(`USPS API error: ${response.statusText}`);
      }

      const xmlText = await response.text();

      // Check for specific USPS error messages
      if (xmlText.includes("<Error>")) {
        const errorMatch = xmlText.match(
          /<Description[^>]*>([^<]*)<\/Description>/
        );
        const errorMessage = errorMatch ? errorMatch[1] : "Unknown error";

        // Handle specific USPS error messages
        if (
          errorMessage.toLowerCase().includes("not eligible") ||
          errorMessage.toLowerCase().includes("geographic") ||
          errorMessage.toLowerCase().includes("location")
        ) {
          throw new Error(
            `USPS API Geographic Restriction: ${errorMessage}. USPS Web Tools API may not be available in your region.`
          );
        }

        throw new Error(`USPS tracking error: ${errorMessage}`);
      }

      // Parse XML response
      const events: TrackingEvent[] = [];
      let currentStatus = "Unknown";
      let currentLocation = undefined;
      let currentDescription = undefined;
      let currentTimestamp = new Date();

      // Extract tracking events from XML
      const trackInfoMatch = xmlText.match(
        /<TrackInfo[^>]*>([\s\S]*?)<\/TrackInfo>/
      );
      if (trackInfoMatch) {
        const trackInfo = trackInfoMatch[1];

        // Extract track details
        const trackDetails = trackInfo.match(
          /<TrackDetail[^>]*>([\s\S]*?)<\/TrackDetail>/g
        );
        if (trackDetails) {
          trackDetails.forEach((detail, index) => {
            const eventMatch = detail.match(/<Event[^>]*>([^<]*)<\/Event>/);
            const locationMatch = detail.match(
              /<EventCity[^>]*>([^<]*)<\/EventCity>/
            );
            const stateMatch = detail.match(
              /<EventState[^>]*>([^<]*)<\/EventState>/
            );
            const dateMatch = detail.match(
              /<EventDate[^>]*>([^<]*)<\/EventDate>/
            );
            const timeMatch = detail.match(
              /<EventTime[^>]*>([^<]*)<\/EventTime>/
            );

            if (eventMatch) {
              const event = eventMatch[1];
              const location =
                locationMatch && stateMatch
                  ? `${locationMatch[1]}, ${stateMatch[1]}`
                  : undefined;
              const date = dateMatch ? dateMatch[1] : "";
              const time = timeMatch ? timeMatch[1] : "";
              const timestamp = new Date(`${date}T${time}`);

              events.push({
                status: event,
                location,
                timestamp,
                description: event,
              });

              // Use the first (most recent) event for current status
              if (index === 0) {
                currentStatus = event;
                currentLocation = location;
                currentDescription = event;
                currentTimestamp = timestamp;
              }
            }
          });
        }
      }

      return {
        trackingNumber: trackingNumber,
        carrier: this.config.name,
        status: this.mapStatus(currentStatus),
        location: currentLocation,
        timestamp: currentTimestamp,
        description: currentDescription,
        events:
          events.length > 0
            ? events
            : [
                {
                  status: currentStatus,
                  location: currentLocation,
                  timestamp: currentTimestamp,
                  description: currentDescription,
                },
              ],
      };
    } catch (error) {
      console.error("USPS API error:", error);

      // Check if this is a geographic restriction error
      if (
        error instanceof Error &&
        (error.message.includes("geographic") ||
          error.message.includes("not eligible") ||
          error.message.includes("access denied"))
      ) {
        throw new Error(
          `USPS API Geographic Restriction: ${error.message}. The USPS Web Tools API is primarily available for US-based users. Please try using FedEx or UPS tracking instead.`
        );
      }

      throw new Error(
        `USPS tracking failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
