import type { MailMessage } from "@vu-lms/shared";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { Screen } from "../../../src/components/Screen";
import { api } from "../../../src/lib/api";

export default function MailDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({
    queryKey: ["mail", id],
    queryFn: () => api<{ item: MailMessage }>(`/api/mail/${id}`),
  });

  const item = query.data?.item;
  return (
    <Screen loading={query.isLoading} error={query.error ? (query.error as Error).message : null}>
      {item ? (
        <View className="bg-white rounded-xl p-4 border border-gray-200">
          <Text className="text-xl font-bold text-vu-navy">{item.subject}</Text>
          <Text className="text-sm text-gray-500 mt-2">From: {item.from}</Text>
          <Text className="text-xs text-gray-400 mt-1">
            {new Date(item.createdAt).toLocaleString()}
          </Text>
          <Text className="mt-4 text-gray-800 leading-6">{item.body}</Text>
        </View>
      ) : null}
    </Screen>
  );
}
