"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface SafeUser {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  role: "player" | "developer" | "admin";
}

interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  library: string[];
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  toggleLibraryGame: (gameId: string) => void;
  isInLibrary: (gameId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [library, setLibrary] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("kuronex_user_library");
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return ["neon-haven", "voidstrike"];
  });

  const toggleLibraryGame = (gameId: string) => {
    setLibrary((prev) => {
      const next = prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId];
      try {
        localStorage.setItem("kuronex_user_library", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const isInLibrary = (gameId: string) => library.includes(gameId);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch session user:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (!ignore) setUser(data.user || null);
        } else {
          if (!ignore) setUser(null);
        }
      } catch (err) {
        console.error("Failed to fetch session user:", err);
        if (!ignore) setUser(null);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    loadUser();
    return () => {
      ignore = true;
    };
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }

      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        library,
        login,
        register,
        logout,
        refreshUser,
        toggleLibraryGame,
        isInLibrary,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
