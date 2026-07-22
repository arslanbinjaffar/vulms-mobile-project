import "../global.css";
import "react-native-gesture-handler";
import {
  SourceSans3_400Regular,
  SourceSans3_500Medium,
  SourceSans3_600SemiBold,
  SourceSans3_700Bold,
  useFonts,
} from "@expo-google-fonts/source-sans-3";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { setupNotifications } from "../src/lib/notifications";
import { colors } from "../src/theme";

try {
  const sheet = StyleSheet as typeof StyleSheet & {
    setFlag?: (key: string, value: string) => void;
  };
  sheet.setFlag?.("darkMode", "class");
} catch {
  // ignore
}

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { student, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "(auth)";
    if (!student && !inAuth) router.replace("/(auth)/login");
    else if (student && inAuth) router.replace("/(tabs)");
  }, [student, loading, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SourceSans3_400Regular,
    SourceSans3_500Medium,
    SourceSans3_600SemiBold,
    SourceSans3_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      setupNotifications();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGate>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.navy },
              headerTintColor: "#fff",
              headerTitleStyle: { fontFamily: "SourceSans3_600SemiBold" },
              contentStyle: { backgroundColor: colors.muted },
            }}
          >
            <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="course/[id]/index" options={{ title: "Course" }} />
            <Stack.Screen name="course/[id]/assignments/index" options={{ title: "Assignments" }} />
            <Stack.Screen name="course/[id]/assignments/[assignmentId]" options={{ title: "Assignment" }} />
            <Stack.Screen name="course/[id]/quizzes/index" options={{ title: "Quizzes" }} />
            <Stack.Screen name="course/[id]/quizzes/[quizId]" options={{ title: "Quiz" }} />
            <Stack.Screen name="course/[id]/gdbs/index" options={{ title: "Graded Discussion Board" }} />
            <Stack.Screen name="course/[id]/gdbs/[gdbId]" options={{ title: "GDB Details" }} />
            <Stack.Screen name="course/[id]/announcements/index" options={{ title: "Announcements" }} />
            <Stack.Screen name="course/[id]/activities/index" options={{ title: "Activity Sessions" }} />
            <Stack.Screen name="more/profile/index" options={{ title: "My Profile" }} />
            <Stack.Screen name="more/profile/change-password" options={{ title: "Change Password" }} />
            <Stack.Screen name="more/profile/logins" options={{ title: "My Logins History" }} />
            <Stack.Screen name="more/progress" options={{ title: "Progress" }} />
            <Stack.Screen name="more/account-book" options={{ title: "Account Book" }} />
            <Stack.Screen name="more/lectures" options={{ title: "Lecture Schedule" }} />
            <Stack.Screen name="more/mail/index" options={{ title: "Mail" }} />
            <Stack.Screen name="more/mail/[id]" options={{ title: "Message" }} />
            <Stack.Screen name="more/notes" options={{ title: "Notes" }} />
            <Stack.Screen name="more/study-scheme" options={{ title: "My Study Scheme" }} />
            <Stack.Screen name="more/studied-courses" options={{ title: "My Studied Courses" }} />
            <Stack.Screen name="more/eid-card" options={{ title: "e-ID Card" }} />
            <Stack.Screen name="more/student-services" options={{ title: "Student Services" }} />
            <Stack.Screen name="more/course-selection" options={{ title: "Course Selection" }} />
            <Stack.Screen name="more/teacher-evaluation" options={{ title: "Teacher Evaluation" }} />
            <Stack.Screen name="more/contact" options={{ title: "Contact Us" }} />
            <Stack.Screen name="more/help" options={{ title: "Help" }} />
          </Stack>
        </AuthGate>
      </AuthProvider>
    </QueryClientProvider>
  );
}
