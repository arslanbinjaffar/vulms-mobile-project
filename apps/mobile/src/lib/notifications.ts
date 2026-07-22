import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupNotifications() {
  if (Platform.OS === "web") return null;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return null;
  return Notifications.getExpoPushTokenAsync().catch(() => null);
}

export async function notifyLocal(title: string, body: string) {
  if (Platform.OS === "web") return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}
