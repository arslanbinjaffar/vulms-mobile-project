"use client";

import { ResourceCrud } from "@/components/ResourceCrud";

export default function Page() {
  return (
    <ResourceCrud
      title="Activity feed"
      description="Live feed of student actions (login, submit, mail read, etc.)."
      listPath="/api/admin/activity"
      readOnly
      columns={[
        { key: "at", label: "When" },
        { key: "studentId", label: "Student" },
        { key: "type", label: "Type" },
        { key: "summary", label: "Summary" },
      ]}
      emptyItem={{}}
      fields={[]}
    />
  );
}
