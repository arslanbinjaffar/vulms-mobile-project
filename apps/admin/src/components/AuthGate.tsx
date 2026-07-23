"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken, clearToken } from "@/lib/api";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        await api("/api/admin/me");
        if (!cancelled) setReady(true);
      } catch {
        clearToken();
        if (!cancelled) router.replace("/login");
      }
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--muted)]">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
