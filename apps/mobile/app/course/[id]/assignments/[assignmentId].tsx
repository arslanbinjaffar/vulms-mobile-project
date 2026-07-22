import type { Assignment } from "@vu-lms/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Screen, StatusPill } from "../../../../src/components/Screen";
import { api } from "../../../../src/lib/api";
import { notifyLocal } from "../../../../src/lib/notifications";

export default function AssignmentDetail() {
  const { assignmentId, id } = useLocalSearchParams<{
    assignmentId: string;
    id: string;
  }>();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: () => api<{ item: Assignment }>(`/api/assignments/${assignmentId}`),
  });

  const submit = useMutation({
    mutationFn: () =>
      api<{ item: Assignment }>(`/api/assignments/${assignmentId}/submit`, {
        method: "POST",
      }),
    onSuccess: async () => {
      await notifyLocal("Assignment submitted", "Your assignment was submitted successfully.");
      qc.invalidateQueries({ queryKey: ["assignment", assignmentId] });
      qc.invalidateQueries({ queryKey: ["assignments", id] });
    },
  });

  const item = query.data?.item;

  return (
    <Screen loading={query.isLoading} error={query.error ? (query.error as Error).message : null}>
      {item ? (
        <View className="bg-white rounded-xl p-4 border border-gray-200">
          <Text className="text-xl font-bold text-vu-navy">{item.title}</Text>
          <Text className="text-sm text-gray-500 mt-1">{item.courseCode}</Text>
          <View className="mt-3">
            <StatusPill label={item.status.replace("_", " ")} tone="warn" />
          </View>
          <Text className="mt-4 text-gray-700">{item.instructions}</Text>
          <View className="flex-row flex-wrap gap-3 mt-3">
            {item.assignmentFileUrl ? (
              <Text className="text-vu-blue">Assignment File</Text>
            ) : null}
            {item.solutionFileUrl ? (
              <Text className="text-vu-blue">Solution File</Text>
            ) : null}
          </View>
          <Text className="mt-3 text-sm text-vu-danger">
            Due: {new Date(item.closeAt).toLocaleString()}
          </Text>
          <Text className="mt-2">
            Score: {item.marks ?? "-"} / {item.totalMarks}
          </Text>
          {item.comments ? (
            <Text className="mt-2 text-gray-700">Comments: {item.comments}</Text>
          ) : null}
          {item.status === "not_submitted" ? (
            <Pressable
              onPress={() => submit.mutate()}
              className="mt-6 bg-vu-purple rounded-xl py-3 items-center"
            >
              <Text className="text-white font-semibold">
                {submit.isPending ? "Submitting..." : "Submit Assignment"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}
