"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

export default function CourseSelectionPage() {
  const [json, setJson] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ item: unknown }>("/api/admin/course-selection")
      .then((d) => setJson(JSON.stringify(d.item, null, 2)))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    try {
      const body = JSON.parse(json);
      const res = await api<{ item: unknown }>("/api/admin/course-selection", {
        method: "PUT",
        body: JSON.stringify(body),
      });
      setJson(JSON.stringify(res.item, null, 2));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <div>
      <PageHeader
        title="Course selection"
        description="Open/closed window and message for More → Course Selection."
      />
      {error ? <p className="mb-3 text-sm text-[var(--danger)]">{error}</p> : null}
      <form onSubmit={onSave} className="panel flex flex-col gap-3">
        <textarea
          className="min-h-[320px] w-full rounded border border-[var(--border)] p-3 font-mono text-sm"
          value={json}
          onChange={(e) => setJson(e.target.value)}
        />
        <button type="submit" className="btn btn-primary self-start">
          Save
        </button>
      </form>
    </div>
  );
}
