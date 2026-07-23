"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({
    phone: "",
    email: "",
    address: "",
    helpUrl: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ item: typeof form }>("/api/admin/contact")
      .then((d) => setForm(d.item))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await api<{ item: typeof form }>("/api/admin/contact", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setForm(res.item);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <div>
      <PageHeader title="Contact" description="Support info for More → Contact VU." />
      {error ? <p className="mb-3 text-sm text-[var(--danger)]">{error}</p> : null}
      <form onSubmit={onSave} className="panel flex max-w-lg flex-col gap-3">
        {(["phone", "email", "address", "helpUrl"] as const).map((key) => (
          <div className="field" key={key}>
            <label htmlFor={key}>{key}</label>
            <input
              id={key}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              required
            />
          </div>
        ))}
        <button type="submit" className="btn btn-primary self-start">
          Save
        </button>
      </form>
    </div>
  );
}
