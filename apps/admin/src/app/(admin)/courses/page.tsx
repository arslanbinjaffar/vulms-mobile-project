"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

type Course = {
  id: string;
  code: string;
  title: string;
  department: string;
  creditHours: number;
  instructorName: string;
  semester: string;
};

const empty = {
  code: "",
  title: "",
  department: "Computer Science",
  creditHours: 3,
  instructorName: "",
  instructorDegree: "",
  instructorPhotoUrl: null as string | null,
  lectureCount: 0,
  semester: "Spring 2026",
  announcementCount: 0,
  assignmentCount: 0,
  gdbCount: 0,
  quizCount: 0,
};

export default function CoursesPage() {
  const [items, setItems] = useState<Course[]>([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState(empty);

  const load = useCallback(async () => {
    try {
      const res = await api<{ items: Course[] }>("/api/admin/courses");
      setItems(res.items);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }

  function openEdit(c: Course) {
    setEditing(c);
    setForm({
      ...empty,
      code: c.code,
      title: c.title,
      department: c.department,
      creditHours: c.creditHours,
      instructorName: c.instructorName,
      semester: c.semester,
    });
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await api(`/api/admin/courses/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            code: form.code,
            title: form.title,
            department: form.department,
            creditHours: Number(form.creditHours),
            instructorName: form.instructorName,
            semester: form.semester,
          }),
        });
      } else {
        await api("/api/admin/courses", {
          method: "POST",
          body: JSON.stringify({ ...form, creditHours: Number(form.creditHours) }),
        });
      }
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this course?")) return;
    try {
      await api(`/api/admin/courses/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <PageHeader
        title="Courses"
        description="Create and edit courses shown in the student app."
        action={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            Add course
          </button>
        }
      />
      {error ? <p className="mb-3 text-sm text-[var(--danger)]">{error}</p> : null}
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Code</th>
              <th>Title</th>
              <th>Instructor</th>
              <th>Credits</th>
              <th>Semester</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.code}</td>
                <td>{c.title}</td>
                <td>{c.instructorName}</td>
                <td>{c.creditHours}</td>
                <td>{c.semester}</td>
                <td className="flex gap-2">
                  <button type="button" className="btn btn-ghost" onClick={() => openEdit(c)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => onDelete(c.id)}>
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
            onSubmit={onSubmit}
          >
            <h3 className="font-serif text-xl">{editing ? "Edit course" : "New course"}</h3>
            {(
              [
                ["code", "Code"],
                ["title", "Title"],
                ["department", "Department"],
                ["instructorName", "Instructor"],
                ["semester", "Semester"],
              ] as const
            ).map(([key, label]) => (
              <div className="field" key={key}>
                <label htmlFor={key}>{label}</label>
                <input
                  id={key}
                  value={String(form[key] ?? "")}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  required
                />
              </div>
            ))}
            <div className="field">
              <label htmlFor="creditHours">Credit hours</label>
              <input
                id="creditHours"
                type="number"
                min={1}
                value={form.creditHours}
                onChange={(e) => setForm((f) => ({ ...f, creditHours: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
