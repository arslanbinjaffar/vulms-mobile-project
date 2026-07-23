"use client";

import { ResourceCrud } from "@/components/ResourceCrud";

export default function Page() {
  return (
    <ResourceCrud
      title="Lectures"
      description="Weekly lecture schedule for More → Lectures."
      listPath="/api/admin/lectures"
      createPath="/api/admin/lectures"
      deletePath={(id) => `/api/admin/lectures/${id}`}
      columns={[
        { key: "day", label: "Day" },
        { key: "startTime", label: "Start" },
        { key: "endTime", label: "End" },
        { key: "courseCode", label: "Course" },
        { key: "title", label: "Title" },
      ]}
      emptyItem={{
        day: "Monday",
        startTime: "09:00",
        endTime: "10:00",
        courseCode: "",
        title: "",
      }}
      fields={[
        { key: "day", label: "Day", required: true },
        { key: "startTime", label: "Start time", required: true },
        { key: "endTime", label: "End time", required: true },
        { key: "courseCode", label: "Course code", required: true },
        { key: "title", label: "Title", required: true },
      ]}
    />
  );
}
