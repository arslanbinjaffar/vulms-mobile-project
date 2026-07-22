import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { useAuth } from "../../src/context/AuthContext";
import { colors } from "../../src/theme";

const PROFILE_ITEMS: {
  href: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { href: "/more/profile", title: "My Profile", icon: "person-outline" },
  { href: "/more/profile/change-password", title: "Change Password", icon: "key-outline" },
  { href: "/more/profile/logins", title: "My Logins History", icon: "briefcase-outline" },
];

const ITEMS: {
  href: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { href: "/more/progress", title: "Progress", icon: "pie-chart" },
  { href: "/more/account-book", title: "Account Book", icon: "wallet" },
  { href: "/more/lectures", title: "Lecture Schedule", icon: "time" },
  { href: "/more/mail", title: "Mail", icon: "mail" },
  { href: "/more/notes", title: "Notes", icon: "create" },
  { href: "/more/study-scheme", title: "My Study Scheme", icon: "map" },
  { href: "/more/studied-courses", title: "My Studied Courses", icon: "library" },
  { href: "/more/eid-card", title: "e-ID Card", icon: "card" },
  { href: "/more/student-services", title: "Student Services", icon: "construct" },
  { href: "/more/course-selection", title: "Course Selection", icon: "checkbox" },
  { href: "/more/teacher-evaluation", title: "Teacher Evaluation", icon: "clipboard" },
  { href: "/more/contact", title: "Contact Us", icon: "call" },
  { href: "/more/help", title: "Help", icon: "help-circle" },
];

export default function MoreScreen() {
  const { student, logout } = useAuth();

  return (
    <Screen title="More">
      <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
        <View className="flex-row items-center mb-3">
          <View className="w-14 h-14 rounded-full bg-vu-navy items-center justify-center mr-3">
            <Text className="text-white font-bold text-xl">
              {student?.name?.slice(0, 1) ?? "S"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-bold text-vu-navy text-lg">{student?.name}</Text>
            <Text className="text-gray-500 text-sm">
              {student?.fieldOfStudy ?? "Information Technology"}
            </Text>
            <Text className="text-xs text-gray-400">{student?.studentId}</Text>
          </View>
          <Ionicons name="notifications" size={22} color={colors.purple} />
        </View>

        {PROFILE_ITEMS.map((item) => (
          <Link key={item.href} href={item.href as any} asChild>
            <Pressable className="flex-row items-center py-3 border-t border-gray-100">
              <Ionicons name={item.icon} size={20} color="#666" />
              <Text className="ml-3 flex-1 text-vu-navy">{item.title}</Text>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </Pressable>
          </Link>
        ))}

        <Pressable
          onPress={() => logout()}
          className="mt-3 border border-gray-300 rounded-full py-2.5 items-center"
        >
          <Text className="text-vu-purple font-semibold">Logout</Text>
        </Pressable>
      </View>

      {ITEMS.map((item) => (
        <Link key={item.href} href={item.href as any} asChild>
          <Pressable className="bg-white rounded-xl px-4 py-3.5 mb-2 border border-gray-200 flex-row items-center">
            <Ionicons name={item.icon} size={20} color={colors.navy} />
            <Text className="ml-3 flex-1 text-vu-navy font-medium">{item.title}</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </Pressable>
        </Link>
      ))}

      <Text className="text-center text-xs text-gray-400 mt-6">
        Virtual University Of Pakistan, Federal Government University
      </Text>
    </Screen>
  );
}
