import type { Course } from "@vu-lms/shared";
import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { api } from "../../src/lib/api";

export default function StudiedCoursesScreen() {
  const query = useQuery({
    queryKey: ["studied-courses"],
    queryFn: () => api<{ courses: Course[] }>("/api/studied-courses"),
  });

  return (
    <Screen
      title="My Studied Courses"
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      {(query.data?.courses ?? []).map((c) => (
        <View key={c.id} className="bg-white rounded-xl mb-3 border border-gray-200 overflow-hidden">
          <View className="bg-vu-purple px-3 py-2">
            <Text className="text-white font-semibold">
              {c.code} - {c.title}
            </Text>
          </View>
          <View className="p-3">
            <Text className="text-sm text-gray-600">{c.instructorName}</Text>
            <Text className="text-xs text-gray-500 mt-2">
              Announcements {c.announcementCount} · Assignments {c.assignmentCount} · GDB{" "}
              {c.gdbCount} · Quizzes {c.quizCount}
            </Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}
