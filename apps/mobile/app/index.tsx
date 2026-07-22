import { Redirect } from "expo-router";
import { useAuth } from "../src/context/AuthContext";

export default function Index() {
  const { student, loading } = useAuth();
  if (loading) return null;
  return <Redirect href={student ? "/(tabs)" : "/(auth)/login"} />;
}
