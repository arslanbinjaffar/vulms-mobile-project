import type { Course, CourseDetails } from "@vu-lms/shared";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Linking, Pressable, Text, TextInput, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Screen } from "../../../src/components/Screen";
import { api } from "../../../src/lib/api";
import { colors } from "../../../src/theme";

const MENU = [
  "Index / Lesson",
  "Course Information",
  "FAQs",
  "Glossary",
  "Books",
  "Download Files",
  "Internet Links",
  "Assessment Scheme",
] as const;

type Tab = (typeof MENU)[number];

const TAB_ICONS: Record<Tab, keyof typeof Ionicons.glyphMap> = {
  "Index / Lesson": "document-text-outline",
  "Course Information": "information-circle-outline",
  FAQs: "chatbubbles-outline",
  Glossary: "list-outline",
  Books: "book-outline",
  "Download Files": "download-outline",
  "Internet Links": "globe-outline",
  "Assessment Scheme": "pie-chart-outline",
};

function SectionHeader({ title }: { title: string }) {
  return (
    <View className="bg-vu-purple rounded-t-xl px-4 py-3">
      <Text className="text-white font-semibold">{title}</Text>
    </View>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <View className="flex-row mb-3">
      <TextInput
        className="flex-1 border border-gray-300 rounded-xl px-3 py-2 bg-white mr-2"
        placeholder={placeholder}
        value={value}
        onChangeText={onChange}
      />
      <View className="bg-vu-blue rounded-xl px-3 items-center justify-center">
        <Ionicons name="search" size={18} color="#fff" />
      </View>
    </View>
  );
}

