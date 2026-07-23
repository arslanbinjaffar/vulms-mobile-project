"use client";

import { ResourceCrud } from "@/components/ResourceCrud";

export default function Page() {
  return (
    <ResourceCrud
      title="Todos"
      description="Items on the student To Do tab."
      listPath="/api/admin/todos"
      createPath="/api/admin/todos"
      deletePath={(id) => `/api/admin/todos/${id}`}
      columns={[
        { key: "type", label: "Type" },
        { key: "title", label: "Title" },
        { key: "courseCode", label: "Course" },
        { key: "endAt", label: "Ends" },
      ]}
      emptyItem={{
        type: "assignment",
        title: "",
        courseCode: null,
        courseId: null,
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
        refId: null,
      }}
      fields={[
        { key: "type", label: "Type", required: true },
        { key: "title", label: "Title", required: true },
        { key: "courseCode", label: "Course code" },
        { key: "courseId", label: "Course id" },
        { key: "startAt", label: "Start at (ISO)", required: true },
        { key: "endAt", label: "End at (ISO)", required: true },
        { key: "refId", label: "Ref id" },
      ]}
    />
  );
}
