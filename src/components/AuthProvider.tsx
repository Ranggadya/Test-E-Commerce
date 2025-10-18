"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  useCallback,
} from "react";

type User = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  error: string | null;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchJson<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      body?.error?.message ?? body?.message ?? "Terjadi kesalahan pada server";
    throw new Error(message);
  }

  return res.json();
}

type AuthResponse = {
  success: boolean;
  data: { user: User };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchJson<AuthResponse>("/api/auth/me");
      setUser(result.data.user);
    } catch (err) {
      setUser(null);
      if (err instanceof Error && err.message !== "Belum login") {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const loginRequest = useCallback(
    async (payload: { email: string; password: string }) => {
      setError(null);
      const result = await fetchJson<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setUser(result.data.user);
    },
    []
  );

  const registerRequest = useCallback(
    async (payload: { name: string; email: string; password: string }) => {
      setError(null);
      const result = await fetchJson<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setUser(result.data.user);
    },
    []
  );

  const logoutRequest = useCallback(async () => {
    setError(null);
    await fetchJson<{ success: boolean; data: { message: string } }>(
      "/api/auth/logout",
      { method: "POST" }
    );
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAdmin: user?.role === "ADMIN",
      error,
      login: loginRequest,
      register: registerRequest,
      logout: logoutRequest,
      refresh: loadProfile,
    }),
    [user, isLoading, error, loginRequest, registerRequest, logoutRequest, loadProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
