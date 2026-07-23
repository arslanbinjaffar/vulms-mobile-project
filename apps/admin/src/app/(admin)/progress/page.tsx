"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

export default function ProgressPage() {
  const [json, setJson] = useState("[]");
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ items: unknown[] }>("/api/admin/progress")
      .then((d) => setJson(JSON.stringify(d.items, null, 2)))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    try {
      const items = JSON.parse(json) as unknown[];
      const next = await api<{ items: unknown[] }>("/api/admin/progress", {
        method: "PUT",
        body: JSON.stringify({ items }),
      });
      setJson(JSON.stringify(next.items, null, 2));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <div>
      <PageHeader
        title="Progress"
        description="Per-course assignment / GDB / quiz submission counts."
      />
      {error ? <p className="mb-3 text-sm text-[var(--danger)]">{error}</p> : null}
      <form onSubmit={onSave} className="panel flex flex-col gap-3">
        <textarea
          className="min-h-[360px] w-full rounded border border-[var(--border)] p-3 font-mono text-sm"
          value={json}
          onChange={(e) => setJson(e.target.value)}
        />
        <button type="submit" className="btn btn-primary self-start">
          Save progress
        </button>
      </form>
    </div>
  );
}
