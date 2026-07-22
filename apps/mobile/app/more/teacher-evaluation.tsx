import type { EvaluationQuestion } from "@vu-lms/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { api } from "../../src/lib/api";

const OPTIONS = [
  "Strongly Disagree",
  "Disagree",
  "Uncertain",
  "Agree",
  "Strongly Agree",
  "N/A",
];

export default function TeacherEvaluationScreen() {
  const query = useQuery({
    queryKey: ["evaluation"],
    queryFn: () =>
      api<{
        courseCode: string;
        courseTitle: string;
        questions: EvaluationQuestion[];
      }>("/api/teacher-evaluation"),
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [likedMost, setLikedMost] = useState("");
  const [likedLeast, setLikedLeast] = useState("");
  const [other, setOther] = useState("");

  const sections = useMemo(() => {
    const map = new Map<string, EvaluationQuestion[]>();
    for (const q of query.data?.questions ?? []) {
      const list = map.get(q.section) ?? [];
      list.push(q);
      map.set(q.section, list);
    }
    return [...map.entries()];
  }, [query.data?.questions]);

  const submit = useMutation({
    mutationFn: () =>
      api("/api/teacher-evaluation", {
        method: "POST",
        body: JSON.stringify({ answers, likedMost, likedLeast, other }),
      }),
    onSuccess: () => Alert.alert("Submitted", "Thank you for your feedback."),
  });

  return (
    <Screen
      title="Teacher Evaluation"
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      {query.data ? (
        <View className="mb-3">
          <Text className="font-bold text-vu-navy">
            {query.data.courseCode} — {query.data.courseTitle}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            Responses are confidential and used for course improvement.
          </Text>
        </View>
      ) : null}

      {sections.map(([section, questions]) => (
        <View key={section} className="mb-4">
          <Text className="font-bold text-vu-purple mb-2">{section}</Text>
          {questions.map((q) => (
            <View key={q.id} className="bg-white rounded-xl p-3 mb-2 border border-gray-200">
              <Text className="text-vu-navy mb-2">{q.text}</Text>
              <View className="flex-row flex-wrap gap-2">
                {OPTIONS.map((opt) => (
                  <Pressable
                    key={opt}
                    onPress={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                    className={`px-2 py-1 rounded-full border ${
                      answers[q.id] === opt
                        ? "bg-vu-purple border-vu-purple"
                        : "border-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-[10px] ${
                        answers[q.id] === opt ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {opt}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>
      ))}

      <Text className="font-bold text-vu-navy mb-2">Comments</Text>
      <TextInput
        className="bg-white border border-gray-200 rounded-xl p-3 mb-2 min-h-[70px]"
        placeholder="What did you like most about the course?"
        multiline
        value={likedMost}
        onChangeText={setLikedMost}
      />
      <TextInput
        className="bg-white border border-gray-200 rounded-xl p-3 mb-2 min-h-[70px]"
        placeholder="What did you like least about the course?"
        multiline
        value={likedLeast}
        onChangeText={setLikedLeast}
      />
      <TextInput
        className="bg-white border border-gray-200 rounded-xl p-3 mb-4 min-h-[70px]"
        placeholder="Any other comments?"
        multiline
        value={other}
        onChangeText={setOther}
      />

      <Pressable
        onPress={() => submit.mutate()}
        className="bg-vu-blue rounded-xl py-3 items-center"
      >
        <Text className="text-white font-semibold">
          {submit.isPending ? "Submitting..." : "Submit"}
        </Text>
      </Pressable>
    </Screen>
  );
}
