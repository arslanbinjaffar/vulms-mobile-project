import type { CourseProgress } from "@vu-lms/shared";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Screen } from "../../src/components/Screen";
import { api } from "../../src/lib/api";

function Pie({ submitted, notSubmitted, color }: { submitted: number; notSubmitted: number; color: string }) {
  const total = submitted + notSubmitted || 1;
  const r = 36;
  const c = 2 * Math.PI * r;
  const pct = submitted / total;
  return (
    <View className="items-center">
      <Svg width={90} height={90}>
        <Circle cx={45} cy={45} r={r} stroke="#E5E7EB" strokeWidth={12} fill="none" />
        <Circle
          cx={45}
          cy={45}
          r={r}
          stroke={color}
          strokeWidth={12}
          fill="none"
          strokeDasharray={`${pct * c} ${c}`}
          strokeDashoffset={c * 0.25}
          strokeLinecap="round"
        />
      </Svg>
      <Text className="text-xs text-gray-600 mt-1">
        {submitted}/{total}
      </Text>
    </View>
  );
}

export default function ProgressScreen() {
  const query = useQuery({
    queryKey: ["progress"],
    queryFn: () => api<{ items: CourseProgress[] }>("/api/progress"),
  });
  const [active, setActive] = useState(0);
  const item = query.data?.items[active];

  return (
    <Screen
      title="Progress Timeline"
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      <View className="flex-row flex-wrap gap-2 mb-4">
        {(query.data?.items ?? []).map((c, i) => (
          <Pressable
            key={c.courseId}
            onPress={() => setActive(i)}
            className={`px-3 py-2 rounded-full ${
              active === i ? "bg-vu-purple" : "bg-white border border-gray-200"
            }`}
          >
            <Text className={active === i ? "text-white text-xs" : "text-gray-700 text-xs"}>
              {c.courseCode}
            </Text>
          </Pressable>
        ))}
      </View>

      {item ? (
        <View>
          <Text className="font-bold text-vu-navy mb-4">{item.courseTitle}</Text>
          <View className="flex-row justify-around bg-white rounded-xl p-4 border border-gray-200">
            <View className="items-center">
              <Text className="font-semibold mb-2">Assignments</Text>
              <Pie
                submitted={item.assignments.submitted}
                notSubmitted={item.assignments.notSubmitted}
                color="#1E88E5"
              />
            </View>
            <View className="items-center">
              <Text className="font-semibold mb-2">GDB</Text>
              {item.gdb ? (
                <Pie
                  submitted={item.gdb.submitted}
                  notSubmitted={item.gdb.notSubmitted}
                  color="#F1C40F"
                />
              ) : (
                <Text className="text-vu-danger mt-8">No Record Found</Text>
              )}
            </View>
            <View className="items-center">
              <Text className="font-semibold mb-2">Quizzes</Text>
              <Pie
                submitted={item.quizzes.submitted}
                notSubmitted={item.quizzes.notSubmitted}
                color="#6B4C9A"
              />
            </View>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}
