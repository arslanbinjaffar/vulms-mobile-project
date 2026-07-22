import type { LoginHistory } from "@vu-lms/shared";
import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";
import { Screen } from "../../../src/components/Screen";
import { api } from "../../../src/lib/api";

export default function LoginHistoryScreen() {
  const query = useQuery({
    queryKey: ["login-history"],
    queryFn: () => api<{ items: LoginHistory[] }>("/api/profile/logins"),
  });

  return (
    <Screen
      title="My Logins History"
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      {(query.data?.items ?? []).map((item) => (
        <View
          key={item.id}
          className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
        >
          <Text className="font-semibold text-vu-navy">
            {new Date(item.at).toLocaleString()}
          </Text>
          <Text className="text-sm text-gray-600 mt-1">{item.device}</Text>
          <Text className="text-xs text-gray-500 mt-1">IP: {item.ip}</Text>
          {item.location ? (
            <Text className="text-xs text-gray-500">{item.location}</Text>
          ) : null}
        </View>
      ))}
    </Screen>
  );
}
