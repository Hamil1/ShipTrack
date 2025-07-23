import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
} from "../auth";

// Mock JWT
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mock-jwt-token"),
  verify: jest.fn((token) => {
    if (token === "valid-token") {
      return { id: "user-123", email: "test@example.com", name: "Test User" };
    }
    throw new Error("Invalid token");
  }),
}));

// Mock bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn(() => Promise.resolve("hashed-password")),
  compare: jest.fn((password, hash) =>
    Promise.resolve(password === "correct-password")
  ),
}));

describe("Auth Utils", () => {
  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const password = "test-password";
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBe("hashed-password");
    });
  });

  describe("comparePassword", () => {
    it("should return true for correct password", async () => {
      const result = await comparePassword(
        "correct-password",
        "hashed-password"
      );
      expect(result).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const result = await comparePassword("wrong-password", "hashed-password");
      expect(result).toBe(false);
    });
  });

  describe("generateToken", () => {
    it("should generate a JWT token", () => {
      const user = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const token = generateToken(user);
      expect(token).toBe("mock-jwt-token");
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token", () => {
      const result = verifyToken("valid-token");
      expect(result).toEqual({
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
      });
    });

    it("should return null for invalid token", () => {
      const result = verifyToken("invalid-token");
      expect(result).toBeNull();
    });
  });
});
