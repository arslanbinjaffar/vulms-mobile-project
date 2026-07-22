import type { Assignment } from "@vu-lms/shared";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Screen } from "../../../../src/components/Screen";
import { api } from "../../../../src/lib/api";
import { colors } from "../../../../src/theme";

export default function AssignmentsList() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseQuery = useQuery({
    queryKey: ["course", id],
    queryFn: () => api<{ course: { code: string; title: string } }>(`/api/courses/${id}`),
  });
  const query = useQuery({
    queryKey: ["assignments", id],
    queryFn: () => api<{ items: Assignment[] }>(`/api/courses/${id}/assignments`),
  });

  const course = courseQuery.data?.course;

  return (
    <Screen
      title={course ? `${course.code} - ${course.title}` : "Assignments"}
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      <View className="bg-vu-purple rounded-xl px-4 py-3 mb-4">
        <Text className="text-white font-semibold">Assignment</Text>
      </View>

      {(query.data?.items ?? []).map((item, index) => (
        <Link
          key={item.id}
          href={`/course/${id}/assignments/${item.id}` as any}
          asChild
        >
          <Pressable className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
            <Text className="text-xs text-gray-400">#{index + 1}</Text>
            <Text className="font-semibold text-vu-navy mt-1">{item.title}</Text>

            <View className="flex-row flex-wrap gap-3 mt-2">
              {item.assignmentFileUrl ? (
                <Text className="text-vu-blue text-sm">Assignment File</Text>
              ) : null}
              {item.solutionFileUrl ? (
                <Text className="text-vu-blue text-sm">Solution File</Text>
              ) : null}
            </View>

            <Text className="text-vu-danger text-sm mt-2">
              Due Date: {new Date(item.closeAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })}
            </Text>
            <Text className="text-sm text-gray-600">Total Marks: {item.totalMarks.toFixed(2)}</Text>

            <View className="mt-2">
              {item.status === "expired" ? (
                <Text className="text-vu-danger font-semibold">Expired</Text>
              ) : item.status === "submitted" || item.status === "graded" ? (
                <View>
                  <Text className="text-vu-success font-semibold">Submitted</Text>
                  {item.submittedFileSize ? (
                    <Text className="text-xs text-gray-500">
                      File Size: {item.submittedFileSize}
                    </Text>
                  ) : null}
                  {item.submittedAt ? (
                    <Text className="text-xs text-gray-500">
                      Submit Date: {new Date(item.submittedAt).toLocaleString()}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Text className="text-amber-600 font-semibold">Pending</Text>
              )}
            </View>

            {item.marks != null ? (
              <View className="mt-2">
                <Text className="text-vu-success font-semibold">
                  Score: {item.marks.toFixed(2)}
                </Text>
                {item.comments ? (
                  <Text className="text-vu-blue text-sm mt-1">Read Comments</Text>
                ) : null}
                {item.gradedFileUrl ? (
                  <Text className="text-vu-blue text-sm">Graded Assignment</Text>
                ) : null}
              </View>
            ) : null}

            <View className="flex-row items-center mt-2">
              <Ionicons name="chatbubble-outline" size={14} color={colors.textMuted} />
              <Text className="text-xs text-gray-400 ml-1">Discuss</Text>
            </View>
          </Pressable>
        </Link>
      ))}
      {!query.isLoading && !query.data?.items.length ? (
        <Text className="text-gray-500">No assignments found.</Text>
      ) : null}
    </Screen>
  );
}
