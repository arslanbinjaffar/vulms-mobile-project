"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

type Item = {
  id: string;
  courseCode?: string;
  title?: string;
  [key: string]: unknown;
};

export default function QuizzesPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ courseCode: "", title: "" });

  const load = useCallback(async () => {
    try {
      const res = await api<{ items: Item[] }>("/api/admin/quizzes");
      setItems(res.items);
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
    try {
      await api("/api/admin/quizzes", { method: "POST", body: JSON.stringify(form) });
      setOpen(false);
      setForm({ courseCode: "", title: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this quiz?")) return;
    try {
      await api(`/api/admin/quizzes/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <PageHeader
        title="Quizzes"
        description="Manage quiz records for the student app."
        action={
          <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
            Add quiz
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
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((q) => (
              <tr key={q.id}>
                <td>{String(q.courseCode ?? "—")}</td>
                <td>{String(q.title ?? q.id)}</td>
                <td>
                  <button type="button" className="btn btn-danger" onClick={() => onDelete(q.id)}>
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
            <h3 className="font-serif text-xl">New quiz</h3>
            <div className="field">
              <label htmlFor="courseCode">Course code</label>
              <input
                id="courseCode"
                value={form.courseCode}
                onChange={(e) => setForm((f) => ({ ...f, courseCode: e.target.value }))}
                required
              />
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
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
