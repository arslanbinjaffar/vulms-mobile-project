"use client";

import { ResourceCrud } from "@/components/ResourceCrud";

export default function Page() {
  return (
    <ResourceCrud
      title="Teacher evaluation"
      description="Questions shown on More → Teacher Evaluation."
      listPath="/api/admin/evaluation-questions"
      createPath="/api/admin/evaluation-questions"
      deletePath={(id) => `/api/admin/evaluation-questions/${id}`}
      columns={[
        { key: "section", label: "Section" },
        { key: "text", label: "Question" },
      ]}
      emptyItem={{ section: "General", text: "" }}
      fields={[
        { key: "section", label: "Section", required: true },
        { key: "text", label: "Question text", type: "textarea", required: true },
      ]}
    />
  );
}
