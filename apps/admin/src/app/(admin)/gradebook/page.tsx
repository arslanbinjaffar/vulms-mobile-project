"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

export default function GradebookPage() {
  const [json, setJson] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api<Record<string, unknown>>("/api/admin/gradebook")
      .then((data) => setJson(JSON.stringify(data, null, 2)))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaved(false);
    try {
      const body = JSON.parse(json) as Record<string, unknown>;
      const next = await api<Record<string, unknown>>("/api/admin/gradebook", {
        method: "PUT",
        body: JSON.stringify(body),
      });
      setJson(JSON.stringify(next, null, 2));
      setSaved(true);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <div>
      <PageHeader
        title="Grade book"
        description="Edit midterms, grade book rows, grading scheme, projected CGPA, and COUM/DAC."
      />
      {error ? <p className="mb-3 text-sm text-[var(--danger)]">{error}</p> : null}
      {saved ? <p className="mb-3 text-sm text-[var(--success)]">Saved.</p> : null}
      <form onSubmit={onSave} className="panel flex flex-col gap-3">
        <textarea
          className="min-h-[420px] w-full rounded border border-[var(--border)] p-3 font-mono text-sm"
          value={json}
          onChange={(e) => setJson(e.target.value)}
        />
        <button type="submit" className="btn btn-primary self-start">
          Save grade book
        </button>
      </form>
    </div>
  );
}
