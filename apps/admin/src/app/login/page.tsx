"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) router.replace("/dashboard");
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api<{ token: string }>("/api/admin/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ username, password }),
      });
      setToken(res.token);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-[var(--navy)] p-10 text-white md:flex">
        <div>
          <p className="text-sm font-semibold tracking-[0.16em] text-white/70 uppercase">
            Virtual University
          </p>
          <h1 className="mt-3 text-4xl font-semibold">LMS Admin</h1>
          <p className="mt-3 max-w-sm text-white/75">
            Manage every record students see in the VU LMS mobile app.
          </p>
        </div>
        <p className="text-sm text-white/50">Matching the student app navy & purple theme</p>
      </div>
      <div className="flex flex-1 items-center justify-center bg-[var(--bg)] px-4">
        <form onSubmit={onSubmit} className="w-full max-w-md panel">
          <h2 className="text-xl font-semibold text-[var(--navy)]">Sign in</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Use your admin credentials.</p>
          <div className="mt-6 flex flex-col gap-4">
            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
