import type { MailMessage } from "@vu-lms/shared";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Screen } from "../../../src/components/Screen";
import { api } from "../../../src/lib/api";

export default function MailList() {
  const query = useQuery({
    queryKey: ["mail"],
    queryFn: () => api<{ items: MailMessage[] }>("/api/mail"),
  });

  return (
    <Screen loading={query.isLoading} error={query.error ? (query.error as Error).message : null}>
      {(query.data?.items ?? []).map((item) => (
        <Link key={item.id} href={`/more/mail/${item.id}` as any} asChild>
          <Pressable className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
            <View className="flex-row justify-between">
              <Text className={`flex-1 ${item.unread ? "font-bold" : "font-medium"} text-vu-navy`}>
                {item.subject}
              </Text>
              {item.unread ? (
                <View className="w-2 h-2 rounded-full bg-vu-danger mt-2" />
              ) : null}
            </View>
            <Text className="text-sm text-gray-500 mt-1">From: {item.from}</Text>
            <Text className="text-xs text-gray-400 mt-1">
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </Pressable>
        </Link>
      ))}
    </Screen>
  );
}
