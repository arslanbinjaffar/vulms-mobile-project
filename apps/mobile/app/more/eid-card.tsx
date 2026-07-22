import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { api } from "../../src/lib/api";

export default function EidCardScreen() {
  const query = useQuery({
    queryKey: ["eid"],
    queryFn: () =>
      api<{
        front: {
          name: string;
          studentId: string;
          program: string;
        };
        back: {
          validUpto: string;
          address: string;
          phone: string;
          instructions: string;
        };
      }>("/api/eid-card"),
  });

  return (
    <Screen
      title="e-ID Card"
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      {query.data ? (
        <>
          <View className="bg-vu-navy rounded-2xl p-5 mb-4">
            <Text className="text-white/70 text-xs">VIRTUAL UNIVERSITY</Text>
            <View className="w-20 h-20 rounded-full bg-white/20 mt-4 mb-3 items-center justify-center">
              <Text className="text-white text-2xl font-bold">
                {query.data.front.name.slice(0, 1)}
              </Text>
            </View>
            <Text className="text-white text-xl font-bold">{query.data.front.name}</Text>
            <Text className="text-white/90 mt-1">{query.data.front.program}</Text>
            <Text className="text-white font-semibold mt-2">
              {query.data.front.studentId}
            </Text>
          </View>
          <View className="bg-white rounded-2xl p-5 border border-gray-200">
            <Text className="font-bold text-vu-navy">Back Side</Text>
            <Text className="text-sm text-gray-600 mt-2">{query.data.back.instructions}</Text>
            <Text className="mt-3 font-semibold">Valid Upto: {query.data.back.validUpto}</Text>
            <Text className="text-sm text-gray-600 mt-2">{query.data.back.address}</Text>
            <Text className="text-sm text-gray-600">{query.data.back.phone}</Text>
          </View>
        </>
      ) : null}
    </Screen>
  );
}
