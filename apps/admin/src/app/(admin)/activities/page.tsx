"use client";

import { ResourceCrud } from "@/components/ResourceCrud";

export default function Page() {
  return (
    <ResourceCrud
      title="Activities"
      description="Live / upcoming course activity sessions."
      listPath="/api/admin/activities"
      createPath="/api/admin/activities"
      deletePath={(id) => `/api/admin/activities/${id}`}
      columns={[
        { key: "courseId", label: "Course" },
        { key: "title", label: "Title" },
        { key: "scheduledAt", label: "When" },
        { key: "status", label: "Status" },
      ]}
      emptyItem={{
        courseId: "",
        title: "",
        scheduledAt: new Date().toISOString(),
        status: "upcoming",
      }}
      fields={[
        { key: "courseId", label: "Course id", required: true },
        { key: "title", label: "Title", required: true },
        { key: "scheduledAt", label: "Scheduled at (ISO)", required: true },
        { key: "status", label: "Status", required: true },
      ]}
    />
  );
}
