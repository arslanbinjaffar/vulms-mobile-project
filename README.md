# VU VULMS Mobile App

Expo + React Native mobile client and own Hono backend for Virtual University LMS.

## Quick start

```bash
pnpm install
pnpm dev:api      # http://localhost:8788
pnpm dev:mobile  # Expo
```

Demo login: **bc230201247** / **password123**

## Structure

- `apps/mobile` — Expo Router app
- `apps/api` — Hono REST API + seed data + VULMS bridge stub
- `packages/shared` — Zod schemas and shared types

## Free deploy (API + APK)

See **[DEPLOY.md](./DEPLOY.md)** for:

1. Render free Docker deploy (`render.yaml` + `Dockerfile`)
2. Setting `EXPO_PUBLIC_API_URL`
3. Building a sideloadable Android APK with `eas build --profile preview`
