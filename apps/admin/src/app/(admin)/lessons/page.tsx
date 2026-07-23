"use client";

import { ResourceCrud } from "@/components/ResourceCrud";

export default function Page() {
  return (
    <ResourceCrud
      title="Lessons"
      description="Lesson index rows per course."
      listPath="/api/admin/lessons"
      createPath="/api/admin/lessons"
      deletePath={(id) => `/api/admin/lessons/${id}`}
      columns={[
        { key: "courseId", label: "Course" },
        { key: "number", label: "#" },
        { key: "title", label: "Title" },
        { key: "forumStatus", label: "Forum" },
      ]}
      emptyItem={{
        courseId: "",
        number: 1,
        title: "",
        duration: "45 min",
        forumStatus: "Open",
        forumCount: 0,
        hasVideo: true,
        hasPdf: true,
      }}
      fields={[
        { key: "courseId", label: "Course id", required: true },
        { key: "number", label: "Number", type: "number", required: true },
        { key: "title", label: "Title", required: true },
        { key: "duration", label: "Duration" },
        { key: "forumStatus", label: "Forum status (Open/Closed)" },
        { key: "forumCount", label: "Forum count", type: "number" },
        { key: "hasVideo", label: "Has video", type: "checkbox" },
        { key: "hasPdf", label: "Has PDF", type: "checkbox" },
      ]}
    />
  );
}
