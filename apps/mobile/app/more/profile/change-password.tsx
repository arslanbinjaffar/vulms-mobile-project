import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { Screen } from "../../../src/components/Screen";
import { api } from "../../../src/lib/api";

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      api<{ ok: boolean; message: string }>("/api/profile/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
    onSuccess: (data) => {
      Alert.alert("Success", data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    },
    onError: (e) => Alert.alert("Error", (e as Error).message),
  });

  function onSubmit() {
    if (newPassword !== confirm) {
      Alert.alert("Error", "New password and confirm password do not match.");
      return;
    }
    mutation.mutate();
  }

  return (
    <Screen title="Change Password">
      <View className="bg-white rounded-xl p-4 border border-gray-200 gap-3">
        <Text className="text-sm text-gray-600">Current Password</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-3 py-3"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <Text className="text-sm text-gray-600">New Password</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-3 py-3"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <Text className="text-sm text-gray-600">Confirm Password</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-3 py-3"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />
        <Pressable
          onPress={onSubmit}
          className="bg-vu-purple rounded-xl py-3 items-center mt-2"
        >
          <Text className="text-white font-semibold">
            {mutation.isPending ? "Saving..." : "Update Password"}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
