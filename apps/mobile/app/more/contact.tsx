import { useQuery } from "@tanstack/react-query";
import { Linking, Pressable, Text, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { api } from "../../src/lib/api";

export default function ContactScreen() {
  const query = useQuery({
    queryKey: ["contact"],
    queryFn: () =>
      api<{ phone: string; email: string; address: string; helpUrl: string }>(
        "/api/contact",
      ),
  });

  return (
    <Screen
      title="Contact Us"
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      {query.data ? (
        <View className="bg-white rounded-xl p-4 border border-gray-200 gap-3">
          <Text className="font-bold text-vu-navy text-lg">Virtual University of Pakistan</Text>
          <Text className="text-gray-700">{query.data.address}</Text>
          <Pressable onPress={() => Linking.openURL(`tel:${query.data.phone}`)}>
            <Text className="text-vu-blue">{query.data.phone}</Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL(`mailto:${query.data.email}`)}>
            <Text className="text-vu-blue">{query.data.email}</Text>
          </Pressable>
        </View>
      ) : null}
    </Screen>
  );
}
