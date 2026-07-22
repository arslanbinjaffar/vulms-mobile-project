import { ReactNode } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme";

export function Screen({
  title,
  children,
  scroll = true,
  loading,
  error,
}: {
  title?: string;
  children: ReactNode;
  scroll?: boolean;
  loading?: boolean;
  error?: string | null;
}) {
  const body = loading ? (
    <View className="flex-1 items-center justify-center py-20">
      <ActivityIndicator color={colors.purple} size="large" />
    </View>
  ) : error ? (
    <View className="m-4 p-4 rounded-lg bg-red-50 border border-red-200">
      <Text className="text-vu-danger">{error}</Text>
    </View>
  ) : (
    children
  );

  return (
    <SafeAreaView className="flex-1 bg-vu-muted" style={{ padding: 0 }} edges={["bottom"]}>
      {title ? (
        <View className="px-4 py-3 bg-white border-b border-gray-200">
          <Text className="text-xl font-bold text-vu-navy">{title}</Text>
        </View>
      ) : null}
      {scroll ? (
        <ScrollView contentContainerClassName="p-4 pb-10">{body}</ScrollView>
      ) : (
        <View className="flex-1 p-4">{body}</View>
      )}
    </SafeAreaView>
  );
}

export function EmptyBanner({ message }: { message: string }) {
  return (
    <View className="bg-vu-purple rounded-lg px-4 py-3 flex-row items-center">
      <Text className="text-white flex-1">{message}</Text>
    </View>
  );
}

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "success" | "danger" | "warn" | "neutral";
}) {
  const map = {
    success: "bg-green-100 text-green-800",
    danger: "bg-red-100 text-red-800",
    warn: "bg-amber-100 text-amber-800",
    neutral: "bg-gray-100 text-gray-700",
  };
  return (
    <View className={`px-2 py-1 rounded ${map[tone].split(" ")[0]}`}>
      <Text className={`text-xs font-medium ${map[tone].split(" ")[1]}`}>{label}</Text>
    </View>
  );
}
