import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromHeader } from "@/utils/auth";
import { detectCarrier, isValidTrackingNumber } from "@/utils/carrierDetection";
import { trackingService } from "@/services/TrackingService";
import { ApiResponse, TrackingInfo } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
): Promise<NextResponse<ApiResponse<TrackingInfo>>> {
  try {
    const { trackingNumber } = await params;

    // Validate tracking number format
    if (!isValidTrackingNumber(trackingNumber)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid tracking number",
          message: "The tracking number format is not recognized",
        },
        { status: 400 }
      );
    }

    // Detect carrier
    const carrier = detectCarrier(trackingNumber);
    if (!carrier) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported carrier",
          message: "This carrier is not supported",
        },
        { status: 400 }
      );
    }

    // Get user from authorization header (optional)
    const authHeader = request.headers.get("authorization");
    const user = getUserFromHeader(authHeader);

    // Step 1: Check for cached data in tracking history
    // For authenticated users, check their personal history first
    let cachedData = null;

    console.log("🔍 Cache Check Debug:");
    console.log("  - Tracking number:", trackingNumber);
    console.log("  - User authenticated:", !!user);
    console.log("  - User ID:", user?.id);

    if (user) {
      // Check user's personal tracking history
      cachedData = await prisma.trackingHistory.findFirst({
        where: {
          trackingNumber: trackingNumber.toUpperCase(),
          userId: user.id,
        },
        orderBy: {
          timestamp: "desc",
        },
      });

      console.log("  - Personal cache found:", !!cachedData);
    }

    // If no personal cache found, check global cache (any user's recent tracking)
    if (!cachedData) {
      cachedData = await prisma.trackingHistory.findFirst({
        where: {
          trackingNumber: trackingNumber.toUpperCase(),
        },
        orderBy: {
          timestamp: "desc",
        },
      });

      console.log("  - Global cache found:", !!cachedData);
    }

    console.log("  - Final cached data:", !!cachedData);

    // Step 2: If we have cached data, check if it's fresh (within 2 hours for testing)
    if (cachedData) {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

      console.log("🔍 Caching Debug:");
      console.log("  - Cached timestamp:", cachedData.timestamp);
      console.log("  - Two hours ago:", twoHoursAgo);
      console.log("  - Is fresh?", cachedData.timestamp > twoHoursAgo);
      console.log(
        "  - Time difference (ms):",
        cachedData.timestamp.getTime() - twoHoursAgo.getTime()
      );

      if (cachedData.timestamp > twoHoursAgo) {
        const trackingInfo: TrackingInfo = {
          trackingNumber: cachedData.trackingNumber,
          carrier: cachedData.carrier,
          status: cachedData.status,
          location: cachedData.location || undefined,
          timestamp: cachedData.timestamp,
          description: cachedData.description || undefined,
          events: [
            {
              status: cachedData.status,
              location: cachedData.location || undefined,
              timestamp: cachedData.timestamp,
              description: cachedData.description || undefined,
            },
          ],
        };

        return NextResponse.json({
          success: true,
          data: trackingInfo,
          message: `Cached tracking information retrieved for ${cachedData.carrier}`,
        });
      }
    }

    // Step 3: No fresh cached data, call carrier API using the new tracking service
    const trackingInfo = await trackingService.track(trackingNumber);

    // Step 4: Save to tracking history if user is authenticated
    if (user) {
      await prisma.trackingHistory.create({
        data: {
          trackingNumber: trackingInfo.trackingNumber,
          carrier: trackingInfo.carrier,
          status: trackingInfo.status,
          location: trackingInfo.location || null,
          timestamp: trackingInfo.timestamp,
          description: trackingInfo.description || null,
          userId: user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: trackingInfo,
      message: `Fresh tracking information retrieved for ${carrier}`,
    });
  } catch (error) {
    console.error("Get tracking error:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        {
          success: false,
          error: "Tracking number not found",
          message: "The tracking number could not be found",
        },
        { status: 404 }
      );
    }

    if (
      error instanceof Error &&
      error.message.includes("API temporarily unavailable")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Carrier API unavailable",
          message: error.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred while retrieving tracking information",
      },
      { status: 500 }
    );
  }
}
