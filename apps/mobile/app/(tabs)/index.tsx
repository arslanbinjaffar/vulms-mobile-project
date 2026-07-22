import type { Course } from "@vu-lms/shared";
import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";
import { CourseCard } from "../../src/components/CourseCard";
import { Screen } from "../../src/components/Screen";
import { useAuth } from "../../src/context/AuthContext";
import { api } from "../../src/lib/api";
import { cacheGet, cacheSet } from "../../src/lib/cache";

export default function HomeScreen() {
  const { student } = useAuth();
  const query = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      try {
        const data = await api<{ semester: string; courses: Course[] }>("/api/courses");
        await cacheSet("vulms:courses", data);
        return data;
      } catch (e) {
        const cached = await cacheGet<{ semester: string; courses: Course[] }>(
          "vulms:courses",
        );
        if (cached) return cached;
        throw e;
      }
    },
  });

  return (
    <Screen
      title={`My Courses (${query.data?.semester ?? "..."})`}
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      <View className="flex-row items-center mb-4 bg-white rounded-xl p-3 border border-gray-200">
        <View className="w-12 h-12 rounded-full bg-vu-navy items-center justify-center mr-3">
          <Text className="text-white font-bold">
            {student?.name?.slice(0, 1) ?? "S"}
          </Text>
        </View>
        <View>
          <Text className="font-semibold text-vu-navy">{student?.name}</Text>
          <Text className="text-xs text-gray-500">({student?.studentId})</Text>
        </View>
      </View>
      {query.data?.courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </Screen>
  );
}
