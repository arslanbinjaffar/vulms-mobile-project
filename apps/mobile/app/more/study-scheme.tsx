import type { StudySchemeCourse } from "@vu-lms/shared";
import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";
import { Screen, StatusPill } from "../../src/components/Screen";
import { api } from "../../src/lib/api";

export default function StudySchemeScreen() {
  const query = useQuery({
    queryKey: ["study-scheme"],
    queryFn: () =>
      api<{
        degree: string;
        program: string;
        version: string;
        items: StudySchemeCourse[];
      }>("/api/study-scheme"),
  });

  const bySem = (query.data?.items ?? []).reduce<Record<number, StudySchemeCourse[]>>(
    (acc, item) => {
      (acc[item.semester] ??= []).push(item);
      return acc;
    },
    {},
  );

  return (
    <Screen
      title="My Study Scheme"
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      {query.data ? (
        <View className="bg-vu-navy rounded-xl p-3 mb-4">
          <Text className="text-white">
            {query.data.degree} · {query.data.program} · {query.data.version}
          </Text>
        </View>
      ) : null}
      {Object.keys(bySem)
        .map(Number)
        .sort((a, b) => a - b)
        .map((sem) => (
          <View key={sem} className="mb-4">
            <Text className="font-bold text-vu-purple mb-2">Semester {sem}</Text>
            {bySem[sem].map((c) => (
              <View
                key={c.code}
                className="bg-white rounded-xl p-3 mb-2 border border-gray-200"
              >
                <View className="flex-row justify-between">
                  <Text className="font-semibold text-vu-navy">
                    {c.code} — {c.title}
                  </Text>
                  <StatusPill
                    label={c.status}
                    tone={c.status === "Pending" ? "danger" : "success"}
                  />
                </View>
                <Text className="text-xs text-gray-500 mt-1">
                  {c.type} · {c.courseType} · {c.creditHours} Cr
                </Text>
              </View>
            ))}
          </View>
        ))}
    </Screen>
  );
}
