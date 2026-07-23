"use client";

import { ResourceCrud } from "@/components/ResourceCrud";

export default function Page() {
  return (
    <ResourceCrud
      title="Student services"
      description="Service links under More → Student Services."
      listPath="/api/admin/student-services"
      createPath="/api/admin/student-services"
      deletePath={(id) => `/api/admin/student-services/${id}`}
      columns={[
        { key: "category", label: "Category" },
        { key: "title", label: "Title" },
        { key: "external", label: "External" },
        { key: "highlight", label: "Highlight" },
      ]}
      emptyItem={{
        category: "Academics",
        title: "",
        external: false,
        highlight: false,
      }}
      fields={[
        { key: "category", label: "Category", required: true },
        { key: "title", label: "Title", required: true },
        { key: "external", label: "External", type: "checkbox" },
        { key: "highlight", label: "Highlight", type: "checkbox" },
      ]}
    />
  );
}
