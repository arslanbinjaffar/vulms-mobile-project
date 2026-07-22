import type { ActivitySession } from "@vu-lms/shared";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { Screen } from "../../../../src/components/Screen";
import { api } from "../../../../src/lib/api";

export default function ActivitySessionsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseQuery = useQuery({
    queryKey: ["course", id],
    queryFn: () => api<{ course: { code: string; title: string } }>(`/api/courses/${id}`),
  });
  const query = useQuery({
    queryKey: ["activities", id],
    queryFn: () =>
      api<{ items: ActivitySession[]; available: boolean; message: string | null }>(
        `/api/courses/${id}/activities`,
      ),
  });

  const course = courseQuery.data?.course;

  return (
    <Screen
      title={course ? `${course.code} - ${course.title}` : "Activity Sessions"}
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      <View className="bg-vu-purple rounded-xl px-4 py-3 mb-4 flex-row justify-between items-center">
        <Text className="text-white font-semibold">Activity Sessions</Text>
      </View>

      <View className="bg-white rounded-xl border border-gray-200 min-h-[180px] items-center justify-center p-6">
        {!query.data?.available ? (
          <Text className="text-vu-danger font-semibold text-base">
            {query.data?.message ?? "No Session found!"}
          </Text>
        ) : (
          (query.data?.items ?? []).map((item) => (
            <View key={item.id} className="w-full border-b border-gray-100 py-3">
              <Text className="font-semibold text-vu-navy">{item.title}</Text>
              <Text className="text-xs text-gray-500 mt-1">
                {new Date(item.scheduledAt).toLocaleString()} · {item.status}
              </Text>
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}
