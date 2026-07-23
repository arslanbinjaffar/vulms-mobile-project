"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

type Course = { id: string; code: string; title: string };

export default function CourseDetailsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [json, setJson] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ items: Course[] }>("/api/admin/courses")
      .then((d) => {
        setCourses(d.items);
        if (d.items[0]) setCourseId(d.items[0].id);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  useEffect(() => {
    if (!courseId) return;
    api<{ details: unknown }>(`/api/admin/courses/${courseId}/details`)
      .then((d) => setJson(JSON.stringify(d.details ?? {}, null, 2)))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, [courseId]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    try {
      const details = JSON.parse(json);
      await api(`/api/admin/courses/${courseId}/details`, {
        method: "PUT",
        body: JSON.stringify({ details }),
      });
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <div>
      <PageHeader
        title="Course details"
        description="Weeks, FAQs, books, downloads, links, and assessment for the course hub."
      />
      {error ? <p className="mb-3 text-sm text-[var(--danger)]">{error}</p> : null}
      <div className="mb-3 field max-w-md">
        <label htmlFor="courseId">Course</label>
        <select
          id="courseId"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} — {c.title}
            </option>
          ))}
        </select>
      </div>
      <form onSubmit={onSave} className="panel flex flex-col gap-3">
        <textarea
          className="min-h-[420px] w-full rounded border border-[var(--border)] p-3 font-mono text-sm"
          value={json}
          onChange={(e) => setJson(e.target.value)}
        />
        <button type="submit" className="btn btn-primary self-start" disabled={!courseId}>
          Save details
        </button>
      </form>
    </div>
  );
}
