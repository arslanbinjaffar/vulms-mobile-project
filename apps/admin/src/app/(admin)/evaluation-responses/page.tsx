"use client";

import { ResourceCrud } from "@/components/ResourceCrud";

export default function Page() {
  return (
    <ResourceCrud
      title="Evaluation responses"
      description="Answers submitted by students."
      listPath="/api/admin/evaluation-responses"
      readOnly
      columns={[
        { key: "at", label: "When" },
        { key: "studentId", label: "Student" },
        { key: "courseCode", label: "Course" },
        { key: "likedMost", label: "Liked most" },
      ]}
      emptyItem={{}}
      fields={[]}
    />
  );
}
