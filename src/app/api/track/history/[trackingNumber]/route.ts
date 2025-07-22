import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromHeader } from "@/utils/auth";
import { ApiResponse, TrackingHistory } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
): Promise<NextResponse<ApiResponse<TrackingHistory[]>>> {
  try {
    const { trackingNumber } = await params;

    // Get user from authorization header
    const authHeader = request.headers.get("authorization");
    const user = getUserFromHeader(authHeader);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Authentication required to view tracking history",
        },
        { status: 401 }
      );
    }

    // Get tracking history for this user and tracking number
    const history = await prisma.trackingHistory.findMany({
      where: {
        trackingNumber: trackingNumber.toUpperCase(),
        userId: user.id,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    if (history.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No history found",
          message: "No tracking history found for this tracking number",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: history,
      message: `Found ${history.length} tracking history entries`,
    });
  } catch (error) {
    console.error("Get tracking history error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred while retrieving tracking history",
      },
      { status: 500 }
    );
  }
}
