import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Fetch tracking history for the user
    const trackingHistory = await prisma.trackingHistory.findMany({
      where: {
        userId: decoded.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        trackingNumber: true,
        carrier: true,
        status: true,
        location: true,
        timestamp: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: trackingHistory,
      message: "Tracking history retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching tracking history:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch tracking history" },
      { status: 500 }
    );
  }
}
