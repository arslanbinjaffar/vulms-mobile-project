import type { StudentProfile } from "@vu-lms/shared";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Text, View } from "react-native";
import { Screen } from "../../../src/components/Screen";
import { api } from "../../../src/lib/api";
import { Pressable } from "react-native";

const TABS = ["Student Profile", "Personal Information", "Academic History"] as const;

export default function StudentProfileScreen() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Student Profile");
  const query = useQuery({
    queryKey: ["profile"],
    queryFn: () => api<{ item: StudentProfile }>("/api/profile"),
  });
  const item = query.data?.item;

  return (
    <Screen
      title="Student Profile"
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      {item ? (
        <>
          <View className="bg-white rounded-xl p-4 border border-gray-200 mb-4 items-center">
            <View className="w-24 h-24 rounded-full bg-vu-navy items-center justify-center mb-3">
              <Text className="text-white text-3xl font-bold">
                {item.summary.name.slice(0, 1)}
              </Text>
            </View>
            <Text className="font-bold text-vu-navy text-lg">{item.summary.name}</Text>
            <Text className="text-gray-600">{item.summary.studentId}</Text>
            <Text className="text-vu-blue text-sm mt-1">{item.summary.email}</Text>
          </View>

          <View className="flex-row flex-wrap gap-2 mb-4">
            {TABS.map((t) => (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                className={`px-3 py-2 rounded-full ${
                  tab === t ? "bg-vu-purple" : "bg-white border border-gray-200"
                }`}
              >
                <Text className={`text-xs ${tab === t ? "text-white" : "text-gray-700"}`}>
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>

          {tab === "Student Profile" ? (
            <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {Object.entries(item.studentProfile).map(([k, v]) => (
                <View
                  key={k}
                  className="flex-row justify-between px-4 py-3 border-b border-gray-100"
                >
                  <Text className="text-gray-500">{k}</Text>
                  <Text className="font-semibold text-vu-navy">{v}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {tab === "Personal Information" ? (
            <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {Object.entries(item.personalInformation).map(([k, v]) => (
                <View
                  key={k}
                  className="flex-row justify-between px-4 py-3 border-b border-gray-100"
                >
                  <Text className="text-gray-500">{k}</Text>
                  <Text className="font-semibold text-vu-navy">{v}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {tab === "Academic History" ? (
            item.academicHistory.map((row) => (
              <View
                key={`${row.degree}-${row.year}`}
                className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
              >
                <Text className="font-bold text-vu-navy">{row.degree}</Text>
                <Text className="text-gray-600 mt-1">{row.institute}</Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {row.year} · {row.marks}
                </Text>
              </View>
            ))
          ) : null}

          <Text className="text-vu-danger text-xs mt-4">{item.correctionNote}</Text>
        </>
      ) : null}
    </Screen>
  );
}
