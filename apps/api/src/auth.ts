import { student, credentials } from "./seed.js";

type Session = { token: string; studentId: string; createdAt: number };

const sessions = new Map<string, Session>();

function token() {
  return `vu_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function login(studentId: string, password: string) {
  const id = studentId.trim().toLowerCase();
  if (
    id !== credentials.studentId.toLowerCase() ||
    password !== credentials.password
  ) {
    return null;
  }
  const t = token();
  sessions.set(t, { token: t, studentId: student.studentId, createdAt: Date.now() });
  return { token: t, student };
}

export function getSession(authHeader: string | undefined) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const t = authHeader.slice(7);
  const session = sessions.get(t);
  if (!session) return null;
  return { token: t, student };
}

export function logout(authHeader: string | undefined) {
  if (!authHeader?.startsWith("Bearer ")) return;
  sessions.delete(authHeader.slice(7));
}
