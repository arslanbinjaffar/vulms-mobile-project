import type { Challan } from "@vu-lms/shared";
import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";
import { Screen, StatusPill } from "../../src/components/Screen";
import { api } from "../../src/lib/api";

export default function AccountBookScreen() {
  const query = useQuery({
    queryKey: ["account-book"],
    queryFn: () =>
      api<{ items: Challan[]; totalPayable: number; totalPayableUsd: number }>(
        "/api/account-book",
      ),
  });

  return (
    <Screen
      title="My Account Book"
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      <View className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
        <Text className="text-vu-blue font-semibold">
          Total Payable Amount: Rs {query.data?.totalPayable ?? 0} / ${" "}
          {query.data?.totalPayableUsd ?? 0}
        </Text>
      </View>
      {(query.data?.items ?? []).map((item) => (
        <View
          key={item.id}
          className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
        >
          <View className="flex-row justify-between">
            <Text className="font-bold text-vu-navy">#{item.challanNo}</Text>
            <StatusPill
              label={item.status.toUpperCase()}
              tone={item.status === "paid" ? "success" : "danger"}
            />
          </View>
          <Text className="text-gray-700 mt-1">{item.challanType}</Text>
          <Text className="text-sm mt-2">
            Payable: {item.payable} · Paid:{" "}
            <Text className="text-vu-success">{item.paid}</Text> · Balance: {item.balance}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            Due: {item.dueDate}
            {item.paidDate ? ` · Paid: ${item.paidDate}` : " · UNPAID"}
          </Text>
          {item.paymentMode ? (
            <Text className="text-xs text-gray-500">Mode: {item.paymentMode}</Text>
          ) : null}
        </View>
      ))}
    </Screen>
  );
}
