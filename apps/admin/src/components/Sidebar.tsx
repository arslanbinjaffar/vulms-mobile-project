"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api, clearToken } from "@/lib/api";

const groups: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "People",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/students", label: "Students" },
      { href: "/teachers", label: "Teachers" },
    ],
  },
  {
    title: "Academics",
    links: [
      { href: "/courses", label: "Courses" },
      { href: "/course-details", label: "Course details" },
      { href: "/lessons", label: "Lessons" },
      { href: "/activities", label: "Activities" },
      { href: "/announcements", label: "Announcements" },
      { href: "/assignments", label: "Assignments" },
      { href: "/quizzes", label: "Quizzes" },
      { href: "/gdbs", label: "GDBs" },
      { href: "/study-scheme", label: "Study scheme" },
      { href: "/course-selection", label: "Course selection" },
    ],
  },
  {
    title: "Assessment",
    links: [
      { href: "/gradebook", label: "Grade book" },
      { href: "/progress", label: "Progress" },
      { href: "/evaluation", label: "Teacher evaluation" },
    ],
  },
  {
    title: "Ops",
    links: [
      { href: "/mails", label: "Mail" },
      { href: "/challans", label: "Challans" },
      { href: "/lectures", label: "Lectures" },
      { href: "/todos", label: "Todos" },
      { href: "/services", label: "Student services" },
      { href: "/notes", label: "Notes" },
      { href: "/contact", label: "Contact" },
      { href: "/notice-count", label: "Notice count" },
    ],
  },
  {
    title: "Tracking",
    links: [
      { href: "/activity", label: "Activity feed" },
      { href: "/quiz-attempts", label: "Quiz attempts" },
      { href: "/login-history", label: "Login history" },
      { href: "/evaluation-responses", label: "Eval responses" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      await api("/api/admin/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    clearToken();
    router.replace("/login");
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-[var(--navy)] text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-xs font-semibold tracking-[0.14em] text-white/70 uppercase">
          Virtual University
        </p>
        <h1 className="mt-1 text-xl font-semibold">LMS Admin</h1>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-1 px-3 text-[10px] font-bold tracking-wider text-white/45 uppercase">
              {group.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.links.map((link) => {
                const active =
                  pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-md px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-[var(--purple)] text-white"
                        : "text-white/85 hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-md px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
