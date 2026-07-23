"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

type Teacher = {
  id: string;
  name: string;
  degree: string;
  department: string;
  photoUrl: string | null;
  email: string | null;
  courseCount: number;
};

const empty = {
  name: "",
  degree: "",
  department: "Computer Science",
  email: "",
};

export default function TeachersPage() {
  const [items, setItems] = useState<Teacher[]>([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState(empty);

  const load = useCallback(async () => {
    try {
      const res = await api<{ items: Teacher[] }>("/api/admin/teachers");
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

  function openEdit(t: Teacher) {
    setEditing(t);
    setForm({
      name: t.name,
      degree: t.degree,
      department: t.department,
      email: t.email ?? "",
    });
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const body = {
        name: form.name,
        degree: form.degree,
        department: form.department,
        email: form.email || null,
      };
      if (editing) {
        await api(`/api/admin/teachers/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        await api("/api/admin/teachers", { method: "POST", body: JSON.stringify(body) });
      }
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this teacher?")) return;
    try {
      await api(`/api/admin/teachers/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <PageHeader
        title="Teachers"
        description="Instructors linked to courses (shown in the student app)."
        action={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            Add teacher
          </button>
        }
      />
      {error ? <p className="mb-3 text-sm text-[var(--danger)]">{error}</p> : null}
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Degree</th>
              <th>Department</th>
              <th>Courses</th>
              <th>Email</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.degree || "—"}</td>
                <td>{t.department || "—"}</td>
                <td>{t.courseCount}</td>
                <td>{t.email || "—"}</td>
                <td className="flex gap-2">
                  <button type="button" className="btn btn-ghost" onClick={() => openEdit(t)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => onDelete(t.id)}>
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
            <h3 className="font-serif text-xl">{editing ? "Edit teacher" : "New teacher"}</h3>
            {(
              [
                ["name", "Name"],
                ["degree", "Degree"],
                ["department", "Department"],
                ["email", "Email"],
              ] as const
            ).map(([key, label]) => (
              <div className="field" key={key}>
                <label htmlFor={key}>{label}</label>
                <input
                  id={key}
                  type={key === "email" ? "email" : "text"}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  required={key === "name"}
                />
              </div>
            ))}
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
