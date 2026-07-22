import type { Gdb } from "@vu-lms/shared";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Screen } from "../../../../src/components/Screen";
import { api } from "../../../../src/lib/api";

export default function GdbsList() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({
    queryKey: ["gdbs", id],
    queryFn: () =>
      api<{
        course: { id: string; code: string; title: string } | null;
        items: Gdb[];
      }>(`/api/courses/${id}/gdbs`),
  });

  const course = query.data?.course;

  return (
    <Screen
      title={course ? `${course.code} - ${course.title}` : "GDB"}
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      <View className="bg-vu-purple rounded-xl px-4 py-3 mb-4">
        <Text className="text-white font-semibold">Graded Discussion Board (GDB)</Text>
      </View>

      {(query.data?.items ?? []).map((item, index) => (
        <View
          key={item.id}
          className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
        >
          <Text className="text-xs text-gray-400">#{index + 1}</Text>
          <Text className="font-semibold text-vu-navy mt-1">
            {item.title || "Graded Discussion Board"}
          </Text>
          <Text className="text-sm text-gray-600 mt-2">
            Total Marks: {item.totalMarks}
          </Text>
          <Text className="text-vu-success text-sm mt-1">
            Start Date:{" "}
            {new Date(item.openAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })}
          </Text>
          <Text className="text-vu-danger text-sm">
            End Date:{" "}
            {new Date(item.closeAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })}
          </Text>
          <Text
            className={`text-sm font-semibold mt-1 ${
              item.gdbStatus === "Open" ? "text-vu-success" : "text-vu-danger"
            }`}
          >
            GDB Status: {item.gdbStatus}
          </Text>
          <Text
            className={`text-sm font-semibold ${
              item.submitStatus === "Submitted" ? "text-vu-success" : "text-vu-danger"
            }`}
          >
            Submit Status: {item.submitStatus}
          </Text>
          {item.obtainedMarks != null ? (
            <Text className="text-vu-navy font-bold mt-1">Result: {item.obtainedMarks}</Text>
          ) : (
            <Text className="text-gray-400 text-sm mt-1">Result: —</Text>
          )}

          <Link href={`/course/${id}/gdbs/${item.id}` as any} asChild>
            <Pressable className="mt-3 bg-vu-purple rounded-xl py-2.5 items-center">
              <Text className="text-white font-semibold">View GDB</Text>
            </Pressable>
          </Link>
        </View>
      ))}

      {!query.isLoading && !query.data?.items.length ? (
        <Text className="text-gray-500">No GDB records found.</Text>
      ) : null}
    </Screen>
  );
}
