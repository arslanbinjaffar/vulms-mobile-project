import type { ClassicTodo, TodoItem } from "@vu-lms/shared";
import { TODO_COLORS, TODO_LABELS } from "@vu-lms/shared";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { api } from "../../src/lib/api";
import { cacheGet, cacheSet } from "../../src/lib/cache";

function hrefFor(item: TodoItem) {
  if (!item.courseId || !item.refId) return null;
  if (item.type === "assignment")
    return `/course/${item.courseId}/assignments/${item.refId}`;
  if (item.type === "quiz" || item.type === "quiz_results")
    return `/course/${item.courseId}/quizzes/${item.refId}`;
  if (item.type === "gdb") return `/course/${item.courseId}/gdbs/${item.refId}`;
  return null;
}

function ClassicSection({
  title,
  emptyText,
  items,
}: {
  title: string;
  emptyText: string;
  items: { id: string; title: string; courseCode: string }[];
}) {
  return (
    <View className="mb-4">
      <Text className="font-bold text-vu-navy mb-2">{title}</Text>
      <View className="bg-white rounded-xl border border-gray-200 p-4 min-h-[64px]">
        {items.length === 0 ? (
          <Text className="text-gray-600 text-sm">{emptyText}</Text>
        ) : (
          items.map((item) => (
            <Text key={item.id} className="text-vu-blue mb-2">
              {item.courseCode}: {item.title}
            </Text>
          ))
        )}
      </View>
    </View>
  );
}

export default function TodoScreen() {
  const [view, setView] = useState<"calendar" | "classic">("calendar");
  const query = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      try {
        const data = await api<{ items: TodoItem[] }>("/api/todos");
        await cacheSet("vulms:todos", data);
        return data;
      } catch (e) {
        const cached = await cacheGet<{ items: TodoItem[] }>("vulms:todos");
        if (cached) return cached;
        throw e;
      }
    },
  });

  const classic = useQuery({
    queryKey: ["todos-classic"],
    queryFn: () => api<ClassicTodo>("/api/todos/classic"),
    enabled: view === "classic",
  });

  const sorted = useMemo(
    () =>
      [...(query.data?.items ?? [])].sort(
        (a, b) => +new Date(a.endAt) - +new Date(b.endAt),
      ),
    [query.data?.items],
  );

  return (
    <Screen
      title="To Do Calendar"
      loading={view === "calendar" ? query.isLoading : classic.isLoading}
      error={
        (view === "calendar" ? query.error : classic.error)
          ? ((view === "calendar" ? query.error : classic.error) as Error).message
          : null
      }
    >
      <View className="bg-vu-purple rounded-xl px-4 py-3 mb-3">
        <Text className="text-white font-semibold">To Do Calendar</Text>
      </View>

      <View className="flex-row mb-3 bg-white rounded-xl p-1 border border-gray-200">
        {(
          [
            ["calendar", "To Do Calendar"],
            ["classic", "Classic To Do"],
          ] as const
        ).map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setView(key)}
            className={`flex-1 py-2 rounded-lg items-center ${
              view === key ? "bg-vu-purple" : ""
            }`}
          >
            <Text className={view === key ? "text-white font-semibold" : "text-gray-600"}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {view === "classic" ? (
        <>
          <ClassicSection
            title="Assignments"
            emptyText="No Assignment is pending for any of your course."
            items={classic.data?.assignments ?? []}
          />
          <ClassicSection
            title="Quizzes"
            emptyText="No Quiz is pending for any of your course."
            items={classic.data?.quizzes ?? []}
          />
          <ClassicSection
            title="Graded Discussion Board (GDB)"
            emptyText="No GDB is pending for any of your course."
            items={classic.data?.gdbs ?? []}
          />
          <ClassicSection
            title="Practicals"
            emptyText="No Practical is pending for any of your course."
            items={classic.data?.practicals ?? []}
          />
        </>
      ) : (
        <>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {(Object.keys(TODO_LABELS) as (keyof typeof TODO_LABELS)[]).map((key) => (
              <View key={key} className="flex-row items-center mr-2 mb-1">
                <View
                  className="w-3 h-3 rounded-sm mr-1"
                  style={{ backgroundColor: TODO_COLORS[key] }}
                />
                <Text className="text-xs text-gray-600">{TODO_LABELS[key]}</Text>
              </View>
            ))}
          </View>

          {sorted.map((item) => {
            const href = hrefFor(item);
            const card = (
              <View
                className="bg-white rounded-xl p-3 mb-3 border border-gray-200 border-l-4"
                style={{ borderLeftColor: TODO_COLORS[item.type] }}
              >
                <Text className="text-xs text-gray-500">{TODO_LABELS[item.type]}</Text>
                <Text className="font-semibold text-vu-navy mt-0.5">{item.title}</Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Due {new Date(item.endAt).toLocaleDateString()}
                </Text>
              </View>
            );
            return href ? (
              <Link key={item.id} href={href as any} asChild>
                <Pressable>{card}</Pressable>
              </Link>
            ) : (
              <View key={item.id}>{card}</View>
            );
          })}
        </>
      )}
    </Screen>
  );
}
