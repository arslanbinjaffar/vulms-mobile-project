import type { Student } from "@vu-lms/shared";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_URL, setAuthToken } from "../lib/api";
import { cacheClear } from "../lib/cache";
import { deleteToken, getToken, setToken } from "../lib/tokenStore";

type AuthContextValue = {
  student: Student | null;
  loading: boolean;
  login: (studentId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "vulms_session_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const token = await getToken(TOKEN_KEY);
      setAuthToken(token);
      if (!token) {
        setStudent(null);
        return;
      }
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setStudent(null);
        return;
      }
      const data = await res.json();
      setStudent(data.student ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      student,
      loading,
      refresh,
      login: async (studentId, password) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error ?? "Login failed");
        if (data.token) {
          await setToken(TOKEN_KEY, data.token);
          setAuthToken(data.token);
        }
        setStudent(data.student);
        setLoading(false);
      },
      logout: async () => {
        try {
          await fetch(`${API_URL}/api/auth/logout`, { method: "POST" });
        } catch {
          // ignore
        }
        await deleteToken(TOKEN_KEY);
        await cacheClear("vulms:");
        setAuthToken(null);
        setStudent(null);
      },
    }),
    [student, loading, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
