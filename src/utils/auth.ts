import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "@/types";

// Get JWT_SECRET with fallback for development
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn(
      "JWT_SECRET not found in environment variables. Using default for development."
    );
    return "your-super-secret-jwt-key-change-this-in-production";
  }
  return secret;
}

const JWT_SECRET = getJwtSecret();

// JWT payload interface
interface JWTPayload {
  id: number;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

/**
 * Hash a password using bcrypt
 * @param password - The plain text password
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain text password with a hashed password
 * @param password - The plain text password
 * @param hashedPassword - The hashed password to compare against
 * @returns True if passwords match, false otherwise
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token for a user
 * @param user - The user object
 * @returns The JWT token
 */
export function generateToken(user: User): string {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  return jwt.sign(payload, JWT_SECRET!, { expiresIn: "7d" });
}

/**
 * Verify and decode a JWT token
 * @param token - The JWT token to verify
 * @returns The decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Extract user from Authorization header
 * @param authHeader - The Authorization header value
 * @returns The decoded user or null if invalid
 */
export function getUserFromHeader(
  authHeader: string | null
): JWTPayload | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}