function AssessmentPie({
  slices,
}: {
  slices: { label: string; weight: number; color: string }[];
}) {
  const total = slices.reduce((s, x) => s + x.weight, 0) || 1;
  const r = 54;
  const c = 2 * Math.PI * r;
  let offset = c * 0.25;
  return (
    <View className="items-center my-4">
      <Svg width={160} height={160}>
        {slices.map((slice) => {
          const len = (slice.weight / total) * c;
          const el = (
            <Circle
              key={slice.label}
              cx={80}
              cy={80}
              r={r}
              stroke={slice.color}
              strokeWidth={28}
              fill="none"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </Svg>
    </View>
  );
}

function fileIcon(type: string): keyof typeof Ionicons.glyphMap {
  if (type === "PDF") return "document-text";
  if (type === "PPT") return "easel-outline";
  if (type === "DOC") return "document";
  if (type === "ZIP") return "archive-outline";
  return "document-outline";
}

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>("Index / Lesson");
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [faqOpen, setFaqOpen] = useState<Record<string, boolean>>({});
  const [letter, setLetter] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["course-details", id],
    queryFn: () =>
      api<{ course: Course; details: CourseDetails }>(`/api/courses/${id}/details`),
  });

  const course = query.data?.course;
  const details = query.data?.details;

  const filteredBooks = useMemo(() => {
    const items = details?.books ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (b) =>
        b.title.toLowerCase().includes(term) ||
        b.author.toLowerCase().includes(term) ||
        b.publisher.toLowerCase().includes(term),
    );
  }, [details?.books, q]);

  const filteredDownloads = useMemo(() => {
    const items = details?.downloads ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((d) => d.title.toLowerCase().includes(term));
  }, [details?.downloads, q]);

  const filteredLinks = useMemo(() => {
    const items = details?.links ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (l) =>
        l.url.toLowerCase().includes(term) ||
        l.description.toLowerCase().includes(term),
    );
  }, [details?.links, q]);

  const filteredFaqs = useMemo(() => {
    const items = details?.faqs ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (f) =>
        f.question.toLowerCase().includes(term) ||
        f.answer.toLowerCase().includes(term),
    );
  }, [details?.faqs, q]);

  const filteredGlossary = useMemo(() => {
    let items = details?.glossary ?? [];
    if (letter) {
      items = items.filter((g) => g.term.toUpperCase().startsWith(letter));
    }
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (g) =>
        g.term.toLowerCase().includes(term) ||
        g.definition.toLowerCase().includes(term),
    );
  }, [details?.glossary, q, letter]);

  // Expand current week by default once data loads
  const currentWeekId = details?.weeks.find((w) => w.isCurrent)?.id;
  const openWeek = expandedWeek ?? currentWeekId ?? null;

  return (
    <Screen
      title={course ? `${course.code} - ${course.title}` : "Course"}
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      {course ? (
        <View className="bg-white rounded-xl p-4 border border-gray-200 mb-4 flex-row">
          <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center mr-3">
            <Ionicons name="person" size={32} color={colors.navy} />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-vu-navy">{course.instructorName}</Text>
            <Text className="text-xs text-gray-500 mt-1">{course.instructorDegree}</Text>
          </View>
        </View>
      ) : null}

      <View className="mb-4">
        {(details?.menu ?? MENU).map((m) => {
          const key = m as Tab;
          const active = tab === key;
          return (
            <Pressable
              key={m}
              onPress={() => {
                setTab(key);
                setQ("");
                setLetter(null);
              }}
              className={`flex-row items-center px-3 py-3 mb-1 rounded-xl border ${
                active ? "bg-gray-100 border-gray-200" : "bg-white border-gray-100"
              }`}
            >
              <Ionicons
                name={TAB_ICONS[key] ?? "ellipse-outline"}
                size={18}
                color={active ? colors.purple : colors.navy}
              />
              <Text
                className={`ml-3 ${active ? "text-vu-purple font-semibold" : "text-vu-navy"}`}
              >
                {m}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === "Index / Lesson" && details ? (
        <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <SectionHeader title="Index / Lesson" />
          {details.weeks.map((week) => {
            const open = openWeek === week.id;
            return (
              <View key={week.id}>
                <Pressable
                  onPress={() => setExpandedWeek(open ? "" : week.id)}
                  className={`px-4 py-3 border-b border-gray-100 ${
                    week.isCurrent ? "bg-green-600" : "bg-white"
                  }`}
                >
                  <Text
                    className={`font-semibold ${week.isCurrent ? "text-white" : "text-vu-navy"}`}
                  >
                    {open ? "- " : "+ "}
                    {week.label}
                  </Text>
                </Pressable>
                {open
                  ? week.items.map((item) => (
                      <View
                        key={item.id}
                        className="px-4 py-3 border-b border-gray-100 bg-gray-50"
                      >
                        <Text className="font-medium text-vu-navy">
                          {item.number} - {item.title}
                        </Text>
                        <View className="flex-row items-center mt-2 gap-4">
                          {item.hasHandout ? (
                            <Ionicons name="save-outline" size={16} color={colors.textMuted} />
                          ) : null}
                          <Text
                            className={`text-xs font-semibold ${
                              item.forumStatus === "Open"
                                ? "text-vu-success"
                                : "text-vu-danger"
                            }`}
                          >
                            {item.forumStatus}
                            {item.forumCount != null ? ` · ${item.forumCount}` : ""}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            {item.duration ?? "N/A"}
                          </Text>
                        </View>
                      </View>
                    ))
                  : null}
              </View>
            );
          })}
        </View>
      ) : null}

      {tab === "Course Information" && details ? (
        <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <SectionHeader title="Course Information" />
          <View className="p-4 gap-3">
            <Text>
              <Text className="font-semibold">Course: </Text>
              {details.information.course}
            </Text>
            <Text>
              <Text className="font-semibold">Category: </Text>
              {details.information.category}, {details.information.creditHours} Credit Hours
            </Text>
            <Text>
              <Text className="font-semibold">Section Incharge: </Text>
              {details.information.sectionIncharge}
            </Text>
            {details.information.sectionEmail ? (
              <Pressable
                onPress={() =>
                  Linking.openURL(`mailto:${details.information.sectionEmail}`)
                }
              >
                <Text className="text-vu-blue">{details.information.sectionEmail}</Text>
              </Pressable>
            ) : null}
            {details.information.sectionPhone ? (
              <Text className="text-gray-600">{details.information.sectionPhone}</Text>
            ) : null}
            <Text className="font-semibold mt-2">Course Synopsis</Text>
            <Text className="text-gray-700 leading-5">{details.information.synopsis}</Text>
            <Text className="font-semibold mt-2">Learning Outcomes</Text>
            {details.information.learningOutcomes.map((o) => (
              <Text key={o} className="text-gray-700">
                • {o}
              </Text>
            ))}
            <Text className="font-semibold mt-2">Course Contents</Text>
            {details.information.courseContents.map((c) => (
              <Text key={c} className="text-gray-700">
                • {c}
              </Text>
            ))}
          </View>
        </View>
      ) : null}

      {tab === "FAQs" && details ? (
        <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <SectionHeader title={`FAQs (${details.faqs.length})`} />
          <View className="p-4">
            <SearchBox value={q} onChange={setQ} placeholder="Search..." />
            {filteredFaqs.map((f) => {
              const open = faqOpen[f.id];
              return (
                <Pressable
                  key={f.id}
                  onPress={() => setFaqOpen((s) => ({ ...s, [f.id]: !open }))}
                  className="border border-gray-100 rounded-xl p-3 mb-2"
                >
                  <View className="flex-row items-start">
                    <View className="w-6 h-6 rounded-full bg-vu-navy items-center justify-center mr-2 mt-0.5">
                      <Text className="text-white text-xs">?</Text>
                    </View>
                    <Text className="flex-1 font-semibold text-vu-navy">{f.question}</Text>
                  </View>
                  {open ? (
                    <Text className="text-gray-700 mt-2 ml-8 leading-5">{f.answer}</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {tab === "Glossary" && details ? (
        <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <SectionHeader title="Glossary" />
          <View className="p-4">
            <SearchBox value={q} onChange={setQ} placeholder="Search..." />
            <View className="flex-row flex-wrap gap-1 mb-3">
              {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((ch) => (
                <Pressable
                  key={ch}
                  onPress={() => setLetter((l) => (l === ch ? null : ch))}
                  className={`w-7 h-7 rounded items-center justify-center ${
                    letter === ch ? "bg-vu-purple" : "bg-gray-100"
                  }`}
                >
                  <Text className={`text-xs ${letter === ch ? "text-white" : "text-gray-700"}`}>
                    {ch}
                  </Text>
                </Pressable>
              ))}
            </View>
            {filteredGlossary.map((g) => (
              <View key={g.id} className="mb-3 border-b border-gray-100 pb-3">
                <View className="flex-row items-center mb-1">
                  <View className="w-6 h-6 rounded bg-gray-200 items-center justify-center mr-2">
                    <Text className="text-xs font-bold">t</Text>
                  </View>
                  <Text className="font-bold text-vu-navy text-base">{g.term}</Text>
                </View>
                <Text className="text-gray-700 leading-5 ml-8">{g.definition}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {tab === "Books" && details ? (
        <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <SectionHeader title="Books" />
          <View className="p-4">
            <SearchBox value={q} onChange={setQ} placeholder="Search for..." />
            {filteredBooks.map((b) => (
              <View key={b.id} className="mb-4 border-b border-gray-100 pb-3">
                <Text className="font-bold text-vu-navy text-base">{b.title}</Text>
                {b.citation ? (
                  <Text className="text-sm text-gray-500 mt-1">{b.citation}</Text>
                ) : null}
                <Text className="text-sm text-gray-700 mt-1">Author: {b.author}</Text>
                <Text className="text-sm text-gray-700">Edition: {b.edition}</Text>
                <Text className="text-sm text-gray-700">Publisher: {b.publisher}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {tab === "Download Files" && details ? (
        <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <SectionHeader title="Download Files" />
          <View className="p-4">
            <SearchBox value={q} onChange={setQ} placeholder="Search for..." />
            {filteredDownloads.map((d) => (
              <View
                key={d.id}
                className="flex-row items-center border border-gray-100 rounded-xl p-3 mb-2"
              >
                <Ionicons name={fileIcon(d.fileType)} size={22} color={colors.purple} />
                <View className="flex-1 ml-3">
                  <Text className="font-semibold text-vu-navy">{d.title}</Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    File Size: {d.fileSize} · Last Updated:{" "}
                    {new Date(d.lastUpdated).toLocaleString()}
                  </Text>
                </View>
                <Ionicons name="download-outline" size={22} color={colors.textMuted} />
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {tab === "Internet Links" && details ? (
        <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <SectionHeader title="Internet Links" />
          <View className="p-4">
            <SearchBox value={q} onChange={setQ} placeholder="Search for..." />
            {filteredLinks.map((l) => (
              <Pressable
                key={l.id}
                onPress={() => Linking.openURL(l.url)}
                className="mb-3 border-b border-gray-100 pb-3"
              >
                <Text className="text-vu-blue">{l.url}</Text>
                <Text className="text-xs text-gray-500 mt-1">File Size: {l.description}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {tab === "Assessment Scheme" && details ? (
        <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <SectionHeader title="Assessment Scheme" />
          <View className="p-4">
            <View className="flex-row flex-wrap gap-2 mb-2">
              {details.assessment.map((s) => (
                <View key={s.label} className="flex-row items-center mr-2">
                  <View
                    className="w-3 h-3 rounded-sm mr-1"
                    style={{ backgroundColor: s.color }}
                  />
                  <Text className="text-xs text-gray-700">
                    {s.label} ({s.weight})
                  </Text>
                </View>
              ))}
            </View>
            <AssessmentPie slices={details.assessment} />
            {details.assessment.map((s) => (
              <View
                key={s.label}
                className="flex-row justify-between py-2 border-b border-gray-100"
              >
                <Text className="text-vu-navy">{s.label}</Text>
                <Text className="font-semibold">{s.weight}%</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </Screen>
  );
}
