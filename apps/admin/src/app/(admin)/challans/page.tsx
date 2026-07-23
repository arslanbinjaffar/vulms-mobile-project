"use client";

import { ResourceCrud } from "@/components/ResourceCrud";

export default function Page() {
  return (
    <ResourceCrud
      title="Challans"
      description="Account book challans students see under More → Account Book."
      listPath="/api/admin/challans"
      createPath="/api/admin/challans"
      deletePath={(id) => `/api/admin/challans/${id}`}
      columns={[
        { key: "challanNo", label: "Challan #" },
        { key: "challanType", label: "Type" },
        { key: "payable", label: "Payable" },
        { key: "balance", label: "Balance" },
        { key: "status", label: "Status" },
      ]}
      emptyItem={{
        challanNo: "",
        challanType: "Tuition Fee",
        payable: 0,
        paid: 0,
        balance: 0,
        status: "unpaid",
        dueDate: new Date().toISOString().slice(0, 10),
        paidDate: null,
        paymentMode: null,
      }}
      fields={[
        { key: "challanNo", label: "Challan number", required: true },
        { key: "challanType", label: "Type", required: true },
        { key: "payable", label: "Payable", type: "number", required: true },
        { key: "paid", label: "Paid", type: "number" },
        { key: "balance", label: "Balance", type: "number", required: true },
        { key: "status", label: "Status (paid/unpaid/partial)", required: true },
        { key: "dueDate", label: "Due date", required: true },
      ]}
    />
  );
}
