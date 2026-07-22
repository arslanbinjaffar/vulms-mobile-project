import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";
import { EmptyBanner, Screen } from "../../src/components/Screen";
import { api } from "../../src/lib/api";

export default function LecturesScreen() {
  const query = useQuery({
    queryKey: ["lectures"],
    queryFn: () =>
      api<{
        items: unknown[];
        available: boolean;
        message: string | null;
      }>("/api/lectures"),
  });

  return (
    <Screen
      title="Weekly Lecture Schedule"
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      {!query.data?.available && query.data?.message ? (
        <EmptyBanner message={query.data.message} />
      ) : (
        <View>
          <Text className="text-gray-600">Schedule loaded.</Text>
        </View>
      )}
    </Screen>
  );
}
