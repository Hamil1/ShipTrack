import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "@/types";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-change-this-in-production";

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
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verify and decode a JWT token
 * @param token - The JWT token to verify
 * @returns The decoded payload or null if invalid
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Extract user from Authorization header
 * @param authHeader - The Authorization header value
 * @returns The decoded user or null if invalid
 */
export function getUserFromHeader(authHeader: string | null): any {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}
