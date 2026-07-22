import type {
  GradeBookEntry,
  GradingSchemeRow,
  MidtermRow,
} from "@vu-lms/shared";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { api } from "../../src/lib/api";
import { cacheGet, cacheSet } from "../../src/lib/cache";

type GbResponse = {
  semester: string;
  studentGradeBook: GradeBookEntry[];
  midterm: MidtermRow[];
  gradingScheme: GradingSchemeRow[];
  projectedCgpa: { currentCgpa: number; effectiveCgpa: number; projected: number };
  coumDac: { status: string; message: string };
};

const TABS = [
  "Student Grade Book",
  "Midterm Result",
  "Grading Scheme",
  "Projected CGPA",
  "COUM/DAC",
] as const;

export default function GradeBookScreen() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Midterm Result");
  const query = useQuery({
    queryKey: ["gradebook"],
    queryFn: async () => {
      try {
        const data = await api<GbResponse>("/api/gradebook");
        await cacheSet("vulms:gradebook", data);
        return data;
      } catch (e) {
        const cached = await cacheGet<GbResponse>("vulms:gradebook");
        if (cached) return cached;
        throw e;
      }
    },
  });

  return (
    <Screen
      title={`Grade Book (${query.data?.semester ?? "..."})`}
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
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

      {tab === "Midterm Result"
        ? query.data?.midterm.map((row) => (
            <View
              key={row.courseCode}
              className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
            >
              <Text className="font-bold text-vu-navy">
                {row.courseCode} — {row.courseTitle}
              </Text>
              <Text className="text-vu-success font-semibold mt-2">
                Marks: {row.marks}/{row.totalMarks}
              </Text>
              <Text className="text-vu-blue mt-1">Percentage: {row.percentage}%</Text>
              <Text className="text-gray-600 text-sm mt-1">
                Class Avg: {row.classAverage} · Exam Attendance: {row.examAttendance}%
              </Text>
              {row.remarks ? (
                <Text className="text-sm text-gray-500 mt-1">{row.remarks}</Text>
              ) : null}
            </View>
          ))
        : null}

      {tab === "Student Grade Book"
        ? query.data?.studentGradeBook.map((row) => (
            <View
              key={row.courseCode}
              className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
            >
              <Text className="font-bold text-vu-navy">{row.courseCode}</Text>
              <Text className="text-sm text-gray-600">{row.courseTitle}</Text>
              <Text className="text-sm mt-2">
                Assignments: {row.assignments ?? "-"} · GDB: {row.gdbs ?? "-"} · Quizzes:{" "}
                {row.quizzes ?? "-"}
              </Text>
              <Text className="text-sm">
                Midterm: {row.midterm ?? "-"} · Final: {row.finalTerm ?? "-"}
              </Text>
            </View>
          ))
        : null}

      {tab === "Grading Scheme"
        ? query.data?.gradingScheme.map((row) => (
            <View
              key={row.component}
              className="bg-white rounded-xl p-3 mb-2 border border-gray-200 flex-row justify-between"
            >
              <Text className="text-vu-navy">{row.component}</Text>
              <Text className="font-semibold">{row.weight}%</Text>
            </View>
          ))
        : null}

      {tab === "Projected CGPA" && query.data ? (
        <View className="bg-white rounded-xl p-4 border border-gray-200">
          <Text className="text-lg font-bold text-vu-navy mb-2">Projected CGPA Calculator</Text>
          <Text>Current CGPA: {query.data.projectedCgpa.currentCgpa}</Text>
          <Text>Effective CGPA: {query.data.projectedCgpa.effectiveCgpa}</Text>
          <Text className="text-vu-purple font-bold mt-2">
            Projected: {query.data.projectedCgpa.projected}
          </Text>
        </View>
      ) : null}

      {tab === "COUM/DAC" && query.data ? (
        <View className="bg-white rounded-xl p-4 border border-gray-200">
          <Text className="font-bold text-vu-navy">Status: {query.data.coumDac.status}</Text>
          <Text className="text-gray-600 mt-2">{query.data.coumDac.message}</Text>
        </View>
      ) : null}
    </Screen>
  );
}
