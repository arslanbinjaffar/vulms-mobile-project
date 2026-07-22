import type { Gdb, GdbPost } from "@vu-lms/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Screen } from "../../../../src/components/Screen";
import { api } from "../../../../src/lib/api";

function feedbackColor(feedback: string | null) {
  if (feedback === "Very Good" || feedback === "Good") return "text-vu-success";
  if (feedback === "Satisfactory") return "text-amber-600";
  if (feedback === "Poor") return "text-vu-danger";
  return "text-gray-400";
}

export default function GdbDetail() {
  const { gdbId, id } = useLocalSearchParams<{ gdbId: string; id: string }>();
  const [post, setPost] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showFullQuestion, setShowFullQuestion] = useState(false);
  const [mineOnly, setMineOnly] = useState(false);
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["gdb", gdbId, page, mineOnly, sort],
    queryFn: () =>
      api<{
        item: Gdb;
        posts: GdbPost[];
        pagination: {
          page: number;
          pageSize: number;
          total: number;
          totalPages: number;
          totalReported: number;
        };
      }>(
        `/api/gdbs/${gdbId}?page=${page}&pageSize=10&mine=${mineOnly ? "1" : "0"}&sort=${sort}`,
      ),
  });

  const submit = useMutation({
    mutationFn: () =>
      api<{ item: Gdb }>(`/api/gdbs/${gdbId}/submit`, {
        method: "POST",
        body: JSON.stringify({ post }),
      }),
    onSuccess: () => {
      setPost("");
      qc.invalidateQueries({ queryKey: ["gdb", gdbId] });
      qc.invalidateQueries({ queryKey: ["gdbs", id] });
    },
  });

  const item = query.data?.item;
  const pagination = query.data?.pagination;
  const question = item?.questionDescription ?? item?.prompt ?? "";
  const shortQuestion = useMemo(() => {
    if (question.length <= 220) return question;
    return `${question.slice(0, 220)}...`;
  }, [question]);

  return (
    <Screen
      title={item ? `GDB > ${item.courseCode}` : "GDB Details"}
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      {item ? (
        <>
          <View className="bg-white rounded-xl border border-vu-purple overflow-hidden mb-4">
            <View className="bg-vu-purple px-4 py-3">
              <Text className="text-white font-semibold">GDB Details</Text>
            </View>
            <View className="p-4">
              <Text className="text-sm text-gray-600">Total Marks: {item.totalMarks}</Text>
              <Text className="text-vu-success text-sm mt-1">
                Starting Date:{" "}
                {new Date(item.openAt).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Text className="text-vu-danger text-sm">
                Closing Date:{" "}
                {new Date(item.closeAt).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Text
                className={`text-sm font-bold mt-2 ${
                  item.gdbStatus === "Open" ? "text-vu-success" : "text-vu-danger"
                }`}
              >
                Status: {item.gdbStatus}
              </Text>

              <Text className="font-bold text-vu-navy mt-4">{item.title}</Text>
              <Text className="text-gray-700 mt-2 leading-5">
                {showFullQuestion ? question : shortQuestion}
              </Text>
              {question.length > 220 ? (
                <Pressable onPress={() => setShowFullQuestion((v) => !v)} className="mt-1">
                  <Text className="text-vu-blue text-sm">
                    {showFullQuestion ? "Show less" : "Read more"}
                  </Text>
                </Pressable>
              ) : null}

              {(item.instructions?.length ?? 0) > 0 ? (
                <View className="mt-4 bg-amber-50 rounded-lg p-3">
                  <Text className="font-semibold text-vu-navy mb-2">Important Instructions</Text>
                  {item.instructions?.map((line) => (
                    <Text key={line} className="text-sm text-gray-700 mb-1">
                      • {line}
                    </Text>
                  ))}
                </View>
              ) : null}

              {item.gdbStatus === "Open" && item.submitStatus !== "Submitted" ? (
                <>
                  <TextInput
                    className="mt-4 border border-gray-300 rounded-xl p-3 min-h-[120px]"
                    multiline
                    placeholder="Write your GDB answer..."
                    value={post}
                    onChangeText={setPost}
                    textAlignVertical="top"
                  />
                  <Pressable
                    onPress={() => submit.mutate()}
                    disabled={!post.trim() || submit.isPending}
                    className="mt-3 bg-vu-purple rounded-xl py-3 items-center"
                  >
                    <Text className="text-white font-semibold">
                      {submit.isPending ? "Submitting..." : "Submit GDB"}
                    </Text>
                  </Pressable>
                  {submit.isError ? (
                    <Text className="text-vu-danger mt-2 text-sm">
                      {(submit.error as Error).message}
                    </Text>
                  ) : null}
                </>
              ) : item.myPost ? (
                <View className="mt-4 p-3 bg-green-50 rounded-lg">
                  <Text className="font-semibold text-vu-success">Your submitted answer</Text>
                  <Text className="mt-1 text-gray-800">{item.myPost}</Text>
                </View>
              ) : item.gdbStatus === "Closed" ? (
                <Text className="mt-4 text-vu-danger font-semibold">
                  GDB is closed. Submission is not allowed.
                </Text>
              ) : null}
            </View>
          </View>

          <View className="bg-white rounded-xl border border-gray-200 p-4 mb-3">
            <Text className="font-bold text-vu-navy mb-3">Discussion Answers</Text>
            <View className="flex-row flex-wrap gap-2 mb-3">
              <Pressable
                onPress={() => {
                  setMineOnly(false);
                  setPage(1);
                }}
                className={`px-3 py-2 rounded-full ${
                  !mineOnly ? "bg-vu-purple" : "bg-gray-100"
                }`}
              >
                <Text className={!mineOnly ? "text-white text-xs" : "text-gray-700 text-xs"}>
                  All Messages
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setMineOnly(true);
                  setPage(1);
                }}
                className={`px-3 py-2 rounded-full ${
                  mineOnly ? "bg-vu-purple" : "bg-gray-100"
                }`}
              >
                <Text className={mineOnly ? "text-white text-xs" : "text-gray-700 text-xs"}>
                  Show My Message
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setSort((s) => (s === "desc" ? "asc" : "desc"));
                  setPage(1);
                }}
                className="px-3 py-2 rounded-full bg-gray-100"
              >
                <Text className="text-gray-700 text-xs">
                  Sort: {sort === "desc" ? "Newest" : "Oldest"}
                </Text>
              </Pressable>
            </View>

            {(query.data?.posts ?? []).map((p) => {
              const open = expanded[p.id] ?? false;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setExpanded((e) => ({ ...e, [p.id]: !open }))}
                  className="border border-gray-100 rounded-xl p-3 mb-2"
                >
                  <View className="flex-row justify-between items-start">
                    <Text className="font-semibold text-vu-navy flex-1">
                      [{open ? "-" : "+"}] GDB Answer ({p.studentId})
                      {p.isMine ? " · You" : ""}
                    </Text>
                    <Text className={`text-xs font-semibold ${feedbackColor(p.feedback)}`}>
                      {p.feedback || "—"}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-400 mt-1">
                    {new Date(p.postedAt).toLocaleString()}
                  </Text>
                  {open ? (
                    <Text className="text-gray-700 mt-2 leading-5">{p.body}</Text>
                  ) : (
                    <Text className="text-gray-500 mt-1" numberOfLines={1}>
                      {p.body}
                    </Text>
                  )}
                </Pressable>
              );
            })}

            {pagination ? (
              <View className="mt-3 flex-row items-center justify-between">
                <Pressable
                  disabled={pagination.page <= 1}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-2 rounded-lg bg-gray-100"
                >
                  <Text className="text-sm text-vu-navy">Previous</Text>
                </Pressable>
                <Text className="text-xs text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </Text>
                <Pressable
                  disabled={pagination.page >= pagination.totalPages}
                  onPress={() => setPage((p) => p + 1)}
                  className="px-3 py-2 rounded-lg bg-gray-100"
                >
                  <Text className="text-sm text-vu-navy">Next</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </>
      ) : null}
    </Screen>
  );
}
