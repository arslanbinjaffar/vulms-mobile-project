import type { Course } from "@vu-lms/shared";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { colors } from "../theme";

type Props = { course: Course };

function Action({
  href,
  icon,
  badge,
  label,
}: {
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: number;
  label: string;
}) {
  return (
    <Link href={href as any} asChild>
      <Pressable className="items-center flex-1 py-2">
        <View>
          <Ionicons name={icon} size={22} color={colors.navy} />
          {badge && badge > 0 ? (
            <View className="absolute -right-2 -top-1 min-w-[16px] h-4 rounded-full bg-red-600 items-center justify-center px-1">
              <Text className="text-[10px] text-white font-bold">{badge}</Text>
            </View>
          ) : null}
        </View>
        <Text className="text-[10px] text-gray-600 mt-1">{label}</Text>
      </Pressable>
    </Link>
  );
}

export function CourseCard({ course }: Props) {
  const base = `/course/${course.id}`;
  return (
    <View className="mb-4 rounded-xl overflow-hidden border border-gray-200 bg-white">
      <Link href={`${base}` as any} asChild>
        <Pressable className="bg-vu-purple px-4 py-3">
          <Text className="text-white font-semibold text-base">
            {course.code} - {course.title}
          </Text>
          <Text className="text-white/80 text-xs mt-1">{course.department}</Text>
          <Text className="text-white/80 text-xs">{course.creditHours} Credit Hour(s)</Text>
        </Pressable>
      </Link>
      <Link href={`${base}` as any} asChild>
        <Pressable className="flex-row px-4 py-3 items-center">
          <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center mr-3">
            <Ionicons name="person" size={28} color={colors.navy} />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-vu-navy">{course.instructorName}</Text>
            <Text className="text-xs text-gray-500" numberOfLines={2}>
              {course.instructorDegree}
            </Text>
          </View>
          <View className="w-12 h-12 rounded-full border-2 border-vu-blue items-center justify-center">
            <Text className="text-vu-blue font-bold">{course.lectureCount}</Text>
          </View>
        </Pressable>
      </Link>
      <View className="flex-row border-t border-gray-100">
        <Action href={`${base}/assignments`} icon="document-text-outline" label="Assign" />
        <Action href={`${base}/gdbs`} icon="people-outline" label="GDB" />
        <Action href={`${base}/quizzes`} icon="help-circle-outline" label="Quiz" />
        <Action href={`${base}/activities`} icon="sync-outline" label="Activity" />
        <Action
          href={`${base}/announcements`}
          icon="megaphone-outline"
          badge={course.announcementCount}
          label="News"
        />
      </View>
    </View>
  );
}
