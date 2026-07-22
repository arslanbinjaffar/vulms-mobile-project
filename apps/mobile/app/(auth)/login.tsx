import { DEMO_PASSWORD, DEMO_STUDENT_ID } from "@vu-lms/shared";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { api } from "../../src/lib/api";
import { colors } from "../../src/theme";

export default function LoginScreen() {
  const { login } = useAuth();
  const [studentId, setStudentId] = useState(DEMO_STUDENT_ID);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const notice = useQuery({
    queryKey: ["notice-count"],
    queryFn: () => api<{ count: number }>("/api/public/notice-count"),
  });

  async function onSubmit() {
    setBusy(true);
    setError(null);
    try {
      await login(studentId.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center">
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-2xl bg-vu-navy items-center justify-center mb-3">
              <Ionicons name="school" size={40} color="#fff" />
            </View>
            <Text className="text-2xl font-bold text-vu-navy">LMS</Text>
            <Text className="text-gray-500">Learning Management System</Text>
          </View>

          <Text className="text-sm text-gray-600 mb-1">Student ID</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 mb-4 bg-white"
            autoCapitalize="none"
            value={studentId}
            onChangeText={setStudentId}
            placeholder="bc230201247"
          />

          <Text className="text-sm text-gray-600 mb-1">Password</Text>
          <View className="border border-gray-300 rounded-xl px-4 py-3 mb-2 flex-row items-center">
            <TextInput
              className="flex-1"
              secureTextEntry={!show}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
            />
            <Pressable onPress={() => setShow((s) => !s)}>
              <Ionicons
                name={show ? "eye-off" : "eye"}
                size={20}
                color={colors.blue}
              />
            </Pressable>
          </View>

          <Text className="text-vu-blue text-sm mb-4">Forgot Password ?</Text>

          {error ? <Text className="text-vu-danger mb-3">{error}</Text> : null}

          <Pressable
            onPress={onSubmit}
            disabled={busy}
            className="bg-vu-blue rounded-xl py-3.5 items-center"
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">Sign In</Text>
            )}
          </Pressable>

          <View className="mt-8 gap-4">
            <View className="flex-row items-center">
              <Ionicons name="calendar" size={18} color={colors.danger} />
              <Text className="ml-2 text-vu-danger font-medium">Check Your Datesheet</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="notifications" size={18} color={colors.blue} />
              <Text className="ml-2 text-vu-blue font-medium">Notice Board</Text>
              {(notice.data?.count ?? 0) > 0 ? (
                <View className="ml-2 bg-red-600 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                  <Text className="text-white text-[10px] font-bold">
                    {notice.data?.count}
                  </Text>
                </View>
              ) : null}
            </View>
            <View className="flex-row items-center">
              <Ionicons name="book" size={18} color={colors.blue} />
              <Text className="ml-2 text-vu-blue font-medium">Student Hand Book</Text>
            </View>
          </View>

          <Text className="text-center text-xs text-gray-400 mt-8">
            Demo: {DEMO_STUDENT_ID} / {DEMO_PASSWORD}
          </Text>
        </View>

        <View className="bg-vu-navy px-4 py-3">
          <Text className="text-white text-center text-xs">
            © IT Department, Virtual University of Pakistan
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
