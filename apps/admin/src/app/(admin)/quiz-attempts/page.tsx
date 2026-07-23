"use client";

import { ResourceCrud } from "@/components/ResourceCrud";

export default function Page() {
  return (
    <ResourceCrud
      title="Quiz attempts"
      description="Scores and answers from student quiz submissions."
      listPath="/api/admin/quiz-attempts"
      readOnly
      columns={[
        { key: "at", label: "When" },
        { key: "studentId", label: "Student" },
        { key: "quizId", label: "Quiz" },
        { key: "score", label: "Score" },
        { key: "totalMarks", label: "Total" },
      ]}
      emptyItem={{}}
      fields={[]}
    />
  );
}
