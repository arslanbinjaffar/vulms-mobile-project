/**
 * Phase 4: Real VULMS bridge.
 * Seed mode is default. Set VULMS_MODE=live + VULMS_ENABLED=true when
 * credentials/session endpoints are provided.
 */

export type VulmsBridgeConfig = {
  enabled: boolean;
  baseUrl: string;
  mode: "seed" | "live";
};

export type VulmsSession = {
  cookies: string;
  studentId: string;
};

const config: VulmsBridgeConfig = {
  enabled: process.env.VULMS_ENABLED === "true",
  baseUrl: process.env.VULMS_BASE_URL ?? "https://vulms.vu.edu.pk",
  mode: (process.env.VULMS_MODE as "seed" | "live") ?? "seed",
};

let liveSession: VulmsSession | null = null;

export function getVulmsBridgeStatus() {
  return {
    ...config,
    hasLiveSession: Boolean(liveSession),
    message:
      config.mode === "live" && config.enabled
        ? "Live VULMS bridge active"
        : "Using seed data. Set VULMS_ENABLED=true and VULMS_MODE=live to enable bridge.",
    endpointsPlanned: [
      "POST /bridge/login",
      "GET /bridge/courses",
      "GET /bridge/calendar",
      "GET /bridge/gradebook",
    ],
    mappedModules: [
      "login",
      "courses",
      "assignments",
      "quizzes",
      "gdb",
      "todos",
      "gradebook",
    ],
  };
}

/** Attempt live VULMS authentication (stub until endpoints provided). */
export async function vulmsLogin(studentId: string, _password: string) {
  if (!config.enabled || config.mode !== "live") {
    return {
      ok: false as const,
      error: "VULMS live bridge not configured. Using local seed auth instead.",
    };
  }

  try {
    // Placeholder: POST credentials to VULMS login, capture Set-Cookie.
    const res = await fetch(`${config.baseUrl}/`, {
      method: "GET",
      redirect: "manual",
    });
    void res;
    liveSession = null;
    return {
      ok: false as const,
      error: `Live adapter not fully implemented for ${studentId}. Awaiting cookie/session mapping details.`,
    };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "VULMS bridge unreachable",
    };
  }
}

export async function vulmsFetch(path: string) {
  if (!liveSession) throw new Error("No live VULMS session");
  const res = await fetch(`${config.baseUrl}${path}`, {
    headers: { Cookie: liveSession.cookies },
  });
  if (!res.ok) throw new Error(`VULMS ${path} failed: ${res.status}`);
  return res.text();
}
