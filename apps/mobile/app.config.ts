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
        ...(typeof config.extra?.eas === "object" && config.extra?.eas
          ? config.extra.eas
          : {}),
        projectId: process.env.EAS_PROJECT_ID,
      },
    },
  };
};
