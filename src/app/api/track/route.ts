import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromHeader } from "@/utils/auth";
import { detectCarrier, isValidTrackingNumber } from "@/utils/carrierDetection";
import { trackingService } from "@/services/TrackingService";
import { ApiResponse, TrackingInfo } from "@/types";

// Validation schema for tracking request
const trackSchema = z.object({
  trackingNumber: z.string().min(1, "Tracking number is required"),
});

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<TrackingInfo>>> {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = trackSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          message: validationResult.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const { trackingNumber } = validationResult.data;

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

    // Basic rate limiting for non-authenticated users
    if (!user) {
      // In a real implementation, you'd check IP-based rate limiting here
      // For now, we'll just proceed but note that authenticated users get better service
    }

    // Call carrier API using the new tracking service
    const trackingInfo = await trackingService.track(trackingNumber);

    // Enhanced features for authenticated users
    if (user) {
      // Save tracking history for authenticated users
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

      // Add user-specific enhancements to the response
      return NextResponse.json({
        success: true,
        data: {
          ...trackingInfo,
          userFeatures: {
            historySaved: true,
            enhancedUpdates: true,
          },
        },
        message: `Tracking information retrieved for ${carrier} (Enhanced features enabled)`,
      });
    }

    // Basic response for non-authenticated users
    return NextResponse.json({
      success: true,
      data: trackingInfo,
      message: `Tracking information retrieved for ${carrier} (Sign up for enhanced features)`,
    });
  } catch (error) {
    console.error("Tracking error:", error);

    // Handle carrier API errors
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

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred while tracking the package",
      },
      { status: 500 }
    );
  }
}
