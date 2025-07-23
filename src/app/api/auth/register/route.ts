import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/utils/auth";
import { ApiResponse, AuthResponse } from "@/types";

// Validation schema for registration
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<AuthResponse>>> {
  let body: any = null;

  try {
    body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          message: validationResult.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User already exists",
          message: "A user with this email already exists",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken(user);

    return NextResponse.json({
      success: true,
      data: {
        user,
        token,
      },
      message: "User registered successfully",
    });
  } catch (error) {
    // Enhanced error logging
    console.error("=== REGISTRATION ERROR ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", (error as any)?.message);
    console.error("Error stack:", (error as any)?.stack);
    console.error("Request body:", body);
    console.error("========================");

    // Handle specific database errors
    if ((error as any)?.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "Database constraint violation",
          message: "A user with this email already exists",
          details: "Email address must be unique",
        },
        { status: 409 }
      );
    }

    if ((error as any)?.code === "P2003") {
      return NextResponse.json(
        {
          success: false,
          error: "Database foreign key constraint failed",
          message: "Invalid data provided",
          details: "Please check your input data",
        },
        { status: 400 }
      );
    }

    if ((error as any)?.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          error: "Database record not found",
          message: "Unable to create user record",
          details: "Database operation failed",
        },
        { status: 500 }
      );
    }

    // Handle Prisma connection errors
    if (
      (error as any)?.message?.includes("connect") ||
      (error as any)?.message?.includes("connection")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection error",
          message: "Unable to connect to database",
          details: "Please try again later or contact support",
        },
        { status: 503 }
      );
    }

    // Handle validation errors
    if ((error as any)?.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          message: "Invalid input data",
          details: (error as any)?.issues
            ?.map((issue: any) => issue.message)
            .join(", "),
        },
        { status: 400 }
      );
    }

    // Handle password hashing errors
    if (
      (error as any)?.message?.includes("password") ||
      (error as any)?.message?.includes("hash")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Password processing error",
          message: "Unable to process password",
          details: "Please try again with a different password",
        },
        { status: 500 }
      );
    }

    // Generic error response with more details
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred during registration",
        details: (error as any)?.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
