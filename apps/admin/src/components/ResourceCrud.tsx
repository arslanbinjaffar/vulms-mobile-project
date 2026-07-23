"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

type Props = {
  title: string;
  description: string;
  listPath: string;
  createPath?: string;
  deletePath?: (id: string) => string;
  idKey?: string;
  columns: { key: string; label: string }[];
  emptyItem: Record<string, unknown>;
  fields: { key: string; label: string; type?: string; required?: boolean }[];
  readOnly?: boolean;
  wrapKey?: string;
};

export function ResourceCrud({
  title,
  description,
  listPath,
  createPath,
  deletePath,
  idKey = "id",
  columns,
  emptyItem,
  fields,
  readOnly,
  wrapKey = "items",
}: Props) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyItem);

  const load = useCallback(async () => {
    try {
      const res = await api<Record<string, unknown>>(listPath);
      const list = (res[wrapKey] as Record<string, unknown>[]) ?? [];
      setItems(list);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [listPath, wrapKey]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!createPath) return;
    try {
      const body: Record<string, unknown> = { ...form };
      for (const f of fields) {
        if (f.type === "number" && body[f.key] !== undefined && body[f.key] !== "") {
          body[f.key] = Number(body[f.key]);
        }
        if (f.type === "checkbox") body[f.key] = Boolean(body[f.key]);
      }
      await api(createPath, { method: "POST", body: JSON.stringify(body) });
      setOpen(false);
      setForm(emptyItem);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function onDelete(id: string) {
    if (!deletePath || !confirm("Delete this record?")) return;
    try {
      await api(deletePath(id), { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        action={
          !readOnly && createPath ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setForm(emptyItem);
                setOpen(true);
              }}
            >
              Add
            </button>
          ) : undefined
        }
      />
      {error ? <p className="mb-3 text-sm text-[var(--danger)]">{error}</p> : null}
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
              {!readOnly && deletePath ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <tr key={String(row[idKey] ?? i)}>
                {columns.map((c) => (
                  <td key={c.key} className="max-w-xs truncate">
                    {formatCell(row[c.key])}
                  </td>
                ))}
                {!readOnly && deletePath ? (
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => onDelete(String(row[idKey]))}
                    >
                      Delete
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-[var(--muted)]">
                  No records yet.
                </td>
              </tr>
            ) : null}
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
            <h3 className="text-lg font-semibold text-[var(--navy)]">New {title}</h3>
            {fields.map((f) => (
              <div className="field" key={f.key}>
                <label htmlFor={f.key}>{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea
                    id={f.key}
                    rows={4}
                    required={f.required}
                    value={String(form[f.key] ?? "")}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  />
                ) : (
                  <input
                    id={f.key}
                    type={f.type === "checkbox" ? "checkbox" : f.type ?? "text"}
                    required={f.required}
                    checked={
                      f.type === "checkbox" ? Boolean(form[f.key]) : undefined
                    }
                    value={
                      f.type === "checkbox" ? undefined : String(form[f.key] ?? "")
                    }
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [f.key]:
                          f.type === "checkbox" ? e.target.checked : e.target.value,
                      }))
                    }
                  />
                )}
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

function formatCell(value: unknown) {
  if (value == null) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
