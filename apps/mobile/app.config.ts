import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? null;

  return {
    ...config,
    name: config.name ?? "VU LMS",
    slug: config.slug ?? "vu-lms",
    extra: {
      ...(config.extra ?? {}),
      apiUrl,
      eas: {
        projectId:
          process.env.EAS_PROJECT_ID ??
          (typeof config.extra?.eas === "object" &&
          config.extra?.eas &&
          "projectId" in config.extra.eas
            ? String((config.extra.eas as { projectId?: string }).projectId ?? "")
            : "4344eab1-c68a-43e8-85ef-5003cb66c1a1"),
      },
    },
  };
};
