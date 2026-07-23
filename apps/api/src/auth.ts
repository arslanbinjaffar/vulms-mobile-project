import { createHmac, timingSafeEqual } from "node:crypto";
import { getStore } from "./store/index.js";

export type Role = "admin" | "student";

type Session = {
  token: string;
  role: Role;
  subjectId: string;
  createdAt: number;
};

type TokenPayload = {
  role: Role;
  subjectId: string;
  iat: number;
  exp: number;
};

/** In-memory cache only — verification uses signed tokens so Vercel cold starts stay valid. */
const sessions = new Map<string, Session>();

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function secret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || "vu-lms-demo-session-secret";
}

function b64url(buf: Buffer | string) {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  return b.toString("base64url");
}

function signPayload(payload: TokenPayload) {
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `vu.${body}.${sig}`;
}

function verifyToken(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "vu") return null;
  const [, body, sig] = parts;
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TokenPayload;
    if (!payload?.role || !payload?.subjectId || !payload?.exp) return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function issueToken(role: Role, subjectId: string) {
  const now = Date.now();
  const payload: TokenPayload = {
    role,
    subjectId,
    iat: now,
    exp: now + TOKEN_TTL_MS,
  };
  const t = signPayload(payload);
  sessions.set(t, { token: t, role, subjectId, createdAt: now });
  return t;
}

function bearer(authHeader: string | undefined) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

export async function loginStudent(studentId: string, password: string) {
  const store = getStore();
  const found = await Promise.resolve(store.findStudentAuth(studentId));
  if (!found || found.password !== password) return null;
  const t = issueToken("student", found.student.studentId);
  return { token: t, student: found.student };
}

export async function loginAdmin(username: string, password: string) {
  const store = getStore();
  const admin = await Promise.resolve(store.getAdminByUsername(username));
  if (!admin || admin.password !== password) return null;
  const t = issueToken("admin", admin.id);
  return {
    token: t,
    admin: { id: admin.id, username: admin.username, name: admin.name },
  };
}

export function getSession(authHeader: string | undefined): Session | null {
  const t = bearer(authHeader);
  if (!t) return null;
  const cached = sessions.get(t);
  if (cached) return cached;
  const payload = verifyToken(t);
  if (!payload) return null;
  const session: Session = {
    token: t,
    role: payload.role,
    subjectId: payload.subjectId,
    createdAt: payload.iat,
  };
  sessions.set(t, session);
  return session;
}

export async function getStudentSession(authHeader: string | undefined) {
  const session = getSession(authHeader);
  if (!session || session.role !== "student") return null;
  const store = getStore();
  const found = await Promise.resolve(store.findStudentAuth(session.subjectId));
  if (!found) return null;
  return { token: session.token, student: found.student };
}

export function getAdminSession(authHeader: string | undefined) {
  const session = getSession(authHeader);
  if (!session || session.role !== "admin") return null;
  return session;
}

export function logout(authHeader: string | undefined) {
  const t = bearer(authHeader);
  if (t) sessions.delete(t);
}

/** @deprecated use loginStudent — kept for temporary compat during refactor */
export const login = loginStudent;
