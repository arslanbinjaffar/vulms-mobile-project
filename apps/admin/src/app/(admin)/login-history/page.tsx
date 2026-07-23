"use client";

import { ResourceCrud } from "@/components/ResourceCrud";

export default function Page() {
  return (
    <ResourceCrud
      title="Login history"
      description="Student login records (also grows on each mobile login)."
      listPath="/api/admin/login-history"
      readOnly
      columns={[
        { key: "at", label: "When" },
        { key: "ip", label: "IP" },
        { key: "device", label: "Device" },
        { key: "location", label: "Location" },
      ]}
      emptyItem={{}}
      fields={[]}
    />
  );
}
