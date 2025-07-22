import { TrackingInfo, TrackingEvent, CarrierType } from "@/types";
import { detectCarrier } from "./carrierDetection";

// Environment variables for carrier API keys
const FEDEX_API_KEY = process.env.FEDEX_API_KEY;
const FEDEX_CLIENT_ID = process.env.FEDEX_CLIENT_ID;
const FEDEX_CLIENT_SECRET = process.env.FEDEX_CLIENT_SECRET;
const USPS_USER_ID = process.env.USPS_USER_ID;

/**
 * Mock tracking data for demonstration purposes
 * Used as fallback for carriers without API access or when APIs are unavailable
 */
const MOCK_TRACKING_DATA: Record<string, TrackingInfo> = {
  // UPS Example
  "1Z999AA1234567890": {
    trackingNumber: "1Z999AA1234567890",
    carrier: "UPS",
    status: "In Transit",
    location: "Memphis, TN",
    timestamp: new Date(),
    description: "Package in transit to next facility",
    events: [
      {
        status: "In Transit",
        location: "Memphis, TN",
        timestamp: new Date(),
        description: "Package in transit to next facility",
      },
      {
        status: "Arrived at Facility",
        location: "Louisville, KY",
        timestamp: new Date(Date.now() - 86400000),
        description: "Package arrived at UPS facility",
      },
      {
        status: "Picked Up",
        location: "New York, NY",
        timestamp: new Date(Date.now() - 172800000),
        description: "Package picked up by UPS",
      },
    ],
  },

  // FedEx Example (fallback)
  "123456789012": {
    trackingNumber: "123456789012",
    carrier: "FedEx",
    status: "Out for Delivery",
    location: "Los Angeles, CA",
    timestamp: new Date(),
    description: "Package out for delivery",
    events: [
      {
        status: "Out for Delivery",
        location: "Los Angeles, CA",
        timestamp: new Date(),
        description: "Package out for delivery",
      },
      {
        status: "At Local Facility",
        location: "Los Angeles, CA",
        timestamp: new Date(Date.now() - 43200000),
        description: "Package arrived at local FedEx facility",
      },
      {
        status: "In Transit",
        location: "Memphis, TN",
        timestamp: new Date(Date.now() - 86400000),
        description: "Package in transit",
      },
    ],
  },

  // USPS Example (fallback)
  "9400100000000000000000": {
    trackingNumber: "9400100000000000000000",
    carrier: "USPS",
    status: "Delivered",
    location: "Chicago, IL",
    timestamp: new Date(Date.now() - 3600000),
    description: "Package delivered to recipient",
    events: [
      {
        status: "Delivered",
        location: "Chicago, IL",
        timestamp: new Date(Date.now() - 3600000),
        description: "Package delivered to recipient",
      },
      {
        status: "Out for Delivery",
        location: "Chicago, IL",
        timestamp: new Date(Date.now() - 7200000),
        description: "Package out for delivery",
      },
      {
        status: "Arrived at Post Office",
        location: "Chicago, IL",
        timestamp: new Date(Date.now() - 86400000),
        description: "Package arrived at local post office",
      },
    ],
  },


};

/**
 * Get FedEx OAuth token
 * @returns OAuth token for FedEx API
 */
