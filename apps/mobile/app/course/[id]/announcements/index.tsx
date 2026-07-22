import type { Announcement } from "@vu-lms/shared";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Screen } from "../../../../src/components/Screen";
import { api } from "../../../../src/lib/api";
import { colors } from "../../../../src/theme";

export default function AnnouncementsList() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [q, setQ] = useState("");
  const [visible, setVisible] = useState(5);
  const courseQuery = useQuery({
    queryKey: ["course", id],
    queryFn: () => api<{ course: { code: string; title: string } }>(`/api/courses/${id}`),
  });
  const query = useQuery({
    queryKey: ["announcements", id],
    queryFn: () => api<{ items: Announcement[] }>(`/api/courses/${id}/announcements`),
  });

  const filtered = useMemo(() => {
    const items = query.data?.items ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (a) =>
        a.title.toLowerCase().includes(term) ||
        new Date(a.createdAt).toLocaleDateString().toLowerCase().includes(term),
    );
  }, [query.data?.items, q]);

  const course = courseQuery.data?.course;

  return (
    <Screen
      title={course ? `${course.code} - ${course.title}` : "Announcements"}
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      <View className="bg-vu-purple rounded-xl px-4 py-3 mb-4">
        <Text className="text-white font-semibold">Course Announcement</Text>
      </View>

      <View className="flex-row mb-4 gap-2">
        <TextInput
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2 bg-white"
          placeholder="Search in announcement title or date..."
          value={q}
          onChangeText={setQ}
        />
        <Pressable
          onPress={() => query.refetch()}
          className="bg-vu-purple rounded-xl px-3 items-center justify-center"
        >
          <Ionicons name="refresh" size={18} color="#fff" />
        </Pressable>
      </View>

      {filtered.slice(0, visible).map((item) => (
        <View
          key={item.id}
          className="bg-white rounded-xl p-4 mb-3 border border-gray-200 flex-row"
        >
          <View className="w-10 h-10 rounded-full bg-vu-purple items-center justify-center mr-3">
            <Ionicons name="megaphone" size={18} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-vu-blue">{item.title}</Text>
            <View className="flex-row items-center mt-2">
              <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
              <Text className="text-xs text-gray-500 ml-1">
                {new Date(item.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })}
              </Text>
            </View>
          </View>
        </View>
      ))}

      {visible < filtered.length ? (
        <Pressable
          onPress={() => setVisible((v) => v + 5)}
          className="bg-vu-purple rounded-xl py-3 items-center"
        >
          <Text className="text-white font-semibold">Load More</Text>
        </Pressable>
      ) : null}

      {!query.isLoading && !filtered.length ? (
        <Text className="text-gray-500">No announcements.</Text>
      ) : null}
    </Screen>
  );
}
