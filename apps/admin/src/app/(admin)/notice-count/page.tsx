"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

export default function NoticeCountPage() {
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ count: number }>("/api/admin/notice-count")
      .then((d) => setCount(d.count))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await api<{ count: number }>("/api/admin/notice-count", {
        method: "PUT",
        body: JSON.stringify({ count }),
      });
      setCount(res.count);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <div>
      <PageHeader
        title="Notice count"
        description="Badge count shown on the student login notice board."
      />
      {error ? <p className="mb-3 text-sm text-[var(--danger)]">{error}</p> : null}
      <form onSubmit={onSave} className="panel flex max-w-sm flex-col gap-3">
        <div className="field">
          <label htmlFor="count">Count</label>
          <input
            id="count"
            type="number"
            min={0}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </div>
        <button type="submit" className="btn btn-primary self-start">
          Save
        </button>
      </form>
    </div>
  );
}