async function getFedExToken(): Promise<string> {
  if (!FEDEX_CLIENT_ID || !FEDEX_CLIENT_SECRET) {
    throw new Error("FedEx API credentials not configured");
  }

  const response = await fetch("https://apis-sandbox.fedex.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: FEDEX_CLIENT_ID,
      client_secret: FEDEX_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error(`FedEx OAuth failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Call FedEx Tracking API
 * @param trackingNumber - The tracking number
 * @returns Tracking information from FedEx
 */
async function callFedExAPI(trackingNumber: string): Promise<TrackingInfo> {
  try {
    const token = await getFedExToken();

    const response = await fetch(
      "https://apis-sandbox.fedex.com/track/v1/trackingnumbers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          includeDetailedScans: true,
          trackingInfo: [
            {
              trackingNumberInfo: {
                trackingNumber: trackingNumber,
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`FedEx API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (
      !data.output ||
      !data.output.completeTrackResults ||
      data.output.completeTrackResults.length === 0
    ) {
      throw new Error("Tracking number not found");
    }

    const trackResult = data.output.completeTrackResults[0];
    const trackDetails = trackResult.trackResults[0];

    // Extract events from scan events
    const events: TrackingEvent[] =
      trackDetails.scanEvents?.map((event: any) => ({
        status: event.eventDescription || "Unknown",
        location: event.scanLocation?.city
          ? `${event.scanLocation.city}, ${event.scanLocation.stateOrProvinceCode}`
          : undefined,
        timestamp: new Date(event.date + "T" + event.time),
        description: event.eventDescription || undefined,
      })) || [];

    // Get the latest event for current status
    const latestEvent = events[0] || {
      status: "Unknown",
      timestamp: new Date(),
      description: "No tracking information available",
    };

    return {
      trackingNumber: trackingNumber,
      carrier: "FedEx",
      status: mapFedExStatus(latestEvent.status),
      location: latestEvent.location,
      timestamp: latestEvent.timestamp,
      description: latestEvent.description,
      events: events,
    };
  } catch (error) {
    console.error("FedEx API error:", error);
    throw new Error(
      `FedEx tracking failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Map FedEx status to our standard status format
 * @param fedExStatus - FedEx status string
 * @returns Standardized status
 */
function mapFedExStatus(fedExStatus: string): TrackingInfo["status"] {
  const status = fedExStatus.toLowerCase();

  if (status.includes("delivered")) return "Delivered";
  if (status.includes("out for delivery")) return "Out for Delivery";
  if (status.includes("exception") || status.includes("failed"))
    return "Exception";
  if (status.includes("picked up") || status.includes("in transit"))
    return "In Transit";
  if (status.includes("pending")) return "Pending";

  return "Unknown";
}

/**
 * Call USPS Tracking API
 * @param trackingNumber - The tracking number
 * @returns Tracking information from USPS
 */
async function callUSPSAPI(trackingNumber: string): Promise<TrackingInfo> {
  try {
    if (!USPS_USER_ID) {
      throw new Error("USPS API credentials not configured");
    }

    // USPS uses XML API
    const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
<TrackFieldRequest USERID="${USPS_USER_ID}">
  <Revision>1</Revision>
  <ClientIp>127.0.0.1</ClientIp>
  <SourceId>ShipTrack</SourceId>
  <TrackID ID="${trackingNumber}"></TrackID>
</TrackFieldRequest>`;

    const response = await fetch(
      "http://production.shippingapis.com/ShippingAPI.dll",
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
      throw new Error(`USPS API error: ${response.statusText}`);
    }

    const xmlText = await response.text();

    // Parse XML response (simplified parsing)
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

    // Check for error in response
    if (xmlText.includes("<Error>")) {
      const errorMatch = xmlText.match(
        /<Description[^>]*>([^<]*)<\/Description>/
      );
      const errorMessage = errorMatch ? errorMatch[1] : "Unknown error";
      throw new Error(`USPS tracking error: ${errorMessage}`);
    }

    return {
      trackingNumber: trackingNumber,
      carrier: "USPS",
      status: mapUSPSStatus(currentStatus),
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
    throw new Error(
      `USPS tracking failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Map USPS status to our standard status format
 * @param uspsStatus - USPS status string
 * @returns Standardized status
 */
function mapUSPSStatus(uspsStatus: string): TrackingInfo["status"] {
  const status = uspsStatus.toLowerCase();

  if (status.includes("delivered")) return "Delivered";
  if (status.includes("out for delivery")) return "Out for Delivery";
  if (status.includes("exception") || status.includes("failed"))
    return "Exception";
  if (
    status.includes("picked up") ||
    status.includes("in transit") ||
    status.includes("arrived")
  )
    return "In Transit";
  if (status.includes("pending") || status.includes("accepted"))
    return "Pending";

  return "Unknown";
}

/**
 * Get tracking information for a tracking number
 * @param trackingNumber - The tracking number to look up
 * @returns Tracking information or null if not found
 */
export async function getTrackingInfo(
  trackingNumber: string
): Promise<TrackingInfo | null> {
  const normalizedNumber = trackingNumber.trim().toUpperCase();

  // Check if we have mock data for this tracking number
  if (MOCK_TRACKING_DATA[normalizedNumber]) {
    return MOCK_TRACKING_DATA[normalizedNumber];
  }

  // If no mock data, generate a generic response based on carrier
  const carrier = detectCarrier(normalizedNumber);
  if (!carrier) {
    return null;
  }

  // Generate generic tracking info for unknown tracking numbers
  return {
    trackingNumber: normalizedNumber,
    carrier,
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

/**
 * Call the appropriate carrier API based on carrier type
 * @param trackingNumber - The tracking number
 * @param carrier - The carrier type
 * @returns Tracking information
 */
export async function callCarrierAPI(
  trackingNumber: string,
  carrier: CarrierType
): Promise<TrackingInfo> {
  const normalizedNumber = trackingNumber.trim().toUpperCase();

  try {
    // Call real APIs for supported carriers
    switch (carrier) {
      case "FedEx":
        if (FEDEX_CLIENT_ID && FEDEX_CLIENT_SECRET) {
          return await callFedExAPI(normalizedNumber);
        }
        break;

      case "USPS":
        if (USPS_USER_ID) {
          return await callUSPSAPI(normalizedNumber);
        }
        break;
    }

    // Fallback to mock data for unsupported carriers or missing credentials
    const trackingInfo = await getTrackingInfo(normalizedNumber);
    if (!trackingInfo) {
      throw new Error(`Tracking number not found: ${normalizedNumber}`);
    }

    return trackingInfo;
  } catch (error) {
    console.error(`${carrier} API error:`, error);

    // If real API fails, fallback to mock data
    const trackingInfo = await getTrackingInfo(normalizedNumber);
    if (!trackingInfo) {
      throw new Error(`Tracking number not found: ${normalizedNumber}`);
    }

    return trackingInfo;
  }
}
