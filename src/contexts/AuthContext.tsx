"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { verifyToken } from "@/utils/auth";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; errorDetails?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; errorDetails?: string }>;
  logout: () => void;
  validateSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout in milliseconds (24 hours)
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = verifyToken(token);
      if (!decoded) return true;

      // Check if token has expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return true;
      }

      return false;
    } catch (error) {
      return true;
    }
  };

  // Validate session with server
  const validateSession = async (): Promise<boolean> => {
    if (!token) return false;

    try {
      const response = await fetch("/api/auth/validate", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update user data if needed
          setUser(data.data.user);
          localStorage.setItem(
            "shiptrack_user",
            JSON.stringify(data.data.user)
          );
          return true;
        }
      }

      // If validation fails, logout
      logout();
      return false;
    } catch (error) {
      console.error("Session validation error:", error);
      logout();
      return false;
    }
  };

  // Check for existing token on mount with validation
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("shiptrack_token");
      const savedUser = localStorage.getItem("shiptrack_user");
      const lastActivity = localStorage.getItem("shiptrack_last_activity");

      if (savedToken && savedUser) {
        try {
          // Check if token is expired
          if (isTokenExpired(savedToken)) {
            console.log("Token expired, logging out");
            logout();
            setIsLoading(false);
            return;
          }

          // Check session timeout
          if (lastActivity) {
            const lastActivityTime = parseInt(lastActivity);
            if (Date.now() - lastActivityTime > SESSION_TIMEOUT) {
              console.log("Session timeout, logging out");
              logout();
              setIsLoading(false);
              return;
            }
          }

          // Validate session with server
          const isValid = await validateSession();
          if (!isValid) {
            console.log("Session validation failed, logging out");
            logout();
            setIsLoading(false);
            return;
          }

          setToken(savedToken);
          setUser(JSON.parse(savedUser));

          // Update last activity
          localStorage.setItem(
            "shiptrack_last_activity",
            Date.now().toString()
          );
        } catch (error) {
          console.error("Failed to initialize auth:", error);
          logout();
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Set up activity tracking for session timeout
  useEffect(() => {
    const updateActivity = () => {
      if (token) {
        localStorage.setItem("shiptrack_last_activity", Date.now().toString());
      }
    };

    // Update activity on user interactions
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => {
      document.addEventListener(event, updateActivity, true);
    });

    // Periodic session validation (every 5 minutes)
    const validationInterval = setInterval(() => {
      if (token) {
        validateSession();
      }
    }, 5 * 60 * 1000);

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity, true);
      });
      clearInterval(validationInterval);
    };
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
        localStorage.setItem("shiptrack_token", data.data.token);
        localStorage.setItem("shiptrack_user", JSON.stringify(data.data.user));
        localStorage.setItem("shiptrack_last_activity", Date.now().toString());
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.message || "Login failed",
          errorDetails: data.details || null
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: "Network error. Please try again.",
        errorDetails: "Unable to connect to the server"
      };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
        localStorage.setItem("shiptrack_token", data.data.token);
        localStorage.setItem("shiptrack_user", JSON.stringify(data.data.user));
        localStorage.setItem("shiptrack_last_activity", Date.now().toString());
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.message || "Registration failed",
          errorDetails: data.details || null
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { 
        success: false, 
        error: "Network error. Please try again.",
        errorDetails: "Unable to connect to the server"
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("shiptrack_token");
    localStorage.removeItem("shiptrack_user");
    localStorage.removeItem("shiptrack_last_activity");
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    validateSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
