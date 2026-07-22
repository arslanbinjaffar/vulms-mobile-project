import type { Quiz } from "@vu-lms/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Screen } from "../../../../src/components/Screen";
import { api } from "../../../../src/lib/api";
import { notifyLocal } from "../../../../src/lib/notifications";

export default function QuizAttempt() {
  const { quizId, id } = useLocalSearchParams<{ quizId: string; id: string }>();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => api<{ item: Quiz }>(`/api/quizzes/${quizId}`),
  });
  const [answers, setAnswers] = useState<number[]>([]);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [result, setResult] = useState<{ obtained: number; total: number } | null>(null);

  useEffect(() => {
    if (!query.data?.item || query.data.item.status !== "open") return;
    const mins = query.data.item.durationMinutes;
    setSecondsLeft(mins * 60);
    setAnswers(new Array(query.data.item.questions?.length ?? 0).fill(-1));
  }, [query.data?.item?.id]);

  useEffect(() => {
    if (secondsLeft == null || secondsLeft <= 0 || result) return;
    const t = setInterval(() => setSecondsLeft((s) => (s == null ? s : s - 1)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft, result]);

  const submit = useMutation({
    mutationFn: () =>
      api<{ obtainedMarks: number; totalMarks: number }>(`/api/quizzes/${quizId}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers: answers.map((a) => (a < 0 ? 0 : a)) }),
      }),
    onSuccess: async (data) => {
      setResult({ obtained: data.obtainedMarks, total: data.totalMarks });
      await notifyLocal("Quiz submitted", `Score: ${data.obtainedMarks}/${data.totalMarks}`);
      qc.invalidateQueries({ queryKey: ["quizzes", id] });
      qc.invalidateQueries({ queryKey: ["quiz", quizId] });
    },
  });

  const item = query.data?.item;

  return (
    <Screen loading={query.isLoading} error={query.error ? (query.error as Error).message : null}>
      {item ? (
        <View>
          <Text className="text-xl font-bold text-vu-navy">{item.title}</Text>
          <Text className="text-sm text-gray-500 mt-1">
            {item.courseCode} · Status: {item.status}
          </Text>
          {item.status === "open" && secondsLeft != null ? (
            <Text className="mt-2 text-vu-danger font-semibold">
              Time left: {Math.floor(secondsLeft / 60)}:
              {String(secondsLeft % 60).padStart(2, "0")}
            </Text>
          ) : null}

          {result || item.status !== "open" ? (
            <View className="bg-white rounded-xl p-4 mt-4 border border-gray-200">
              <Text className="font-bold text-vu-navy">Result</Text>
              <Text className="text-vu-success mt-2 text-lg">
                {(result?.obtained ?? item.obtainedMarks) ?? "-"} /{" "}
                {result?.total ?? item.totalMarks}
              </Text>
            </View>
          ) : (
            <>
              {(item.questions ?? []).map((q, qi) => (
                <View key={q.id} className="bg-white rounded-xl p-4 mt-3 border border-gray-200">
                  <Text className="font-semibold text-vu-navy">
                    {qi + 1}. {q.text}
                  </Text>
                  {q.options.map((opt, oi) => (
                    <Pressable
                      key={oi}
                      onPress={() =>
                        setAnswers((prev) => {
                          const next = [...prev];
                          next[qi] = oi;
                          return next;
                        })
                      }
                      className={`mt-2 px-3 py-2 rounded-lg border ${
                        answers[qi] === oi
                          ? "border-vu-purple bg-purple-50"
                          : "border-gray-200"
                      }`}
                    >
                      <Text>{opt}</Text>
                    </Pressable>
                  ))}
                </View>
              ))}
              <Pressable
                onPress={() => submit.mutate()}
                className="mt-6 bg-vu-purple rounded-xl py-3 items-center"
              >
                <Text className="text-white font-semibold">
                  {submit.isPending ? "Submitting..." : "Submit Quiz"}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      ) : null}
    </Screen>
  );
}
