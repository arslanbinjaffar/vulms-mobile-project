import type { StudentServiceLink } from "@vu-lms/shared";
import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { api } from "../../src/lib/api";

const ORDER = ["Academics", "Accounts", "Examinations", "Registrar"] as const;

export default function StudentServicesScreen() {
  const query = useQuery({
    queryKey: ["student-services"],
    queryFn: () => api<{ items: StudentServiceLink[] }>("/api/student-services"),
  });

  return (
    <Screen
      title="Student Services"
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      {ORDER.map((cat) => {
        const items = (query.data?.items ?? []).filter((i) => i.category === cat);
        if (!items.length) return null;
        return (
          <View key={cat} className="mb-4">
            <Text className="font-bold text-vu-navy mb-2">{cat}</Text>
            {items.map((item) => (
              <View
                key={item.id}
                className="bg-white rounded-xl px-4 py-3 mb-2 border border-gray-200"
              >
                <Text className={item.highlight ? "text-vu-danger font-semibold" : "text-vu-blue"}>
                  {item.title}
                  {item.external ? " ↗" : ""}
                </Text>
              </View>
            ))}
          </View>
        );
      })}
    </Screen>
  );
}
