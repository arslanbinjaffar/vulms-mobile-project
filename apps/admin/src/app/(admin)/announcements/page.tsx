"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

type Course = { id: string; code: string; title: string };
type Announcement = {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  body: string;
  publishedAt?: string;
};

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ courseId: "", title: "", body: "" });

  const load = useCallback(async () => {
    try {
      const [a, c] = await Promise.all([
        api<{ items: Announcement[] }>("/api/admin/announcements"),
        api<{ items: Course[] }>("/api/admin/courses"),
      ]);
      setItems(a.items);
      setCourses(c.items);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    const course = courses.find((c) => c.id === form.courseId);
    if (!course) {
      setError("Select a course");
      return;
    }
    try {
      await api("/api/admin/announcements", {
        method: "POST",
        body: JSON.stringify({
          courseId: course.id,
          courseCode: course.code,
          title: form.title,
          body: form.body,
        }),
      });
      setOpen(false);
      setForm({ courseId: "", title: "", body: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    try {
      await api(`/api/admin/announcements/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Publish notices that students see after refresh."
        action={
          <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
            New announcement
          </button>
        }
      />
      {error ? <p className="mb-3 text-sm text-[var(--danger)]">{error}</p> : null}
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Course</th>
              <th>Title</th>
              <th>Body</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>{a.courseCode}</td>
                <td>{a.title}</td>
                <td className="max-w-md truncate">{a.body}</td>
                <td>
                  <button type="button" className="btn btn-danger" onClick={() => onDelete(a.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open ? (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <form
            className="modal flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
            onSubmit={onCreate}
          >
            <h3 className="font-serif text-xl">New announcement</h3>
            <div className="field">
              <label htmlFor="courseId">Course</label>
              <select
                id="courseId"
                value={form.courseId}
                onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
                required
              >
                <option value="">Select…</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="body">Body</label>
              <textarea
                id="body"
                rows={4}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                required
              />
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Publish
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
