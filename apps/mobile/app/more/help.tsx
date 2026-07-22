import { Text, View } from "react-native";
import { Screen } from "../../src/components/Screen";

const FAQS = [
  {
    q: "How do I attempt a quiz?",
    a: "Open Home → course Quiz icon → select an open quiz → answer and submit before the timer ends.",
  },
  {
    q: "Where is Grade Book?",
    a: "Use the Grade Book tab for Midterm Result, Student Grade Book, Grading Scheme, and CGPA tools.",
  },
  {
    q: "How do I see upcoming deadlines?",
    a: "Open the To Do tab for agenda and month views of assignments, GDBs, quizzes, and datesheet.",
  },
];

export default function HelpScreen() {
  return (
    <Screen title="Help">
      {FAQS.map((f) => (
        <View key={f.q} className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
          <Text className="font-semibold text-vu-navy">{f.q}</Text>
          <Text className="text-gray-600 mt-2">{f.a}</Text>
        </View>
      ))}
    </Screen>
  );
}
