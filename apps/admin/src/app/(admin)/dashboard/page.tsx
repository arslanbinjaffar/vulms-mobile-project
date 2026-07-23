"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

type Stats = Record<string, number | string | undefined>;

const cards: { label: string; key: string; href: string }[] = [
  { label: "Students", key: "students", href: "/students" },
  { label: "Teachers", key: "teachers", href: "/teachers" },
  { label: "Courses", key: "courses", href: "/courses" },
  { label: "Announcements", key: "announcements", href: "/announcements" },
  { label: "Assignments", key: "assignments", href: "/assignments" },
  { label: "Quizzes", key: "quizzes", href: "/quizzes" },
  { label: "GDBs", key: "gdbs", href: "/gdbs" },
  { label: "Mails", key: "mails", href: "/mails" },
  { label: "Challans", key: "challans", href: "/challans" },
  { label: "Activity", key: "activityEvents", href: "/activity" },
  { label: "Quiz attempts", key: "quizAttempts", href: "/quiz-attempts" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Stats>("/api/admin/stats")
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={
          stats?.mode
            ? `Store mode: ${stats.mode}. Admin owns all LMS content students consume.`
            : "Overview of LMS content and student activity."
        }
      />
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="panel transition-transform hover:-translate-y-0.5"
          >
            <p className="text-xs font-bold tracking-[0.08em] text-[var(--muted)] uppercase">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-[var(--navy)]">
              {stats ? Number(stats[card.key] ?? 0) : "…"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
