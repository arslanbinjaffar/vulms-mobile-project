"use client";

import { ResourceCrud } from "@/components/ResourceCrud";

export default function Page() {
  return (
    <ResourceCrud
      title="Notes"
      description="Student-created notes (admin can delete)."
      listPath="/api/admin/notes"
      deletePath={(id) => `/api/admin/notes/${id}`}
      columns={[
        { key: "title", label: "Title" },
        { key: "body", label: "Body" },
        { key: "updatedAt", label: "Updated" },
      ]}
      emptyItem={{}}
      fields={[]}
    />
  );
}
