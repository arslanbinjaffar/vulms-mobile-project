"use client";

import { ResourceCrud } from "@/components/ResourceCrud";

export default function Page() {
  return (
    <ResourceCrud
      title="Study scheme"
      description="Degree plan rows for More → Study Scheme."
      listPath="/api/admin/study-scheme"
      createPath="/api/admin/study-scheme"
      deletePath={(code) => `/api/admin/study-scheme/${code}`}
      idKey="code"
      columns={[
        { key: "code", label: "Code" },
        { key: "title", label: "Title" },
        { key: "status", label: "Status" },
        { key: "semester", label: "Sem" },
        { key: "creditHours", label: "CH" },
      ]}
      emptyItem={{
        code: "",
        title: "",
        type: "Required",
        courseType: "Theory",
        creditHours: 3,
        group: null,
        status: "Pending",
        semester: 1,
      }}
      fields={[
        { key: "code", label: "Code", required: true },
        { key: "title", label: "Title", required: true },
        { key: "type", label: "Type" },
        { key: "courseType", label: "Course type" },
        { key: "creditHours", label: "Credit hours", type: "number", required: true },
        { key: "status", label: "Status (Studied/Exempted/Pending)", required: true },
        { key: "semester", label: "Semester", type: "number", required: true },
      ]}
    />
  );
}
