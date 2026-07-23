"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

type Student = {
  id: string;
  studentId: string;
  name: string;
  program: string;
  cgpa?: number;
  currentSemesterNo?: number;
};

export default function StudentsPage() {
  const [items, setItems] = useState<Student[]>([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    password: "",
    name: "",
    program: "BS Computer Science",
  });

  const load = useCallback(async () => {
    try {
      const res = await api<{ items: Student[] }>("/api/admin/students");
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
      await api("/api/admin/students", { method: "POST", body: JSON.stringify(form) });
      setOpen(false);
      setForm({ studentId: "", password: "", name: "", program: "BS Computer Science" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this student?")) return;
    try {
      await api(`/api/admin/students/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage student accounts used by the mobile app."
        action={
          <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
            Add student
          </button>
        }
      />
      {error ? <p className="mb-3 text-sm text-[var(--danger)]">{error}</p> : null}
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Program</th>
              <th>CGPA</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id}>
                <td>{s.studentId}</td>
                <td>{s.name}</td>
                <td>{s.program}</td>
                <td>{s.cgpa ?? "—"}</td>
                <td>
                  <button type="button" className="btn btn-danger" onClick={() => onDelete(s.id)}>
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
            <h3 className="font-serif text-xl">New student</h3>
            {(
              [
                ["studentId", "Student ID"],
                ["password", "Password"],
                ["name", "Name"],
                ["program", "Program"],
              ] as const
            ).map(([key, label]) => (
              <div className="field" key={key}>
                <label htmlFor={key}>{label}</label>
                <input
                  id={key}
                  type={key === "password" ? "password" : "text"}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  required
                />
              </div>
            ))}
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
