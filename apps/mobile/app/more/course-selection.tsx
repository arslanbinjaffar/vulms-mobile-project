import type { CourseSelection } from "@vu-lms/shared";
import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { api } from "../../src/lib/api";

export default function CourseSelectionScreen() {
  const query = useQuery({
    queryKey: ["course-selection"],
    queryFn: () => api<{ item: CourseSelection }>("/api/course-selection"),
  });
  const item = query.data?.item;

  return (
    <Screen
      title={item ? `Course Selection (${item.semesterLabel})` : "Course Selection"}
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      {item ? (
        <>
          <View className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
            {(
              [
                ["Student ID", item.studentId],
                ["Name", item.name],
                ["Study Program", item.studyProgram],
                ["CGPA", String(item.cgpa)],
                ["Effective CGPA", String(item.effectiveCgpa)],
                ["Credits Earned", String(item.creditsEarned)],
                ["Credits Exempted", String(item.creditsExempted)],
                ["Current Semester No", String(item.currentSemesterNo)],
              ] as const
            ).map(([k, v]) => (
              <View
                key={k}
                className="flex-row border-b border-gray-100 px-4 py-3 justify-between"
              >
                <Text className="text-gray-500">{k}</Text>
                <Text className="font-semibold text-vu-navy">{v}</Text>
              </View>
            ))}
          </View>
          {!item.isOpen && item.closedMessage ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4">
              <Text className="text-vu-danger font-semibold">{item.closedMessage}</Text>
            </View>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
