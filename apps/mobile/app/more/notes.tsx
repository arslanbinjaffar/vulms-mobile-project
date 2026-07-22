import type { Note } from "@vu-lms/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { api } from "../../src/lib/api";

export default function NotesScreen() {
  const [q, setQ] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["notes", q],
    queryFn: () =>
      api<{ items: Note[] }>(`/api/notes${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  });

  const create = useMutation({
    mutationFn: () =>
      api("/api/notes", {
        method: "POST",
        body: JSON.stringify({ title, body }),
      }),
    onSuccess: () => {
      setTitle("");
      setBody("");
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return (
    <Screen
      title="Notes"
      loading={query.isLoading}
      error={query.error ? (query.error as Error).message : null}
    >
      <View className="flex-row mb-4">
        <TextInput
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2 bg-white mr-2"
          placeholder="Search for..."
          value={q}
          onChangeText={setQ}
        />
      </View>

      <View className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
        <TextInput
          className="border border-gray-200 rounded-lg px-3 py-2 mb-2"
          placeholder="Enter Title"
          value={title}
          onChangeText={setTitle}
        />
        <Text className="text-xs text-gray-400 mb-2">
          {new Date().toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <TextInput
          className="border border-gray-200 rounded-lg px-3 py-2 min-h-[100px]"
          placeholder="Enter Note"
          multiline
          value={body}
          onChangeText={setBody}
          textAlignVertical="top"
        />
        <View className="flex-row justify-end gap-3 mt-3">
          <Pressable
            onPress={() => {
              setTitle("");
              setBody("");
            }}
            className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center"
          >
            <Text>×</Text>
          </Pressable>
          <Pressable
            onPress={() => create.mutate()}
            disabled={!title.trim() || !body.trim()}
            className="w-10 h-10 rounded-full bg-vu-blue items-center justify-center"
          >
            <Text className="text-white">✓</Text>
          </Pressable>
        </View>
      </View>

      {(query.data?.items ?? []).map((note) => (
        <View key={note.id} className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
          <Text className="font-semibold text-vu-navy">{note.title}</Text>
          <Text className="text-xs text-gray-400 mt-1">
            {new Date(note.createdAt).toLocaleDateString()}
          </Text>
          <Text className="text-gray-700 mt-2">{note.body}</Text>
        </View>
      ))}
    </Screen>
  );
}
