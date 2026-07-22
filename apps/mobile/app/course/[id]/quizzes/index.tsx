import type { Quiz } from "@vu-lms/shared";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Screen } from "../../../../src/components/Screen";
import { api } from "../../../../src/lib/api";

export default function QuizzesList() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseQuery = useQuery({
    queryKey: ["course", id],
    queryFn: () => api<{ course: { code: string; title: string } }>(`/api/courses/${id}`),
  });
  const query = useQuery({
    queryKey: ["quizzes", id],
    queryFn: () => api<{ items: Quiz[] }>(`/api/courses/${id}/quizzes`),
  });

  const course = courseQuery.data?.course;

  return (
    <Screen
      title={course ? `${course.code} - ${course.title}` : "Quiz"}
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      <View className="bg-vu-purple rounded-xl px-4 py-3 mb-4">
        <Text className="text-white font-semibold">Quiz</Text>
      </View>

      {(query.data?.items ?? []).map((item, index) => {
        const openClose = item.openCloseLabel ?? (item.status === "open" ? "Open" : "Closed");
        const statusLabel =
          item.status === "result_declared" || item.status === "results"
            ? "Result Declared"
            : item.status === "submitted" || item.status === "attempted"
              ? "Submitted"
              : item.status === "open"
                ? "Open"
                : "Closed";

        return (
          <Link key={item.id} href={`/course/${id}/quizzes/${item.id}` as any} asChild>
            <Pressable className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
              <Text className="text-xs text-gray-400">#{index + 1}</Text>
              <Text className="font-semibold text-vu-navy mt-1">{item.title}</Text>
              <Text className="text-vu-success text-sm mt-2">
                Start: {new Date(item.openAt).toLocaleString()}
              </Text>
              <Text className="text-vu-danger text-sm">
                End: {new Date(item.closeAt).toLocaleString()}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Total Marks: {item.totalMarks}</Text>
              <Text
                className={`text-sm font-semibold mt-1 ${
                  openClose === "Open" ? "text-vu-success" : "text-vu-danger"
                }`}
              >
                {openClose}
              </Text>
              <Text
                className={`text-sm font-semibold ${
                  statusLabel === "Submitted" ? "text-vu-success" : "text-vu-danger"
                }`}
              >
                {statusLabel}
              </Text>
              {item.submittedAt ? (
                <Text className="text-xs text-gray-500">
                  Submit Date: {new Date(item.submittedAt).toLocaleString()}
                </Text>
              ) : null}
              {item.obtainedMarks != null ? (
                <Text className="text-vu-navy font-bold mt-1">Result: {item.obtainedMarks}</Text>
              ) : null}
            </Pressable>
          </Link>
        );
      })}

      <View className="mt-2 p-3 bg-red-50 rounded-xl border border-red-100">
        <Text className="text-vu-danger text-xs">
          Note: To take Quiz in Chrome browser, it is mandatory to Install/Enable VU Quiz Firewall
          Extension.
        </Text>
        <Text className="text-vu-blue text-xs mt-2">Unfair Means Regulations</Text>
      </View>
    </Screen>
  );
}
