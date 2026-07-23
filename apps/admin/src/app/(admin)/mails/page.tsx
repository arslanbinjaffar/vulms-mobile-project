"use client";

import { ResourceCrud } from "@/components/ResourceCrud";

export default function Page() {
  return (
    <ResourceCrud
      title="Mail"
      description="Inbox messages shown in the student More → Mail screen."
      listPath="/api/admin/mails"
      createPath="/api/admin/mails"
      deletePath={(id) => `/api/admin/mails/${id}`}
      columns={[
        { key: "from", label: "From" },
        { key: "subject", label: "Subject" },
        { key: "unread", label: "Unread" },
        { key: "createdAt", label: "Created" },
      ]}
      emptyItem={{
        from: "VU LMS",
        subject: "",
        body: "",
        unread: true,
        createdAt: new Date().toISOString(),
      }}
      fields={[
        { key: "from", label: "From", required: true },
        { key: "subject", label: "Subject", required: true },
        { key: "body", label: "Body", type: "textarea", required: true },
      ]}
    />
  );
}
